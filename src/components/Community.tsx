import React, { useState } from 'react';
import { ShieldAlert, Lightbulb, MessageSquare, TrendingUp, Send, CheckCircle, Plus, ThumbsUp } from 'lucide-react';
import { TeamMember, Idea } from '../types';
import Heroes from './Heroes';

interface CommunityProps {
  team: Record<string, TeamMember>;
  ideas: Idea[];
  setIdeas: React.Dispatch<React.SetStateAction<Idea[]>>;
}

const Community: React.FC<CommunityProps> = ({ team, ideas, setIdeas }) => {
  const [activeSection, setActiveSection] = useState<'heroes' | 'feedback' | 'wishlist'>('heroes');
  const [anonymousFeedback, setAnonymousFeedback] = useState("");
  const [newIdea, setNewIdea] = useState("");
  const [hasVoted, setHasVoted] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSendFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    if (!anonymousFeedback.trim()) return;
    setShowSuccess(true);
    setAnonymousFeedback("");
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleAddIdea = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIdea.trim()) return;
    const idea: Idea = {
      id: `ID-${Date.now()}`,
      text: newIdea,
      votes: 0,
    };
    setIdeas([idea, ...ideas]);
    setNewIdea("");
  };

  const handleVote = (id: string) => {
    if (hasVoted) return;
    setIdeas(ideas.map(i => i.id === id ? { ...i, votes: i.votes + 1 } : i));
    setHasVoted(true);
  };

  const sortedIdeas = [...ideas].sort((a, b) => b.votes - a.votes);

  return (
    <div className="max-w-6xl mx-auto flex flex-col fade-in">
      <div className="flex justify-center mb-8">
        <div className="bg-black/40 backdrop-blur-xl border border-white/10 p-1.5 rounded-2xl flex gap-1">
          {[
            { id: 'heroes', label: 'Герои', icon: <TrendingUp size={16} /> },
            { id: 'feedback', label: 'Обратная связь', icon: <MessageSquare size={16} /> },
            { id: 'wishlist', label: 'Анонимный ящик идей', icon: <Lightbulb size={16} /> },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveSection(tab.id as any)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all uppercase tracking-widest ${
                activeSection === tab.id 
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20" 
                : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 min-h-[600px]">
        {activeSection === 'heroes' && <Heroes team={team} />}

        {activeSection === 'feedback' && (
          <div className="max-w-2xl mx-auto py-12 fade-in">
            <div className="text-center mb-10">
              <div className="w-20 h-20 bg-red-500/10 border border-red-500/20 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <ShieldAlert size={32} className="text-red-400" />
              </div>
              <h2 className="text-3xl font-black text-white mb-3 uppercase italic">Обратная связь</h2>
              <p className="text-slate-400">
                Твой голос важен. Здесь ты можешь оставить жалобу или предложение руководителю совершенно анонимно. Мы снижаем социальные барьеры для общего роста.
              </p>
            </div>

            <div className="glass-panel p-8 rounded-3xl border border-white/5 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-5">
                <MessageSquare size={120} />
              </div>
              
              <form onSubmit={handleSendFeedback} className="relative z-10">
                <div className="mb-6">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Сообщение</label>
                  <textarea 
                    value={anonymousFeedback}
                    onChange={(e) => setAnonymousFeedback(e.target.value)}
                    placeholder="Опишите ситуацию или предложите улучшение..."
                    className="w-full h-48 bg-black/40 border border-white/10 rounded-2xl p-5 text-white text-sm focus:outline-none focus:border-red-500/50 transition-all resize-none"
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[10px] text-slate-500 font-bold uppercase tracking-tighter">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Анонимность гарантирована
                  </div>
                  <button 
                    type="submit"
                    disabled={!anonymousFeedback.trim()}
                    className="bg-red-600 hover:bg-red-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-bold px-8 py-3 rounded-2xl text-xs uppercase tracking-widest transition-all shadow-xl shadow-red-600/10 flex items-center gap-2"
                  >
                    <Send size={14} /> Отправить анонимно
                  </button>
                </div>
              </form>

              {showSuccess && (
                <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-md flex flex-col items-center justify-center text-center p-8 animate-fade-in z-20">
                  <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mb-4 border border-emerald-500/30">
                    <CheckCircle size={32} className="text-emerald-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Отправлено!</h3>
                  <p className="text-sm text-slate-400">Ваше сообщение передано руководству. Спасибо за честность!</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeSection === 'wishlist' && (
          <div className="max-w-4xl mx-auto py-8 fade-in">
            <div className="flex items-end justify-between mb-10">
              <div>
                <h2 className="text-3xl font-black text-white mb-2 uppercase italic tracking-tighter">Анонимный ящик идей</h2>
                <p className="text-slate-400">Предложения по улучшению офиса, цеха или рабочих процессов. Анонимно — никто не узнает автора.</p>
              </div>
              <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-widest">
                <div className="flex items-center gap-2 text-indigo-400">
                  <TrendingUp size={16} /> По голосам
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
              <div className="glass-panel p-8 rounded-3xl border-2 border-dashed border-white/5 flex flex-col items-center justify-center text-center group hover:border-indigo-500/20 transition-all">
                <div className="w-14 h-14 bg-indigo-500/10 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Plus size={24} className="text-indigo-400" />
                </div>
                <h3 className="font-bold text-white mb-2">Есть новая идея?</h3>
                <p className="text-[10px] text-slate-500 mb-4 uppercase tracking-widest">Никто не узнает, что это ты</p>
                <form onSubmit={handleAddIdea} className="w-full">
                  <input 
                    type="text" 
                    value={newIdea}
                    onChange={(e) => setNewIdea(e.target.value)}
                    placeholder="Например: кофемашина в цех..."
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white mb-4 focus:outline-none focus:border-indigo-500/50"
                  />
                  <button 
                    type="submit"
                    className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl text-[10px] uppercase tracking-widest transition-all"
                  >
                    Добавить анонимно
                  </button>
                </form>
              </div>

              <div className="space-y-4 max-h-[500px] overflow-y-auto chat-scroll pr-2">
                {sortedIdeas.length === 0 && (
                  <div className="text-center text-slate-600 py-16 text-sm">Пока нет идей. Будь первым!</div>
                )}
                {sortedIdeas.map((idea) => (
                  <div key={idea.id} className="glass-panel p-5 rounded-2xl border border-white/5 flex items-center justify-between group hover:bg-white/5 transition-all">
                    <div className="flex items-start gap-4 flex-1 min-w-0">
                      <div className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center shrink-0 border border-amber-500/20">
                        <Lightbulb size={18} className="text-amber-400" />
                      </div>
                      <p className="text-sm text-slate-300 pr-4">{idea.text}</p>
                    </div>
                    <button 
                      onClick={() => handleVote(idea.id)}
                      disabled={hasVoted}
                      className={`flex flex-col items-center justify-center border rounded-xl w-14 h-14 transition-all shrink-0 ${
                        hasVoted
                          ? "opacity-40 cursor-not-allowed"
                          : "hover:border-indigo-500/50 hover:bg-indigo-500/10 cursor-pointer"
                      } ${idea.votes > 0 ? "bg-indigo-500/20 border-indigo-500/50" : "bg-black/40 border-white/10"}`}
                      title={hasVoted ? "Вы уже отдали свой голос" : "Голосовать"}
                    >
                      <ThumbsUp size={16} className={`mb-1 ${idea.votes > 0 ? "text-indigo-400" : "text-slate-500"}`} />
                      <span className={`text-xs font-bold ${idea.votes > 0 ? "text-white" : "text-slate-400"}`}>
                        {idea.votes}
                      </span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Community;