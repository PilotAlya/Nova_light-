import React, { useState } from 'react';
import { Ruler, Calendar, Clock, MapPin, CheckCircle2, XCircle } from 'lucide-react';
import type { Lead } from '../types';

interface MeasurementCalendarProps { leads: Lead[] }

export default function MeasurementCalendar({ leads }: MeasurementCalendarProps) {
  const [showDone, setShowDone] = useState(false);
  const measures = leads.filter(l => l.status==='measure' || l.status==='mounting');
  const filtered = showDone ? measures : measures.filter(l => l.status==='measure');
  return (<div className="p-6 fade-in">
    <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2"><Ruler size={20} className="text-indigo-400" /> Замеры</h2>
    <div className="flex items-center gap-2 mb-6">
      <button onClick={() => setShowDone(false)} className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${!showDone?'bg-indigo-500/30 text-indigo-200 border border-indigo-400/50':'bg-white/5 text-slate-400 border border-white/10'}`}>Активные замеры</button>
      <button onClick={() => setShowDone(true)} className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${showDone?'bg-indigo-500/30 text-indigo-200 border border-indigo-400/50':'bg-white/5 text-slate-400 border border-white/10'}`}>Все ({measures.length})</button>
    </div>
    <div className="space-y-3">
      {filtered.length===0 && <p className="text-slate-500 text-sm text-center py-8">Нет замеров</p>}
      {filtered.map(l => (<div key={l.id} className="bg-white/5 border border-white/10 rounded-2xl p-4 hover:border-white/20 transition-all flex items-center gap-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${l.status==='mounting'?'bg-emerald-500/20':'bg-amber-500/20'}`}>
          {l.status==='mounting' ? <CheckCircle2 size={20} className="text-emerald-400" /> : <Ruler size={20} className="text-amber-400" />}
        </div>
        <div className="flex-1">
          <p className="text-white text-sm font-bold">{l.name}</p>
          <p className="text-slate-500 text-xs mt-0.5">{l.type} • {l.budget}</p>
          <div className="flex items-center gap-3 mt-1.5 text-[10px] text-slate-500">
            <span className="flex items-center gap-1"><Calendar size={10} />{l.deadline}</span>
            <span className="flex items-center gap-1"><MapPin size={10} />{l.source}</span>
            <span className="flex items-center gap-1"><Clock size={10} />{l.contactMethod}</span>
          </div>
        </div>
        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${l.status==='measure'?'bg-amber-500/20 text-amber-300':'bg-emerald-500/20 text-emerald-300'}`}>
          {l.status==='measure' ? 'Замер' : 'Монтаж'}
        </span>
      </div>))}
    </div>
  </div>);
}