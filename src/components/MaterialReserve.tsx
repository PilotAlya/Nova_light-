import React from 'react';
import { Package, Grid, Layers } from 'lucide-react';
import type { Lead } from '../types';

interface MaterialReserveProps { leads: Lead[] }

export default function MaterialReserve({ leads }: MaterialReserveProps) {
  const materialCount: Record<string, { count: number; total: number }> = {};
  leads.forEach(l => {
    const mat = l.material || 'Не указан';
    if (!materialCount[mat]) materialCount[mat] = { count: 0, total: 0 };
    materialCount[mat].count++;
    const budget = parseFloat(l.budget.replace(/[^\d,]/g,'').replace(',','.'));
    materialCount[mat].total += isNaN(budget) ? 0 : budget;
  });
  return (<div className="p-6 fade-in">
    <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2"><Package size={20} className="text-indigo-400" /> Резерв материалов</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Object.entries(materialCount).sort((a,b) => b[1].count - a[1].count).map(([mat, data]) => (<div key={mat} className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:border-white/20 transition-all">
        <div className="flex items-center gap-3 mb-3"><Layers size={18} className="text-indigo-400" /><span className="text-white font-bold text-sm">{mat}</span></div>
        <div className="flex items-center justify-between">
          <div><p className="text-2xl font-bold text-white">{data.count}</p><p className="text-[10px] text-slate-500 uppercase">Проектов</p></div>
          <div className="text-right"><p className="text-lg font-bold text-emerald-400">{data.total.toLocaleString()} ₽</p><p className="text-[10px] text-slate-500 uppercase">Общая сумма</p></div>
        </div>
      </div>))}
    </div>
  </div>);
}