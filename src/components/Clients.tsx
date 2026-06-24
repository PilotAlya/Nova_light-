import React, { useState } from 'react';
import { Users, Search, Phone, Mail, MapPin } from 'lucide-react';
import type { Lead } from '../types';

interface ClientsProps { leads: Lead[] }

export default function Clients({ leads }: ClientsProps) {
  const [query, setQuery] = useState('');
  const filtered = leads.filter(l => l.name.toLowerCase().includes(query.toLowerCase()) || l.phone.includes(query));
  return (<div className="p-6 fade-in">
    <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2"><Users size={20} className="text-indigo-400" /> Клиенты</h2>
    <div className="relative w-80 mb-6">
      <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
      <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Поиск по имени или телефону..." className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-indigo-500/50" />
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {filtered.map(l => (<div key={l.id} className="bg-white/5 border border-white/10 rounded-2xl p-4 hover:border-white/20 transition-all">
        <p className="text-white font-bold text-sm mb-2">{l.name}</p>
        <div className="space-y-1.5 text-xs text-slate-400">
          <div className="flex items-center gap-2"><Phone size={12} /><span>{l.phone}</span></div>
          <div className="flex items-center gap-2"><Mail size={12} /><span className="text-slate-500">{l.contactMethod}</span></div>
          <div className="flex items-center gap-2"><MapPin size={12} /><span className="text-slate-500">{l.source}</span></div>
        </div>
        <div className="mt-3 flex items-center justify-between">
          <span className="text-[10px] text-slate-600">{l.budget} • {l.type}</span>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${l.status==='new'?'bg-blue-500/20 text-blue-300':l.status==='project'?'bg-purple-500/20 text-purple-300':l.status==='measure'?'bg-amber-500/20 text-amber-300':l.status==='production'?'bg-emerald-500/20 text-emerald-300':'bg-slate-500/20 text-slate-300'}`}>{l.status}</span>
        </div>
      </div>))}
    </div>
  </div>);
}