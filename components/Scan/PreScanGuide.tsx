// src/components/Scanner/PreScanGuide.tsx

import React from 'react';
import { Sun, Focus, Scan, Aperture, Lightbulb, ShieldCheck } from 'lucide-react';

const PreScanGuide: React.FC = () => {
    return (
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
            <div className="bg-linear-to-r from-rose-500 to-pink-500 rounded-2xl p-5 text-white shadow-lg shadow-rose-200 relative overflow-hidden group">
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
                 <ShieldCheck className="w-5 h-5 text-slate-400 mt-0.5 shrink-0" />
                 <div>
                     <h4 className="font-bold text-slate-700 text-sm mb-1">Bảo mật tuyệt đối</h4>
                     <p className="text-xs text-slate-500 leading-relaxed">
                         Hình ảnh của bạn được phân tích bởi AI tiên tiến và không được chia sẻ cho bên thứ ba. Kết quả chỉ mang tính chất tham khảo.
                     </p>
                 </div>
            </div>
        </div>
    );
};

export default PreScanGuide;