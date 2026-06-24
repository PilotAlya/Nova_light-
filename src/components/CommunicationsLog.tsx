import React, { useState } from 'react';
import { MessageSquare, Search, Send } from 'lucide-react';
import type { Lead } from '../types';

interface CommunicationsLogProps { leads: Lead[] }

export default function CommunicationsLog({ leads }: CommunicationsLogProps) {
  const [query, setQuery] = useState('');
  const allMsgs = leads.flatMap(l => 
    (l.messages||[]).map(m => ({ ...m, leadName: l.name, leadId: l.id, time: m.time || '' }))
  ).filter(m => m.leadName.toLowerCase().includes(query.toLowerCase()));
  return (<div className="p-6 fade-in">
    <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2"><MessageSquare size={20} className="text-indigo-400" /> Коммуникации</h2>
    <div className="relative w-80 mb-6">
      <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
      <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Поиск по клиенту..." className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-indigo-500/50" />
    </div>
    <div className="space-y-2 max-w-2xl">
      {allMsgs.length===0 && <p className="text-slate-500 text-sm text-center py-8">Нет сообщений</p>}
      {allMsgs.map((m,i) => (<div key={i} className={`flex ${m.from==='manager'?'justify-end':'justify-start'}`}>
        <div className={`max-w-[80%] p-3 rounded-2xl ${m.from==='manager'?'bg-indigo-600/50 rounded-tr-none':'bg-white/10 rounded-tl-none'}`}>
          <p className="text-xs text-slate-400 mb-1">{m.leadName}</p>
          <p className="text-sm text-white">{m.text}</p>
          <p className="text-[10px] text-slate-500 mt-1">{m.time}</p>
        </div>
      </div>))}
    </div>
  </div>);
}