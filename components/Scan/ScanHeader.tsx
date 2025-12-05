import React from 'react';
import { Camera, Crown } from 'lucide-react';

interface ScannerHeaderProps {
    imageLoaded: boolean;
    isProMode: boolean;
    onToggleProMode: () => void;
    navigate: (path: string) => void;
}

const ScannerHeader: React.FC<ScannerHeaderProps> = ({ imageLoaded, isProMode, onToggleProMode, navigate }) => {
    return (
        <div className="flex items-center justify-between mb-2 px-1">
            <div>
                <h2 className="text-2xl font-black text-slate-800 tracking-tight font-serif">Kiểm tra thịt</h2>
                <p className="text-slate-500 text-sm font-medium">Chụp ảnh để AI phân tích độ tươi</p>
            </div>
            <div className="flex items-center gap-2">
                <button
                    onClick={onToggleProMode}
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
                            ? 'bg-linear-to-br from-amber-300 to-yellow-500 rotate-0 scale-110' 
                            : 'bg-slate-100 group-hover:bg-rose-50'}
                        `}>
                            <Crown className={`w-4 h-4 transition-colors ${isProMode ? 'text-amber-900 fill-amber-900' : 'text-slate-400 group-hover:text-rose-500'}`} />
                        </div>
                    </div>
                    
                    {/* Glow effect for Pro */}
                    {isProMode && <div className="absolute inset-0 bg-amber-400/10 blur-md rounded-full pointer-events-none"></div>}
                </button>

                {!imageLoaded && (
                    <div className="p-2.5 bg-rose-100 rounded-full shadow-sm">
                        <Camera className="w-6 h-6 text-rose-500" />
                    </div>
                )}
            </div>
        </div>
    );
};

export default ScannerHeader;