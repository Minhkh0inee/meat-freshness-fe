
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChefHat, ShoppingBag, PartyPopper, Send, Lock, Crown, Sparkles, Plus, MessageSquare, Clock, Menu, X, Trash2 } from 'lucide-react';
import { Chat, Content } from "@google/genai";
import { AIPersona, ChatMessage, ChatSession } from '@/types';
import { createChatSession } from '../services/geminiService';

const AIAssistant: React.FC = () => {
  const navigate = useNavigate();
  
  // State
  const [isPremium, setIsPremium] = useState(false);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [selectedPersona, setSelectedPersona] = useState<AIPersona | null>(null);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chatSession, setChatSession] = useState<Chat | null>(null);
  const [showSidebar, setShowSidebar] = useState(false); // Mobile sidebar toggle
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load premium status and history on mount
  useEffect(() => {
    const premiumStatus = localStorage.getItem('isPremium') === 'true';
    setIsPremium(premiumStatus);

    const savedSessions = localStorage.getItem('chatHistory');
    if (savedSessions) {
        try {
            const parsed = JSON.parse(savedSessions);
            // Sort by last message time desc
            const sorted = (Array.isArray(parsed) ? parsed : []).sort((a: ChatSession, b: ChatSession) => b.lastMessageAt - a.lastMessageAt);
            setSessions(sorted);
        } catch (e) {
            console.error("Failed to load chat history", e);
        }
    }
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Save sessions whenever they change
  useEffect(() => {
      if (sessions.length > 0) {
          localStorage.setItem('chatHistory', JSON.stringify(sessions));
      }
  }, [sessions]);

  // Create New Chat
  const startNewChat = async (persona: AIPersona) => {
      if (!isPremium) {
          navigate('/premium');
          return;
      }
      
      const newSessionId = Date.now().toString();
      
      // Initial greeting
      let greeting = "";
      if (persona === AIPersona.CHEF) greeting = "Xin chào! Tôi là Chef Gordon. Bạn cần tư vấn thực đơn gì hôm nay?";
      if (persona === AIPersona.HOUSEWIFE) greeting = "Chào em! Chị Ba đây. Nay đi chợ mua gì, hay cần tìm chỗ mua đồ ngon thì bảo chị nha!";
      if (persona === AIPersona.FRIEND) greeting = "Hi bestie! 😜 Nay ăn gì? Tám chút về đồ ăn hông?";

      const initialMessage: ChatMessage = {
          id: 'init',
          role: 'model',
          text: greeting,
          timestamp: Date.now()
      };

      const newSession: ChatSession = {
          id: newSessionId,
          persona: persona,
          title: "Cuộc trò chuyện mới",
          messages: [initialMessage],
          createdAt: Date.now(),
          lastMessageAt: Date.now()
      };

      // Update State
      setSessions(prev => [newSession, ...prev]);
      setActiveSessionId(newSessionId);
      setSelectedPersona(persona);
      setMessages([initialMessage]);
      setShowSidebar(false);

      // Init Gemini
      await initGeminiChat(persona, undefined);
  };

  // Load Existing Chat
  const loadChat = async (session: ChatSession) => {
      if (!isPremium) {
          navigate('/premium');
          return;
      }

      setActiveSessionId(session.id);
      setSelectedPersona(session.persona);
      setMessages(session.messages);
      setShowSidebar(false);

      // Convert stored messages to Gemini Content format for context restoration
      const historyContent: Content[] = session.messages
        .filter(m => m.id !== 'init') // Filter out local init message if needed
        .map(m => ({
            role: m.role,
            parts: [{ text: m.text }]
        }));

      await initGeminiChat(session.persona, historyContent);
  };

  const initGeminiChat = async (persona: AIPersona, history?: Content[]) => {
    try {
        let location;
        if (persona === AIPersona.HOUSEWIFE) {
            try {
                const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
                    navigator.geolocation.getCurrentPosition(resolve, reject, {timeout: 5000});
                });
                location = { lat: pos.coords.latitude, lng: pos.coords.longitude };
            } catch (e) {
                console.warn("Could not get location", e);
            }
        }
        const session = createChatSession(persona, location, history);
        setChatSession(session);
    } catch (e) {
        console.error("Failed to init chat session", e);
    }
  };

  const deleteSession = (e: React.MouseEvent, id: string) => {
      e.stopPropagation();
      if(window.confirm("Xóa cuộc trò chuyện này?")) {
          const updated = sessions.filter(s => s.id !== id);
          setSessions(updated);
          localStorage.setItem('chatHistory', JSON.stringify(updated));
          if (activeSessionId === id) {
              setActiveSessionId(null);
              setSelectedPersona(null);
          }
      }
  };

  const handleSend = async () => {
      if (!input.trim() || !chatSession || !activeSessionId) return;
      
      const userMsg: ChatMessage = {
          id: Date.now().toString(),
          role: 'user',
          text: input,
          timestamp: Date.now()
      };
      
      // Optimistic update
      const updatedMessages = [...messages, userMsg];
      setMessages(updatedMessages);
      setInput('');
      setIsLoading(true);

      // Update Session in list (Title update if it's the first user msg)
      setSessions(prev => prev.map(s => {
          if (s.id === activeSessionId) {
              return {
                  ...s,
                  messages: updatedMessages,
                  lastMessageAt: Date.now(),
                  title: s.messages.length <= 1 ? (userMsg.text.substring(0, 30) + (userMsg.text.length > 30 ? '...' : '')) : s.title
              };
          }
          return s;
      }).sort((a, b) => b.lastMessageAt - a.lastMessageAt));

      try {
          const result = await chatSession.sendMessage({ message: userMsg.text });
          const responseText = result.text;
          
          const modelMsg: ChatMessage = {
              id: (Date.now() + 1).toString(),
              role: 'model',
              text: responseText || "Xin lỗi, tôi chưa hiểu ý bạn.",
              timestamp: Date.now()
          };
          
          const finalMessages = [...updatedMessages, modelMsg];
          setMessages(finalMessages);

          // Update session with model response
          setSessions(prev => prev.map(s => {
            if (s.id === activeSessionId) {
                return {
                    ...s,
                    messages: finalMessages,
                    lastMessageAt: Date.now()
                };
            }
            return s;
          }));

      } catch (error) {
          console.error("Chat error", error);
          const errorMsg: ChatMessage = {
              id: (Date.now() + 1).toString(),
              role: 'model',
              text: "Xin lỗi, hệ thống đang bận.",
              timestamp: Date.now()
          };
          setMessages(prev => [...prev, errorMsg]);
      } finally {
          setIsLoading(false);
      }
  };

  // Group sessions by date
  const getGroupedSessions = () => {
      const today = new Date().setHours(0,0,0,0);
      const yesterday = today - 86400000;

      const groups = {
          today: [] as ChatSession[],
          yesterday: [] as ChatSession[],
          older: [] as ChatSession[]
      };

      sessions.forEach(s => {
          if (s.lastMessageAt >= today) groups.today.push(s);
          else if (s.lastMessageAt >= yesterday) groups.yesterday.push(s);
          else groups.older.push(s);
      });

      return groups;
  };

  const groupedSessions = getGroupedSessions();

  // --- VIEW: PERSONA SELECTION (HOME) ---
  if (!activeSessionId && !selectedPersona) {
      return (
          <div className="max-w-6xl mx-auto pb-4 animate-fade-in-up min-h-[calc(100dvh-200px)] flex flex-col">
              <div className="flex-1 flex flex-col items-center justify-center">
                <div className="text-center mb-10 space-y-4 mt-8 md:mt-0">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-100 text-rose-600 font-bold text-xs uppercase tracking-widest">
                            <Sparkles className="w-3 h-3" /> Trợ lý AI Đa năng
                    </div>
                    <h2 className="text-3xl md:text-5xl font-black text-slate-800 font-serif">Chọn Người Đồng Hành</h2>
                    <p className="text-slate-500 max-w-xl mx-auto">
                        Bạn cần một đầu bếp chuyên nghiệp, một người chị nội trợ đảm đang hay một người bạn vui tính?
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-4 w-full max-w-5xl">
                    {/* Persona Cards */}
                    <PersonaCard 
                        persona={AIPersona.CHEF}
                        name="Đầu Bếp Gordon"
                        desc="Thực đơn & Kỹ thuật nấu"
                        icon={<ChefHat className="w-8 h-8" />}
                        color="slate"
                        isPremium={isPremium}
                        onClick={() => startNewChat(AIPersona.CHEF)}
                    />
                    <PersonaCard 
                        persona={AIPersona.HOUSEWIFE}
                        name="Chị Ba Nội Trợ"
                        desc="Đi chợ & Tìm địa điểm"
                        icon={<ShoppingBag className="w-8 h-8" />}
                        color="rose"
                        isPremium={isPremium}
                        onClick={() => startNewChat(AIPersona.HOUSEWIFE)}
                    />
                    <PersonaCard 
                        persona={AIPersona.FRIEND}
                        name="Bạn Thân Foodie"
                        desc="Review & Trò chuyện"
                        icon={<PartyPopper className="w-8 h-8" />}
                        color="amber"
                        isPremium={isPremium}
                        onClick={() => startNewChat(AIPersona.FRIEND)}
                    />
                </div>

                {/* Recent History Quick Access */}
                {sessions.length > 0 && (
                    <div className="mt-12 w-full max-w-md mb-8">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 text-center">Gần đây</h4>
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 divide-y divide-slate-50">
                            {sessions.slice(0, 2).map(s => (
                                <div key={s.id} onClick={() => loadChat(s)} className="p-4 flex items-center gap-3 cursor-pointer hover:bg-slate-50 transition-colors first:rounded-t-2xl last:rounded-b-2xl">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white ${s.persona === 'chef' ? 'bg-slate-800' : s.persona === 'housewife' ? 'bg-rose-500' : 'bg-amber-400'}`}>
                                        {s.persona === 'chef' ? <ChefHat className="w-4 h-4"/> : s.persona === 'housewife' ? <ShoppingBag className="w-4 h-4"/> : <PartyPopper className="w-4 h-4"/>}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-slate-800 truncate">{s.title}</p>
                                        <p className="text-xs text-slate-400">{new Date(s.lastMessageAt).toLocaleDateString('vi-VN')}</p>
                                    </div>
                                    <MessageSquare className="w-4 h-4 text-slate-300" />
                                </div>
                            ))}
                        </div>
                    </div>
                )}
              </div>
          </div>
      );
  }

  // --- VIEW: CHAT INTERFACE WITH SIDEBAR ---
  // Modified height calculation: 100dvh - 13rem (mobile) / 10rem (desktop)
  // 13rem ~ 208px (Header 64 + Pad 24 + BottomNav ~90 + Safe Area)
  // 10rem ~ 160px (Header 64 + Pad 24 + Desktop Footer/Pad)
  return (
      <div className="h-[calc(100dvh-13rem)] md:h-[calc(100dvh-10rem)] max-w-7xl mx-auto flex overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl animate-fade-in mt-1 md:mt-4">
          
          {/* SIDEBAR (History) */}
          <div className={`
             fixed inset-0 z-50 bg-white/95 backdrop-blur md:relative md:bg-slate-50 md:w-80 md:flex flex-col border-r border-slate-200 transition-transform duration-300 ease-in-out
             ${showSidebar ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          `}>
              {/* Sidebar Header */}
              <div className="p-4 border-b border-slate-200 flex justify-between items-center h-16">
                  <h3 className="font-bold text-slate-700">Lịch sử Chat</h3>
                  <button onClick={() => setShowSidebar(false)} className="md:hidden p-2 text-slate-400">
                      <X className="w-5 h-5" />
                  </button>
              </div>

              {/* New Chat Button */}
              <div className="p-4">
                  <button 
                    onClick={() => { setActiveSessionId(null); setSelectedPersona(null); setShowSidebar(false); }}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-rose-500 text-white rounded-xl font-bold shadow-lg shadow-rose-200 hover:bg-rose-600 transition-colors"
                  >
                      <Plus className="w-5 h-5" /> Cuộc trò chuyện mới
                  </button>
              </div>

              {/* History List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-6 pb-20 md:pb-4">
                  {Object.entries(groupedSessions).map(([key, group]) => (
                      group.length > 0 && (
                          <div key={key}>
                              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 px-2">
                                  {key === 'today' ? 'Hôm nay' : key === 'yesterday' ? 'Hôm qua' : 'Cũ hơn'}
                              </h4>
                              <div className="space-y-1">
                                  {group.map(session => (
                                      <div 
                                        key={session.id}
                                        onClick={() => loadChat(session)}
                                        className={`group flex items-center gap-3 p-2.5 rounded-xl cursor-pointer transition-all ${
                                            activeSessionId === session.id ? 'bg-white shadow-sm border border-slate-200' : 'hover:bg-slate-100 border border-transparent'
                                        }`}
                                      >
                                          <div className={`w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center text-white ${
                                              session.persona === 'chef' ? 'bg-slate-700' : session.persona === 'housewife' ? 'bg-rose-400' : 'bg-amber-400'
                                          }`}>
                                              {session.persona === 'chef' ? <ChefHat className="w-4 h-4"/> : session.persona === 'housewife' ? <ShoppingBag className="w-4 h-4"/> : <PartyPopper className="w-4 h-4"/>}
                                          </div>
                                          <div className="flex-1 min-w-0">
                                              <p className={`text-sm font-medium truncate ${activeSessionId === session.id ? 'text-slate-800' : 'text-slate-600'}`}>
                                                  {session.title}
                                              </p>
                                          </div>
                                          <button 
                                            onClick={(e) => deleteSession(e, session.id)}
                                            className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                                          >
                                              <Trash2 className="w-3 h-3" />
                                          </button>
                                      </div>
                                  ))}
                              </div>
                          </div>
                      )
                  ))}
                  {sessions.length === 0 && (
                      <div className="text-center py-10 text-slate-400">
                          <Clock className="w-8 h-8 mx-auto mb-2 opacity-20" />
                          <p className="text-xs">Chưa có lịch sử</p>
                      </div>
                  )}
              </div>
          </div>

          {/* MAIN CHAT AREA */}
          <div className="flex-1 flex flex-col h-full relative">
              {/* Chat Header */}
              <div className={`p-4 flex justify-between items-center border-b border-slate-100 z-10 shadow-sm h-16 ${
                  selectedPersona === AIPersona.CHEF ? 'bg-slate-900 text-white' :
                  selectedPersona === AIPersona.HOUSEWIFE ? 'bg-rose-500 text-white' :
                  'bg-amber-400 text-white'
              }`}>
                  <div className="flex items-center gap-3">
                      <button onClick={() => setShowSidebar(true)} className="md:hidden p-1.5 bg-white/20 rounded-lg">
                          <Menu className="w-5 h-5" />
                      </button>
                      <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                          {selectedPersona === AIPersona.CHEF && <ChefHat className="w-5 h-5" />}
                          {selectedPersona === AIPersona.HOUSEWIFE && <ShoppingBag className="w-5 h-5" />}
                          {selectedPersona === AIPersona.FRIEND && <PartyPopper className="w-5 h-5" />}
                      </div>
                      <div>
                          <h3 className="font-bold text-base leading-none">
                              {selectedPersona === AIPersona.CHEF && "Chef Gordon"}
                              {selectedPersona === AIPersona.HOUSEWIFE && "Chị Ba Nội Trợ"}
                              {selectedPersona === AIPersona.FRIEND && "Bạn Thân Foodie"}
                          </h3>
                          <span className="text-[10px] opacity-80 font-medium uppercase tracking-wider flex items-center gap-1 mt-0.5">
                              <span className="w-1.5 h-1.5 bg-green-400 rounded-full"></span>
                              {isLoading ? 'Đang trả lời...' : 'Trực tuyến'}
                          </span>
                      </div>
                  </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 bg-slate-50/50 scroll-smooth">
                  {messages.map((msg) => (
                      <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[85%] md:max-w-[75%] p-3 md:p-4 rounded-2xl shadow-sm ${
                              msg.role === 'user' 
                              ? 'bg-slate-800 text-white rounded-tr-none' 
                              : 'bg-white text-slate-800 border border-slate-100 rounded-tl-none'
                          }`}>
                              <p className="whitespace-pre-wrap text-sm leading-relaxed">{msg.text}</p>
                              <div className={`text-[10px] mt-1 text-right opacity-60 ${msg.role === 'user' ? 'text-slate-300' : 'text-slate-400'}`}>
                                  {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                              </div>
                          </div>
                      </div>
                  ))}
                  {isLoading && (
                      <div className="flex justify-start animate-fade-in">
                          <div className="bg-white p-4 rounded-2xl rounded-tl-none shadow-sm border border-slate-100 flex gap-2 items-center">
                              <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></span>
                              <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-75"></span>
                              <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-150"></span>
                          </div>
                      </div>
                  )}
                  <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="p-3 md:p-4 bg-white border-t border-slate-100">
                  <div className="flex gap-2 relative max-w-3xl mx-auto">
                      <input 
                          type="text" 
                          value={input}
                          onChange={(e) => setInput(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                          placeholder="Nhập tin nhắn..." 
                          className="flex-1 bg-slate-100 border-0 rounded-xl px-4 py-3 focus:ring-2 focus:ring-rose-200 outline-none text-slate-800 placeholder:text-slate-400 transition-all text-sm"
                          disabled={isLoading}
                          autoFocus
                      />
                      <button 
                          onClick={handleSend}
                          disabled={isLoading || !input.trim()}
                          className={`p-3 rounded-xl transition-all duration-200 ${
                              input.trim() 
                              ? 'bg-rose-500 text-white shadow-lg shadow-rose-200 hover:scale-105 active:scale-95' 
                              : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                          }`}
                      >
                          <Send className="w-5 h-5" />
                      </button>
                  </div>
              </div>
          </div>
      </div>
  );
};

// Sub-component for Persona Card
const PersonaCard = ({ persona, name, desc, icon, color, isPremium, onClick }: any) => (
    <div onClick={onClick} className={`group bg-white rounded-[2.5rem] p-6 lg:p-8 border border-slate-100 shadow-lg hover:shadow-2xl transition-all cursor-pointer relative overflow-hidden ${!isPremium ? 'grayscale-[0.5]' : ''}`}>
        <div className={`absolute top-0 right-0 w-32 h-32 rounded-bl-[4rem] -mr-4 -mt-4 transition-all opacity-20 bg-${color}-500 group-hover:scale-110`}></div>
        <div className="relative z-10">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-lg transition-transform group-hover:scale-110 bg-${color}-500 text-white`}>
                {icon}
            </div>
            <h3 className="text-xl lg:text-2xl font-black text-slate-800 mb-2 font-serif">{name}</h3>
            <p className="text-slate-500 text-sm mb-6 line-clamp-2">{desc}</p>
            <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wide">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span> Online
            </div>
        </div>
        {!isPremium && (
            <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex flex-col items-center justify-center z-20 text-center p-4">
                <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center mb-2">
                    <Lock className="w-5 h-5 text-amber-600" />
                </div>
                <div className="px-3 py-1 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-[10px] font-bold rounded-full shadow-md">
                    <Crown className="w-3 h-3 inline mr-1" /> VIP Only
                </div>
            </div>
        )}
    </div>
);

export default AIAssistant;
