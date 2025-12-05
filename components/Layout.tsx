import React, { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ScanLine, BookOpen, Sparkles, Home, ChefHat, Clock, Bot, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Header from './Header/Header';
import Footer from './Footer/Footer';
import { Outlet } from "react-router-dom";
interface LayoutProps {
  children?: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();

  const isLandingPage = location.pathname === '/';
  const isPremiumPage = location.pathname === '/premium';

  // Hide navigation on premium page
  if (isPremiumPage) {
      return <>{children}</>;
  }



  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FFF0F3] relative overflow-x-hidden font-sans text-slate-900">
      <Header isLandingPage={isLandingPage}/>

      {/* MAIN CONTENT */}
      <main className={`flex-1 w-full ${!isLandingPage ? 'pb-24 md:pb-12' : ''}`}>
        <div className={`${!isLandingPage ? 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6' : ''}`}>
           <Outlet />
        </div>
      </main>

      <Footer isLandingPage={isLandingPage} isActive={isActive}/>
    </div>
  );
};

export default Layout;
