
import React, { useState, useEffect } from 'react';
import { MOCK_NEWS } from '../constants';
import { summarizeNews } from '../services/geminiService';

const NewsFeed: React.FC = () => {
  const [summary, setSummary] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      setLoading(true);
      const text = await summarizeNews(MOCK_NEWS);
      setSummary(text || '');
      setLoading(false);
    };
    fetchSummary();
  }, []);

  return (
    <div className="bg-white rounded-3xl shadow-xl p-8 border border-slate-200 h-full overflow-hidden flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
          <span>📰</span> Päivän Uutiset
        </h2>
        <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-semibold">Tekoälyn tiivistelmä</span>
      </div>

      <div className="flex-1 overflow-y-auto space-y-6">
        {loading ? (
          <div className="space-y-4">
            <div className="h-6 bg-slate-100 rounded w-3/4 animate-pulse"></div>
            <div className="h-6 bg-slate-100 rounded w-full animate-pulse"></div>
            <div className="h-6 bg-slate-100 rounded w-2/3 animate-pulse"></div>
          </div>
        ) : (
          <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-r-2xl text-xl text-slate-700 leading-relaxed italic">
            "{summary}"
          </div>
        )}

        <div className="space-y-4 mt-8">
          <h3 className="text-xl font-semibold text-slate-600 border-b pb-2">Tuoreimmat otsikot</h3>
          {MOCK_NEWS.map(news => (
            <div key={news.id} className="group cursor-pointer p-4 rounded-2xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
              <div className="flex justify-between items-start mb-1">
                <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">{news.category}</span>
                <span className="text-xs text-slate-400">{news.time}</span>
              </div>
              <h4 className="text-2xl font-bold text-slate-800 group-hover:text-blue-600 transition-colors">{news.title}</h4>
              <p className="text-slate-600 mt-2 line-clamp-2 text-lg">{news.summary}</p>
            </div>
          ))}
        </div>
      </div>
      
      <button className="w-full mt-6 py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl font-bold text-xl transition-colors">
        Lue lisää uutisia
      </button>
    </div>
  );
};

export default NewsFeed;
