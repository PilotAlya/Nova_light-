import React, { useMemo, useState } from 'react';
import { TrendingUp, Users, DollarSign, Target, BarChart3, Eye, Download, ArrowUp, ArrowDown, Filter } from 'lucide-react';
import { Lead, TeamMember } from '../types';

interface SalesReportsProps {
  leads: Lead[];
  team: Record<string, TeamMember>;
}

const parseBudget = (s: string) => Number(s.replace(/[^\d]/g, '')) || 0;

const statusLabels: Record<string, string> = {
  new: 'Новые лиды', project: 'В проектировании', measure: 'Ожидают замер',
  production: 'В производстве', mounting: 'Монтаж',
};

const SalesReports: React.FC<SalesReportsProps> = ({ leads, team }) => {
  const [period, setPeriod] = useState<'all' | 'month' | 'quarter'>('all');
  const [managerFilter, setManagerFilter] = useState<string>('all');

  const filteredLeads = useMemo(() => {
    let items = leads;
    if (period === 'month') {
      const now = new Date();
      items = items.filter(l => {
        const d = new Date(l.deadline);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      });
    }
    if (period === 'quarter') {
      const now = new Date();
      const qStart = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
      items = items.filter(l => new Date(l.deadline) >= qStart);
    }
    if (managerFilter !== 'all') {
      items = items.filter(l => l.assignee.name === managerFilter);
    }
    return items;
  }, [leads, period, managerFilter]);

  const totalLeads = filteredLeads.length;
  const totalBudget = useMemo(() => filteredLeads.reduce((s, l) => s + parseBudget(l.budget), 0), [filteredLeads]);
  const avgCheck = totalLeads ? Math.round(totalBudget / totalLeads) : 0;

  const stageCounts = useMemo(() => {
    const counts: Record<string, number> = { new: 0, project: 0, measure: 0, production: 0, mounting: 0 };
    filteredLeads.forEach(l => { counts[l.status] = (counts[l.status] || 0) + 1; });
    return counts;
  }, [filteredLeads]);

  const conversionRate = totalLeads ? Math.round((stageCounts.mounting / totalLeads) * 100) : 0;

  const managerKPIs = useMemo(() => {
    const map: Record<string, { leads: number; budget: number; mounting: number; name: string }> = {};
    filteredLeads.forEach(l => {
      const key = l.assignee.name;
      if (!map[key]) map[key] = { leads: 0, budget: 0, mounting: 0, name: key };
      map[key].leads++;
      map[key].budget += parseBudget(l.budget);
      if (l.status === 'mounting') map[key].mounting++;
    });
    return Object.values(map).sort((a, b) => b.budget - a.budget);
  }, [filteredLeads]);

  const stageOrder = ['new', 'project', 'measure', 'production', 'mounting'];

  return (
    <div className="max-w-6xl mx-auto fade-in">
      <div className="flex items-start gap-4 border-b border-white/10 pb-6 mb-6 flex-wrap">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500/30 to-sky-500/30 flex items-center justify-center border border-emerald-500/30">
          <BarChart3 size={24} className="text-emerald-300" />
        </div>
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-white tracking-tight">Дашборд продаж</h2>
          <p className="text-sm text-slate-400">Аналитика по лидам, конверсия, KPI менеджеров и финансовые показатели</p>
        </div>
        <div className="flex gap-2 items-center">
          <Filter size={14} className="text-slate-500" />
          <select value={period} onChange={e => setPeriod(e.target.value as any)}
            className="bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500/50">
            <option value="all">За всё время</option>
            <option value="month">За текущий месяц</option>
            <option value="quarter">За квартал</option>
          </select>
          <select value={managerFilter} onChange={e => setManagerFilter(e.target.value)}
            className="bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500/50">
            <option value="all">Все менеджеры</option>
            {Object.values(team).filter(m => m.role === 'Менеджер' || m.role === 'Дизайнер').map(m => (
              <option key={m.name} value={m.name}>{m.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Overview cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <div className="glass-panel rounded-2xl border border-white/5 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Users size={14} className="text-sky-400" />
            <span className="text-xs text-slate-500 uppercase font-bold">Всего лидов</span>
          </div>
          <p className="text-2xl font-bold text-white">{totalLeads}</p>
          <p className="text-xs text-slate-500 mt-1">за выбранный период</p>
        </div>
        <div className="glass-panel rounded-2xl border border-white/5 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Target size={14} className="text-emerald-400" />
            <span className="text-xs text-slate-500 uppercase font-bold">Конверсия</span>
          </div>
          <p className="text-2xl font-bold text-emerald-400">{conversionRate}%</p>
          <p className="text-xs text-slate-500 mt-1">до монтажа</p>
        </div>
        <div className="glass-panel rounded-2xl border border-white/5 p-4">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign size={14} className="text-amber-400" />
            <span className="text-xs text-slate-500 uppercase font-bold">Средний чек</span>
          </div>
          <p className="text-2xl font-bold text-amber-400">{avgCheck.toLocaleString()} ₽</p>
        </div>
        <div className="glass-panel rounded-2xl border border-white/5 p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp size={14} className="text-purple-400" />
            <span className="text-xs text-slate-500 uppercase font-bold">Общий бюджет</span>
          </div>
          <p className="text-2xl font-bold text-purple-400">{totalBudget.toLocaleString()} ₽</p>
        </div>
      </div>

      {/* Conversion funnel */}
      <div className="glass-panel rounded-2xl border border-white/5 p-5 mb-8">
        <div className="flex items-center gap-2 mb-5">
          <Eye size={14} className="text-indigo-400" />
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">Воронка конверсии</h3>
        </div>
        <div className="space-y-2">
          {stageOrder.map((status, idx) => {
            const count = stageCounts[status];
            const pct = totalLeads ? Math.round((count / totalLeads) * 100) : 0;
            const drop = idx > 0 ? Math.round((count / (stageCounts[stageOrder[idx - 1]] || 1)) * 100) : 100;
            return (
              <div key={status} className="relative">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-bold text-white">{statusLabels[status]}</span>
                  <span className="text-slate-400">{count} ({pct}%)</span>
                </div>
                <div className="h-3 bg-black/40 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all" style={{
                    width: `${pct}%`,
                    background: idx === 0 ? 'linear-gradient(90deg, #38bdf8, #818cf8)' :
                      idx === 1 ? 'linear-gradient(90deg, #a78bfa, #c084fc)' :
                      idx === 2 ? 'linear-gradient(90deg, #fbbf24, #f59e0b)' :
                      idx === 3 ? 'linear-gradient(90deg, #34d399, #10b981)' :
                      'linear-gradient(90deg, #f472b6, #ec4899)'
                  }} />
                </div>
                {idx > 0 && (
                  <div className="flex items-center gap-1 mt-0.5">
                    {drop < 80 ? <ArrowDown size={10} className="text-rose-400" /> : <ArrowUp size={10} className="text-emerald-400" />}
                    <span className={`text-xs ${drop < 80 ? 'text-rose-400' : 'text-emerald-400'}`}>
                      {drop}% переход со предыдущего этапа
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Manager KPI table */}
      <div className="glass-panel rounded-2xl border border-white/5 overflow-hidden mb-8">
        <div className="flex items-center gap-2 p-5 pb-3">
          <Users size={14} className="text-sky-400" />
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">KPI Менеджеров</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-black/40 text-slate-500 uppercase tracking-wider">
                <th className="px-5 py-3 font-bold">Менеджер</th>
                <th className="px-5 py-3 font-bold">Лиды</th>
                <th className="px-5 py-3 font-bold">Бюджет</th>
                <th className="px-5 py-3 font-bold">Средний чек</th>
                <th className="px-5 py-3 font-bold">Доведено до монтажа</th>
                <th className="px-5 py-3 font-bold">Конверсия</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {managerKPIs.map((m, i) => {
                const conversion = m.leads ? Math.round((m.mounting / m.leads) * 100) : 0;
                const avg = m.leads ? Math.round(m.budget / m.leads) : 0;
                return (
                  <tr key={m.name} className={`${i % 2 === 0 ? 'bg-black/10' : 'bg-transparent'} hover:bg-white/5 transition-colors`}>
                    <td className="px-5 py-3 font-bold text-white">{m.name}</td>
                    <td className="px-5 py-3 text-slate-200">{m.leads}</td>
                    <td className="px-5 py-3 text-amber-300 font-bold">{m.budget.toLocaleString()} ₽</td>
                    <td className="px-5 py-3 text-slate-200">{avg.toLocaleString()} ₽</td>
                    <td className="px-5 py-3 text-emerald-400">{m.mounting}</td>
                    <td className="px-5 py-3">
                      <span className={`font-bold ${conversion > 30 ? 'text-emerald-400' : conversion > 15 ? 'text-amber-400' : 'text-rose-400'}`}>
                        {conversion}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SalesReports;
