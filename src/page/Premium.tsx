import React, { useState, useEffect } from 'react';
import { Check, Crown, Sparkles, X, Zap, ShieldCheck, Smartphone, Brain, Loader, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useProfile } from '../../hooks/useProfile';
import { useAuth } from '../context/AuthContext';

// Định nghĩa types cho plan
type PlanType = 'monthly' | 'annual';

const Premium: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { user, loading: profileLoading, updateSubscription, error: profileError } = useProfile();
  
  const [isProcessing, setIsProcessing] = useState(false);
  
  const currentPlan = user?.subscriptionType || 'free'; 
  const isMonthly = currentPlan === 'monthly';
  const isAnnual = currentPlan === 'annual';
  const loading = isProcessing || profileLoading || authLoading;

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      alert("Vui lòng đăng nhập để nâng cấp gói.");
      navigate('/signin');
    }
  }, [isAuthenticated, authLoading, navigate]);

  const handleSubscribe = async (plan: PlanType) => {
    if (plan === currentPlan) return;

    setIsProcessing(true);
    
    try {
        const subscriptionType = plan;

        await updateSubscription({
            isPro: true,
            subscriptionType: subscriptionType,
        });

        alert(`Chúc mừng! Bạn đã chuyển sang gói ${plan === 'annual' ? 'Năm (VIP)' : 'Tháng'} thành công.`);
        navigate('/account'); 

    } catch (error) {
        console.error('Subscription update failed:', error);
        alert('Có lỗi xảy ra khi đăng ký/cập nhật gói. Vui lòng thử lại.');
    } finally {
        setIsProcessing(false);
    }
  };

  const renderButtonContent = (plan: PlanType) => {
      if (isProcessing) return <><Loader className="w-4 h-4 animate-spin" /> Đang xử lý...</>;
      
      // Hiển thị trạng thái "ĐANG SỬ DỤNG"
      if (plan === currentPlan) {
          return <>✅ ĐANG SỬ DỤNG</>;
      }
      
      return plan === 'monthly' ? 'Chọn Gói Tháng' : 'Đăng Ký Ngay';
  };
  
  // Hiển thị Loading toàn màn hình
  if (loading) {
      return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900">
            <Loader className="w-8 h-8 animate-spin text-amber-400" />
            <span className="text-white ml-3">Đang tải trạng thái gói...</span>
        </div>
      );
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center p-4 animate-fade-in-up overflow-y-auto bg-slate-900">
      
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 z-0 pointer-events-none"></div>
      <div className="absolute top-0 left-0 w-full h-full opacity-10 z-0 pointer-events-none" style={{backgroundImage: 'url("https://www.transparenttextures.com/patterns/cubes.png")'}}></div>
      <div className="absolute top-20 right-20 w-64 h-64 bg-amber-500/20 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-20 left-20 w-64 h-64 bg-rose-500/20 rounded-full blur-[100px] pointer-events-none"></div>

      {/* Close Button / Go Back */}
      <button 
        onClick={() => navigate(-1)}
        className="absolute top-6 left-6 z-50 p-2 bg-white/10 text-white rounded-full hover:bg-white/20 transition-colors backdrop-blur-sm"
        disabled={isProcessing}
      >
        <ArrowLeft className="w-6 h-6" />
      </button>

      <div className="relative z-10 max-w-5xl w-full space-y-10 py-10">
        
        {/* Header */}
        <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-200 to-yellow-500 text-amber-900 font-bold text-xs uppercase tracking-widest shadow-lg shadow-amber-500/20">
                <Crown className="w-3 h-3 fill-amber-900" /> Gói Thành Viên VIP
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-b from-amber-100 to-amber-400 font-serif">
                Mở Khóa Sức Mạnh AI
            </h1>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto font-medium">
                Trải nghiệm trợ lý ẩm thực toàn năng. Từ lên thực đơn, đi chợ hộ đến người bạn tâm giao.
            </p>
            {profileError && (
                 <p className="text-sm text-rose-300">Lỗi tải dữ liệu: {profileError}</p>
            )}
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-10 px-4 md:px-10">
            
            {/* Monthly Plan */}
            <div className={`bg-white/5 backdrop-blur-xl border rounded-[2.5rem] p-8 relative overflow-hidden transition-all group ${isMonthly ? 'border-rose-400 shadow-rose-500/30' : 'border-white/10 hover:border-white/20'}`}>
                
                {/* Badge Đang Dùng Gói Tháng */}
                {isMonthly && <div className="absolute top-0 right-0 bg-rose-500 text-white text-xs font-bold px-4 py-1 rounded-bl-2xl z-10">ĐANG DÙNG</div>}
                
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h3 className="text-white font-bold text-xl mb-1">Gói Tháng</h3>
                        <p className="text-slate-400 text-sm">Linh hoạt, hủy bất cứ lúc nào</p>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                        <Zap className="w-6 h-6" />
                    </div>
                </div>
                <div className="mb-8 flex items-end gap-3">
                    <span className="text-xl font-medium text-slate-500 line-through">49.000đ</span>
                    <span className="text-4xl font-black text-white">0.000đ</span>
                    <span className="text-slate-500">/tháng</span>
                </div>
                <ul className="space-y-4 mb-8">
                    <li className="flex items-center gap-3 text-slate-300 text-sm">
                        <Check className="w-5 h-5 text-emerald-400" /> Truy cập Trợ lý AI (3 Personas)
                    </li>
                    <li className="flex items-center gap-3 text-slate-300 text-sm">
                        <Check className="w-5 h-5 text-emerald-400" /> <strong>Scan thịt với AI thế hệ mới</strong>
                    </li>
                    <li className="flex items-center gap-3 text-slate-300 text-sm">
                        <Check className="w-5 h-5 text-emerald-400" /> Độ chính xác cao hơn 99%
                    </li>
                    <li className="flex items-center gap-3 text-slate-300 text-sm">
                        <Check className="w-5 h-5 text-emerald-400" /> Không giới hạn lượt Scan
                    </li>
                    <li className="flex items-center gap-3 text-slate-300 text-sm">
                        <Check className="w-5 h-5 text-emerald-400" /> Loại bỏ quảng cáo
                    </li>
                </ul>
                
                <button 
                    onClick={() => handleSubscribe('monthly')}
                    disabled={isProcessing || isMonthly}
                    className={`
                        w-full py-4 rounded-2xl font-bold transition-all flex items-center justify-center gap-2
                        ${isMonthly 
                            ? 'bg-rose-600 text-white cursor-default' 
                            : 'bg-white/10 text-white border border-white/20 hover:bg-white hover:text-slate-900'}
                    `}
                >
                    {renderButtonContent('monthly')}
                </button>
            </div>

            {/* Yearly Plan (Featured) */}
            <div className={`bg-gradient-to-b from-amber-500/20 to-slate-900/80 backdrop-blur-xl border rounded-[2.5rem] p-8 relative overflow-hidden shadow-2xl transform transition-transform duration-300 ${isAnnual ? 'border-amber-400 shadow-amber-500/50' : 'border-amber-500/50 hover:-translate-y-2'}`}>
                
                {/* Badge Đang Dùng Gói Năm */}
                {isAnnual && <div className="absolute top-0 right-0 bg-amber-500 text-amber-900 text-xs font-bold px-4 py-1 rounded-bl-2xl z-10">ĐANG DÙNG</div>}
                
                <div className="absolute top-0 right-0 bg-amber-500 text-amber-900 text-xs font-bold px-4 py-1 rounded-bl-2xl z-10">
                    TIẾT KIỆM 15%
                </div>
                
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h3 className="text-amber-200 font-bold text-xl mb-1">Gói Năm</h3>
                        <p className="text-amber-200/60 text-sm">Thanh toán một lần, dùng cả năm</p>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-amber-500 flex items-center justify-center text-amber-900 shadow-lg shadow-amber-500/20">
                        <Crown className="w-6 h-6 fill-amber-900" />
                    </div>
                </div>
                <div className="mb-8 flex items-end gap-3">
                    <span className="text-xl font-medium text-amber-200/50 line-through">499.000đ</span>
                    <span className="text-5xl font-black text-white">0.000đ</span>
                    <span className="text-amber-200/60">/năm</span>
                </div>
                <ul className="space-y-4 mb-8">
                    <li className="flex items-center gap-3 text-white text-sm font-medium">
                        <div className="p-1 bg-amber-500 rounded-full"><Check className="w-3 h-3 text-amber-900 stroke-[3]" /></div>
                        Tất cả quyền lợi gói tháng
                    </li>
                    <li className="flex items-center gap-3 text-white text-sm font-medium">
                        <div className="p-1 bg-amber-500 rounded-full"><Brain className="w-3 h-3 text-amber-900 stroke-[3]" /></div>
                        <strong>Model Scan Thịt Chuyên Sâu (Deep Learning)</strong>
                    </li>
                    <li className="flex items-center gap-3 text-white text-sm font-medium">
                        <div className="p-1 bg-amber-500 rounded-full"><Check className="w-3 h-3 text-amber-900 stroke-[3]" /></div>
                        Ưu tiên hỗ trợ 24/7
                    </li>
                    <li className="flex items-center gap-3 text-white text-sm font-medium">
                        <div className="p-1 bg-amber-500 rounded-full"><Check className="w-3 h-3 text-amber-900 stroke-[3]" /></div>
                        Badge thành viên VIP
                    </li>
                </ul>

                <button 
                    onClick={() => handleSubscribe('annual')}
                    disabled={isProcessing || isAnnual}
                    className={`
                        w-full py-4 rounded-2xl font-bold shadow-lg transition-all flex items-center justify-center gap-2
                        ${isAnnual 
                            ? 'bg-amber-600 text-amber-900 cursor-default' 
                            : 'bg-gradient-to-r from-amber-400 to-yellow-500 text-amber-900 hover:shadow-amber-500/40 hover:scale-[1.02]'}
                    `}
                >
                    {renderButtonContent('annual')}
                </button>
            </div>
        </div>

        {/* Comparison / Trust */}
        <div className="grid grid-cols-3 gap-4 max-w-3xl mx-auto px-4">
            <div className="text-center space-y-2">
                <ShieldCheck className="w-8 h-8 text-emerald-400 mx-auto" />
                <h4 className="text-white font-bold text-sm">Bảo mật cao</h4>
            </div>
            <div className="text-center space-y-2">
                <Smartphone className="w-8 h-8 text-blue-400 mx-auto" />
                <h4 className="text-white font-bold text-sm">Đồng bộ thiết bị</h4>
            </div>
            <div className="text-center space-y-2">
                <Sparkles className="w-8 h-8 text-purple-400 mx-auto" />
                <h4 className="text-white font-bold text-sm">AI Thông Minh</h4>
            </div>
        </div>

      </div>
    </div>
  );
};

export default Premium;