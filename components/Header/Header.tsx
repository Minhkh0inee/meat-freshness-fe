
import { useAuth } from '@/src/context/AuthContext';
import { BookOpen, Bot, ChefHat, ScanLine, Sparkles, User } from 'lucide-react';
import logoImg from '../../public/logo.png'
import { Link } from 'react-router-dom';


const Header = ({isLandingPage}) => {
      const { isAuthenticated, user } = useAuth();
      const desktopNavItems = [
        { path: "/scan", icon: ScanLine, label: "Scan" },
        { path: "/assistant", icon: Bot, label: "Trợ lý AI" },
        { path: "/dictionary", icon: BookOpen, label: "Từ điển" },
        { path: "/blog", icon: Sparkles, label: "Blog" },
      ];

      const isActive = (path: string) => {
        if (path === "/") return location.pathname === "/";
        return location.pathname.startsWith(path);
      };
  return (
          <header className={`bg-white/80 backdrop-blur-xl sticky top-0 z-40 border-b border-rose-100/50 transition-all duration-300 supports-backdrop-filter:bg-white/60`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 bg-linear-to-br from-rose-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg shadow-rose-200 group-hover:scale-105 transition-transform duration-300 ring-2 ring-white">
                <img src={logoImg} alt="" className='object-cover w-full h-full rounded-2xl'/>
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
                       to="/scan" 
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
                      <span className="text-xs font-bold text-slate-600 max-w-20 truncate">
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
  )
}

export default Header