import React, { useState, useRef, useEffect } from 'react';
import { Camera, RefreshCw, XCircle, Brain, Sparkles } from 'lucide-react';
import { analyzeMeatImage, refineAnalysis } from '../../src/services/geminiService';
import { AnalysisResult, SafetyStatus, HistoryItem, MeatType, SensoryData, StorageEnvironment, ContainerType } from '../../types';
import { Link, useNavigate } from 'react-router-dom';
import { useScan } from '../../hooks/useScan';
import { useAuth } from '../context/AuthContext';
import ScannerHeader from '@/components/Scan/ScanHeader';
import ScanResults from '@/components/Scan/ScanResult';
import PreScanGuide from '@/components/Scan/PreScanGuide';
import ScanLimitMask from '@/components/Scan/ScanLimitMask';
import { calculateStorageDeadline, getPredictedSensoryValues, getScanStage } from '../utils/scan.util';

// Constants
const SCAN_LIMIT = 2;
const GUEST_SCAN_COUNT_KEY = 'guestScanCount';

const saveToHistory = (data: AnalysisResult, base64: string, id?: string): string => {
    const historyItem: HistoryItem = {
        id: id || Date.now().toString(),
        imageUrl: base64,
        storageDeadline: Date.now() + 7 * 24 * 60 * 60 * 1000,
        actionStatus: 'storing',
        storageEnvironment: 'fridge',
        containerType: 'bag',
        ...data,
    };
    const existingHistory = localStorage.getItem('meatHistory');
    const history = existingHistory ? JSON.parse(existingHistory) : [];
    
    const filteredHistory = id 
      ? history.filter((item: any) => item.id !== id)
      : history;
    
    const updatedHistory = [historyItem, ...filteredHistory];
    localStorage.setItem('meatHistory', JSON.stringify(updatedHistory));
    return historyItem.id;
};


