import React from 'react';
import { DollarSign, TrendingUp, Target, CreditCard } from 'lucide-react';
import type { Lead } from '../types';

interface FinanceProps { leads: Lead[] }

function parseBudget(b: string): number {
  const n = parseFloat(b.replace(/[^\d,]/g,'').replace(',','.'));
  return isNaN(n) ? 0 : n;
}

export default function Finance({ leads }: FinanceProps) {
  const total = leads.reduce((s,l) => s + parseBudget(l.budget), 0);
  const projects = leads.filter(l => l.status==='project');
  const production = leads.filter(l => l.status==='production');
  const mounting = leads.filter(l => l.status==='mounting');
  const inWork = total - [...projects,...production,...mounting].reduce((s,l) => s + parseBudget(l.budget), 0);
  const paid = leads.filter(l => l.status==='mounting').reduce((s,l) => s + parseBudget(l.budget), 0);
  
  return (<div className="p-6 fade-in">
    <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2"><DollarSign size={20} className="text-indigo-400" /> Финансы</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
        <div className="flex items-center gap-3 mb-3"><TrendingUp size={18} className="text-emerald-400" /><span className="text-xs text-slate-500 uppercase font-bold">Общий портфель</span></div>
        <p className="text-2xl font-bold text-white">{total.toLocaleString()} ₽</p>
      </div>
      <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
        <div className="flex items-center gap-3 mb-3"><Target size={18} className="text-blue-400" /><span className="text-xs text-slate-500 uppercase font-bold">В работе</span></div>
        <p className="text-2xl font-bold text-white">{inWork.toLocaleString()} ₽</p>
      </div>
      <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
        <div className="flex items-center gap-3 mb-3"><CreditCard size={18} className="text-purple-400" /><span className="text-xs text-slate-500 uppercase font-bold">Оплачено</span></div>
        <p className="text-2xl font-bold text-emerald-400">{paid.toLocaleString()} ₽</p>
      </div>
      <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
        <div className="flex items-center gap-3 mb-3"><DollarSign size={18} className="text-amber-400" /><span className="text-xs text-slate-500 uppercase font-bold">Проектов</span></div>
        <p className="text-2xl font-bold text-white">{leads.length}</p>
      </div>
    </div>
    <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
      <table className="w-full">
        <thead><tr className="border-b border-white/10"><th className="text-left p-4 text-xs text-slate-500 uppercase font-bold">Клиент</th><th className="text-left p-4 text-xs text-slate-500 uppercase font-bold">Бюджет</th><th className="text-left p-4 text-xs text-slate-500 uppercase font-bold">Статус</th><th className="text-left p-4 text-xs text-slate-500 uppercase font-bold">Дедлайн</th></tr></thead>
        <tbody>{leads.map(l => (<tr key={l.id} className="border-b border-white/5 hover:bg-white/5">
          <td className="p-4 text-sm text-white">{l.name}</td>
          <td className="p-4 text-sm text-white">{l.budget}</td>
          <td className="p-4"><span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${l.status==='new'?'bg-blue-500/20 text-blue-300':l.status==='project'?'bg-purple-500/20 text-purple-300':l.status==='measure'?'bg-amber-500/20 text-amber-300':l.status==='production'?'bg-emerald-500/20 text-emerald-300':'bg-slate-500/20 text-slate-300'}`}>{l.status}</span></td>
          <td className="p-4 text-sm text-slate-400">{l.deadline}</td>
        </tr>))}</tbody>
      </table>
    </div>
  </div>);
}