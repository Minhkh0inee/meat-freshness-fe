import React, { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ScanLine, BookOpen, Sparkles, Home, ChefHat, Clock, Bot, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const { isAuthenticated, user } = useAuth();
  const isLandingPage = location.pathname === '/';
  const isPremiumPage = location.pathname === '/premium';

  // Hide navigation on premium page
  if (isPremiumPage) {
      return <>{children}</>;
  }

  // Desktop Nav Items
  const desktopNavItems = [
    { path: '/scan', icon: ScanLine, label: 'Scan' },
    { path: '/assistant', icon: Bot, label: 'Trợ lý AI' },
    { path: '/dictionary', icon: BookOpen, label: 'Từ điển' },
    { path: '/blog', icon: Sparkles, label: 'Blog' },
  ];

  // Mobile Nav Items
  const mobileNavItems = [
    { path: '/scan', icon: ScanLine, label: 'Scan' },
    { path: '/assistant', icon: Bot, label: 'AI Chat' },
    { path: '/dictionary', icon: BookOpen, label: 'Từ điển' },
    { path: '/blog', icon: Sparkles, label: 'Blog' },
    { path: '/account', icon: User, label: 'Tôi' },
  ];

  // Helper to check active route
  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FFF0F3] relative overflow-x-hidden font-sans text-slate-900">
      
      {/* TOP HEADER - Responsive */}
      <header className={`bg-white/80 backdrop-blur-xl sticky top-0 z-40 border-b border-rose-100/50 transition-all duration-300 supports-[backdrop-filter]:bg-white/60`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            {/* Logo Area */}
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 bg-gradient-to-br from-rose-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg shadow-rose-200 group-hover:scale-105 transition-transform duration-300 ring-2 ring-white">
                <ChefHat className="w-6 h-6 text-white" />
              </div>
              <div className="flex flex-col">
                <h1 className="font-black text-lg text-slate-800 leading-none tracking-tight font-serif">Thịt Tươi Rói</h1>
                <span className="text-[10px] font-bold text-rose-500 tracking-widest uppercase mt-0.5">AI Food Assistant</span>
              </div>
            </Link>

            {/* RIGHT SIDE ACTIONS */}
            {isLandingPage ? (
               /* Landing page - show sign in or start button */
               <div className="flex items-center gap-3">
                 {isAuthenticated ? (
                   <Link 
                     to="/scan" 
                     className="px-5 py-2 bg-rose-500 text-white font-bold rounded-full text-sm shadow-lg shadow-rose-200 hover:bg-rose-600 hover:scale-105 transition-all duration-300"
                   >
                      Vào ứng dụng
                   </Link>
                 ) : (
                   <>
                     <Link 
                       to="/signin" 
                       className="px-4 py-2 text-slate-600 hover:text-rose-500 font-bold text-sm transition-colors"
                     >
                        Đăng nhập
                     </Link>
                     <Link 
                       to="/signup" 
                       className="px-5 py-2 bg-rose-500 text-white font-bold rounded-full text-sm shadow-lg shadow-rose-200 hover:bg-rose-600 hover:scale-105 transition-all duration-300"
                     >
                        Bắt đầu ngay
                     </Link>
                   </>
                 )}
               </div>
            ) : (
               /* APP NAVIGATION */
               <>
                {/* DESKTOP NAVIGATION (Tablet Landscape & PC) */}
                <nav className="hidden md:flex items-center gap-2">
                    {desktopNavItems.map((item) => {
                        const active = isActive(item.path);
                        return (
                            <Link 
                                key={item.path}
                                to={item.path}
                                className={`relative px-5 py-2.5 rounded-full text-sm font-bold transition-all duration-300 flex items-center gap-2 ${
                                    active 
                                    ? "bg-rose-50 text-rose-600 shadow-sm ring-1 ring-rose-200/50" 
                                    : "text-slate-500 hover:bg-white hover:text-slate-700 hover:shadow-sm"
                                }`}
                            >
                                <item.icon className={`w-4 h-4 ${active ? "stroke-[2.5px]" : "stroke-2"}`} />
                                {item.label}
                            </Link>
                        )
                    })}
                    <div className="w-px h-6 bg-slate-200 mx-2"></div>

                    {/* Account Button - Show user name if authenticated */}
                    {isAuthenticated ? (
                      <Link to="/account" className={`p-2.5 rounded-full border shadow-sm transition-all hover:scale-105 flex items-center gap-2 px-4 ${isActive('/account') ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-500 border-slate-100 hover:border-rose-200'}`}>
                          {user?.avatar ? (
                            <img 
                              src={user.avatar} 
                              alt="Avatar" 
                              className="w-5 h-5 rounded-full object-cover" 
                            />
                          ) : (
                            <User className="w-4 h-4" />
                          )}
                          <span className="text-sm font-bold">
                            {user?.name || 'Tài khoản'}
                          </span>
                      </Link>
                    ) : (
                      <Link 
                        to="/signin" 
                        className="p-2.5 rounded-full border shadow-sm transition-all hover:scale-105 flex items-center gap-2 px-4 bg-white text-slate-500 border-slate-100 hover:border-rose-200"
                      >
                          <User className="w-4 h-4" />
                          <span className="text-sm font-bold">Đăng nhập</span>
                      </Link>
                    )}
                </nav>

                {/* Mobile Header Right - Show user name if authenticated */}
                <div className="md:hidden flex items-center">
                  {isAuthenticated && user ? (
                    <Link to="/account" className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/50 border border-white/20">
                      {user.avatar ? (
                        <img 
                          src={user.avatar} 
                          alt="Avatar" 
                          className="w-6 h-6 rounded-full object-cover" 
                        />
                      ) : (
                        <User className="w-4 h-4 text-slate-500" />
                      )}
                      <span className="text-xs font-bold text-slate-600 max-w-[80px] truncate">
                        {user.name}
                      </span>
                    </Link>
                  ) : (
                    <Link 
                      to="/signin" 
                      className="text-xs font-bold text-slate-500 px-3 py-1.5 rounded-full bg-white/50 border border-white/20"
                    >
                      Đăng nhập
                    </Link>
                  )}
                </div>
               </>
            )}
          </div>
      </header>

      {/* MAIN CONTENT */}
      <main className={`flex-1 w-full ${!isLandingPage ? 'pb-24 md:pb-12' : ''}`}>
        <div className={`${!isLandingPage ? 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6' : ''}`}>
           {children}
        </div>
      </main>

      {/* MOBILE BOTTOM NAVIGATION (Ultra Compact Floating) */}
      {!isLandingPage && (
        <div className="md:hidden fixed bottom-5 left-0 right-0 z-50 flex justify-center pointer-events-none">
            {/* Compact Container - "Floating Island" style - Smaller & Nicer */}
            <nav className="pointer-events-auto bg-white/80 backdrop-blur-xl rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-white/50 p-1.5 flex items-center gap-1 ring-1 ring-black/5 scale-90 origin-bottom">
              
              {mobileNavItems.map((item) => {
                const active = isActive(item.path);
                
                return (
                  <Link 
                      key={item.path}
                      to={item.path}
                      className={`relative px-4 py-3 rounded-[1.5rem] transition-all duration-300 ease-out group flex items-center justify-center ${
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
      )}
    </div>
  );
};

export default Layout;
