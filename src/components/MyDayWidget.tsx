import React, { useState } from "react";
import { Calendar, Clock, ListTodo, Quote, User, AlertTriangle, HelpCircle } from "lucide-react";
import { Lead, TimelineEntry } from "../types";

interface MyDayWidgetProps {
  currentUser: string | null;
  leads: Lead[];
  projectTimeline: TimelineEntry[];
  onLeadClick?: (lead: Lead) => void;
}

const BORIS_QUOTES = [
  "Порядок в проектах — порядок в голове. Загляни в таймлайн, сверь дедлайны!",
  "Даже самый сложный заказ начинается с первого замера. Ты справишься!",
  "Не забывай: каждый лид — это чья-то мечта об идеальной кухне. ✨",
  "Лучший способ съесть слона — резать его на фасады. Делай по одному шагу!",
  "Проверь материалы перед запуском — это сэкономит нервы и бюджет.",
  "Твой фокус сегодня = твой результат в конце недели. Держись плана!",
  "Если что-то пошло не так — просто позови меня. Я здесь, чтобы помочь.",
  "Даже Борис когда-то был новичком. Главное — задавать правильные вопросы!",
];

const getTimeBasedGreeting = (): string => {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return "Доброе утро";
  if (hour >= 12 && hour < 17) return "Добрый день";
  if (hour >= 17 && hour < 23) return "Добрый вечер";
  return "Доброй ночи";
};

const getDailyQuote = (): string => {
  const today = new Date();
  const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000);
  return BORIS_QUOTES[dayOfYear % BORIS_QUOTES.length];
};

const getOverdueLeadsText = (count: number): string => {
  const mod10 = count % 10;
  const mod100 = count % 100;
  if (mod100 >= 11 && mod100 <= 19) return `${count} просроченных лидов`;
  if (mod10 === 1) return `${count} просроченный лид`;
  if (mod10 >= 2 && mod10 <= 4) return `${count} просроченных лида`;
  return `${count} просроченных лидов`;
};

export default function MyDayWidget({ currentUser, leads, projectTimeline, onLeadClick }: MyDayWidgetProps) {
  if (!currentUser) return null;

  const [showQuote, setShowQuote] = useState(false);
  const greeting = getTimeBasedGreeting();
  const quote = getDailyQuote();

  const localDate = new Date();
  const year = localDate.getFullYear();
  const month = String(localDate.getMonth() + 1).padStart(2, "0");
  const day = String(localDate.getDate()).padStart(2, "0");
  const today = `${year}-${month}-${day}`;

  const myLeads = leads.filter((l) => l.assignee.name === currentUser);
  const myTimelines = projectTimeline.filter((t) => t.member === currentUser);
  const overdueLeads = myLeads.filter((l) => l.deadline < today);
  const activeTasks = myTimelines.filter((t) => t.status !== "done");
  const todayLeads = myLeads.filter((l) => l.deadline === today);

  return (
    <div className="mb-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 glass-panel rounded-2xl border border-white/10 p-6 bg-gradient-to-br from-indigo-500/5 to-purple-500/5">
          <div className="flex items-start justify-between mb-5">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/25">
                  <User size={20} className="text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">
                     {greeting}, <span className="text-indigo-300">{currentUser}</span>
                  </h2>
                  <p className="text-xs text-slate-400">
                    {new Date().toLocaleDateString("ru-RU", { weekday: "long", day: "numeric", month: "long" })}
                  </p>
                </div>
              </div>
            </div>
            <div className="relative">
              <button
                onClick={() => setShowQuote(!showQuote)}
                className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-amber-300 hover:border-amber-500/30 hover:bg-amber-500/10 transition-all"
                title="Совет дня"
              >
                <HelpCircle size={16} />
              </button>
              {showQuote && (
                <div className="absolute right-0 top-10 w-64 bg-slate-900 border border-amber-500/30 rounded-2xl p-4 shadow-2xl z-50 fade-in">
                  <div className="flex items-start gap-2">
                    <Quote size={14} className="text-amber-400 mt-0.5 shrink-0" />
                    <p className="text-[11px] text-amber-200/80 italic leading-relaxed">
                      "{quote}"
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="bg-black/30 border border-white/5 rounded-xl p-4">
              <div className="flex items-center gap-2 text-emerald-400 mb-2">
                <ListTodo size={16} />
                <span className="text-[10px] uppercase tracking-wider font-bold">Мои лиды</span>
              </div>
              <p className="text-3xl font-bold text-white">{myLeads.length}</p>
              <p className="text-[10px] text-slate-500 mt-1">всего в работе</p>
            </div>
            <div className="bg-black/30 border border-white/5 rounded-xl p-4">
              <div className="flex items-center gap-2 text-indigo-400 mb-2">
                <Calendar size={16} />
                <span className="text-[10px] uppercase tracking-wider font-bold">Активных задач</span>
              </div>
              <p className="text-3xl font-bold text-white">{activeTasks.length}</p>
              <p className="text-[10px] text-slate-500 mt-1">в таймлайне</p>
            </div>
            <div className="bg-black/30 border border-white/5 rounded-xl p-4">
              <div className="flex items-center gap-2 text-amber-400 mb-2">
                <Clock size={16} />
                <span className="text-[10px] uppercase tracking-wider font-bold">Дедлайнов</span>
              </div>
              <p className="text-3xl font-bold text-white">{todayLeads.length}</p>
              <p className="text-[10px] text-slate-500 mt-1">на сегодня</p>
            </div>
          </div>
        </div>

        <div className="glass-panel rounded-2xl border border-white/10 p-6 bg-gradient-to-br from-amber-500/5 to-orange-500/5">
          <h3 className="text-xs uppercase tracking-widest font-bold text-slate-400 mb-4 flex items-center gap-2">
            <AlertTriangle size={14} className="text-amber-400" />
            Фокус внимания
          </h3>

          {overdueLeads.length > 0 ? (
            <div className="space-y-3">
              <p className="text-sm font-semibold text-red-400">
                {getOverdueLeadsText(overdueLeads.length)}
              </p>
              {overdueLeads.slice(0, 3).map((lead) => (
                <button
                  key={lead.id}
                  onClick={() => onLeadClick?.(lead)}
                  className="w-full text-left bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2 hover:bg-red-500/20 transition-all"
                >
                  <p className="text-xs font-semibold text-white">{lead.name}</p>
                  <p className="text-[10px] text-red-300">{lead.type} · дедлайн {lead.deadline}</p>
                </button>
              ))}
            </div>
          ) : todayLeads.length > 0 ? (
            <div className="space-y-3">
              <p className="text-sm font-semibold text-amber-400">Дедлайны сегодня</p>
              {todayLeads.slice(0, 3).map((lead) => (
                <button
                  key={lead.id}
                  onClick={() => onLeadClick?.(lead)}
                  className="w-full text-left bg-amber-500/10 border border-amber-500/20 rounded-xl px-3 py-2 hover:bg-amber-500/20 transition-all"
                >
                  <p className="text-xs font-semibold text-white">{lead.name}</p>
                  <p className="text-[10px] text-amber-300">{lead.type} · {lead.budget}</p>
                </button>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center mb-3">
                <ListTodo size={18} className="text-emerald-400" />
              </div>
              <p className="text-sm text-emerald-300 font-semibold">Всё спокойно</p>
              <p className="text-[10px] text-slate-500 mt-1">Нет просрочек и дедлайнов на сегодня</p>
            </div>
          )}

          <div className="mt-4 pt-3 border-t border-white/5">
            <p className="text-[10px] text-slate-500 flex items-center gap-1">
              <Clock size={10} />
              Обновлено: {new Date().toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
