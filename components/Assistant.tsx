
import React, { useCallback, useState, useRef, useEffect } from 'react';
import { getGeminiAssistant } from '../services/geminiService';
import { ChatMessage } from '../types';
import { useI18n } from '../i18n';
import { useSpeechInput } from '../hooks/useSpeechInput';

interface AssistantProps {
  variant?: 'default' | 'header';
}

const Assistant: React.FC<AssistantProps> = ({ variant = 'default' }) => {
  const { t, speechLocale } = useI18n();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isMinimized, setIsMinimized] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const setSpokenInput = useCallback((text: string) => setInput(text), []);
  const clearInputBeforeListen = useCallback(() => setInput(''), []);
  const { speechState, canListen, toggleListening } = useSpeechInput({
    locale: speechLocale,
    onResult: setSpokenInput,
    clearBeforeListen: clearInputBeforeListen,
  });

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
        className="assistant-card relative flex h-full min-h-[116px] w-full items-center justify-center gap-3 overflow-hidden rounded-[20px] border border-white/10 p-4 text-white shadow-[0_8px_32px_rgba(10,26,14,.3)] transition-all hover:-translate-y-0.5 active:scale-95 md:min-h-[128px] md:p-4"
        style={{
          background: 'linear-gradient(135deg, #0c1829 0%, #0f2318 60%, #1a3428 100%)',
          animation: 'assistant-glow 4s ease-in-out infinite alternate',
        }}
        aria-label={t('assistantOpen')}
      >
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-3xl md:h-12 md:w-12 md:text-4xl" aria-hidden="true">✦</span>
        <span className="text-left text-white/85">
          <span className="mb-1 flex items-center gap-2 text-[.65rem] font-black uppercase tracking-[.2em] text-[rgba(240,192,64,.75)]">
            AI-avustaja
            <span className="ml-auto h-[6px] w-[6px] rounded-full bg-[#3db870] shadow-[0_0_6px_#3db870]" style={{ animation: 'aurora-pulse 2.5s ease-in-out infinite' }} aria-hidden="true" />
          </span>
          <span className="block text-base font-black leading-tight md:text-lg">{t('assistantNeedHelp')}</span>
          <span className="block text-sm font-bold leading-snug text-white/55">{t('assistantAskAnything')}</span>
        </span>
      </button>
    );
  }

  if (isMinimized) {
    return (
      <button 
        onClick={() => setIsMinimized(false)}
        className="w-full bg-[#173e5f] hover:bg-[#214f76] text-white p-8 rounded-[2.5rem] shadow-xl transition-all transform hover:-translate-y-1 flex flex-col items-center justify-center border-4 border-white/20 dark:border-brand-indigo/50 min-h-[220px] focus:ring-4 focus:ring-blue-400 outline-none"
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
      className={`assistant-card overflow-hidden rounded-[22px] border border-white/10 text-white shadow-[0_16px_64px_rgba(10,26,14,.38)] flex flex-col animate-in slide-in-from-bottom-4 duration-300 ${variant === 'header' ? 'fixed right-6 top-24 z-[9998] h-[min(78dvh,560px)] w-[min(28rem,calc(100vw-3rem))]' : 'relative min-h-[420px] md:min-h-[500px]'}`}
      style={{
        background: 'linear-gradient(135deg, #0c1829 0%, #0f2318 60%, #1a3428 100%)',
        animation: 'assistant-glow 4s ease-in-out infinite alternate',
      }}
      aria-label={t('assistantChat')}
    >
      <div className="p-4 md:p-6 text-white flex items-center justify-between gap-3 border-b border-white/10">
        <div className="flex min-w-0 items-center gap-3 md:gap-4">
          <div className="w-9 h-9 md:w-10 md:h-10 bg-white/10 rounded-full flex items-center justify-center text-xl md:text-2xl" aria-hidden="true">✦</div>
          <div>
            <p className="text-[.65rem] font-black tracking-[.2em] uppercase text-[rgba(240,192,64,.75)]">AI-avustaja</p>
            <h2 className="text-lg md:text-xl font-black uppercase tracking-tight">{t('assistantTitle')}</h2>
          </div>
        </div>
        <button 
          onClick={() => setIsMinimized(true)}
          className="shrink-0 bg-black/20 hover:bg-black/40 px-3 py-2 md:px-4 rounded-full text-sm md:text-base font-bold transition-colors focus:ring-2 focus:ring-white"
        >
          {t('assistantClose')} ✕
        </button>
      </div>

      <div 
        ref={scrollRef}
        className="min-h-0 flex-1 p-4 md:p-6 overflow-y-auto space-y-3 md:space-y-4 bg-black/10 transition-colors duration-300"
        aria-live="polite"
      >
        {messages.length === 0 && (
          <div className="text-center py-10">
            <p className="text-xl font-bold text-white/60">{t('assistantGreeting')}</p>
          </div>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[88%] p-3 md:p-4 rounded-2xl text-base md:text-lg font-bold shadow-sm transition-colors duration-200 ${
              msg.role === 'user' 
                ? 'bg-[rgba(212,148,10,.15)] text-white rounded-br-none border border-[rgba(212,148,10,.2)]' 
                : 'bg-white/[.07] text-white/85 rounded-bl-none border border-white/10'
            }`}>
              {msg.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white/[.07] p-4 rounded-2xl flex gap-1 items-center border border-white/10" aria-label={t('assistantLoading')}>
              <span className="w-2 h-2 bg-[#3db870] rounded-full animate-bounce"></span>
              <span className="w-2 h-2 bg-[#3db870] rounded-full animate-bounce [animation-delay:0.2s]"></span>
              <span className="w-2 h-2 bg-[#3db870] rounded-full animate-bounce [animation-delay:0.4s]"></span>
            </div>
          </div>
        )}
      </div>

      <div className="p-3 md:p-4 bg-black/10 border-t border-white/10 flex gap-2">
        <input 
          type="text" 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder={speechState === 'listening' ? t('listeningPlaceholder') : t('assistantPlaceholder')}
          className="min-w-0 flex-1 rounded-xl border border-white/15 bg-white/[.08] px-3 py-2 text-base font-bold text-white/90 placeholder-white/35 outline-none transition-colors focus:border-[rgba(240,192,64,.5)] focus:shadow-[0_0_0_3px_rgba(240,192,64,.12)] md:px-4 md:py-3 md:text-lg"
          aria-label={t('assistantInput')}
        />
        {canListen && (
          <button
            type="button"
            onClick={toggleListening}
            className={`${speechState === 'listening' ? 'bg-red-500 text-white animate-pulse' : 'bg-slate-200 hover:bg-red-100 text-slate-900 dark:bg-slate-700 dark:text-white dark:hover:bg-red-900/40'} flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-xl font-black shadow-md transition-all active:scale-95 focus:outline-none focus:ring-4 focus:ring-red-300`}
            aria-label={speechState === 'listening' ? t('stopListening') : t('startListening')}
          >
            🎤
          </button>
        )}
        <button 
          onClick={handleSend}
          disabled={isLoading || !input.trim()}
          className="rounded-[10px] bg-[rgba(212,148,10,.9)] px-4 py-2 font-black text-[#0f2318] shadow-md transition-all hover:bg-[rgba(240,192,64,.95)] focus-visible:ring-4 focus-visible:ring-[#f0c040]/30 active:scale-95 disabled:opacity-50 md:px-6 md:py-3"
        >
          {t('assistantSend')}
        </button>
      </div>
    </section>
  );
};

export default Assistant;
