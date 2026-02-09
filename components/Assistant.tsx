
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
    if (!input.trim() || isLoading) return;

    const userMsg: ChatMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const responseText = await getGeminiAssistant(input, messages);
      const aiMsg: ChatMessage = { role: 'assistant', content: responseText };
      setMessages(prev => [...prev, aiMsg]);
    } catch (e) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Pahoittelut, yhteysvirhe. Yritä uudelleen.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (isMinimized) {
    return (
      <button 
        onClick={() => setIsMinimized(false)}
        className="w-full bg-blue-700 hover:bg-blue-800 text-white p-8 rounded-[2.5rem] shadow-xl transition-all transform hover:-translate-y-1 flex flex-col items-center justify-center border-4 border-white/20 min-h-[220px] focus:ring-4 focus:ring-blue-400 outline-none"
        aria-label="Avaa tekoälyavustaja"
      >
        <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-5xl mb-4" aria-hidden="true">🤖</div>
        <div className="text-center">
          <h2 className="text-2xl font-black">Tarvitsetko apua?</h2>
          <p className="text-lg text-blue-100">Kysy mitä vain suomeksi</p>
        </div>
      </button>
    );
  }

  return (
    <section 
      className="bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col h-full border-4 border-blue-700 dark:border-blue-600 animate-in slide-in-from-bottom-4 duration-300 min-h-[500px]"
      aria-label="Keskusteluavustaja"
    >
      <div className="bg-blue-700 p-6 text-white flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-2xl" aria-hidden="true">🤖</div>
          <h2 className="text-xl font-black uppercase tracking-tight">Avustaja</h2>
        </div>
        <button 
          onClick={() => setIsMinimized(true)}
          className="bg-black/20 hover:bg-black/40 px-4 py-2 rounded-full font-bold transition-colors focus:ring-2 focus:ring-white"
        >
          Sulje ✕
        </button>
      </div>

      <div 
        ref={scrollRef}
        className="flex-1 p-6 overflow-y-auto space-y-4"
        aria-live="polite"
      >
        {messages.length === 0 && (
          <div className="text-center py-10 opacity-60">
            <p className="text-xl font-bold">Miten voin auttaa tänään?</p>
          </div>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-4 rounded-2xl text-lg font-medium shadow-sm ${
              msg.role === 'user' ? 'bg-blue-700 text-white rounded-tr-none' : 'bg-slate-100 dark:bg-slate-700 dark:text-white rounded-tl-none border border-slate-200 dark:border-slate-600'
            }`}>
              {msg.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-slate-100 dark:bg-slate-700 p-4 rounded-2xl flex gap-1 items-center" aria-label="Ladataan vastausta">
              <span className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></span>
              <span className="w-2 h-2 bg-blue-600 rounded-full animate-bounce [animation-delay:0.2s]"></span>
              <span className="w-2 h-2 bg-blue-600 rounded-full animate-bounce [animation-delay:0.4s]"></span>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 bg-slate-50 dark:bg-slate-900 border-t-2 border-slate-100 dark:border-slate-700 flex gap-2">
        <input 
          type="text" 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Kirjoita kysymys..."
          className="flex-1 border-2 border-slate-300 dark:border-slate-600 rounded-xl px-4 py-3 text-lg focus:ring-4 focus:ring-blue-200 outline-none dark:bg-slate-800"
          aria-label="Kysymyskenttä"
        />
        <button 
          onClick={handleSend}
          disabled={isLoading || !input.trim()}
          className="bg-blue-700 text-white px-6 py-3 rounded-xl font-black hover:bg-blue-800 disabled:opacity-50 transition-all focus:ring-4 focus:ring-blue-300"
        >
          Lähetä
        </button>
      </div>
    </section>
  );
};

export default Assistant;
