import React, { useState } from 'react';
import { Search, Calendar, User, ChevronRight, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { blogPosts } from '../data/mockData';

const Blog: React.FC = () => {
  const [filter, setFilter] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredPosts = blogPosts.filter(post => {
    const matchesCategory = filter === 'All' || post.category === filter;
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const categories = ['All', 'Mẹo vặt', 'Dinh dưỡng', 'Sơ chế', 'Cảnh báo', 'Khoa học'];
  const heroPost = filteredPosts.length > 0 ? filteredPosts[0] : null;
  const otherPosts = filteredPosts.length > 0 ? filteredPosts.slice(1) : [];

  return (
    <div className="space-y-8 pb-24 animate-fade-in max-w-5xl mx-auto">
      
      {/* Header & Search */}
      <div className="space-y-4">
        <h2 className="text-3xl font-black text-slate-800 tracking-tight font-serif">Tạp chí Thịt Sạch</h2>
        <div className="relative max-w-lg">
            <input 
            type="text" 
            placeholder="Tìm kiếm kiến thức..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-3.5 rounded-2xl border-0 bg-white shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] focus:ring-2 focus:ring-rose-200 outline-none transition-all placeholder:text-slate-400 text-slate-700 font-medium"
            />
            <Search className="absolute left-4 top-3.5 w-5 h-5 text-rose-400" />
        </div>
      </div>

      {/* Categories */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-5 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all ${
              filter === cat 
                ? 'bg-slate-800 text-white shadow-lg shadow-slate-200 transform scale-105' 
                : 'bg-white text-slate-500 hover:bg-rose-50 hover:text-rose-500 border border-white'
            }`}
          >
            {cat === 'All' ? 'Tất cả' : cat}
          </button>
        ))}
      </div>

      {/* Posts List */}
      {filteredPosts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              
              {/* Hero Post - Spans full width on mobile, 2 cols on tablet, 3 on desktop */}
              {heroPost && (
                  <Link to={`/blog/${heroPost.id}`} className="md:col-span-2 lg:col-span-3 group relative block rounded-[2.5rem] overflow-hidden shadow-xl shadow-rose-100/50 h-96 md:h-[500px]">
                      <img src={heroPost.image} alt={heroPost.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-transparent flex flex-col justify-end p-6 md:p-10">
                          <div className="flex items-center gap-2 mb-3">
                              <span className="px-3 py-1 rounded-lg bg-rose-500 text-white text-xs font-bold uppercase tracking-wide shadow-sm">
                                  {heroPost.category}
                              </span>
                              <span className="flex items-center gap-1 text-amber-300 text-xs font-bold uppercase tracking-wide">
                                  <Star className="w-3 h-3 fill-amber-300" /> Nổi bật
                              </span>
                          </div>
                          <h3 className="text-2xl md:text-4xl font-black text-white leading-tight mb-3 font-serif group-hover:text-rose-200 transition-colors">
                              {heroPost.title}
                          </h3>
                          <p className="text-slate-300 text-sm md:text-base line-clamp-2 mb-4 font-medium max-w-2xl">
                              {heroPost.excerpt}
                          </p>
                          <div className="flex items-center gap-2 text-slate-400 text-xs font-medium">
                              <span>{heroPost.author}</span>
                              <span>•</span>
                              <span>{heroPost.date}</span>
                          </div>
                      </div>
                  </Link>
              )}

              {/* Other Posts - Grid Layout */}
              {otherPosts.map((post) => (
                    <Link to={`/blog/${post.id}`} key={post.id} className="group flex flex-col gap-4 bg-white p-4 rounded-[2rem] border border-white shadow-sm hover:shadow-xl hover:shadow-rose-100/50 transition-all duration-300">
                        <div className="h-48 flex-shrink-0 rounded-2xl overflow-hidden relative">
                            <img 
                                src={post.image} 
                                alt={post.title} 
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                            />
                            <span className="absolute top-3 left-3 text-[10px] font-bold text-white bg-black/50 backdrop-blur-md px-2 py-0.5 rounded-md uppercase">{post.category}</span>
                        </div>
                        
                        <div className="flex flex-col justify-center flex-1">
                            <h3 className="font-bold text-slate-800 leading-snug mb-2 line-clamp-2 group-hover:text-rose-600 transition-colors text-lg font-serif">
                                {post.title}
                            </h3>
                            <p className="text-sm text-slate-500 mb-4 line-clamp-2">{post.excerpt}</p>
                            
                            <div className="flex items-center gap-2 text-xs text-slate-400 mt-auto pt-4 border-t border-slate-50">
                                <div className="w-6 h-6 rounded-full overflow-hidden bg-slate-100">
                                     {post.authorAvatar ? <img src={post.authorAvatar} className="w-full h-full object-cover" /> : <User className="w-3 h-3 m-auto mt-1.5" />}
                                </div>
                                <span className="font-medium text-slate-500">{post.author}</span>
                                <span className="ml-auto">{post.date}</span>
                            </div>
                        </div>
                    </Link>
              ))}

          </div>
      ) : (
        <div className="text-center py-20 text-slate-400 bg-white rounded-3xl border border-dashed border-slate-200">
             <p>Không tìm thấy bài viết nào.</p>
        </div>
      )}
    </div>
  );
};

export default Blog;