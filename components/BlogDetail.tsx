
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, User, Share2, Bookmark } from 'lucide-react';
import { blogPosts } from '../src/data/mockData';

const BlogDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const post = blogPosts.find(p => p.id === id);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
      if (id) {
          try {
              const savedIdsString = localStorage.getItem('savedPosts');
              const savedIds = savedIdsString ? JSON.parse(savedIdsString) : [];
              if (Array.isArray(savedIds)) {
                  setIsSaved(savedIds.includes(id));
              }
          } catch (e) {
              console.error("Error loading saved status", e);
              setIsSaved(false);
          }
      }
  }, [id]);

  const toggleSave = () => {
      if (!id) return;
      
      try {
          const savedIdsString = localStorage.getItem('savedPosts');
          let savedIds = savedIdsString ? JSON.parse(savedIdsString) : [];
          
          if (!Array.isArray(savedIds)) savedIds = [];

          let newSavedIds;
          if (savedIds.includes(id)) {
              newSavedIds = savedIds.filter((savedId: string) => savedId !== id);
              setIsSaved(false);
          } else {
              newSavedIds = [...savedIds, id];
              setIsSaved(true);
          }
          
          localStorage.setItem('savedPosts', JSON.stringify(newSavedIds));
      } catch (e) {
          console.error("Error saving post", e);
      }
  };

  if (!post) {
    return <div className="text-center py-20">Bài viết không tồn tại.</div>;
  }

  return (
    <div className="pb-20 animate-fade-in bg-white min-h-screen max-w-4xl mx-auto shadow-xl shadow-slate-200/50 my-0 md:my-8 md:rounded-[2.5rem] overflow-hidden">
      
      {/* Sticky Header */}
      <div className="sticky top-0 bg-white/90 backdrop-blur-md z-20 px-6 py-4 flex justify-between items-center border-b border-slate-50">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 rounded-full bg-slate-50 hover:bg-rose-50 text-slate-600 hover:text-rose-600 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex gap-2">
             <button 
                onClick={toggleSave}
                className={`p-2 rounded-full hover:bg-slate-50 transition-all duration-300 ${isSaved ? 'text-rose-500 bg-rose-50' : 'text-slate-400'}`}
             >
                <Bookmark className={`w-5 h-5 ${isSaved ? 'fill-rose-500' : ''}`} />
             </button>
             <button className="p-2 rounded-full hover:bg-slate-50 text-slate-400 transition-colors">
                <Share2 className="w-5 h-5" />
             </button>
          </div>
      </div>

      {/* Cover Image */}
      <div className="w-full h-64 md:h-96 relative">
         <img src={post.image} alt={post.title} className="w-full h-full object-cover" />
         <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent opacity-80"></div>
      </div>

      <div className="px-6 md:px-12 -mt-20 relative z-10">
        {/* Category Tag */}
        <span className="inline-block px-3 py-1 rounded-lg bg-rose-600 text-white text-xs font-bold uppercase tracking-wider shadow-lg shadow-rose-200 mb-4">
            {post.category}
        </span>

        <h1 className="text-3xl md:text-4xl font-black text-slate-900 leading-[1.2] mb-6 font-serif">{post.title}</h1>
        
        {/* Author Block */}
        <div className="flex items-center justify-between mb-8 pb-8 border-b border-slate-100">
            <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-slate-200 overflow-hidden">
                    {post.authorAvatar ? (
                        <img src={post.authorAvatar} className="w-full h-full object-cover" alt={post.author} />
                    ) : (
                        <User className="w-6 h-6 m-auto mt-3 text-slate-400" />
                    )}
                </div>
                <div>
                    <div className="font-bold text-slate-800 text-sm">{post.author}</div>
                    <div className="text-xs text-slate-500">{post.authorRole || 'Tác giả'}</div>
                </div>
            </div>
            <div className="text-xs text-slate-400 font-medium bg-slate-50 px-3 py-1 rounded-full">
                {post.date}
            </div>
        </div>

        {/* Content */}
        <div className="blog-content max-w-none">
             <p className="text-lg font-medium text-slate-600 mb-8 italic leading-relaxed border-l-4 border-rose-400 pl-4">
                {post.excerpt}
             </p>
             
             <div 
                className="prose prose-lg prose-rose max-w-none text-slate-800 prose-headings:font-serif prose-img:rounded-3xl prose-img:shadow-lg"
                dangerouslySetInnerHTML={{ __html: post.content }} 
            />
        </div>

        {/* Footer of Article */}
        <div className="mt-16 pt-8 border-t border-slate-100">
             <h3 className="font-bold text-slate-800 mb-6 text-xl">Bài viết liên quan</h3>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 {blogPosts.filter(p => p.id !== post.id).slice(0, 2).map(p => (
                     <div key={p.id} onClick={() => navigate(`/blog/${p.id}`)} className="flex gap-4 cursor-pointer group bg-slate-50 p-3 rounded-2xl border border-transparent hover:border-rose-100 hover:bg-white hover:shadow-lg transition-all">
                         <img src={p.image} className="w-24 h-24 rounded-xl object-cover flex-shrink-0" alt="" />
                         <div className="flex flex-col justify-center">
                             <div className="text-[10px] font-bold text-rose-500 mb-1 uppercase bg-rose-100 inline-block px-2 py-0.5 rounded w-fit">{p.category}</div>
                             <h4 className="font-bold text-slate-800 text-sm leading-snug group-hover:text-rose-600 line-clamp-2">{p.title}</h4>
                         </div>
                     </div>
                 ))}
             </div>
        </div>
      </div>
    </div>
  );
};

export default BlogDetail;
