// src/components/Scanner/SensoryForm.tsx

import React from 'react';
import { XCircle, Wind, Fingerprint, Droplets, Brain } from 'lucide-react';
import { SensoryData } from '../../types';

interface SensoryFormProps {
    sensoryData: SensoryData;
    onRefineAnalysis: () => Promise<void>;
    setShowSensoryForm: (show: boolean) => void;
    setSensoryData: (data: SensoryData) => void;
    sensoryFormRef: React.RefObject<HTMLDivElement>;
}

const SensoryForm: React.FC<SensoryFormProps> = ({ 
    sensoryData, 
    onRefineAnalysis, 
    setShowSensoryForm, 
    setSensoryData,
    sensoryFormRef
}) => {
    
    const handleSliderChange = (key: keyof SensoryData, value: number) => {
        setSensoryData({...sensoryData, [key]: value});
    };

    return (
        <div ref={sensoryFormRef} className="bg-white rounded-4xl p-6 border border-slate-100 shadow-xl animate-fade-in-up relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-rose-400 to-purple-500"></div>
            <div className="flex justify-between items-start mb-2">
                <h3 className="text-xl font-black text-slate-800">Kiểm tra Cảm quan</h3>
                <button onClick={() => setShowSensoryForm(false)} className="p-1 rounded-full hover:bg-slate-100 text-slate-400">
                    <XCircle className="w-5 h-5" />
                </button>
            </div>

            <div className="space-y-6">
                {/* Sliders */}
                {/* Mùi vị */}
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
                            onChange={(e) => handleSliderChange('smell', Number(e.target.value))}
                            className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-rose-500 transition-all"
                    />
                </div>

                {/* Độ đàn hồi */}
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
                            onChange={(e) => handleSliderChange('texture', Number(e.target.value))}
                            className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-purple-500 transition-all"
                    />
                </div>

                {/* Bề mặt */}
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
                            onChange={(e) => handleSliderChange('moisture', Number(e.target.value))}
                            className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-sky-500 transition-all"
                    />
                </div>

                <button 
                        onClick={onRefineAnalysis}
                        className="w-full py-4 rounded-xl bg-rose-500 text-white font-bold shadow-lg shadow-rose-200 hover:scale-[1.02] transition-transform flex items-center justify-center gap-2 mt-4"
                >
                    <Brain className="w-5 h-5" /> Phân tích lại ngay
                </button>
            </div>
        </div>
    );
};

export default SensoryForm;