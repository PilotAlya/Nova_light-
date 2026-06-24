import React, { useState, useEffect, useRef } from 'react';
import { TrendingUp, ChevronDown, ChevronRight, DollarSign, Users, Factory, BarChart3, TrendingDown } from 'lucide-react';
import { Lead } from '../types';

interface AnalyticsProps {
  leads: Lead[];
  onLeadClick?: (lead: Lead) => void;
}

const Analytics: React.FC<AnalyticsProps> = ({ leads, onLeadClick }) => {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const projectCount = leads.filter((l) => l.status === "project").length;
  const measureCount = leads.filter((l) => l.status === "measure").length;
  const productionCount = leads.filter((l) => l.status === "production").length;
  const totalLeads = leads.length;

  const budgets = leads
    .map((l) => parseInt(l.budget.replace(/\D/g, "")))
    .filter((v) => !isNaN(v) && v > 0);
  const avgCheck = budgets.length > 0
    ? Math.round(budgets.reduce((a, b) => a + b, 0) / budgets.length)
    : 0;
  const totalRevenue = budgets.reduce((a, b) => a + b, 0);

  const revenueLeads = leads.filter(l => {
    const b = parseInt(l.budget.replace(/\D/g, ""));
    return !isNaN(b) && b > 0;
  });

  const avgCheckLeads = revenueLeads;

  const productionLeads = leads.filter(l => l.status === "production");

  const funnel = [
    { stage: "Новые лиды", count: totalLeads, pct: 100, color: "bg-sky-400" },
    { stage: "В проектировании", count: projectCount, pct: totalLeads ? Math.round(projectCount / totalLeads * 100) : 0, color: "bg-purple-400" },
    { stage: "Ожидают замер", count: measureCount, pct: totalLeads ? Math.round(measureCount / totalLeads * 100) : 0, color: "bg-yellow-400" },
    { stage: "На производстве", count: productionCount, pct: totalLeads ? Math.round(productionCount / totalLeads * 100) : 0, color: "bg-emerald-400" },
  ];

  const toggleSection = (section: string) => {
    setExpandedSection(prev => prev === section ? null : section);
  };

  const renderDrillDown = (sectionKey: string, icon: React.ReactNode, title: string, count: number, items: { id: string; name: string; value: string; lead?: Lead }[]) => (
    <div className="glass-panel rounded-2xl border border-white/5 overflow-hidden">
      <button
        onClick={() => toggleSection(sectionKey)}
        className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-all"
      >
        <div className="flex items-center gap-3">
          {icon}
          <div className="text-left">
            <p className="text-sm font-bold text-white">{title}</p>
            <p className="text-[10px] text-slate-400">{count} позиций</p>
          </div>
        </div>
        {expandedSection === sectionKey ? <ChevronDown size={16} className="text-slate-400" /> : <ChevronRight size={16} className="text-slate-400" />}
      </button>
      {expandedSection === sectionKey && (
        <div className="px-4 pb-4 space-y-1.5 max-h-48 overflow-y-auto chat-scroll">
          {items.map((item) => (
            <button
              key={item.id}
              onClick={() => item.lead && onLeadClick?.(item.lead)}
              className="w-full flex items-center justify-between bg-black/20 hover:bg-black/40 rounded-xl px-3 py-2 transition-all text-left"
            >
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded">{item.id}</span>
                <span className="text-xs text-slate-300">{item.name}</span>
              </div>
              <span className="text-xs font-bold text-slate-200">{item.value}</span>
            </button>
          ))}
          {items.length === 0 && (
            <p className="text-xs text-slate-500 text-center py-4">Нет данных</p>
          )}
        </div>
      )}
    </div>
  );

  const leadToItem = (l: Lead, value: string) => ({ id: l.id, name: l.name, value, lead: l });

  return (
    <div className="max-w-5xl mx-auto fade-in">
      <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">Аналитика и Воронка</h2>
      <p className="text-slate-400 mb-8">Показатели конверсии и эффективности производства.</p>

      <div className="grid grid-cols-3 gap-6 mb-8">
        <div className="glass-panel p-6 rounded-3xl border border-white/5 bg-white/5">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Выручка</p>
          <h3 className="text-3xl font-black text-white mb-3 tracking-tighter">{totalRevenue.toLocaleString()} ₽</h3>
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-400 uppercase tracking-tight">
            <TrendingUp size={14} /> {totalLeads} лидов
          </div>
        </div>

        <div className="glass-panel p-6 rounded-3xl border border-white/5 bg-white/5 flex flex-col justify-center">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Средний чек</p>
          <h3 className="text-3xl font-black text-white tracking-tighter">{avgCheck.toLocaleString()} ₽</h3>
        </div>

        <div className="glass-panel p-6 rounded-3xl border border-white/5 bg-white/5 flex flex-col justify-center">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">В производстве</p>
          <h3 className="text-3xl font-black text-white tracking-tighter">{productionCount} проектов</h3>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 mb-8">
        {renderDrillDown(
          "revenue",
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center"><DollarSign size={16} className="text-emerald-400" /></div>,
          "Какие лиды принесли выручку",
          revenueLeads.length,
          revenueLeads.map(l => leadToItem(l, l.budget))
        )}
        {renderDrillDown(
          "avgcheck",
          <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center"><Users size={16} className="text-purple-400" /></div>,
          "Составляющие среднего чека",
          avgCheckLeads.length,
          avgCheckLeads.map(l => leadToItem(l, `${l.budget} (${l.type})`))
        )}
        {renderDrillDown(
          "production",
          <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center"><Factory size={16} className="text-amber-400" /></div>,
          "Проекты в производстве",
          productionLeads.length,
          productionLeads.map(l => leadToItem(l, `${l.type} · ${l.budget}`))
        )}
      </div>

      <div className="glass-panel p-8 rounded-2xl">
        <div className="space-y-6">
          {funnel.map((step) => (
            <div key={step.stage}>
              <div className="flex justify-between text-sm mb-2">
                <span className="font-medium text-slate-200">{step.stage}</span>
                <span className="text-slate-400">{step.count} шт. ({step.pct}%)</span>
              </div>
              <div className="h-3 bg-black/40 rounded-full overflow-hidden border border-white/5">
                <div className={`h-full ${step.color} rounded-full`} style={{ width: `${step.pct}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <MarketMonitoring />
    </div>
  );
};

const competitors = [
  { name: "Кухни-Стандарт", price: 145000, delta: -2.5, share: 32 },
  { name: "Мебель-Сити", price: 162000, delta: 1.8, share: 28 },
  { name: "Эко-Кухня", price: 138000, delta: -0.7, share: 20 },
  { name: "Премиум Кухни", price: 210000, delta: 3.2, share: 15 },
  { name: "Гардероб-Профи", price: 118000, delta: 0.0, share: 5 },
];

const materials = [
  { name: "ЛДСП 16мм (лист)", price: 2450, delta: 3.1 },
  { name: "МДФ 19мм (лист)", price: 4200, delta: 1.2 },
  { name: "Кромка ПВХ 2мм (м)", price: 85, delta: 0.0 },
  { name: "Петля мебельная (шт)", price: 180, delta: -1.5 },
  { name: "Направляющая шариковая (пара)", price: 550, delta: 4.8 },
];

const MarketMonitoring = () => {
  return (
    <div className="mt-8 fade-in">
      <div className="flex items-center gap-3 border-b border-white/10 pb-4 mb-6">
        <div className="w-10 h-10 rounded-xl bg-rose-500/20 flex items-center justify-center">
          <BarChart3 className="text-rose-400" size={22} />
        </div>
        <div>
          <h3 className="text-xl font-bold text-white">Мониторинг рынка</h3>
          <p className="text-xs text-slate-400">Цены конкурентов и биржевые котировки материалов — Пермь, {new Date().toLocaleDateString("ru-RU")}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-black/30 border border-rose-500/10 rounded-2xl p-5">
          <h4 className="text-xs font-bold text-rose-300 uppercase tracking-widest mb-4 flex items-center gap-2">
            <TrendingUp size={14} /> Конкуренты — средний чек (кухни)
          </h4>
          <div className="space-y-3">
            {competitors.map((c) => (
              <div key={c.name} className="flex items-center justify-between bg-white/5 rounded-xl px-3 py-2.5">
                <div>
                  <div className="text-xs font-bold text-white">{c.name}</div>
                  <div className="text-[9px] text-slate-500">Доля рынка: {c.share}%</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-white">{c.price.toLocaleString()} ₽</div>
                  <div className={`text-[10px] font-bold flex items-center gap-1 justify-end ${c.delta < 0 ? "text-emerald-400" : c.delta > 0 ? "text-rose-400" : "text-slate-400"}`}>
                    {c.delta < 0 ? <TrendingDown size={12} /> : c.delta > 0 ? <TrendingUp size={12} /> : null}
                    {c.delta > 0 ? "+" : ""}{c.delta}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-black/30 border border-amber-500/10 rounded-2xl p-5">
          <h4 className="text-xs font-bold text-amber-300 uppercase tracking-widest mb-4 flex items-center gap-2">
            <BarChart3 size={14} /> Биржевые цены материалов
          </h4>
          <div className="space-y-3">
            {materials.map((m) => (
              <div key={m.name} className="flex items-center justify-between bg-white/5 rounded-xl px-3 py-2.5">
                <div className="text-xs text-slate-300">{m.name}</div>
                <div className="text-right">
                  <div className="text-sm font-bold text-white">{m.price.toLocaleString()} ₽</div>
                  <div className={`text-[10px] font-bold ${m.delta < 0 ? "text-emerald-400" : m.delta > 0 ? "text-rose-400" : "text-slate-400"}`}>
                    {m.delta > 0 ? "+" : ""}{m.delta}% к прошлому месяцу
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
