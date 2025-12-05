import React from 'react';
import { Link } from 'react-router-dom';
import { Outlet } from "react-router-dom";
interface AuthLayoutProps {
  children?: React.ReactNode;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-linear-to-br from-rose-50 via-white to-orange-50">
      {/* Header */}
      <header className="p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-rose-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">🥩</span>
            </div>
            <span className="font-black text-xl text-slate-800">MeatFresh</span>
          </Link>
          
          <nav className="hidden md:flex items-center gap-6">
            <Link to="/" className="text-slate-600 hover:text-rose-500 transition-colors">
              Trang chủ
            </Link>
            <Link to="/blog" className="text-slate-600 hover:text-rose-500 transition-colors">
              Blog
            </Link>
            <Link to="/dictionary" className="text-slate-600 hover:text-rose-500 transition-colors">
              Từ điển
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-4">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="p-4 text-center text-xs text-slate-400">
        © 2024 MeatFresh. Tất cả quyền được bảo lưu.
      </footer>
    </div>
  );
};

export default AuthLayout;