const Scanner: React.FC = () => {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();
    const { saveScan, loading: savingToAPI } = useScan();
    
    const [guestScanCount, setGuestScanCount] = useState<number>(() => {
        const savedCount = localStorage.getItem(GUEST_SCAN_COUNT_KEY);
        return savedCount ? parseInt(savedCount, 10) : 0;
    });
    const [showLimitMask, setShowLimitMask] = useState(false);
    
    const [image, setImage] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [isRefining, setIsRefining] = useState(false);
    const [progress, setProgress] = useState(0);
    const [result, setResult] = useState<AnalysisResult | null>(null);
    const [showSensoryForm, setShowSensoryForm] = useState(false);
    const [sensoryData, setSensoryData] = useState<SensoryData>({ smell: 0, texture: 0, moisture: 0, drip: 0 });
    const [storageConfig, setStorageConfig] = useState<{ environment: StorageEnvironment; container: ContainerType }>({ environment: 'fridge', container: 'bag' });
    const [isProMode, setIsProMode] = useState(() => {
        const savedMode = localStorage.getItem('scanProMode');
        const isPremium = localStorage.getItem('isPremium') === 'true';
        return isPremium && savedMode === 'true';
    });
    const [currentScanId, setCurrentScanId] = useState<string | null>(null);
    
    const fileInputRef = useRef<HTMLInputElement>(null);
    const resultRef = useRef<HTMLDivElement>(null);
    const sensoryFormRef = useRef<HTMLDivElement>(null);
    
    const currentStage = getScanStage(progress, isProMode);

    useEffect(() => {
        if (!isAuthenticated && guestScanCount >= SCAN_LIMIT) {
            setShowLimitMask(true);
        } else {
            setShowLimitMask(false);
        }
    }, [guestScanCount, isAuthenticated]);
    
    useEffect(() => {
        if (result && resultRef.current && !showSensoryForm) {
            if (window.innerWidth < 1024) {
                setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
            }
        }
    }, [result, showSensoryForm]);

    useEffect(() => {
        if (showSensoryForm && sensoryFormRef.current) {
            setTimeout(() => sensoryFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 100);
        }
    }, [showSensoryForm]);

    const handleToggleProMode = () => {
        const isPremium = localStorage.getItem('isPremium') === 'true';
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

    const processImage = async (base64: string) => {
        if (!isAuthenticated) {
            if (guestScanCount >= SCAN_LIMIT) {
                setShowLimitMask(true);
                return; 
            }
        }
        setLoading(true);
        setResult(null);
        setShowSensoryForm(false);
        setProgress(0);
        setCurrentScanId(null); 

        const progressInterval = setInterval(() => {
            setProgress((prev) => (prev >= 85 ? prev : prev + Math.floor(Math.random() * 5) + 1));
        }, 150);
        
        try {
            const minTimePromise = new Promise(resolve => setTimeout(resolve, 2500));
            const analysisPromise = analyzeMeatImage(base64, isProMode);
            
            const [_, data] = await Promise.all([minTimePromise, analysisPromise]);
            
            clearInterval(progressInterval);
            setProgress(100);

            setTimeout(() => {
                setResult(data);
                setLoading(false);
                
                if (!isAuthenticated) {
                    const newCount = guestScanCount + 1;
                    setGuestScanCount(newCount);
                    localStorage.setItem(GUEST_SCAN_COUNT_KEY, newCount.toString());
                    if (newCount >= SCAN_LIMIT) setShowLimitMask(true); 
                }

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



    const animateSliders = (targetValues: SensoryData) => {
        const duration = 1200; 
        const startTime = performance.now();

        const animate = (currentTime: number) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const ease = 1 - Math.pow(1 - progress, 3);

            setSensoryData({
                smell: Math.round(targetValues.smell * ease),
                texture: Math.round(targetValues.texture * ease),
                moisture: Math.round(targetValues.moisture * ease),
                drip: Math.round(targetValues.drip * ease)
            });

            if (progress < 1) requestAnimationFrame(animate);
        };
        requestAnimationFrame(animate);
    };

    const handleOpenDeepAnalysis = () => {
        if (!result) return;
        const target = getPredictedSensoryValues(result.freshnessLevel);
        setSensoryData({ smell: 0, texture: 0, moisture: 0, drip: 0 });
        setShowSensoryForm(true);
        setTimeout(() => animateSliders(target), 200);
    };

    const handleRefineAnalysis = async () => {
        if (!result || !image) return;
        setIsRefining(true);
        
        try {
            const refinedResult = await refineAnalysis(result, sensoryData, isProMode);
            setResult(refinedResult);
            setShowSensoryForm(false);
            
            const idToUse = currentScanId || saveToHistory(refinedResult, image);
            saveToHistory(refinedResult, image, idToUse);
            setCurrentScanId(idToUse);
        } catch (e) {
            console.error(e);
        } finally {
            setIsRefining(false);
        }
    };

    const handleSaveToStorage = async () => {
        if (!result || !image) return;

        try {
            const historyItem: HistoryItem = {
                id: currentScanId || Date.now().toString(),
                imageUrl: image,
                storageDeadline: calculateStorageDeadline(result.freshnessLevel, storageConfig.environment, storageConfig.container),
                actionStatus: 'storing',
                storageEnvironment: storageConfig.environment,
                containerType: storageConfig.container,
                ...result,
            };

            const existingHistory = localStorage.getItem('meatHistory');
            const history = existingHistory ? JSON.parse(existingHistory) : [];
            const filteredHistory = currentScanId ? history.filter((item: any) => item.id !== currentScanId) : history;
            const updatedHistory = [historyItem, ...filteredHistory];

            if (isAuthenticated) {
                const res = await saveScan(result, image, sensoryData, storageConfig);
                if(res.status === 201 || res.status === 200){
                    navigate("/account")
                }
            }
            handleReset();
        } catch (error) {
            console.error('Error saving scan:', error);
            alert('Có lỗi khi lưu. Vui lòng thử lại.');
        }
    };

    const triggerUpload = () => {
        if (showLimitMask) return; // Không cho upload nếu đã bị mask
        fileInputRef.current?.click();
    };

    const handleReset = () => {
        setImage(null); 
        setResult(null); 
        setShowSensoryForm(false);
        setCurrentScanId(null);
        setSensoryData({ smell: 0, texture: 0, moisture: 0, drip: 0 });
    };

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
            <ScannerHeader 
                imageLoaded={!!image} 
                isProMode={isProMode} 
                onToggleProMode={handleToggleProMode}
                navigate={navigate}
            />

            {/* Main Content Grid */}
            <div className="lg:grid lg:grid-cols-2 lg:gap-12 lg:items-start">
                
                {/* LEFT COL: Camera Area */}
                <div className="relative w-full">
                    <div 
                        className={`relative overflow-hidden rounded-[2.5rem] transition-all duration-500 aspect-4/4 lg:aspect-4/3 shadow-2xl shadow-rose-200/40 border-4 border-white bg-white ${loading ? 'ring-4 ring-rose-200' : ''}`}
                    >
                        {/* MASK GIỚI HẠN */}
                        {showLimitMask && !isAuthenticated && (
                            <ScanLimitMask limit={SCAN_LIMIT} navigate={navigate} />
                        )}

                        {!image ? (
                            <div 
                                onClick={triggerUpload}
                                className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer hover:bg-rose-50/50 transition-all group"
                            >
                                <div className="absolute inset-4 border-2 border-dashed border-rose-200 rounded-4xl pointer-events-none group-hover:border-rose-400 transition-colors"></div>
                                
                                <div className="mb-5 p-6 bg-rose-50 rounded-full group-hover:scale-110 transition-transform shadow-sm relative z-10">
                                    <Camera className="w-10 h-10 text-rose-300 group-hover:text-rose-500" />
                                </div>
                                <h3 className="font-bold text-slate-700 text-lg relative z-10">Nhấn để chụp ảnh</h3>
                                <p className="text-slate-400 text-sm mt-1 font-medium relative z-10">Hỗ trợ JPG, PNG</p>
                                
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
                                        <div className="absolute top-0 left-0 w-full h-1/2 bg-linear-to-b from-rose-500/20 to-transparent animate-scan-beam z-20 pointer-events-none border-b-2 border-rose-400/50"></div>
                                        <div className="absolute inset-0 flex flex-col items-center justify-center z-30 px-6">
                                            <div className="bg-white/95 backdrop-blur-xl p-6 rounded-3xl shadow-2xl w-full max-w-[280px] flex flex-col items-center border border-white animate-float">
                                                <div className="w-12 h-12 rounded-2xl bg-rose-50 flex items-center justify-center mb-4 shadow-inner">
                                                    <Camera/>
                                                </div>
                                                <h4 className="text-slate-800 font-bold text-center mb-1">{currentStage.text}</h4>
                                                <p className="text-slate-400 text-xs font-medium mb-4">{progress}% hoàn thành</p>
                                                <div className="w-full h-2.5 bg-rose-100 rounded-full overflow-hidden">
                                                    <div 
                                                        className="h-full bg-linear-to-r from-rose-400 to-pink-500 rounded-full transition-all duration-300 ease-out relative"
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
                    {result && !loading ? (
                        <ScanResults
                            result={result}
                            isProMode={isProMode}
                            isDevMeatType={isDevMeatType}
                            savingToAPI={savingToAPI}
                            showSensoryForm={showSensoryForm}
                            sensoryData={sensoryData}
                            onOpenDeepAnalysis={handleOpenDeepAnalysis}
                            onSaveToStorage={handleSaveToStorage}
                            onReset={handleReset}
                            onRefineAnalysis={handleRefineAnalysis}
                            setShowSensoryForm={setShowSensoryForm}
                            setSensoryData={setSensoryData}
                            sensoryFormRef={sensoryFormRef}
                        />
                    ) : (
                        !loading && <PreScanGuide />
                    )}
                </div>
            </div>
        </div>
    );
};

export default Scanner;