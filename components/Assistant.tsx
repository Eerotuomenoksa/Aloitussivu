
import React, { useState, useRef, useEffect } from 'react';
import { getGeminiAssistant } from '../services/geminiService';
import { ChatMessage } from '../types';

const Assistant: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isMinimized, setIsMinimized] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isMinimized]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: ChatMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    const responseText = await getGeminiAssistant(input, messages);
    const aiMsg: ChatMessage = { role: 'assistant', content: responseText };
    setMessages(prev => [...prev, aiMsg]);
    setIsLoading(false);
  };

  if (isMinimized) {
    return (
      <button 
        onClick={() => setIsMinimized(false)}
        className="w-full h-full bg-blue-600 hover:bg-blue-700 text-white p-6 rounded-3xl shadow-xl transition-all transform hover:-translate-y-1 active:scale-95 flex items-center justify-between border-4 border-white/20 group min-h-[160px]"
      >
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-4xl group-hover:scale-110 transition-transform">
            🤖
          </div>
          <div className="text-left">
            <h2 className="text-2xl font-black leading-tight">Tarvitsetko apua?</h2>
            <p className="text-lg text-blue-100">Avaa avustaja</p>
          </div>
        </div>
        <span className="text-4xl font-light opacity-60">＋</span>
      </button>
    );
  }

  return (
    <div className="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col h-full border-2 border-blue-100 animate-in slide-in-from-bottom-4 duration-300 min-h-[500px]">
      <div className="bg-blue-600 p-6 text-white flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-3xl">
            🤖
          </div>
          <div>
            <h2 className="text-2xl font-black">Avustaja</h2>
            <p className="text-xs text-blue-100 font-bold uppercase tracking-widest">Paikalla auttamassa</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setMessages([])}
            className="text-sm bg-white/10 hover:bg-white/20 px-4 py-2 rounded-full transition-colors font-bold"
          >
            Tyhjennä
          </button>
          <button 
            onClick={() => setIsMinimized(true)}
            className="text-sm bg-black/20 hover:bg-black/30 px-4 py-2 rounded-full transition-colors font-bold flex items-center gap-2"
          >
            Pienennä ✕
          </button>
        </div>
      </div>

      <div 
        ref={scrollRef}
        className="flex-1 p-8 overflow-y-auto space-y-6 max-h-[400px]"
      >
        {messages.length === 0 && (
          <div className="text-center text-slate-400 mt-12 px-4">
            <div className="text-6xl mb-6">👋</div>
            <p className="text-2xl font-bold text-slate-700 mb-4">
              Hei! Miten voisin auttaa?
            </p>
            <p className="text-lg text-slate-500 leading-relaxed max-w-sm mx-auto">
              Kysy reseptejä, neuvoja tai vaikkapa päivän säätä.
            </p>
          </div>
        )}
        {messages.map((msg, i) => (
          <div 
            key={i} 
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-200`}
          >
            <div 
              className={`max-w-[85%] p-5 rounded-3xl text-xl shadow-sm leading-relaxed ${
                msg.role === 'user' 
                  ? 'bg-blue-600 text-white rounded-tr-none' 
                  : 'bg-slate-100 text-slate-800 rounded-tl-none border border-slate-200'
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-slate-100 p-5 rounded-3xl flex gap-2 border border-slate-200">
              <div className="w-3 h-3 bg-blue-400 rounded-full animate-bounce"></div>
              <div className="w-3 h-3 bg-blue-400 rounded-full animate-bounce delay-100"></div>
              <div className="w-3 h-3 bg-blue-400 rounded-full animate-bounce delay-200"></div>
            </div>
          </div>
        )}
      </div>

      <div className="p-6 bg-slate-50 border-t-2 border-slate-100 flex gap-4">
        <input 
          type="text" 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Kirjoita kysymys..."
          className="flex-1 border-2 border-slate-200 rounded-2xl px-6 py-5 text-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 shadow-inner bg-white"
        />
        <button 
          onClick={handleSend}
          disabled={isLoading}
          className="bg-blue-600 text-white px-10 py-5 rounded-2xl text-2xl font-black hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 active:scale-95 disabled:opacity-50"
        >
          Lähetä
        </button>
      </div>
    </div>
  );
};

export default Assistant;
