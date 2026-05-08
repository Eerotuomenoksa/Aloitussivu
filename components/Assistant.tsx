
import React, { useState, useRef, useEffect } from 'react';
import { getGeminiAssistant } from '../services/geminiService';
import { ChatMessage } from '../types';
import { useI18n } from '../i18n';

interface AssistantProps {
  variant?: 'default' | 'header';
}

const Assistant: React.FC<AssistantProps> = ({ variant = 'default' }) => {
  const { t } = useI18n();
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
      setMessages(prev => [...prev, { role: 'assistant', content: t('assistantError') }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (isMinimized && variant === 'header') {
    return (
      <button
        onClick={() => setIsMinimized(false)}
        className="w-full rounded-2xl md:rounded-3xl bg-brand-indigo p-4 md:p-5 text-white shadow-xl transition-all hover:bg-brand-purple active:scale-95 focus:outline-none focus:ring-4 focus:ring-indigo-300 border-4 border-indigo-500/20 min-h-[92px] md:min-h-[150px] flex items-center justify-center gap-3 md:gap-4"
        aria-label={t('assistantOpen')}
      >
        <span className="flex h-12 w-12 md:h-16 md:w-16 items-center justify-center rounded-full bg-white/20 text-3xl md:text-5xl" aria-hidden="true">🤖</span>
        <span className="text-left">
          <span className="block text-base md:text-xl font-black leading-tight">{t('assistantNeedHelp')}</span>
          <span className="block text-sm md:text-base font-bold text-blue-100">{t('assistantAskAnything')}</span>
        </span>
      </button>
    );
  }

  if (isMinimized) {
    return (
      <button 
        onClick={() => setIsMinimized(false)}
        className="w-full bg-brand-indigo hover:bg-brand-purple dark:bg-brand-indigo dark:hover:bg-brand-purple text-white p-8 rounded-[2.5rem] shadow-xl transition-all transform hover:-translate-y-1 flex flex-col items-center justify-center border-4 border-white/20 dark:border-brand-indigo/50 min-h-[220px] focus:ring-4 focus:ring-blue-400 outline-none"
        aria-label={t('assistantOpen')}
      >
        <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-5xl mb-4" aria-hidden="true">🤖</div>
        <div className="text-center">
          <h2 className="text-2xl font-black">{t('assistantNeedHelp')}</h2>
          <p className="text-lg text-blue-100">{t('assistantAskAnything')}</p>
        </div>
      </button>
    );
  }

  return (
    <section 
      className={`bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col h-full border-4 border-brand-indigo dark:border-brand-purple animate-in slide-in-from-bottom-4 duration-300 ${variant === 'header' ? 'min-h-[440px] xl:absolute xl:right-0 xl:top-full xl:z-40 xl:mt-4 xl:w-[28rem]' : 'min-h-[500px]'}`}
      aria-label={t('assistantChat')}
    >
      <div className="bg-brand-indigo dark:bg-brand-purple p-6 text-white flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-2xl" aria-hidden="true">🤖</div>
          <h2 className="text-xl font-black uppercase tracking-tight">{t('assistantTitle')}</h2>
        </div>
        <button 
          onClick={() => setIsMinimized(true)}
          className="bg-black/20 hover:bg-black/40 px-4 py-2 rounded-full font-bold transition-colors focus:ring-2 focus:ring-white"
        >
          {t('assistantClose')} ✕
        </button>
      </div>

      <div 
        ref={scrollRef}
        className="flex-1 p-6 overflow-y-auto space-y-4 bg-slate-100 dark:bg-slate-900 transition-colors duration-300"
        aria-live="polite"
      >
        {messages.length === 0 && (
          <div className="text-center py-10">
            <p className="text-xl font-bold text-slate-500 dark:text-slate-400">{t('assistantGreeting')}</p>
          </div>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-4 rounded-2xl text-lg font-bold shadow-sm transition-colors duration-200 ${
              msg.role === 'user' 
                ? 'bg-brand-indigo text-white rounded-tr-none' 
                : 'bg-white dark:bg-slate-700 text-slate-950 dark:text-white rounded-tl-none border border-slate-300 dark:border-slate-600'
            }`}>
              {msg.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white dark:bg-slate-700 p-4 rounded-2xl flex gap-1 items-center border border-slate-200 dark:border-slate-600" aria-label={t('assistantLoading')}>
              <span className="w-2 h-2 bg-brand-indigo dark:bg-brand-cyan rounded-full animate-bounce"></span>
              <span className="w-2 h-2 bg-brand-indigo dark:bg-brand-cyan rounded-full animate-bounce [animation-delay:0.2s]"></span>
              <span className="w-2 h-2 bg-brand-indigo dark:bg-brand-cyan rounded-full animate-bounce [animation-delay:0.4s]"></span>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 bg-white dark:bg-slate-800 border-t-2 border-slate-200 dark:border-slate-700 flex gap-2">
        <input 
          type="text" 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder={t('assistantPlaceholder')}
          className="flex-1 border-2 border-slate-400 dark:border-slate-600 rounded-xl px-4 py-3 text-lg focus:ring-4 focus:ring-blue-200 outline-none bg-white dark:bg-slate-700 text-slate-950 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 transition-colors font-bold"
          aria-label={t('assistantInput')}
        />
        <button 
          onClick={handleSend}
          disabled={isLoading || !input.trim()}
          className="bg-brand-indigo text-white px-6 py-3 rounded-xl font-black hover:bg-brand-purple disabled:opacity-50 transition-all focus:ring-4 focus:ring-blue-300 shadow-md active:scale-95"
        >
          {t('assistantSend')}
        </button>
      </div>
    </section>
  );
};

export default Assistant;
