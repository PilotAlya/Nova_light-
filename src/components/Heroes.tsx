import React, { useState } from 'react';
import { Zap, Shield, Star, Trophy, MessageCircle, Sparkles, Send, X, Phone, Mail } from 'lucide-react';
import { TeamMember } from '../types';

interface HeroesProps {
  team: Record<string, TeamMember>;
}

const Heroes: React.FC<HeroesProps> = ({ team }) => {
  const [selectedContact, setSelectedContact] = useState<TeamMember | null>(null);
  const [message, setMessage] = useState("");

  const heroesData: Record<string, Partial<TeamMember>> = {
    admin: {
      superpower: "Архитектор Экосистемы",
      achievements: ["Стратегия и видение", "Контроль качества"],
    },
    sergey: {
      superpower: "Мастер точного замера",
      achievements: ["Лазерная точность", "Выезд за 24 часа"],
    },
    elena: {
      superpower: "Душа салона",
      achievements: ["Лид продаж", "Образцы ЛДСП"],
    },
    dmitry: {
      superpower: "Стальной характер",
      achievements: ["Точность до мм", "Наставник цеха"],
    },
    andrey: {
      superpower: "Хранитель склада",
      achievements: ["Всё на учёте", "Расходники под рукой"],
    },
  };

  const getIconForSuperpower = (superpower?: string) => {
    if (superpower?.includes("Хранитель")) return <Shield className="text-amber-400" size={20} />;
    if (superpower?.includes("Архитектор")) return <Zap className="text-indigo-400" size={20} />;
    if (superpower?.includes("Мастер")) return <MessageCircle className="text-emerald-400" size={20} />;
    if (superpower?.includes("Визуализатор")) return <Sparkles className="text-purple-400" size={20} />;
    if (superpower?.includes("Железный")) return <Trophy className="text-orange-400" size={20} />;
    if (superpower?.includes("Командный")) return <Star className="text-sky-400" size={20} />;
    if (superpower?.includes("Герой Рэлана")) return <Zap className="text-indigo-400" size={20} />;
    return <Star className="text-sky-400" size={20} />;
  };

  return (
    <div className="max-w-6xl mx-auto py-8 fade-in relative">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-black text-white mb-4 tracking-tighter uppercase italic">
          Наши Герои
        </h2>
        <p className="text-slate-400 max-w-2xl mx-auto">
          Команда — это не просто сотрудники, а настоящие супергерои, каждый из которых обладает уникальным даром для создания совершенства.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 px-4 mb-20">
        {Object.entries(team).map(([key, member]) => {
          const hero = heroesData[key] || {};
          const superpower = hero.superpower || "Герой Рэлана";
          const achievements = hero.achievements || ["Командный игрок"];

          return (
            <div 
              key={key} 
              className="group relative h-[480px] rounded-3xl overflow-hidden transition-all duration-500 hover:scale-[1.02] hover:-translate-y-2"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent backdrop-blur-xl border border-white/10 group-hover:border-indigo-500/30 transition-all" />
              <div className="absolute -inset-0.5 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-3xl opacity-0 group-hover:opacity-20 blur-xl transition-all duration-500" />

              <div className="relative h-56 flex items-center justify-center pt-8">
                <div className="relative w-36 h-36">
                  <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-full animate-pulse blur-md opacity-40 group-hover:opacity-60" />
                  <img 
                    src={member.avatar} 
                    alt={member.name} 
                    className="relative w-full h-full rounded-full border-2 border-white/20 object-cover z-10 p-1 bg-black/40 shadow-2xl"
                  />
                  <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-black/80 rounded-2xl border border-white/10 flex items-center justify-center z-20 shadow-xl group-hover:scale-110 transition-transform">
                    {getIconForSuperpower(superpower)}
                  </div>
                </div>
              </div>

              <div className="relative z-10 px-6 pt-4 text-center">
                <h3 className="text-xl font-bold text-white mb-1 group-hover:text-indigo-300 transition-colors">
                  {member.name}
                </h3>
                <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold mb-4">
                  {member.role}
                </p>

                <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl mb-5">
                  <Star size={14} className="text-indigo-400" />
                  <span className="text-xs font-bold text-indigo-300 italic">{superpower}</span>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-5">
                  {achievements.map((achievement, i) => (
                    <div 
                      key={i} 
                      className="flex items-center justify-center px-3 py-2.5 bg-black/30 border border-white/5 rounded-xl group-hover:border-indigo-500/20 transition-all"
                    >
                      <span className="text-[11px] text-slate-300 font-medium text-center leading-tight">{achievement}</span>
                    </div>
                  ))}
                </div>

                <button 
                  onClick={() => setSelectedContact(member)}
                  className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-xs font-bold uppercase tracking-widest text-indigo-300 transition-all flex items-center justify-center gap-2 group/btn"
                >
                  <MessageCircle size={14} className="group-hover/btn:scale-110 transition-transform" />
                  Связаться с героем
                </button>
              </div>

              <div className="absolute bottom-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-30 group-hover:opacity-100 transition-opacity duration-700" />
            </div>
          );
        })}
      </div>

      {/* Contact Modal */}
      {selectedContact && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setSelectedContact(null)} />
          
          <div className="relative w-full max-w-md bg-slate-900/90 rounded-3xl border border-white/10 shadow-2xl overflow-hidden animate-scale-in">
            {/* Header */}
            <div className="p-6 border-b border-white/10 bg-black/20 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <img src={selectedContact.avatar} className="w-12 h-12 rounded-full border border-white/10" alt="" />
                <div>
                  <h4 className="font-bold text-white leading-tight">{selectedContact.name}</h4>
                  <p className="text-xs text-slate-500 uppercase tracking-widest font-bold">Личный канал связи</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedContact(null)}
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
              >
                <X size={18} className="text-slate-400" />
              </button>
            </div>

            {/* Chat Content */}
            <div className="h-80 p-6 overflow-y-auto chat-scroll flex flex-col gap-4">
              <div className="self-start max-w-[85%] bg-white/5 p-4 rounded-2xl rounded-tl-none border border-white/5">
                <p className="text-sm text-slate-300">
                  Привет! Это {selectedContact.name.split(' ')[0]}. Чем я могу тебе помочь сегодня?
                </p>
              </div>
              <div className="self-end max-w-[85%] bg-indigo-600 p-4 rounded-2xl rounded-tr-none text-white text-sm shadow-lg">
                Здравствуйте! У меня есть вопрос по текущему проекту...
              </div>
              <div className="text-center">
                <span className="text-[10px] text-slate-600 uppercase font-bold tracking-widest">Сегодня, 12:45</span>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="px-6 flex gap-2">
              <button className="flex-1 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-[10px] font-bold text-indigo-300 uppercase hover:bg-indigo-500/20 transition-all flex items-center justify-center gap-2">
                <Phone size={12} /> Звонок
              </button>
              <button className="flex-1 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-[10px] font-bold text-emerald-300 uppercase hover:bg-emerald-500/20 transition-all flex items-center justify-center gap-2">
                <Mail size={12} /> Email
              </button>
            </div>

            {/* Input */}
            <div className="p-6">
              <form 
                className="relative flex items-center"
                onSubmit={(e) => {
                  e.preventDefault();
                  setMessage("");
                }}
              >
                <input 
                  type="text" 
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Введите сообщение..."
                  className="w-full bg-black/40 border border-white/10 rounded-2xl py-3 pl-4 pr-12 text-sm text-white focus:outline-none focus:border-indigo-500/50"
                />
                <button className="absolute right-2 w-8 h-8 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg hover:bg-indigo-500 transition-colors">
                  <Send size={14} />
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Heroes;
