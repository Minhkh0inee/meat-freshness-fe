
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { HistoryItem, ActionStatus, BlogPost, StorageEnvironment, ContainerType } from '../../types';
import { 
    Trash2, Clock, Utensils, AlertCircle, CheckCircle2, Trash, Bookmark, BookOpen, ChevronRight, 
    Refrigerator, Snowflake, Package, Sun, Box, ShoppingBag, Ban 
} from 'lucide-react';
import { blogPosts } from '../data/mockData';

const History: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'storage' | 'saved'>('storage');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [savedPosts, setSavedPosts] = useState<BlogPost[]>([]);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);

  // Load data on mount and when tabs change
  useEffect(() => {
    // Load History
    try {
        const storedHistory = localStorage.getItem('meatHistory');
        if (storedHistory) {
            const parsed = JSON.parse(storedHistory);
            setHistory(Array.isArray(parsed) ? parsed : []);
        }
    } catch (e) {
        console.error("Error loading history", e);
        setHistory([]);
    }

    // Load Saved Posts
    try {
        const savedIdsStr = localStorage.getItem('savedPosts');
        const savedIds = savedIdsStr ? JSON.parse(savedIdsStr) : [];
        if (Array.isArray(savedIds) && blogPosts) {
            const posts = blogPosts.filter(p => savedIds.includes(p.id));
            setSavedPosts(posts);
        } else {
            setSavedPosts([]);
        }
    } catch (e) {
        console.error("Error loading saved posts", e);
        setSavedPosts([]);
    }
  }, [activeTab]);

  const saveHistory = (newHistory: HistoryItem[]) => {
    setHistory(newHistory);
    localStorage.setItem('meatHistory', JSON.stringify(newHistory));
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
        if (level === 1) duration = 4 * oneHour;
        else if (level === 2) duration = 2 * oneHour;
        else duration = 0;
    }

    // 2. Container Modifiers
    if (container === 'box') {
        if (env === 'room_temp') duration += 1 * oneHour;
        else duration *= 1.1;
    } else if (container === 'none') {
        if (env === 'freezer') duration *= 0.5;
        else duration *= 0.8;
    }
    
    return start + duration;
  };

  const updateStatus = (id: string, status: ActionStatus) => {
    const updated = history.map(item => 
      item.id === id ? { ...item, actionStatus: status } : item
    );
    saveHistory(updated);
  };

  const updateStorageConfig = (id: string, updates: { env?: StorageEnvironment, container?: ContainerType }) => {
      const updated = history.map(item => {
          if (item.id === id) {
              const newEnv = updates.env || item.storageEnvironment || 'fridge';
              const newContainer = updates.container || item.containerType || 'bag';
              
              // Recalculate deadline
              const newDeadline = recalculateDeadline(item.freshnessLevel, newEnv, newContainer, item.timestamp);
              
              return { 
                  ...item, 
                  storageEnvironment: newEnv,
                  containerType: newContainer,
                  storageDeadline: newDeadline,
                  actionStatus: (item.actionStatus === 'cooked' || item.actionStatus === 'discarded') ? 'storing' : item.actionStatus 
              };
          }
          return item;
      });
      saveHistory(updated);
  };

  const deleteHistoryItem = (id: string) => {
      if(window.confirm("Xóa mục này khỏi kho?")) {
          const updated = history.filter(item => item.id !== id);
          saveHistory(updated);
      }
  };

  const clearHistory = () => {
    if (window.confirm('Bạn có chắc muốn xóa toàn bộ kho lưu trữ?')) {
      localStorage.removeItem('meatHistory');
      setHistory([]);
    }
  };

  const unsavePost = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    try {
        const savedIdsStr = localStorage.getItem('savedPosts');
        let savedIds: string[] = savedIdsStr ? JSON.parse(savedIdsStr) : [];
        const newIds = savedIds.filter(sid => sid !== id);
        localStorage.setItem('savedPosts', JSON.stringify(newIds));
        setSavedPosts(prev => prev.filter(p => p.id !== id));
    } catch (e) {
        console.error(e);
    }
  };

  // Time calculation helpers
  const getTimeLeft = (deadline: number) => {
    const now = Date.now();
    const diff = deadline - now;
    if (diff <= 0) return 0;
    return Math.ceil(diff / (1000 * 60 * 60)); // Hours
  };

  const getDeadlineStatus = (deadline: number, currentStatus: ActionStatus) => {
     if (currentStatus === 'cooked') return 'cooked';
     if (currentStatus === 'discarded') return 'discarded';
     if (Date.now() > deadline || currentStatus === 'expired') return 'expired';
     return 'storing';
  };

  return (
    <div className="space-y-8 pb-24 animate-fade-in max-w-5xl mx-auto">
      
      {/* --- HEADER --- */}
      <div className="space-y-6">
          <h2 className="text-3xl font-black text-slate-800 tracking-tight font-serif">Kho lưu trữ</h2>

          {/* Navigation Tabs */}
          <div className="flex p-1.5 bg-white rounded-2xl shadow-sm border border-slate-100 max-w-md mx-auto md:mx-0">
              <button 
                 onClick={() => setActiveTab('storage')}
                 className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                     activeTab === 'storage' 
                     ? 'bg-rose-50 text-rose-600 shadow-sm ring-1 ring-rose-100' 
                     : 'text-slate-400 hover:bg-slate-50'
                 }`}
              >
                  <Clock className="w-4 h-4" /> Tủ lạnh
                  {history.length > 0 && <span className="bg-rose-200 text-rose-700 text-[9px] px-1.5 rounded-full shadow-sm">{history.length}</span>}
              </button>
              <button 
                 onClick={() => setActiveTab('saved')}
                 className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                     activeTab === 'saved' 
                     ? 'bg-rose-50 text-rose-600 shadow-sm ring-1 ring-rose-100' 
                     : 'text-slate-400 hover:bg-slate-50'
                 }`}
              >
                  <Bookmark className="w-4 h-4" /> Đã lưu
                  {savedPosts.length > 0 && <span className="bg-rose-200 text-rose-700 text-[9px] px-1.5 rounded-full shadow-sm">{savedPosts.length}</span>}
              </button>
          </div>
      </div>

      {/* --- STORAGE CONTENT --- */}
      {activeTab === 'storage' && (
          <div className="space-y-6">
            {history.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-200">
                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Clock className="w-10 h-10 text-slate-300" />
                    </div>
                    <p className="text-slate-500 font-bold mb-1">Tủ lạnh trống</p>
                    <p className="text-slate-400 text-sm">Hãy quét thịt để thêm vào kho quản lý.</p>
                    <Link to="/scan" className="inline-block mt-4 text-rose-500 font-bold text-sm hover:underline">Quét ngay</Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="col-span-full flex justify-end">
                     <button onClick={clearHistory} className="text-xs text-slate-400 hover:text-rose-500 flex items-center gap-1 font-bold">
                        <Trash2 className="w-3 h-3" /> Xóa lịch sử
                     </button>
                </div>
                {history.map((item) => {
                    const status = getDeadlineStatus(item.storageDeadline, item.actionStatus);
                    const hoursLeft = getTimeLeft(item.storageDeadline);
                    const totalHours = item.freshnessLevel === 1 ? 96 : item.freshnessLevel === 2 ? 72 : 24; // rough estimate for progress bar
                    const progress = Math.max(0, Math.min(100, (hoursLeft / totalHours) * 100));
                    
                    const currentEnv = item.storageEnvironment || 'fridge';
                    const currentContainer = item.containerType || 'bag';
                    const isEditing = editingItemId === item.id;
                    const isSpoiled = item.freshnessLevel >= 4;

                    return (
                    <div key={item.id} className={`bg-white p-4 rounded-3xl shadow-sm border relative overflow-hidden transition-all hover:shadow-md flex flex-col ${
                        status === 'expired' ? 'border-rose-200 opacity-90' : 
                        status === 'cooked' ? 'border-emerald-100 opacity-75 grayscale-[0.5]' : 
                        status === 'discarded' ? 'border-slate-200 opacity-60' :
                        'border-slate-100'
                    }`}>
                    <div className="flex gap-4 relative z-10">
                        <div className="w-24 h-24 rounded-2xl overflow-hidden flex-shrink-0 bg-slate-100 relative group">
                            <img src={item.imageUrl} alt="Meat" className="w-full h-full object-cover" />
                            <div className="absolute top-0 right-0 bg-black/60 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-bl-lg backdrop-blur-sm">
                                Lv.{item.freshnessLevel}
                            </div>
                        </div>

                        <div className="flex-1 flex flex-col justify-between py-1">
                            <div>
                                <div className="flex justify-between items-start">
                                    <h3 className="font-bold text-slate-800 text-lg">{item.meatType}</h3>
                                    <div className="flex gap-1">
                                        <button 
                                            onClick={() => setEditingItemId(isEditing ? null : item.id)} 
                                            className={`p-1.5 rounded-lg transition-colors ${isEditing ? 'bg-amber-100 text-amber-600' : 'bg-slate-50 text-slate-400 hover:text-amber-500'}`}
                                        >
                                            <Package className="w-4 h-4" />
                                        </button>
                                        <Link to={`/dictionary?type=${encodeURIComponent(item.meatType)}&level=${item.freshnessLevel}`} className="p-1.5 bg-slate-50 rounded-lg text-slate-400 hover:text-rose-500">
                                            <BookOpen className="w-4 h-4" />
                                        </Link>
                                        <button onClick={() => deleteHistoryItem(item.id)} className="p-1.5 bg-slate-50 rounded-lg text-slate-400 hover:text-rose-500">
                                            <Trash className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                                
                                <div className="mt-1">
                                    {status === 'storing' && (
                                        <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                                            <Clock className="w-3 h-3" /> {hoursLeft > 24 ? `${Math.floor(hoursLeft/24)} ngày` : `${hoursLeft}h`}
                                        </span>
                                    )}
                                    {status === 'expired' && (
                                        <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full animate-pulse">
                                            <AlertCircle className="w-3 h-3" /> Hết hạn
                                        </span>
                                    )}
                                    {status === 'cooked' && (
                                        <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                                            <CheckCircle2 className="w-3 h-3" /> Đã nấu
                                        </span>
                                    )}
                                    {status === 'discarded' && (
                                        <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                                            <Trash className="w-3 h-3" /> Đã bỏ
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Config Summary (If not editing) */}
                            {!isEditing && status === 'storing' && (
                                <div className="mt-2 flex items-center gap-2 text-xs text-slate-500 font-medium">
                                    <span className="flex items-center gap-1 bg-slate-50 px-1.5 py-0.5 rounded">
                                        {currentEnv === 'fridge' ? <Refrigerator className="w-3 h-3"/> : currentEnv === 'freezer' ? <Snowflake className="w-3 h-3"/> : <Sun className="w-3 h-3"/>}
                                    </span>
                                    <span className="flex items-center gap-1 bg-slate-50 px-1.5 py-0.5 rounded">
                                        {currentContainer === 'box' ? <Box className="w-3 h-3"/> : currentContainer === 'bag' ? <ShoppingBag className="w-3 h-3"/> : <Ban className="w-3 h-3"/>}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Detailed Configuration Panel */}
                    {isEditing && status === 'storing' && (
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
                    
                    {/* Progress Bar */}
                    {status === 'storing' && (
                        <div className="mt-auto">
                            <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden mt-2">
                                <div 
                                    className={`h-full rounded-full transition-all duration-500 ${
                                        hoursLeft < 5 ? 'bg-rose-500' : hoursLeft < 24 ? 'bg-amber-500' : 'bg-emerald-500'
                                    }`}
                                    style={{ width: `${progress}%` }}
                                ></div>
                            </div>
                        </div>
                    )}

                    {(status === 'storing' || status === 'expired') && (
                        <div className="mt-3 pt-3 border-t border-dashed border-slate-100 flex gap-2">
                            {!isSpoiled && (
                                <button 
                                    onClick={() => updateStatus(item.id, 'cooked')}
                                    className="flex-1 py-2 rounded-xl bg-emerald-50 text-emerald-600 text-sm font-bold hover:bg-emerald-100 transition-colors flex items-center justify-center gap-2"
                                >
                                    <Utensils className="w-3 h-3" /> Đã nấu
                                </button>
                            )}
                            <button 
                                onClick={() => updateStatus(item.id, 'discarded')}
                                className="flex-1 py-2 rounded-xl bg-slate-50 text-slate-500 text-slate-500 text-sm font-bold hover:bg-rose-50 hover:text-rose-600 transition-colors flex items-center justify-center gap-2"
                            >
                                <Trash className="w-3 h-3" /> Đã bỏ
                            </button>
                        </div>
                    )}
                    </div>
                )})}
                </div>
            )}
          </div>
      )}

      {/* --- SAVED CONTENT --- */}
      {activeTab === 'saved' && (
          <div className="space-y-4">
              {savedPosts.length === 0 ? (
                  <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-200">
                      <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Bookmark className="w-10 h-10 text-slate-300" />
                      </div>
                      <p className="text-slate-500 font-bold mb-1">Chưa có bài viết</p>
                      <p className="text-slate-400 text-sm">Lưu các mẹo hay để xem lại sau.</p>
                      <Link to="/blog" className="inline-block mt-4 text-rose-500 font-bold text-sm hover:underline">Khám phá Blog</Link>
                  </div>
              ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {savedPosts.map(post => (
                        <Link to={`/blog/${post.id}`} key={post.id} className="flex gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all group relative">
                            <div className="w-24 h-24 rounded-xl bg-slate-100 overflow-hidden flex-shrink-0">
                                <img src={post.image} className="w-full h-full object-cover" alt={post.title} />
                            </div>
                            <div className="flex-1 flex flex-col justify-center">
                                <div className="text-[10px] font-bold text-rose-500 uppercase mb-1">{post.category}</div>
                                <h4 className="font-bold text-slate-800 leading-snug line-clamp-2 mb-2 group-hover:text-rose-600 transition-colors font-serif">{post.title}</h4>
                                <div className="flex items-center gap-1 text-slate-400 text-xs font-medium mt-auto">
                                    <span>Đọc tiếp</span> <ChevronRight className="w-3 h-3" />
                                </div>
                            </div>
                            <button 
                                onClick={(e) => unsavePost(e, post.id)}
                                className="absolute top-2 right-2 p-2 text-rose-500 hover:bg-rose-50 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                            >
                                <Bookmark className="w-4 h-4 fill-rose-500" />
                            </button>
                        </Link>
                      ))}
                  </div>
              )}
          </div>
      )}

    </div>
  );
};

export default History;
