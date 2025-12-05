import React from 'react';
import { Link } from 'react-router-dom';
import { Ghost } from 'lucide-react';

const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#FFF0F3] text-slate-800">
      <div className="bg-white rounded-3xl shadow-xl p-8 flex flex-col items-center">
        <Ghost className="w-16 h-16 text-rose-400 mb-4" />
        <h1 className="text-3xl font-bold mb-2">404 - Không tìm thấy trang</h1>
        <p className="text-slate-500 mb-6">Trang bạn yêu cầu không tồn tại hoặc đã bị di chuyển.</p>
        <Link
          to="/"
          className="px-6 py-3 bg-rose-500 text-white rounded-xl font-bold hover:bg-rose-600 transition-colors"
        >
          Quay về trang chủ
        </Link>
      </div>
    </div>
  );
};

export default NotFound;