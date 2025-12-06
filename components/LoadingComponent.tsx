import React from 'react';
import {  RefreshCw, Utensils } from 'lucide-react';

const LoadingScreen: React.FC = () => {
  return (
    <div className="fixed inset-0 z-100 flex flex-col items-center justify-center p-6 bg-slate-900 text-white animate-fade-in">
      
      {/* Container Chính */}
      <div className="flex flex-col items-center space-y-6">
        
        {/* Logo/Icon Động */}
        <div className="relative">
          {/* Vòng quay ngoài (Outer Spin) */}
          <div className="w-24 h-24 rounded-full border-4 border-rose-400/20 border-t-rose-500 animate-spin-slow"></div>
          
          {/* Icon trung tâm (Center Icon) */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="p-3 bg-rose-500 rounded-full shadow-xl shadow-rose-500/30 animate-pulse">
                <Utensils className="w-8 h-8 text-white fill-white" />
            </div>
          </div>
        </div>
        
        {/* Text Đang tải */}
        <div className="text-center">
          <h1 className="text-2xl font-black text-amber-400 tracking-tight font-serif">
            Meat Inspector AI
          </h1>
          <p className="text-slate-400 text-sm mt-1 flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 text-slate-400 animate-spin" />
            Đang tải dữ liệu và xác thực phiên...
          </p>
        </div>
        
        {/* Tips hoặc Slogan */}
        <p className="text-xs text-slate-500 max-w-xs text-center pt-4 italic">
            "Công nghệ AI giúp bạn quản lý thực phẩm an toàn hơn mỗi ngày."
        </p>
        
      </div>
      
    </div>
  );
};

export default LoadingScreen;