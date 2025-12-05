import React from 'react';
import { AlertOctagon } from 'lucide-react';

interface ScanLimitMaskProps {
    limit: number;
    navigate: (path: string) => void;
}

const ScanLimitMask: React.FC<ScanLimitMaskProps> = ({ limit, navigate }) => {
    return (
        <div className="absolute inset-0 z-50 bg-slate-900/90 backdrop-blur-sm flex items-center justify-center p-8 animate-fade-in">
            <div className="bg-white p-8 rounded-3xl shadow-2xl text-center max-w-sm">
                <AlertOctagon className="w-10 h-10 text-rose-500 mx-auto mb-4" />
                <h3 className="text-xl font-black text-slate-800 mb-2">Đã hết lượt quét</h3>
                <p className="text-slate-600 text-sm mb-6">
                    Chỉ được <span className='font-bold'>{limit} lần quét</span>.
                    <br/>Vui lòng <span className='font-bold'>Đăng nhập</span> để sử dụng không giới hạn!
                </p>
                <button
                    onClick={() => navigate('/login')} // Thay bằng '/login' nếu path là login
                    className="cursor-pointer w-full py-3 rounded-xl bg-rose-500 text-white font-bold shadow-lg hover:bg-rose-600 transition-colors"
                >
                    Đăng nhập ngay
                </button>
            </div>
        </div>
    );
};

export default ScanLimitMask;