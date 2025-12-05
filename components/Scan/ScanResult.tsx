// src/components/Scanner/ScanResults.tsx

import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Link } from 'react-router-dom';
import { AnalysisResult, SafetyStatus, MeatType, SensoryData } from '../../types';
import { CheckCircle, AlertTriangle, AlertOctagon, RefreshCw, Save, BookOpen, Microscope, Sparkles, Construction, ArrowDown, TestTube, ChevronRight, Brain } from 'lucide-react';

import SensoryForm from './SensoryForm';

interface ScanResultsProps {
    result: AnalysisResult;
    isProMode: boolean;
    isDevMeatType: boolean;
    savingToAPI: boolean;
    showSensoryForm: boolean;
    sensoryData: SensoryData;
    onOpenDeepAnalysis: () => void;
    onSaveToStorage: () => Promise<void>;
    onReset: () => void;
    onRefineAnalysis: () => Promise<void>;
    setShowSensoryForm: (show: boolean) => void;
    setSensoryData: (data: SensoryData) => void;
    sensoryFormRef: React.RefObject<HTMLDivElement>;
}

const getStatusTheme = (status: SafetyStatus) => {
    switch (status) {
      case SafetyStatus.SAFE: return { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-100", icon: <CheckCircle className="w-8 h-8 text-emerald-500" />, scoreColor: "#10b981" };
      case SafetyStatus.CAUTION: return { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-100", icon: <AlertTriangle className="w-8 h-8 text-amber-500" />, scoreColor: "#f59e0b" };
      case SafetyStatus.DANGER: return { bg: "bg-rose-50", text: "text-rose-700", border: "border-rose-100", icon: <AlertOctagon className="w-8 h-8 text-rose-500" />, scoreColor: "#f43f5e" };
      default: return { bg: "bg-gray-50", text: "text-gray-700", border: "border-gray-200", icon: <AlertTriangle className="w-8 h-8 text-gray-400" />, scoreColor: "#9ca3af" };
    }
};

const renderGauge = (score: number, color: string) => {
    const data = [{ name: 'Score', value: score }, { name: 'Rest', value: 100 - score }];
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

const ScanResults: React.FC<ScanResultsProps> = ({
    result,
    isProMode,
    isDevMeatType,
    savingToAPI,
    showSensoryForm,
    sensoryData,
    onOpenDeepAnalysis,
    onSaveToStorage,
    onReset,
    onRefineAnalysis,
    setShowSensoryForm,
    setSensoryData,
    sensoryFormRef
}) => {
    
    const theme = getStatusTheme(result.safetyStatus);

    return (
        <div className="space-y-4 animate-fade-in-up">
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
                    onClick={onOpenDeepAnalysis}
                    className="w-full bg-linear-to-r from-slate-800 to-slate-900 text-white p-4 rounded-2xl shadow-lg shadow-slate-200 flex items-center justify-between group hover:scale-[1.01] transition-all"
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
                <SensoryForm 
                    sensoryData={sensoryData}
                    onRefineAnalysis={onRefineAnalysis}
                    setShowSensoryForm={setShowSensoryForm}
                    setSensoryData={setSensoryData}
                    sensoryFormRef={sensoryFormRef}
                />
            )}
            
            {/* ACTION BUTTONS ROW */}
            {!showSensoryForm && !isDevMeatType && (
                <div className="grid grid-cols-2 gap-3 mt-4">
                    {/* SAVE TO STORAGE/API BUTTON */}
                    <button
                        onClick={onSaveToStorage}
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
                        onClick={onReset}
                        className="w-full py-3 rounded-2xl bg-white border border-slate-200 text-slate-700 font-bold shadow-sm hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
                    >
                        <RefreshCw className="w-5 h-5" /> Quét mới
                    </button>
                </div>
            )}
            
            {/* Link to Dictionary */}
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
                                    <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${theme.scoreColor === '#10b981' ? 'bg-emerald-400' : 'bg-rose-400'}`} />
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
    );
};

export default ScanResults;