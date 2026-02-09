
import React, { useState, useEffect } from 'react';
import { MOCK_NEWS } from '../constants';
import { summarizeNews } from '../services/geminiService';

const NewsFeed: React.FC = () => {
  const [summary, setSummary] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      setLoading(true);
      try {
        const text = await summarizeNews(MOCK_NEWS);
        setSummary(text || '');
      } catch (e) {
        setSummary('Uutistiivistelmää ei voitu ladata.');
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, []);

  return (
    <section className="bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-xl p-8 border-4 border-slate-100 dark:border-slate-700 h-full overflow-hidden flex flex-col" aria-labelledby="news-heading">
      <div className="flex items-center justify-between mb-6">
        <h2 id="news-heading" className="text-3xl font-black text-slate-800 dark:text-white flex items-center gap-3">
          <span>📰</span> Uutiset
        </h2>
        <span className="bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider">Päivitetty</span>
      </div>

      <div className="flex-1 overflow-y-auto space-y-6">
        {loading ? (
          <div className="space-y-4" aria-hidden="true">
            <div className="h-6 bg-slate-100 dark:bg-slate-700 rounded w-3/4 animate-pulse"></div>
            <div className="h-6 bg-slate-100 dark:bg-slate-700 rounded w-full animate-pulse"></div>
            <div className="h-6 bg-slate-100 dark:bg-slate-700 rounded w-2/3 animate-pulse"></div>
          </div>
        ) : (
          <div className="bg-blue-50 dark:bg-blue-900/20 border-l-8 border-blue-500 p-6 rounded-r-2xl text-xl text-slate-700 dark:text-slate-200 leading-relaxed italic font-medium">
            "{summary}"
          </div>
        )}

        <div className="space-y-4 mt-4">
          {MOCK_NEWS.map(news => (
            <div key={news.id} className="p-4 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors border border-transparent hover:border-slate-100 dark:hover:border-slate-600">
              <div className="flex justify-between items-start mb-1">
                <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">{news.category}</span>
                <span className="text-xs text-slate-400">{news.time}</span>
              </div>
              <h4 className="text-2xl font-black text-slate-800 dark:text-white leading-tight">{news.title}</h4>
              <p className="text-slate-600 dark:text-slate-400 mt-2 text-lg line-clamp-3">{news.summary}</p>
            </div>
          ))}
        </div>
      </div>
      
      <a 
        href="https://yle.fi/uutiset" 
        target="_blank" 
        rel="noopener noreferrer"
        className="w-full mt-6 py-4 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-white rounded-2xl font-black text-xl transition-all text-center"
      >
        Lue lisää uutisia Yleltä
      </a>
    </section>
  );
};

export default NewsFeed;
