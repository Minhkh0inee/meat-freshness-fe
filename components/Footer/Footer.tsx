import { BookOpen, Bot, ScanLine, Sparkles, User } from 'lucide-react';
import React from 'react'
import { Link } from 'react-router-dom';

const Footer = ({isLandingPage, isActive}) => {
      const mobileNavItems = [
    { path: '/scan', icon: ScanLine, label: 'Scan' },
    { path: '/assistant', icon: Bot, label: 'AI Chat' },
    { path: '/dictionary', icon: BookOpen, label: 'Từ điển' },
    { path: '/blog', icon: Sparkles, label: 'Blog' },
    { path: '/account', icon: User, label: 'Tôi' },
  ];
  return !isLandingPage && (
        <div className="md:hidden fixed bottom-5 left-0 right-0 z-50 flex justify-center pointer-events-none">
            {/* Compact Container - "Floating Island" style - Smaller & Nicer */}
            <nav className="pointer-events-auto bg-white/80 backdrop-blur-xl rounded-4xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-white/50 p-1.5 flex items-center gap-1 ring-1 ring-black/5 scale-90 origin-bottom">
              
              {mobileNavItems.map((item) => {
                const active = isActive(item.path);
                
                return (
                  <Link 
                      key={item.path}
                      to={item.path}
                      className={`relative px-4 py-3 rounded-4xl transition-all duration-300 ease-out group flex items-center justify-center ${
                         active 
                         ? 'bg-rose-500 text-white shadow-lg shadow-rose-200' 
                         : 'text-slate-400 hover:bg-slate-100/50'
                      }`}
                  >   
                      <item.icon className={`w-5 h-5 ${active ? "stroke-[2.5px]" : "stroke-2"}`} />
                  </Link>
                );
              })}
            </nav>
        </div>
      )
}

export default Footer