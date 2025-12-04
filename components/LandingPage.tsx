import React from 'react';
import { Link } from 'react-router-dom';
import { Microscope, Database, ArrowRight, ShieldCheck, Smartphone, Zap, ChefHat, Beef, Drumstick, BookOpen, Camera, Search, FileText, Thermometer, Snowflake, Clock, ChevronRight, FlaskConical, Activity, Droplets, Wind, Palette, Bot, Sparkles } from 'lucide-react';
import { MeatType } from '../types';
import { blogPosts } from '../utils/mockData';

const LandingPage: React.FC = () => {
  const meatPreviews = [
    { 
        type: MeatType.PORK, 
        icon: <ChefHat className="w-6 h-6" />, 
        color: 'bg-rose-100 text-rose-600',
        label: 'Thịt Heo' 
    },
    { 
        type: MeatType.BEEF, 
        icon: <Beef className="w-6 h-6" />, 
        color: 'bg-red-100 text-red-600',
        label: 'Thịt Bò'
    },
    { 
        type: MeatType.CHICKEN, 
        icon: <Drumstick className="w-6 h-6" />, 
        color: 'bg-orange-100 text-orange-600',
        label: 'Thịt Gà'
    }
  ];

  const steps = [
    {
      icon: <Camera className="w-6 h-6" />,
      title: "1. Chụp Ảnh",
      desc: "Chụp rõ miếng thịt dưới ánh sáng tốt."
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "2. AI Phân Tích",
      desc: "Hệ thống quét màu sắc & kết cấu trong 3s."
    },
    {
      icon: <Bot className="w-6 h-6" />,
      title: "3. Hỏi Trợ Lý",
      desc: "Chat với Chef Gordon để lấy thực đơn."
    }
  ];

  const tips = [
    {
      icon: <Snowflake className="w-5 h-5 text-sky-500" />,
      bg: "bg-sky-50",
      title: "Đông lạnh đúng cách",
      desc: "-18°C là nhiệt độ vàng để vi khuẩn ngủ đông."
    },
    {
      icon: <Thermometer className="w-5 h-5 text-rose-500" />,
      bg: "bg-rose-50",
      title: "Rã đông an toàn",
      desc: "Luôn rã đông trong ngăn mát, không dùng nước nóng."
    },
    {
      icon: <Clock className="w-5 h-5 text-amber-500" />,
      bg: "bg-amber-50",
      title: "Thời gian vàng",
      desc: "Thịt xay chỉ nên để ngăn mát tối đa 24h."
    }
  ];

  return (
    <div className="min-h-screen bg-rose-50 text-slate-900 font-sans relative overflow-x-hidden pb-20">
      
      {/* Background Gradients */}
      <div className="absolute top-0 left-0 w-full h-[600px] bg-gradient-to-b from-pink-100 via-rose-50 to-transparent opacity-60 z-0"></div>
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-rose-200/40 rounded-full blur-3xl"></div>
      <div className="absolute top-40 -left-20 w-72 h-72 bg-blue-100/40 rounded-full blur-3xl"></div>

      <div className="relative z-10 flex flex-col min-h-screen pt-8">
        
        {/* Hero Section */}
        <div className="flex-1 flex flex-col lg:flex-row items-center lg:justify-between lg:gap-16 px-6 pb-16 max-w-7xl mx-auto w-full">
          
          {/* Text Content */}
          <div className="lg:w-1/2 flex flex-col items-center lg:items-start text-center lg:text-left">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-rose-100 shadow-sm mb-8 animate-fade-in-up">
                <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
                </span>
                <span className="text-[11px] font-bold tracking-widest uppercase text-rose-500">AI Food Technology 3.0</span>
            </div>
            
            <h1 className="text-5xl lg:text-7xl font-black tracking-tight mb-6 leading-[1.1] text-slate-900 animate-fade-in-up delay-100 font-serif">
                An Toàn Trọn Gói <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-pink-400">Chọn Thịt Tươi Rói</span>
            </h1>
            
            <p className="text-slate-500 text-lg lg:text-xl mb-10 leading-relaxed animate-fade-in-up delay-200 font-medium max-w-xl">
                Ứng dụng AI đầu tiên tại Việt Nam giúp bạn kiểm tra độ tươi của thịt chỉ trong 3 giây. Nay đã có thêm Trợ lý Ảo đồng hành cùng căn bếp Việt.
            </p>

            <div className="w-full sm:w-auto flex flex-col sm:flex-row gap-4 animate-fade-in-up delay-300 relative z-20 mb-12 lg:mb-0">
                <Link to="/scan" className="group relative overflow-hidden bg-slate-900 text-white font-bold text-lg py-4 px-8 rounded-2xl shadow-xl shadow-rose-200 hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 w-full sm:w-auto text-center">
                    <div className="absolute inset-0 bg-gradient-to-r from-rose-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <span className="relative flex items-center justify-center gap-3">
                        Kiểm tra ngay <ArrowRight className="w-5 h-5" />
                    </span>
                </Link>
                <Link to="/assistant" className="bg-white text-slate-700 font-bold text-lg py-4 px-8 rounded-2xl shadow-sm border border-rose-100 hover:bg-rose-50 transition-all w-full sm:w-auto text-center flex items-center justify-center gap-2">
                    <Sparkles className="w-5 h-5 text-amber-500" /> Trợ lý AI
                </Link>
            </div>
          </div>

          {/* Visual/Interactive Content */}
          <div className="lg:w-1/2 w-full animate-fade-in-up delay-300">
             <div className="bg-white/60 backdrop-blur-md p-6 lg:p-8 rounded-[2.5rem] border border-white shadow-2xl shadow-rose-100">
                <div className="flex items-center justify-between mb-6 px-2">
                    <div className="flex items-center gap-2 text-slate-400 uppercase tracking-widest text-[10px] font-bold">
                        <BookOpen className="w-3 h-3" /> Khám phá Từ điển
                    </div>
                    <div className="flex gap-1">
                        <div className="w-2 h-2 rounded-full bg-rose-400"></div>
                        <div className="w-2 h-2 rounded-full bg-slate-200"></div>
                        <div className="w-2 h-2 rounded-full bg-slate-200"></div>
                    </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {meatPreviews.map((item) => (
                        <Link 
                            key={item.label}
                            to={`/dictionary?type=${encodeURIComponent(item.type)}`}
                            className="bg-white rounded-2xl p-5 lg:p-6 shadow-sm hover:shadow-xl hover:shadow-rose-100 hover:-translate-y-1 transition-all border border-rose-50 flex flex-col items-center gap-4 group cursor-pointer"
                        >
                            <div className={`w-16 h-16 rounded-full flex items-center justify-center ${item.color} group-hover:scale-110 transition-transform text-xl`}>
                                {item.icon}
                            </div>
                            <div className="text-sm lg:text-base font-bold text-slate-700">{item.label}</div>
                            <div className="w-8 h-1 bg-slate-100 rounded-full group-hover:bg-rose-200 transition-colors"></div>
                        </Link>
                    ))}
                </div>

                <div className="mt-6 pt-6 border-t border-rose-100 flex items-center justify-between text-xs text-slate-400 font-medium">
                    <span>Dữ liệu cập nhật: 2025</span>
                    <span>500+ lượt quét</span>
                </div>
             </div>
          </div>
        </div>

        {/* Value Proposition (Features) */}
        <div className="bg-white py-16 lg:py-24 rounded-[3rem] shadow-[0_-10px_40px_rgba(0,0,0,0.03)] relative z-10 mx-4 lg:mx-8 mb-6">
            <div className="max-w-7xl mx-auto px-6 lg:px-12">
                <div className="text-center mb-12 lg:mb-16">
                    <h2 className="text-3xl lg:text-4xl font-black text-slate-800 mb-4">Tại sao cần AI?</h2>
                    <p className="text-slate-500 text-base lg:text-lg max-w-2xl mx-auto">Mắt thường có thể bị đánh lừa bởi ánh sáng hoặc thủ thuật của người bán. AI phân tích dựa trên dữ liệu khoa học chính xác.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                        { 
                            icon: Microscope, 
                            color: "text-rose-500", 
                            bg: "bg-rose-50", 
                            title: "Soi thớ thịt", 
                            desc: "Phát hiện độ đàn hồi và kết cấu vi mô của thớ thịt." 
                        },
                        { 
                            icon: Database, 
                            color: "text-blue-500", 
                            bg: "bg-blue-50", 
                            title: "Big Data", 
                            desc: "Huấn luyện trên 2000+ mẫu thịt chuẩn." 
                        },
                        { 
                            icon: Bot, 
                            color: "text-purple-500", 
                            bg: "bg-purple-50", 
                            title: "Trợ lý Ảo", 
                            desc: "Đầu bếp AI lên thực đơn và hướng dẫn nấu ăn." 
                        },
                        { 
                            icon: ShieldCheck, 
                            color: "text-emerald-500", 
                            bg: "bg-emerald-50", 
                            title: "An toàn", 
                            desc: "Cảnh báo sớm rủi ro nhiễm khuẩn Salmonella." 
                        }
                    ].map((item, idx) => (
                        <div key={idx} className="flex flex-col gap-4 p-6 rounded-3xl border border-slate-50 bg-slate-50/50 hover:bg-white hover:shadow-lg transition-all duration-300">
                            <div className={`w-14 h-14 rounded-2xl ${item.bg} ${item.color} flex items-center justify-center flex-shrink-0 mb-2`}>
                                <item.icon className="w-7 h-7" />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-800 text-lg mb-2">{item.title}</h3>
                                <p className="text-slate-500 text-sm leading-relaxed">{item.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>

        {/* SCIENTIFIC FOUNDATION SECTION */}
        <div className="max-w-7xl mx-auto px-6 lg:px-12 mb-24">
            <div className="bg-slate-900 rounded-[2.5rem] p-8 lg:p-12 relative overflow-hidden shadow-2xl shadow-slate-400/50">
                {/* Decorative Blobs */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-rose-500/20 rounded-full blur-[100px] pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/20 rounded-full blur-[100px] pointer-events-none"></div>

                <div className="relative z-10">
                    <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 mb-12">
                        <div>
                            <div className="inline-block px-3 py-1 rounded-lg bg-white/10 text-rose-300 text-xs font-bold uppercase tracking-widest mb-3 border border-white/10">
                                Scientific Core
                            </div>
                            <h2 className="text-3xl lg:text-4xl font-black text-white mb-2">Cơ sở huấn luyện AI</h2>
                            <p className="text-slate-400 max-w-xl">
                                Dữ liệu không chỉ là hình ảnh. Chúng tôi huấn luyện mô hình dựa trên 5 chỉ số vàng của công nghệ thực phẩm (FoodTech).
                            </p>
                        </div>
                        <div className="hidden lg:block">
                            <FlaskConical className="w-16 h-16 text-white/10" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                        {[
                            {
                                label: "pH Level",
                                icon: FlaskConical,
                                value: "5.4 - 6.2",
                                desc: "Độ chua/kiềm quyết định khả năng giữ nước & màu sắc.",
                                color: "text-emerald-400",
                                borderColor: "border-emerald-500/30"
                            },
                            {
                                label: "CIE Lab*",
                                icon: Palette,
                                value: "Color Space",
                                desc: "Không gian màu tiêu chuẩn đo lường sắc tố Myoglobin.",
                                color: "text-rose-400",
                                borderColor: "border-rose-500/30"
                            },
                            {
                                label: "TPA Texture",
                                icon: Activity,
                                value: "Elasticity",
                                desc: "Phân tích độ cứng & đàn hồi bề mặt vật lý.",
                                color: "text-blue-400",
                                borderColor: "border-blue-500/30"
                            },
                            {
                                label: "Water Activity",
                                icon: Droplets,
                                value: "aw < 0.99",
                                desc: "Hoạt độ nước tự do - môi trường sống của vi khuẩn.",
                                color: "text-sky-400",
                                borderColor: "border-sky-500/30"
                            },
                            {
                                label: "TVB-N",
                                icon: Wind,
                                value: "< 20mg",
                                desc: "Chỉ số Nitơ bazơ bay hơi biểu hiện sự ôi thiu.",
                                color: "text-purple-400",
                                borderColor: "border-purple-500/30"
                            }
                        ].map((item, idx) => (
                            <div key={idx} className={`bg-white/5 backdrop-blur-sm border ${item.borderColor} p-5 rounded-2xl hover:bg-white/10 transition-colors`}>
                                <item.icon className={`w-6 h-6 ${item.color} mb-3`} />
                                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">{item.label}</div>
                                <div className="text-lg font-bold text-white mb-2">{item.value}</div>
                                <p className="text-[11px] text-slate-400 leading-snug">
                                    {item.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>

        {/* How It Works Section */}
        <div className="mb-20 max-w-7xl mx-auto px-6 lg:px-12">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-12">
                <div className="lg:w-1/3">
                    <h2 className="text-3xl lg:text-4xl font-black text-slate-800 mb-4">Cách sử dụng đơn giản</h2>
                    <p className="text-slate-500 mb-8">Chỉ với 3 bước, bạn đã có thể trở thành chuyên gia chọn thực phẩm.</p>
                    <Link to="/scan" className="hidden lg:inline-flex items-center gap-2 text-rose-600 font-bold hover:gap-3 transition-all">
                        Thử ngay bây giờ <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
                
                <div className="lg:w-2/3 relative border-l-2 border-rose-200 ml-4 lg:ml-0 lg:border-l-0 lg:grid lg:grid-cols-3 lg:gap-8 py-2 lg:py-0">
                    {steps.map((step, idx) => (
                        <div key={idx} className="relative pl-8 lg:pl-0 mb-8 lg:mb-0 last:mb-0">
                            <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-rose-500 border-4 border-rose-50 lg:hidden"></div>
                            <div className="flex flex-col gap-4 lg:bg-white lg:p-6 lg:rounded-3xl lg:border lg:border-rose-50 lg:shadow-sm lg:h-full">
                                <div className="w-12 h-12 bg-rose-100 rounded-2xl flex items-center justify-center text-rose-500 shadow-sm">
                                    {step.icon}
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-800 text-lg mb-2">{step.title}</h3>
                                    <p className="text-slate-500 text-sm leading-relaxed">{step.desc}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>

        {/* Quick Storage Tips */}
        <div className="mb-20 bg-gradient-to-r from-rose-50 to-white py-12">
             <div className="max-w-7xl mx-auto px-6 lg:px-12">
                <div className="flex justify-between items-end mb-8">
                    <h2 className="text-3xl font-black text-slate-800">Mẹo bảo quản</h2>
                    <span className="text-xs font-bold text-rose-500 uppercase hidden sm:block">Kiến thức quan trọng</span>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {tips.map((tip, idx) => (
                        <div key={idx} className={`p-6 lg:p-8 rounded-[2rem] border border-white shadow-sm ${tip.bg} flex flex-col justify-between min-h-[180px] hover:-translate-y-1 transition-transform duration-300`}>
                            <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm mb-4">
                                {tip.icon}
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-800 text-lg mb-2">{tip.title}</h3>
                                <p className="text-sm text-slate-600 font-medium leading-relaxed">{tip.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
             </div>
        </div>

        {/* Featured Blog Posts */}
        <div className="max-w-7xl mx-auto px-6 lg:px-12 mb-20">
            <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-black text-slate-800">Bài viết nổi bật</h2>
                <Link to="/blog" className="text-rose-500 font-bold flex items-center gap-1 hover:gap-2 transition-all">
                    Xem tất cả <ChevronRight className="w-4 h-4" />
                </Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {blogPosts.slice(0, 3).map((post) => (
                    <Link to={`/blog/${post.id}`} key={post.id} className="group flex flex-col bg-white p-4 rounded-[2rem] shadow-sm border border-rose-50 hover:shadow-xl hover:shadow-rose-100/50 transition-all duration-300 h-full">
                        <div className="h-48 rounded-2xl overflow-hidden mb-4 relative">
                            <img src={post.image} alt={post.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                            <span className="absolute top-3 left-3 text-[10px] font-bold text-white bg-black/50 backdrop-blur-md px-3 py-1 rounded-full uppercase border border-white/20">{post.category}</span>
                        </div>
                        <div className="flex flex-col flex-1">
                            <h3 className="font-bold text-slate-800 text-lg mb-3 line-clamp-2 group-hover:text-rose-600 transition-colors font-serif">{post.title}</h3>
                            <p className="text-slate-400 text-sm line-clamp-2 mb-4 flex-1">{post.excerpt}</p>
                            <div className="flex items-center gap-2 text-xs font-bold text-slate-300 pt-4 border-t border-slate-50">
                                <span>Đọc tiếp</span> <ArrowRight className="w-3 h-3" />
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 py-20 border-t border-slate-100">
            <div className="max-w-7xl mx-auto px-6 text-center">
                <div className="p-8 lg:p-12 bg-rose-100 rounded-[3rem] mb-12 max-w-3xl mx-auto relative overflow-hidden">
                    <div className="relative z-10">
                        <div className="flex items-center justify-center gap-3 mb-4">
                            <Smartphone className="w-8 h-8 text-rose-600" />
                            <span className="font-black text-2xl text-rose-800">Dùng thử miễn phí</span>
                        </div>
                        <p className="text-rose-700 font-medium mb-6">Trải nghiệm công nghệ AI bảo vệ sức khỏe gia đình bạn ngay hôm nay.</p>
                        <Link to="/scan" className="inline-block bg-rose-600 text-white px-8 py-3 rounded-full font-bold hover:bg-rose-700 transition-colors shadow-lg shadow-rose-200">
                            Bắt đầu ngay
                        </Link>
                    </div>
                    <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/30 rounded-full blur-3xl"></div>
                    <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-white/30 rounded-full blur-3xl"></div>
                </div>

                <div className="flex flex-col md:flex-row items-center justify-center gap-6 text-slate-400 text-sm font-medium">
                    <span>© 2024 Fresh Meat Assistant</span>
                    <span className="hidden md:inline">•</span>
                    <span>Design with ❤️ for Vietnam</span>
                </div>
            </div>
        </div>

      </div>
    </div>
  );
};

export default LandingPage;