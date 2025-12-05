import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HistoryItem, ActionStatus, BlogPost, StorageEnvironment, ContainerType } from '@/types';
import { 
  Clock, 
  Bookmark, 
  BookOpen, 
  Zap, 
  Trash, 
  Shield, 
  Award, 
  Leaf,
  ChevronRight,
  Crown,
  Refrigerator,
  Snowflake,
  Package,
  Utensils,
  Sun,
  Box,
  ShoppingBag,
  Ban,
  Edit2,
  Camera,
  User as UserIcon,
  Loader,
  LogOut,
  Settings,
  RefreshCw
} from 'lucide-react';
import { blogPosts } from '../data/mockData';
import { useProfile } from '../../hooks/useProfile';
import { useAuth } from '../../context/AuthContext';
import { useScan } from '../../hooks/useScan';

const Account: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, signOut } = useAuth();
  const { user, subscription, loading: profileLoading, error: profileError, uploadAvatar } = useProfile();
  const { getUserScans, updateScanStatus, loading: scanLoading, error: scanError } = useScan();
  console.log(getUserScans)
  // --- STATE ---
  const [activeTab, setActiveTab] = useState<'storage' | 'saved'>('storage');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [savedPosts, setSavedPosts] = useState<BlogPost[]>([]);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalScans, setTotalScans] = useState(0);
  const [result, setResult] = useState([])
  const limit = 10;

  // Handle sign out
  const handleSignOut = async () => {
    if (window.confirm('Bạn có chắc muốn đăng xuất?')) {
      try {
        await signOut();
        navigate('/signin');
      } catch (error) {
        console.error('Sign out error:', error);
        navigate('/signin');
      }
    }
  };

  // Redirect to sign in if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      window.location.href = '/signin';
    }
  }, [isAuthenticated]);

  // Convert API scan to HistoryItem format
  const convertScanToHistoryItem = (scan: any): HistoryItem => {
    console.log("scan: ", scan)
    return {
      id: scan.id,
      imageUrl: scan.imageUrl,
      meatType: scan.meatType,
      freshnessScore: scan.freshnessScore,
      freshnessLevel: scan.freshnessLevel,
      safetyStatus: scan.safetyStatus,
      visualCues: scan.visualCues,
      summary: scan.summary,
      timestamp: new Date(scan.createdAt).getTime(),
      storageDeadline: scan.storageDeadline || Date.now() + (3 * 24 * 60 * 60 * 1000),
      actionStatus: scan.actionStatus || 'storing',
      storageEnvironment: scan.storageEnvironment || 'fridge',
      containerType: scan.containerType || 'bag',
    };
  };

  // --- LOAD DATA ---
  const loadStorageData = async () => {
    if (!isAuthenticated) return;

    try {
      const result = await getUserScans(currentPage, limit);
      setResult(result.scans)
      setTotalPages(result.totalPages);
      setTotalScans(result.total);
      
      console.log(`✅ Loaded ${result.scans.length} scans from API`);
      
    } catch (error) {
      console.error('❌ Failed to load from API:', error);
      setHistory([]);
      setTotalPages(1);
      setTotalScans(0);
    }
  };

  const loadSavedPosts = () => {
    try {
      const savedIdsStr = localStorage.getItem('savedPosts');
      const savedIds: string[] = savedIdsStr ? JSON.parse(savedIdsStr) : [];
      
      if (blogPosts && Array.isArray(blogPosts) && Array.isArray(savedIds)) {
        const posts = blogPosts.filter(p => savedIds.includes(p.id));
        setSavedPosts(posts);
      } else {
        setSavedPosts([]);
      }
    } catch (error) {
      console.error("Load saved posts error", error);
      setSavedPosts([]);
    }
  };

  const loadData = () => {
    if (activeTab === 'storage') {
      loadStorageData();
    } else {
      loadSavedPosts();
    }
  };

  useEffect(() => {
    loadData();
  }, [activeTab, currentPage, isAuthenticated]);

  // --- ACTIONS: STORAGE ---
  const updateStatus = async (id: string, status: ActionStatus) => {
    try {
      // Update via API
      await updateScanStatus(id, { actionStatus: status });
      
      // Update local state optimistically
      const updatedHistory = history.map(item => 
        item.id === id ? { ...item, actionStatus: status } : item
      );
      setHistory(updatedHistory);
      
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Có lỗi khi cập nhật. Vui lòng thử lại.');
      // Reload data to revert optimistic update
      loadStorageData();
    }
  };

  const updateStorageConfig = async (id: string, updates: { env?: StorageEnvironment, container?: ContainerType }) => {
    try {
      const item = history.find(h => h.id === id);
      if (!item) return;

      const newEnv = updates.env || item.storageEnvironment || 'fridge';
      const newContainer = updates.container || item.containerType || 'bag';
      
      // Recalculate deadline
      const newDeadline = recalculateDeadline(item.freshnessLevel, newEnv, newContainer, item.timestamp);
      
      const updateData = {
        storageEnvironment: newEnv,
        containerType: newContainer,
        storageDeadline: newDeadline,
        actionStatus: (item.actionStatus === 'cooked' || item.actionStatus === 'discarded') ? 'storing' : item.actionStatus
      };

      // Update via API
      await updateScanStatus(id, updateData);
      
      // Update local state optimistically
      const updatedHistory = history.map(item => {
        if (item.id === id) {
          return { ...item, ...updateData };
        }
        return item;
      });
      
      setHistory(updatedHistory);
      
    } catch (error) {
      console.error('Error updating storage config:', error);
      alert('Có lỗi khi cập nhật cấu hình. Vui lòng thử lại.');
      // Reload data to revert optimistic update
      loadStorageData();
    }
  };

  const deleteItem = async (id: string) => {
    if (!window.confirm("Xóa mục này khỏi lịch sử?")) return;

    try {
      // Delete via API
      
      // Update local state optimistically
      const updatedHistory = history.filter(item => item.id !== id);
      setHistory(updatedHistory);
      
      // Update total count
      setTotalScans(prev => prev - 1);
      
    } catch (error) {
      console.error('Error deleting item:', error);
      alert('Có lỗi khi xóa. Vui lòng thử lại.');
      // Reload data to revert optimistic update
      loadStorageData();
    }
  };

  const clearAllScans = async () => {
    if (!window.confirm("Bạn có chắc muốn xóa toàn bộ lịch sử scan?")) return;

    try {

      
      // Clear local state
      setHistory([]);
      setTotalScans(0);
      setTotalPages(1);
      setCurrentPage(1);
      
      alert('Đã xóa toàn bộ lịch sử scan thành công!');
      
    } catch (error) {
      console.error('Error clearing all scans:', error);
      alert('Có lỗi khi xóa. Vui lòng thử lại.');
      // Reload data to show current state
      loadStorageData();
    }
  };

  const refreshData = () => {
    setCurrentPage(1);
    loadStorageData();
  };

  // --- ACTIONS: SAVED POSTS ---
  const unsavePost = (e: React.MouseEvent, id: string) => {
    e.preventDefault(); 
    e.stopPropagation();
    try {
      const currentSavedIdsStr = localStorage.getItem('savedPosts');
      let currentSavedIds: string[] = currentSavedIdsStr ? JSON.parse(currentSavedIdsStr) : [];
      
      if (Array.isArray(currentSavedIds)) {
        const newIds = currentSavedIds.filter(sid => sid !== id);
        localStorage.setItem('savedPosts', JSON.stringify(newIds));
        setSavedPosts(prev => prev.filter(p => p.id !== id));
      }
    } catch (e) {
      console.error("Error unsaving post", e);
    }
  };

  // Handle avatar upload
  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File quá lớn. Vui lòng chọn ảnh nhỏ hơn 5MB');
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Vui lòng chọn file ảnh');
      return;
    }

    try {
      await uploadAvatar(file);
      alert('Cập nhật ảnh đại diện thành công!');
    } catch (error) {
      alert('Lỗi upload ảnh. Vui lòng thử lại.');
    }
  };

  // --- HELPER: TIME ---
  const getHoursLeft = (deadline: number) => {
    const now = Date.now();
    const diff = deadline - now;
    return Math.ceil(diff / (1000 * 60 * 60));
  };

  const getDisplayStatus = (item: HistoryItem) => {
     if (item.actionStatus === 'cooked') return { label: 'Đã nấu', color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' };
     if (item.actionStatus === 'discarded') return { label: 'Đã bỏ', color: 'text-slate-400', bg: 'bg-slate-50', border: 'border-slate-100' };
     
     const hours = getHoursLeft(item.storageDeadline);
     if (hours <= 0 || item.actionStatus === 'expired') return { label: 'Hết hạn', color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-200' };
     
     if (hours > 24) {
         const days = Math.floor(hours / 24);
         return { label: `Còn ${days} ngày`, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100' };
     }
     
     return { label: `Còn ${hours}h`, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100' };
  };

  // --- RECALCULATE DEADLINE LOGIC ---
  const recalculateDeadline = (
      level: number, 
      env: StorageEnvironment, 
      container: ContainerType, 
      baseTimestamp: number
    ): number => {
    const oneDay = 24 * 60 * 60 * 1000;
    const oneHour = 60 * 60 * 1000;
    const start = baseTimestamp || Date.now();

    let duration = 0;

    // 1. Environment Base Time
    if (env === 'fridge') {
        if (level === 1) duration = 4 * oneDay;
        else if (level === 2) duration = 3 * oneDay;
        else if (level === 3) duration = 1 * oneDay;
        else duration = 0;
    } else if (env === 'freezer') {
        if (level === 1) duration = 90 * oneDay;
        else if (level === 2) duration = 60 * oneDay;
        else if (level === 3) duration = 7 * oneDay;
        else duration = 0;
    } else if (env === 'room_temp') {
        // Meat at room temp spoils very fast
        if (level === 1) duration = 4 * oneHour;
        else if (level === 2) duration = 2 * oneHour;
        else duration = 0;
    }

    // 2. Container Modifiers
    if (container === 'box') {
        // Box protects slightly better/cleaner
        if (env === 'room_temp') duration += 1 * oneHour; // +1h if boxed outside
        else duration *= 1.1; // +10% duration
    } else if (container === 'none') {
        // No packaging is bad
        if (env === 'freezer') duration *= 0.5; // Freezer burn risk
        else duration *= 0.8; // Dries out or contaminates
    }
    
    return start + duration;
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-2xl mx-auto py-24 text-center">
        <p className="text-slate-500">Vui lòng đăng nhập để xem trang này</p>
        <Link to="/signin" className="text-rose-500 font-bold hover:underline">
          Đăng nhập ngay
        </Link>
      </div>
    );
  }

  // Safe default values for UI - fix the null error
  const displayUser = user || {
    name: 'Người dùng',
    avatar: '',
    level: 1,
    xp: 0,
    title: 'Thành viên mới'
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-24 animate-fade-in-up">
      
      {/* --- 1. PROFILE CARD --- */}
      <div className="bg-white rounded-3xl p-6 shadow-xl shadow-rose-100/50 border border-rose-50 relative overflow-hidden">
         <div className="absolute top-0 right-0 w-32 h-32 bg-rose-100 rounded-bl-[4rem] -mr-4 -mt-4 opacity-50"></div>
         
         {profileLoading && (
           <div className="absolute inset-0 bg-white/80 rounded-3xl flex items-center justify-center z-20">
             <Loader className="w-6 h-6 animate-spin text-rose-500" />
           </div>
         )}
         
         <div className="relative z-10 flex items-center gap-4">
            <div className="relative group">
                {displayUser.avatar ? (
                  <img 
                      src={displayUser.avatar} 
                      alt="Avatar" 
                      className={`w-20 h-20 rounded-full object-cover border-4 shadow-sm bg-slate-200 ${subscription?.plan === 'yearly' ? 'border-amber-400' : subscription?.plan === 'monthly' ? 'border-rose-400' : 'border-slate-100'}`}
                  />
                ) : (
                  <div className={`w-20 h-20 rounded-full border-4 shadow-sm bg-slate-100 flex items-center justify-center ${subscription?.plan === 'yearly' ? 'border-amber-400' : subscription?.plan === 'monthly' ? 'border-rose-400' : 'border-slate-100'}`}>
                    <UserIcon className="w-8 h-8 text-slate-400" />
                  </div>
                )}
                
                {/* Avatar Upload Button */}
                <label className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                  <Camera className="w-5 h-5 text-white" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                  />
                </label>
                
                {/* Level Badge */}
                <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-rose-500 text-white rounded-full flex items-center justify-center text-xs font-bold border-2 border-white">
                    {displayUser.level || 1}
                </div>
            </div>
            
            <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                    <h2 className="text-2xl font-black text-slate-800">{displayUser.name || 'Người dùng'}</h2>
                    
                    {/* Edit Profile Button */}
                    <button
                      onClick={() => setIsEditingProfile(!isEditingProfile)}
                      className="p-1 text-slate-400 hover:text-rose-500 transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    
                    {/* Membership Badge */}
                    {subscription?.isPremium ? (
                        <div className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide flex items-center gap-1 shadow-sm ${
                            subscription.plan === 'yearly' 
                            ? 'bg-gradient-to-r from-amber-300 to-yellow-500 text-white' 
                            : 'bg-gradient-to-r from-rose-400 to-pink-500 text-white'
                        }`}>
                            <Crown className="w-3 h-3 fill-current" />
                            {subscription.plan === 'yearly' ? 'VIP' : 'Premium'}
                        </div>
                    ) : (
                        <div className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 text-[10px] font-bold uppercase tracking-wide">
                            Free
                        </div>
                    )}
                </div>
                
                <p className="text-sm text-slate-500 font-medium mb-2">{displayUser.title || 'Thành viên mới'}</p>
                
                {/* XP Bar */}
                <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 mb-1">
                    <span>XP</span>
                    <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-50">
                        <div className="h-full bg-rose-500 rounded-full" style={{ width: `${displayUser.xp || 0}%` }}></div>
                    </div>
                    <span>{displayUser.xp || 0}/100</span>
                </div>
                
                {/* Error Message */}
                {profileError && (
                  <p className="text-xs text-rose-500 mt-2">{profileError}</p>
                )}
            </div>

            {/* Settings & Sign Out Buttons */}
            <div className="flex flex-col gap-2">
                <button 
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
                  title="Cài đặt"
                >
                    <Settings className="w-4 h-4" />
                </button>
                <button 
                    onClick={handleSignOut}
                    className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                    title="Đăng xuất"
                >
                    <LogOut className="w-4 h-4" />
                </button>
            </div>
         </div>

         {/* Profile Edit Form */}
         {isEditingProfile && (
           <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 mt-4">
             <h4 className="font-bold text-slate-800 mb-3">Chỉnh sửa thông tin</h4>
             <div className="space-y-3">
               <div>
                 <label className="block text-xs font-bold text-slate-500 mb-1">Tên hiển thị</label>
                 <input
                   type="text"
                   defaultValue={displayUser.name || ''}
                   className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-rose-200 outline-none"
                   placeholder="Nhập tên của bạn"
                 />
               </div>
               <div>
                 <label className="block text-xs font-bold text-slate-500 mb-1">Tiêu đề</label>
                 <input
                   type="text"
                   defaultValue={displayUser.title || ''}
                   className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-rose-200 outline-none"
                   placeholder="Ví dụ: Foodie sành ăn"
                 />
               </div>
               <div className="flex gap-2">
                 <button 
                   onClick={() => setIsEditingProfile(false)}
                   className="flex-1 py-2 px-4 bg-slate-200 text-slate-700 rounded-lg text-sm font-bold hover:bg-slate-300 transition-colors"
                 >
                   Hủy
                 </button>
                 <button className="flex-1 py-2 px-4 bg-rose-500 text-white rounded-lg text-sm font-bold hover:bg-rose-600 transition-colors">
                   Lưu
                 </button>
               </div>
             </div>
           </div>
         )}

         {/* Badges */}
         <div className="flex gap-3 mt-6 pt-6 border-t border-dashed border-slate-100 overflow-x-auto no-scrollbar">
             {[
                 { icon: Shield, color: 'text-blue-500', bg: 'bg-blue-50', label: 'An toàn' },
                 { icon: Award, color: 'text-amber-500', bg: 'bg-amber-50', label: 'Top 1' },
                 { icon: Leaf, color: 'text-emerald-500', bg: 'bg-emerald-50', label: 'Sống xanh' },
                 { icon: Zap, color: 'text-purple-500', bg: 'bg-purple-50', label: 'Nhanh tay' },
             ].map((badge, i) => (
                 <div key={i} className="flex flex-col items-center gap-1 min-w-[60px]">
                     <div className={`w-10 h-10 rounded-xl ${badge.bg} ${badge.color} flex items-center justify-center shadow-sm`}>
                         <badge.icon className="w-5 h-5" />
                     </div>
                     <span className="text-[9px] font-bold text-slate-400 uppercase mt-1">{badge.label}</span>
                 </div>
             ))}
         </div>
         
         {!subscription?.isPremium && (
             <Link to="/premium" className="mt-4 flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-amber-100 to-orange-100 border border-amber-200 group cursor-pointer">
                 <div className="flex items-center gap-3">
                     <div className="p-1.5 bg-white/50 rounded-lg text-amber-600">
                         <Crown className="w-4 h-4" />
                     </div>
                     <div>
                         <div className="text-xs font-bold text-amber-800">Nâng cấp VIP</div>
                         <div className="text-[10px] text-amber-600">Mở khóa trợ lý AI & nhiều hơn nữa</div>
                     </div>
                 </div>
                 <ChevronRight className="w-4 h-4 text-amber-600 group-hover:translate-x-1 transition-transform" />
             </Link>
         )}

         {/* Sign Out Section */}
         <div className="mt-4 pt-4 border-t border-dashed border-slate-100">
           <button 
             onClick={handleSignOut}
             className="w-full flex items-center justify-center gap-2 p-3 text-slate-500 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-colors group"
           >
             <LogOut className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
             <span className="text-sm font-bold">Đăng xuất</span>
           </button>
         </div>
      </div>

      {/* --- 2. TABS --- */}
      <div className="flex p-1 bg-slate-100/80 rounded-2xl">
        <button 
           onClick={() => setActiveTab('storage')}
           className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${activeTab === 'storage' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
        >
            <Clock className="w-4 h-4" /> 
            Bảo quản ({totalScans})
            {scanLoading && <Loader className="w-3 h-3 animate-spin ml-1" />}
        </button>
        <button 
           onClick={() => setActiveTab('saved')}
           className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${activeTab === 'saved' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
        >
            <Bookmark className="w-4 h-4" /> Đã lưu ({savedPosts.length})
        </button>
      </div>

      {/* --- 3. CONTENT --- */}
      
      {/* STORAGE TAB CONTENT */}
      {activeTab === 'storage' && (
        <div className="space-y-4">
          {/* Header with refresh button */}
          <div className="flex justify-between items-center">
            <div className="text-xs text-slate-500">
              Dữ liệu từ máy chủ
              {totalScans > 0 && ` • Trang ${currentPage}/${totalPages}`}
            </div>
            <div className="flex gap-2">
              <button 
                onClick={refreshData}
                disabled={scanLoading}
                className="text-xs font-bold text-slate-400 hover:text-rose-500 flex items-center gap-1 px-2 py-1 rounded hover:bg-rose-50 transition-colors"
              >
                <RefreshCw className={`w-3 h-3 ${scanLoading ? 'animate-spin' : ''}`} /> 
                Làm mới
              </button>
              <button 
                onClick={clearAllScans} 
                className="text-xs font-bold text-slate-400 hover:text-rose-500 flex items-center gap-1 px-2 py-1 rounded hover:bg-rose-50 transition-colors"
              >
                <Trash className="w-3 h-3" /> Xóa tất cả
              </button>
            </div>
          </div>

          {/* Error message */}
          {scanError && (
            <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 text-rose-600 text-sm">
              ⚠️ {scanError}
            </div>
          )}

          {/* Loading state */}
          {scanLoading && result.length === 0 && (
            <div className="text-center py-12 bg-white rounded-3xl border border-slate-100">
              <Loader className="w-8 h-8 animate-spin text-rose-500 mx-auto mb-4" />
              <p className="text-slate-500 text-sm">Đang tải dữ liệu...</p>
            </div>
          )}

          {/* Empty state */}
          {!scanLoading && result.length === 0 && (
            <div className="text-center py-12 bg-white rounded-3xl border-2 border-dashed border-slate-100">
              <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-rose-300" />
              </div>
              <p className="text-slate-400 text-sm">Tủ lạnh trống trơn.</p>
              <Link to="/scan" className="text-rose-500 font-bold text-sm hover:underline mt-2 block">Quét thịt ngay</Link>
            </div>
          )}

          {/* History Items */}
          {result.map(item => {
            const status = getDisplayStatus(item);
            const currentEnv = item.storageEnvironment || 'fridge';
            const currentContainer = item.containerType || 'bag';
            const isSpoiled = item.freshnessLevel >= 4;
            const isEditing = editingItemId === item.id;

            return (
              <div key={item.id} className={`bg-white p-4 rounded-2xl border ${status.border} shadow-sm gap-4 transition-all hover:shadow-md flex flex-col relative`}>
                
                <div className="flex gap-4">
                  <div className="w-20 h-20 rounded-xl bg-slate-100 overflow-hidden flex-shrink-0 relative">
                    <img src={item.imageUrl} className="w-full h-full object-cover" alt={item.meatType} />
                    <div className="absolute bottom-0 left-0 right-0 bg-black/50 backdrop-blur-sm text-white text-[9px] font-bold text-center py-0.5">
                      LV.{item.freshnessLevel}
                    </div>
                  </div>
                  
                  <div className="flex-1 flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-slate-800">{item.meatType}</h4>
                        <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${status.bg} ${status.color}`}>
                          {status.label}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => setEditingItemId(isEditing ? null : item.id)} 
                          className={`p-1.5 rounded-lg transition-colors ${isEditing ? 'bg-amber-100 text-amber-600' : 'bg-slate-50 text-slate-400 hover:text-amber-500'}`}
                        >
                          <Package className="w-4 h-4" />
                        </button>
                        <Link to={`/dictionary?type=${encodeURIComponent(item.meatType)}&level=${item.freshnessLevel}`} className="p-1.5 bg-slate-50 rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-500 transition-colors">
                          <BookOpen className="w-4 h-4" />
                        </Link>
                        <button onClick={() => deleteItem(item.id)} className="p-1.5 bg-slate-50 rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-500 transition-colors">
                          <Trash className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    
                    {/* Summary Info */}
                    {!isEditing && item.actionStatus !== 'discarded' && item.actionStatus !== 'cooked' && (
                      <div className="flex items-center gap-2 mt-2 text-xs text-slate-500 font-medium">
                        <span className="flex items-center gap-1 bg-slate-50 px-1.5 py-0.5 rounded">
                          {currentEnv === 'fridge' ? <Refrigerator className="w-3 h-3"/> : currentEnv === 'freezer' ? <Snowflake className="w-3 h-3"/> : <Sun className="w-3 h-3"/>} 
                          {currentEnv === 'fridge' ? 'Tủ mát' : currentEnv === 'freezer' ? 'Tủ đông' : 'Nhiệt độ phòng'}
                        </span>
                        <span className="flex items-center gap-1 bg-slate-50 px-1.5 py-0.5 rounded">
                          {currentContainer === 'box' ? <Box className="w-3 h-3"/> : currentContainer === 'bag' ? <ShoppingBag className="w-3 h-3"/> : <Ban className="w-3 h-3"/>}
                          {currentContainer === 'box' ? 'Hộp kín' : currentContainer === 'bag' ? 'Túi/Màng' : 'Không gói'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Detailed Storage Config Panel */}
                {isEditing && item.actionStatus === 'storing' && (
                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 animate-fade-in mt-2">
                    <div className="grid grid-cols-2 gap-4">
                      {/* Column 1: Environment */}
                      <div className="space-y-2">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Môi trường</p>
                          <div className="flex flex-col gap-1">
                              <button 
                                  onClick={() => updateStorageConfig(item.id, { env: 'fridge' })}
                                  className={`flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs font-medium transition-colors ${currentEnv === 'fridge' ? 'bg-white shadow-sm text-sky-600 ring-1 ring-sky-100' : 'text-slate-500 hover:bg-slate-100'}`}
                              >
                                  <Refrigerator className="w-3 h-3" /> Tủ mát
                              </button>
                              <button 
                                  onClick={() => updateStorageConfig(item.id, { env: 'freezer' })}
                                  className={`flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs font-medium transition-colors ${currentEnv === 'freezer' ? 'bg-white shadow-sm text-blue-600 ring-1 ring-blue-100' : 'text-slate-500 hover:bg-slate-100'}`}
                              >
                                  <Snowflake className="w-3 h-3" /> Tủ đông
                              </button>
                              <button 
                                  onClick={() => updateStorageConfig(item.id, { env: 'room_temp' })}
                                  className={`flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs font-medium transition-colors ${currentEnv === 'room_temp' ? 'bg-white shadow-sm text-amber-600 ring-1 ring-amber-100' : 'text-slate-500 hover:bg-slate-100'}`}
                              >
                                  <Sun className="w-3 h-3" /> Nhiệt độ phòng
                              </button>
                          </div>
                      </div>

                      {/* Column 2: Container */}
                      <div className="space-y-2">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Vật chứa</p>
                          <div className="flex flex-col gap-1">
                              <button 
                                  onClick={() => updateStorageConfig(item.id, { container: 'box' })}
                                  className={`flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs font-medium transition-colors ${currentContainer === 'box' ? 'bg-white shadow-sm text-emerald-600 ring-1 ring-emerald-100' : 'text-slate-500 hover:bg-slate-100'}`}
                              >
                                  <Box className="w-3 h-3" /> Hộp kín
                              </button>
                              <button 
                                  onClick={() => updateStorageConfig(item.id, { container: 'bag' })}
                                  className={`flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs font-medium transition-colors ${currentContainer === 'bag' ? 'bg-white shadow-sm text-purple-600 ring-1 ring-purple-100' : 'text-slate-500 hover:bg-slate-100'}`}
                              >
                                  <ShoppingBag className="w-3 h-3" /> Túi / Màng
                              </button>
                              <button 
                                  onClick={() => updateStorageConfig(item.id, { container: 'none' })}
                                  className={`flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs font-medium transition-colors ${currentContainer === 'none' ? 'bg-white shadow-sm text-rose-600 ring-1 ring-rose-100' : 'text-slate-500 hover:bg-slate-100'}`}
                              >
                                  <Ban className="w-3 h-3" /> Không gói
                              </button>
                          </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Quick Actions (Cooked/Discarded) */}
                {item.actionStatus !== 'cooked' && item.actionStatus !== 'discarded' && (
                   <div className="flex gap-2 pt-2 border-t border-dashed border-slate-100">
                      {/* Hide "Cooked" if Meat is Spoiled (Level 4-5) */}
                      {!isSpoiled && (
                          <button onClick={() => updateStatus(item.id, 'cooked')} className="flex-1 py-1.5 rounded-lg bg-emerald-50 text-emerald-600 text-xs font-bold hover:bg-emerald-100 transition-colors flex items-center justify-center gap-1">
                              <Utensils className="w-3 h-3" /> Đã nấu
                          </button>
                      )}
                      <button onClick={() => updateStatus(item.id, 'discarded')} className="flex-1 py-1.5 rounded-lg bg-slate-50 text-slate-500 text-xs font-bold hover:bg-slate-100 transition-colors flex items-center justify-center gap-1">
                          <Trash className="w-3 h-3" /> Vứt bỏ
                      </button>
                   </div>
                )}
              </div>
            );
          })}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage <= 1 || scanLoading}
                className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Trước
              </button>
              
              <span className="px-4 py-2 bg-rose-500 text-white rounded-lg text-sm font-bold">
                {currentPage} / {totalPages}
              </span>
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage >= totalPages || scanLoading}
                className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Sau
              </button>
            </div>
          )}
        </div>
      )}

      {/* SAVED CONTENT - Keep as is since it's for blog posts */}
      {activeTab === 'saved' && (
          <div className="space-y-4">
              {savedPosts.length === 0 ? (
                  <div className="text-center py-12 bg-white rounded-3xl border-2 border-dashed border-slate-100">
                      <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Bookmark className="w-8 h-8 text-rose-300" />
                      </div>
                      <p className="text-slate-400 text-sm">Chưa lưu bài viết nào.</p>
                      <Link to="/blog" className="text-rose-500 font-bold text-sm hover:underline mt-2 block">Khám phá Blog</Link>
                  </div>
              ) : (
                  savedPosts.map(post => (
                      <Link to={`/blog/${post.id}`} key={post.id} className="block bg-white p-4 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all group relative">
                          <div className="flex gap-4">
                              <div className="w-20 h-20 rounded-xl bg-slate-100 overflow-hidden flex-shrink-0">
                                  <img src={post.image} className="w-full h-full object-cover" alt={post.title} />
                              </div>
                              <div className="flex-1">
                                  <div className="text-[10px] font-bold text-rose-500 uppercase mb-1">{post.category}</div>
                                  <h4 className="font-bold text-slate-800 leading-snug line-clamp-2 mb-2 group-hover:text-rose-600 transition-colors">{post.title}</h4>
                                  <div className="flex items-center gap-1 text-slate-400 text-xs">
                                      <span>Đọc ngay</span> <ChevronRight className="w-3 h-3" />
                                  </div>
                              </div>
                          </div>
                          <button 
                            onClick={(e) => unsavePost(e, post.id)}
                            className="absolute top-2 right-2 p-2 text-rose-500 hover:bg-rose-50 rounded-full transition-colors z-10"
                          >
                              <Bookmark className="w-4 h-4 fill-rose-500" />
                          </button>
                      </Link>
                  ))
              )}
          </div>
      )}

    </div>
  );
};

export default Account;
