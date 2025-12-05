import React, { useState, useRef, useCallback } from 'react';
import { Camera, Upload, Save, RefreshCw, Zap, CheckCircle, AlertTriangle, XCircle, AlertOctagon, ChevronRight, BookOpen, Microscope, UploadCloud, ScanLine, Palette, Brain, TestTube, Fingerprint, Wind, Droplets, ArrowDown, Sun, Focus, Aperture, Lightbulb, ShieldCheck, Scan, Construction, SlidersHorizontal, Crown, Sparkles } from 'lucide-react';
import { analyzeMeatImage, refineAnalysis } from '../../services/geminiService';
import { AnalysisResult, SafetyStatus, HistoryItem, MeatType, SensoryData, StorageEnvironment, ContainerType } from '../../types';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Link, useNavigate } from 'react-router-dom';
import { useScan } from '../../hooks/useScan';
import { useAuth } from '../../context/AuthContext';

const Scanner: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { saveScan, loading: savingToAPI } = useScan();
  
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isRefining, setIsRefining] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [showSensoryForm, setShowSensoryForm] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [sensoryData, setSensoryData] = useState<SensoryData>({
    smell: 0,
    texture: 0,
    moisture: 0,
    drip: 0
  });
  const [storageConfig, setStorageConfig] = useState<{
    environment: StorageEnvironment;
    container: ContainerType;
  }>({
    environment: 'fridge',
    container: 'bag'
  });

  // Initialize Pro Mode based on LocalStorage AND Premium Status
  const [isProMode, setIsProMode] = useState(() => {
      const savedMode = localStorage.getItem('scanProMode');
      const isPremium = localStorage.getItem('isPremium') === 'true';
      return isPremium && savedMode === 'true';
  });
  
  // Track the ID of the current scan session to update history instead of creating duplicates
  const [currentScanId, setCurrentScanId] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  const sensoryFormRef = useRef<HTMLDivElement>(null);
  
  // Dynamic Scan Stages
  const getScanStage = (prog: number) => {
    if (prog < 30) return { text: "Khởi động Vision AI...", icon: <ScanLine className="w-6 h-6 text-rose-500 animate-pulse" /> };
    if (prog < 60) return { text: `Phân tích ${isProMode ? '(Deep Learning)...' : 'sắc tố...'}`, icon: <Palette className="w-6 h-6 text-blue-500 animate-pulse" /> };
    if (prog < 85) return { text: "Kiểm tra cấu trúc bề mặt...", icon: <Microscope className="w-6 h-6 text-emerald-500 animate-pulse" /> };
    if (prog < 100) return { text: "Tổng hợp kết quả...", icon: <Brain className="w-6 h-6 text-purple-500 animate-pulse" /> };
    return { text: "Hoàn tất!", icon: <CheckCircle className="w-6 h-6 text-rose-600" /> };
  };

  const currentStage = getScanStage(progress);

  React.useEffect(() => {
    if (result && resultRef.current && !showSensoryForm) {
      // Only scroll on mobile where things are stacked
      if (window.innerWidth < 1024) {
        setTimeout(() => {
            resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      }
    }
  }, [result, showSensoryForm]);

  React.useEffect(() => {
      if (showSensoryForm && sensoryFormRef.current) {
          setTimeout(() => {
              sensoryFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }, 100);
      }
  }, [showSensoryForm]);

  const handleToggleProMode = () => {
    const isPremium = localStorage.getItem('isPremium') === 'true';
    
    // If trying to turn ON Pro Mode but not premium
    if (!isProMode && !isPremium) {
        navigate('/premium');
        return;
    }
    
    const newMode = !isProMode;
    setIsProMode(newMode);
    localStorage.setItem('scanProMode', String(newMode));
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setImage(base64);
      processImage(base64);
    };
    reader.readAsDataURL(file);
  };

  // Helper to save to local history
  const saveToHistory = (data: AnalysisResult, base64: string, id?: string): string => {
    const historyItem: HistoryItem = {
        id: id || Date.now().toString(),
        imageUrl: base64,
        storageDeadline: Date.now() + 7 * 24 * 60 * 60 * 1000, // Placeholder
        actionStatus: 'storing',
        storageEnvironment: 'fridge',
        containerType: 'bag',
        ...data,
    };

    const existingHistory = localStorage.getItem('meatHistory');
    const history = existingHistory ? JSON.parse(existingHistory) : [];
    
    // If updating existing scan, remove old one
    const filteredHistory = id 
      ? history.filter((item: any) => item.id !== id)
      : history;
    
    const updatedHistory = [historyItem, ...filteredHistory];
    localStorage.setItem('meatHistory', JSON.stringify(updatedHistory));
    return historyItem.id;
  };

  // Calculate storage deadline helper
  const calculateStorageDeadline = (level: number, env: StorageEnvironment, container: ContainerType): number => {
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;
    
    let baseDays = 0;
    
    if (env === 'fridge') {
      baseDays = level === 1 ? 4 : level === 2 ? 3 : level === 3 ? 1 : 0;
    } else if (env === 'freezer') {
      baseDays = level === 1 ? 90 : level === 2 ? 60 : level === 3 ? 7 : 0;
    } else if (env === 'room_temp') {
      baseDays = level === 1 ? 0.17 : level === 2 ? 0.08 : 0;
    }
    
    if (container === 'box') {
      baseDays *= 1.1;
    } else if (container === 'none') {
      baseDays *= 0.8;
    }
    
    return now + (baseDays * oneDay);
  };

  // Handle save to storage (both local and API)
  const handleSaveToStorage = async () => {
    if (!result || !image) return;

    try {
      // 1. Save to localStorage (update with final deadline)
      const historyItem: HistoryItem = {
        id: currentScanId || Date.now().toString(),
        imageUrl: image,
        storageDeadline: calculateStorageDeadline(result.freshnessLevel, storageConfig.environment, storageConfig.container),
        actionStatus: 'storing' as const,
        storageEnvironment: storageConfig.environment,
        containerType: storageConfig.container,
        ...result,
      };

      const existingHistory = localStorage.getItem('meatHistory');
      const history = existingHistory ? JSON.parse(existingHistory) : [];
      
      // If updating existing scan, remove old one
      const filteredHistory = currentScanId 
        ? history.filter((item: any) => item.id !== currentScanId)
        : history;
      
      const updatedHistory = [historyItem, ...filteredHistory];
      localStorage.setItem('meatHistory', JSON.stringify(updatedHistory));

      // 2. Save to API if user is authenticated
      if (isAuthenticated) {
        try {
          console.log('Attempting to save scan to API...');
          await saveScan(result, image, sensoryData, storageConfig);
          console.log('✅ Scan saved to server successfully');
        } catch (apiError) {
          console.error('❌ Failed to save to server:', apiError);
          // Continue with local save even if API fails
          alert('Đã lưu offline. Sẽ đồng bộ khi có mạng.');
        }
      } else {
        console.log('User not authenticated, only saving locally');
      }

      // 3. Show success message and reset
      alert('Đã lưu vào kho thành công!');
      handleReset();
      
    } catch (error) {
      console.error('Error saving scan:', error);
      alert('Có lỗi khi lưu. Vui lòng thử lại.');
    }
  };

  const processImage = async (base64: string) => {
    setLoading(true);
    setResult(null);
    setShowSensoryForm(false);
    setProgress(0);
    setCurrentScanId(null); // Reset ID for new scan

    const progressInterval = setInterval(() => {
        setProgress((prev) => {
            if (prev >= 85) return prev; 
            return prev + Math.floor(Math.random() * 5) + 1;
        });
    }, 150);
    
    try {
        const minTimePromise = new Promise(resolve => setTimeout(resolve, 2500));
        // Pass isProMode flag to the service
        const analysisPromise = analyzeMeatImage(base64, isProMode);
        
        const [_, data] = await Promise.all([minTimePromise, analysisPromise]);
        
        clearInterval(progressInterval);
        setProgress(100);

        setTimeout(() => {
            setResult(data);
            setLoading(false);
            
            // Initial save to history (Local Storage only) upon first analysis
            if (data.meatType !== MeatType.BEEF && data.meatType !== MeatType.CHICKEN) {
                const newId = saveToHistory(data, base64);
                setCurrentScanId(newId);
            } else {
                setCurrentScanId(null);
            }

        }, 600);

    } catch (error) {
        console.error(error);
        clearInterval(progressInterval);
        setLoading(false);
    }
  };

  // Calculate predicted values based on freshness level
  const getPredictedSensoryValues = (level: number): SensoryData => {
      switch (level) {
          case 1: return { smell: 5, texture: 5, moisture: 5, drip: 5 }; // Excellent
          case 2: return { smell: 25, texture: 20, moisture: 20, drip: 10 }; // Good
          case 3: return { smell: 55, texture: 50, moisture: 45, drip: 30 }; // Average
          case 4: return { smell: 80, texture: 85, moisture: 80, drip: 70 }; // Bad
          case 5: return { smell: 95, texture: 95, moisture: 95, drip: 95 }; // Spoiled
          default: return { smell: 10, texture: 10, moisture: 10, drip: 10 };
      }
  };

  const animateSliders = (targetValues: SensoryData) => {
    const duration = 1200; // ms
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Ease out cubic for smooth feeling
      const ease = 1 - Math.pow(1 - progress, 3);

      setSensoryData({
        smell: Math.round(targetValues.smell * ease),
        texture: Math.round(targetValues.texture * ease),
        moisture: Math.round(targetValues.moisture * ease),
        drip: Math.round(targetValues.drip * ease)
      });

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  };

  const handleOpenDeepAnalysis = () => {
      if (result) {
          const target = getPredictedSensoryValues(result.freshnessLevel);
          
          // Reset to 0 first
          setSensoryData({ smell: 0, texture: 0, moisture: 0, drip: 0 });
          setShowSensoryForm(true);
          
          // Trigger animation after a slight delay to allow modal to render
          setTimeout(() => {
            animateSliders(target);
          }, 200);
      }
  };

  const handleRefineAnalysis = async () => {
      if (!result) return;
      setIsRefining(true);
      
      try {
        // Pass isProMode flag
        const refinedResult = await refineAnalysis(result, sensoryData, isProMode);
        setResult(refinedResult);
        setShowSensoryForm(false);
        
        if (image) {
            // Update the existing history item instead of creating a new one
            if (currentScanId) {
                saveToHistory(refinedResult, image, currentScanId);
            } else if (refinedResult.meatType !== MeatType.BEEF && refinedResult.meatType !== MeatType.CHICKEN) {
                // If ID was somehow null, create a new history item
                const newId = saveToHistory(refinedResult, image);
                setCurrentScanId(newId);
            }
        }
      } catch (e) {
          console.error(e);
      } finally {
          setIsRefining(false);
      }
  };

  const triggerUpload = () => {
    fileInputRef.current?.click();
  };

  const handleReset = () => {
      setImage(null); 
      setResult(null); 
      setShowSensoryForm(false);
      setCurrentScanId(null);
      setSensoryData({ smell: 0, texture: 0, moisture: 0, drip: 0 });
  };

  const getStatusTheme = (status: SafetyStatus) => {
    switch (status) {
      case SafetyStatus.SAFE: return {
        bg: "bg-emerald-50",
        text: "text-emerald-700",
        border: "border-emerald-100",
        icon: <CheckCircle className="w-8 h-8 text-emerald-500" />,
        scoreColor: "#10b981"
      };
      case SafetyStatus.CAUTION: return {
        bg: "bg-amber-50",
        text: "text-amber-700",
        border: "border-amber-100",
        icon: <AlertTriangle className="w-8 h-8 text-amber-500" />,
        scoreColor: "#f59e0b"
      };
      case SafetyStatus.DANGER: return {
        bg: "bg-rose-50",
        text: "text-rose-700",
        border: "border-rose-100",
        icon: <AlertOctagon className="w-8 h-8 text-rose-500" />,
        scoreColor: "#f43f5e"
      };
      default: return {
        bg: "bg-gray-50",
        text: "text-gray-700",
        border: "border-gray-200",
        icon: <AlertTriangle className="w-8 h-8 text-gray-400" />,
        scoreColor: "#9ca3af"
      };
    }
  };

  const renderGauge = (score: number, color: string) => {
    const data = [
      { name: 'Score', value: score },
      { name: 'Rest', value: 100 - score },
    ];
    return (
      <div className="h-28 relative flex justify-center items-center -mt-4">
         <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="100%"
                startAngle={180}
                endAngle={0}
                innerRadius={60}
                outerRadius={75}
                paddingAngle={0}
                dataKey="value"
                stroke="none"
                cornerRadius={10}
              >
                <Cell key="cell-0" fill={color} />
                <Cell key="cell-1" fill="#fecdd3" />
              </Pie>
            </PieChart>
         </ResponsiveContainer>
         <div className="absolute bottom-2 flex flex-col items-center">
            <span className="text-3xl font-black text-slate-800">{score}</span>
         </div>
      </div>
    );
  };

  const theme = result ? getStatusTheme(result.safetyStatus) : null;
  const isDevMeatType = result && (result.meatType === MeatType.BEEF || result.meatType === MeatType.CHICKEN);

  if (isRefining) {
      return (
          <div className="flex flex-col items-center justify-center h-[60vh] space-y-6">
              <div className="relative">
                  <div className="w-24 h-24 rounded-full border-4 border-rose-100 border-t-rose-500 animate-spin"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                      <Brain className="w-10 h-10 text-rose-500 animate-pulse" />
                  </div>
              </div>
              <div className="text-center">
                  <h3 className="text-xl font-black text-slate-800 mb-2">AI Đang Tổng Hợp Dữ Liệu</h3>
                  <p className="text-slate-500 max-w-xs mx-auto">Kết hợp hình ảnh và đánh giá cảm quan của bạn để đưa ra phán quyết cuối cùng...</p>
              </div>
          </div>
      );
  }

  return (
    <div className="animate-fade-in space-y-6 max-w-6xl mx-auto pb-24">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-2 px-1">
         <div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight font-serif">Kiểm tra thịt</h2>
            <p className="text-slate-500 text-sm font-medium">Chụp ảnh để AI phân tích độ tươi</p>
         </div>
         <div className="flex items-center gap-2">
             {/* PRO Mode Toggle Button */}
             <button
                onClick={handleToggleProMode}
                className={`
                    relative group overflow-hidden rounded-full p-1 pl-4 pr-1 transition-all duration-300 border
                    ${isProMode 
                    ? 'bg-slate-900 border-slate-800 text-white shadow-lg shadow-amber-200' 
                    : 'bg-white border-slate-200 text-slate-500 hover:border-rose-200 shadow-sm'}
                `}
            >
                <div className="flex items-center gap-3">
                    <div className="flex flex-col items-start mr-1">
                        <span className={`text-[9px] font-bold uppercase tracking-wider leading-none mb-0.5 ${isProMode ? 'opacity-80' : 'text-slate-400'}`}>
                            {isProMode ? 'PRO AI' : 'Basic AI'}
                        </span>
                        <span className={`text-xs font-bold leading-none ${isProMode ? 'text-amber-400' : 'text-slate-700'}`}>
                            {isProMode ? 'Đang bật' : 'Bật chế độ Pro'}
                        </span>
                    </div>
                    
                    {/* Switch Circle */}
                    <div className={`
                        w-8 h-8 rounded-full flex items-center justify-center transition-all duration-500 transform
                        ${isProMode 
                        ? 'bg-gradient-to-br from-amber-300 to-yellow-500 rotate-0 scale-110' 
                        : 'bg-slate-100 group-hover:bg-rose-50'}
                    `}>
                        <Crown className={`w-4 h-4 transition-colors ${isProMode ? 'text-amber-900 fill-amber-900' : 'text-slate-400 group-hover:text-rose-500'}`} />
                    </div>
                </div>
                
                {/* Glow effect for Pro */}
                {isProMode && <div className="absolute inset-0 bg-amber-400/10 blur-md rounded-full pointer-events-none"></div>}
            </button>

             {!image && (
                 <div className="p-2.5 bg-rose-100 rounded-full shadow-sm">
                     <Camera className="w-6 h-6 text-rose-500" />
                 </div>
             )}
         </div>
      </div>

      {/* Main Content Grid */}
      <div className="lg:grid lg:grid-cols-2 lg:gap-12 lg:items-start">
          
          {/* LEFT COL: Camera Area */}
          <div className="relative w-full">
            <div 
                className={`relative overflow-hidden rounded-[2.5rem] transition-all duration-500 aspect-[4/4] lg:aspect-[4/3] shadow-2xl shadow-rose-200/40 border-4 border-white bg-white ${loading ? 'ring-4 ring-rose-200' : ''}`}
            >
                {!image ? (
                <div 
                    onClick={triggerUpload}
                    className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer hover:bg-rose-50/50 transition-all group"
                >
                    <div className="absolute inset-4 border-2 border-dashed border-rose-200 rounded-[2rem] pointer-events-none group-hover:border-rose-400 transition-colors"></div>
                    
                    <div className="mb-5 p-6 bg-rose-50 rounded-full group-hover:scale-110 transition-transform shadow-sm relative z-10">
                        <UploadCloud className="w-10 h-10 text-rose-300 group-hover:text-rose-500" />
                    </div>
                    <h3 className="font-bold text-slate-700 text-lg relative z-10">Nhấn để chụp ảnh</h3>
                    <p className="text-slate-400 text-sm mt-1 font-medium relative z-10">Hỗ trợ JPG, PNG</p>
                    
                    {/* Pro Mode Indicator inside camera area */}
                    {isProMode && (
                        <div className="absolute bottom-6 flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 text-amber-400 text-xs font-bold border border-slate-700 shadow-lg">
                            <Sparkles className="w-3 h-3 fill-amber-400" />
                            Đang dùng mô hình cao cấp
                        </div>
                    )}
                </div>
                ) : (
                <div className="w-full h-full relative bg-black">
                    <img src={image} alt="Uploaded meat" className="w-full h-full object-cover" />
                    
                    {/* Scanning UI Overlay */}
                    {loading && (
                        <>
                            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px] z-10"></div>
                            <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-rose-500/20 to-transparent animate-scan-beam z-20 pointer-events-none border-b-2 border-rose-400/50"></div>
                            <div className="absolute inset-0 flex flex-col items-center justify-center z-30 px-6">
                                <div className="bg-white/95 backdrop-blur-xl p-6 rounded-3xl shadow-2xl w-full max-w-[280px] flex flex-col items-center border border-white animate-float">
                                    <div className="w-12 h-12 rounded-2xl bg-rose-50 flex items-center justify-center mb-4 shadow-inner">
                                        {currentStage.icon}
                                    </div>
                                    <h4 className="text-slate-800 font-bold text-center mb-1">{currentStage.text}</h4>
                                    <p className="text-slate-400 text-xs font-medium mb-4">{progress}% hoàn thành</p>
                                    <div className="w-full h-2.5 bg-rose-100 rounded-full overflow-hidden">
                                        <div 
                                            className="h-full bg-gradient-to-r from-rose-400 to-pink-500 rounded-full transition-all duration-300 ease-out relative"
                                            style={{ width: `${progress}%` }}
                                        >
                                            <div className="absolute inset-0 bg-white/30 animate-[shimmer_2s_infinite]"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    {!loading && (
                        <button 
                        onClick={handleReset}
                        className="absolute top-4 right-4 bg-white/80 backdrop-blur hover:bg-white text-slate-800 p-2.5 rounded-full shadow-lg transition-all z-40 group"
                        >
                        <XCircle className="w-6 h-6 text-rose-500 group-hover:scale-110 transition-transform" />
                        </button>
                    )}
                </div>
                )}
                <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                accept="image/*" 
                className="hidden" 
                />
            </div>
          </div>

          {/* RIGHT COL: Results or Info Area */}
          <div className="mt-8 lg:mt-0">
            {result && !loading && theme ? (
                /* --- RESULT VIEW --- */
                <div ref={resultRef} className="space-y-4 animate-fade-in-up">
                    {/* Status & Score Row */}
                    <div className="grid grid-cols-3 gap-4">
                        {/* Status Card */}
                        <div className={`col-span-2 rounded-3xl p-5 border ${isDevMeatType ? 'bg-slate-50 border-slate-100' : theme.bg + ' ' + theme.border} flex flex-col justify-between relative overflow-hidden min-h-[140px]`}>
                            <div className="absolute top-0 right-0 -mt-4 -mr-4 opacity-10 transform rotate-12">
                                {isDevMeatType ? <Brain className="w-24 h-24 text-slate-400" /> : theme.icon}
                            </div>
                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-[10px] font-bold uppercase tracking-wider opacity-70">Loại thịt phát hiện</span>
                                {isProMode && <span className="px-1.5 py-0.5 rounded bg-slate-800 text-amber-400 text-[9px] font-bold border border-slate-600 flex items-center gap-1"><Sparkles className="w-2 h-2" /> PRO AI</span>}
                            </div>
                            <div>
                                <h3 className={`text-2xl font-black ${isDevMeatType ? 'text-slate-800' : theme.text} leading-none mb-2`}>
                                    {result.meatType}
                                </h3>
                                <p className={`text-xs font-bold opacity-70 uppercase tracking-wide ${isDevMeatType ? 'text-slate-500' : ''}`}>
                                    {isDevMeatType ? 'Đang phát triển' : result.safetyStatus}
                                </p>
                            </div>
                        </div>

                        {/* Score/Info Card */}
                        <div className="col-span-1 bg-white rounded-3xl p-2 border border-rose-100 shadow-sm flex flex-col items-center justify-center min-h-[140px]">
                            {isDevMeatType ? (
                                <div className="flex flex-col items-center justify-center h-full text-center p-2">
                                    <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center mb-2">
                                        <Construction className="w-5 h-5 text-slate-400" />
                                    </div>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase">Coming Soon</span>
                                </div>
                            ) : (
                                <>
                                    {renderGauge(result.freshnessScore, theme.scoreColor)}
                                    <span className="text-[10px] font-bold text-slate-400 -mt-2 uppercase tracking-wider">Độ tươi</span>
                                </>
                            )}
                        </div>
                    </div>

                    {/* DEEP ANALYSIS BUTTON (Hide if dev type) */}
                    {!isDevMeatType && !showSensoryForm && (
                        <button 
                            onClick={handleOpenDeepAnalysis}
                            className="w-full bg-gradient-to-r from-slate-800 to-slate-900 text-white p-4 rounded-2xl shadow-lg shadow-slate-200 flex items-center justify-between group hover:scale-[1.01] transition-all"
                        >
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white/10 rounded-xl backdrop-blur">
                                    <TestTube className="w-6 h-6 text-rose-300" />
                                </div>
                                <div className="text-left">
                                    <div className="font-bold text-base">Đánh giá chuyên sâu</div>
                                    <div className="text-[11px] text-slate-400 font-medium">Kết hợp cảm quan để chính xác 99%</div>
                                </div>
                            </div>
                            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-rose-500 transition-colors">
                                <ArrowDown className="w-4 h-4" />
                            </div>
                        </button>
                    )}

                    {/* SENSORY FORM OVERLAY */}
                    {showSensoryForm && !isDevMeatType && (
                        <div ref={sensoryFormRef} className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-xl animate-fade-in-up relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-rose-400 to-purple-500"></div>
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="text-xl font-black text-slate-800">Kiểm tra Cảm quan</h3>
                                <button onClick={() => setShowSensoryForm(false)} className="p-1 rounded-full hover:bg-slate-100 text-slate-400">
                                    <XCircle className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="space-y-6">
                                {/* Sliders */}
                                <div>
                                    <div className="flex justify-between mb-2 text-sm font-bold text-slate-700">
                                        <span className="flex items-center gap-1"><Wind className="w-4 h-4 text-blue-400"/> Mùi vị</span>
                                        <div className="flex items-center gap-2">
                                            <span className="text-rose-500 font-bold bg-rose-50 px-2 py-0.5 rounded text-xs">{sensoryData.smell}%</span>
                                            <span className="text-slate-400 text-xs font-normal">{sensoryData.smell > 50 ? 'Hôi/Chua' : 'Thơm/Không mùi'}</span>
                                        </div>
                                    </div>
                                    <input 
                                            type="range" min="0" max="100" 
                                            value={sensoryData.smell}
                                            onChange={(e) => setSensoryData({...sensoryData, smell: Number(e.target.value)})}
                                            className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-rose-500 transition-all"
                                    />
                                </div>

                                <div>
                                    <div className="flex justify-between mb-2 text-sm font-bold text-slate-700">
                                        <span className="flex items-center gap-1"><Fingerprint className="w-4 h-4 text-purple-400"/> Độ đàn hồi</span>
                                        <div className="flex items-center gap-2">
                                            <span className="text-purple-500 font-bold bg-purple-50 px-2 py-0.5 rounded text-xs">{sensoryData.texture}%</span>
                                            <span className="text-slate-400 text-xs font-normal">{sensoryData.texture > 50 ? 'Nhão/Lõm' : 'Đàn hồi tốt'}</span>
                                        </div>
                                    </div>
                                    <input 
                                            type="range" min="0" max="100" 
                                            value={sensoryData.texture}
                                            onChange={(e) => setSensoryData({...sensoryData, texture: Number(e.target.value)})}
                                            className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-purple-500 transition-all"
                                    />
                                </div>

                                <div>
                                    <div className="flex justify-between mb-2 text-sm font-bold text-slate-700">
                                        <span className="flex items-center gap-1"><Droplets className="w-4 h-4 text-sky-400"/> Bề mặt</span>
                                        <div className="flex items-center gap-2">
                                            <span className="text-sky-500 font-bold bg-sky-50 px-2 py-0.5 rounded text-xs">{sensoryData.moisture}%</span>
                                            <span className="text-slate-400 text-xs font-normal">{sensoryData.moisture > 50 ? 'Nhớt/Dính' : 'Khô ráo/Ẩm nhẹ'}</span>
                                        </div>
                                    </div>
                                    <input 
                                            type="range" min="0" max="100" 
                                            value={sensoryData.moisture}
                                            onChange={(e) => setSensoryData({...sensoryData, moisture: Number(e.target.value)})}
                                            className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-sky-500 transition-all"
                                    />
                                </div>

                                <button 
                                        onClick={handleRefineAnalysis}
                                        className="w-full py-4 rounded-xl bg-rose-500 text-white font-bold shadow-lg shadow-rose-200 hover:scale-[1.02] transition-transform flex items-center justify-center gap-2 mt-4"
                                >
                                    <Brain className="w-5 h-5" /> Phân tích lại ngay
                                </button>
                            </div>
                        </div>
                    )}
                    
                    {/* --- NEW ACTION BUTTONS ROW --- */}
                    {!showSensoryForm && !isDevMeatType && (
                        <div className="grid grid-cols-2 gap-3 mt-4">
                            {/* SAVE TO STORAGE/API BUTTON */}
                            <button
                                onClick={handleSaveToStorage}
                                disabled={savingToAPI}
                                className={`
                                    w-full py-3 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 
                                    ${savingToAPI 
                                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                                        : 'bg-rose-500 text-white shadow-lg shadow-rose-200 hover:bg-rose-600'}
                                `}
                            >
                                {savingToAPI ? (
                                    <>
                                        <RefreshCw className="w-4 h-4 animate-spin" />
                                        Đang lưu...
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-5 h-5" /> Lưu vào Kho
                                    </>
                                )}
                            </button>
                            
                            {/* DICTIONARY/RESET BUTTONS */}
                             <button
                                onClick={handleReset}
                                className="w-full py-3 rounded-2xl bg-white border border-slate-200 text-slate-700 font-bold shadow-sm hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
                            >
                                <RefreshCw className="w-5 h-5" /> Quét mới
                            </button>
                        </div>
                    )}
                    
                    {/* Link to Dictionary (Remains) */}
                    <div className="grid grid-cols-2 gap-3">
                        <Link 
                            to={`/dictionary?type=${encodeURIComponent(result.meatType)}&level=${result.freshnessLevel}`}
                            className="col-span-2"
                        >
                            <div className="bg-white border border-rose-100 rounded-2xl p-4 flex items-center justify-between text-slate-700 shadow-sm hover:bg-rose-50 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-rose-100 rounded-lg text-rose-500">
                                        <BookOpen className="w-5 h-5" />
                                    </div>
                                    <div className="font-bold text-sm">So sánh với Từ điển</div>
                                </div>
                                <ChevronRight className="w-5 h-5 text-slate-400" />
                            </div>
                        </Link>
                    </div>

                    {/* Details Card */}
                    <div className="bg-white rounded-3xl p-6 border border-rose-100 shadow-sm">
                        <div className="flex items-center gap-2 mb-5">
                            <div className="p-1.5 bg-rose-50 rounded-lg text-rose-500">
                                <Microscope className="w-5 h-5" />
                            </div>
                            <h3 className="font-bold text-slate-800">Phân tích chi tiết</h3>
                        </div>
                        
                        {isDevMeatType ? (
                            <div className="p-4 bg-slate-50 rounded-2xl text-center border border-slate-100">
                                <p className="text-slate-500 font-medium text-sm leading-relaxed">
                                    AI cho <strong>{result.meatType}</strong> đang được đội ngũ kỹ sư phát triển để đảm bảo độ chính xác tuyệt đối.
                                    <br/>Vui lòng quay lại sau hoặc thử với Thịt Heo.
                                </p>
                            </div>
                        ) : (
                            <>
                                <div className="space-y-3">
                                    {result.visualCues.map((cue, idx) => (
                                        <div key={idx} className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50/80 border border-slate-100/50">
                                            <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${theme.scoreColor === '#10b981' ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                                            <p className="text-sm text-slate-600 font-medium leading-snug">{cue}</p>
                                        </div>
                                    ))}
                                </div>
                                
                                <div className="mt-6 pt-6 border-t border-dashed border-slate-200">
                                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Kết luận chuyên gia</h4>
                                    <div className="bg-rose-50/50 p-4 rounded-2xl border border-rose-100">
                                        <p className="text-slate-700 text-sm leading-relaxed font-medium italic">"{result.summary}"</p>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            ) : (
                /* --- PRE-SCAN GUIDE VIEW --- */
                !loading && (
                    <div className="space-y-6 animate-fade-in-up delay-100">
                        {/* 1. Tips Section */}
                        <div>
                            <h3 className="text-xl font-black text-slate-800 font-serif mb-3">Mẹo chụp ảnh chuẩn AI</h3>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col gap-2 hover:shadow-md transition-shadow">
                                    <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center text-amber-500">
                                        <Sun className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-700 text-sm">Đủ sáng</h4>
                                        <p className="text-[10px] text-slate-400 leading-tight mt-0.5">Dùng ánh sáng tự nhiên hoặc đèn trắng.</p>
                                    </div>
                                </div>
                                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col gap-2 hover:shadow-md transition-shadow">
                                    <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center text-blue-500">
                                        <Focus className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-700 text-sm">Rõ nét</h4>
                                        <p className="text-[10px] text-slate-400 leading-tight mt-0.5">Giữ chắc tay, chạm màn hình để lấy nét.</p>
                                    </div>
                                </div>
                                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col gap-2 hover:shadow-md transition-shadow">
                                    <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-500">
                                        <Scan className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-700 text-sm">Góc chụp</h4>
                                        <p className="text-[10px] text-slate-400 leading-tight mt-0.5">Chụp thẳng góc 90 độ từ trên xuống.</p>
                                    </div>
                                </div>
                                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col gap-2 hover:shadow-md transition-shadow">
                                    <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center text-purple-500">
                                        <Aperture className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-700 text-sm">Cận cảnh</h4>
                                        <p className="text-[10px] text-slate-400 leading-tight mt-0.5">Để miếng thịt chiếm 70% khung hình.</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 2. Fun Fact Banner */}
                        <div className="bg-gradient-to-r from-rose-500 to-pink-500 rounded-2xl p-5 text-white shadow-lg shadow-rose-200 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-white/20 rounded-full blur-2xl -mr-10 -mt-10"></div>
                            <div className="relative z-10">
                                <div className="flex items-center gap-2 mb-2">
                                    <Lightbulb className="w-4 h-4 text-yellow-300 fill-yellow-300 animate-pulse" />
                                    <span className="text-xs font-bold uppercase tracking-widest opacity-90">Bạn có biết?</span>
                                </div>
                                <p className="text-sm font-medium leading-snug opacity-95">
                                    "Thịt bò chuyển từ màu tím sang đỏ cherry chỉ sau 15 phút tiếp xúc với không khí nhờ phản ứng Oxymyoglobin."
                                </p>
                            </div>
                        </div>

                        {/* 3. Privacy / Steps */}
                        <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 flex items-start gap-3">
                             <ShieldCheck className="w-5 h-5 text-slate-400 mt-0.5 flex-shrink-0" />
                             <div>
                                 <h4 className="font-bold text-slate-700 text-sm mb-1">Bảo mật tuyệt đối</h4>
                                 <p className="text-xs text-slate-500 leading-relaxed">
                                     Hình ảnh của bạn được phân tích bởi AI tiên tiến và không được chia sẻ cho bên thứ ba. Kết quả chỉ mang tính chất tham khảo.
                                 </p>
                             </div>
                        </div>
                    </div>
                )
            )}
          </div>
      </div>
    </div>
  );
};

export default Scanner;