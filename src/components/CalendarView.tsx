import React, { useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import type { Lead } from '../types';

interface CalendarViewProps { leads: Lead[] }

const MONTHS = ['Январь','Февраль','Март','Апрель','Май','Июнь','Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь'];
const DAYS = ['Пн','Вт','Ср','Чт','Пт','Сб','Вс'];

export default function CalendarView({ leads }: CalendarViewProps) {
  const [month, setMonth] = useState(new Date().getMonth());
  const [year, setYear] = useState(new Date().getFullYear());
  const prev = () => { if (month===0) { setMonth(11); setYear(y=>y-1); } else setMonth(m=>m-1); };
  const next = () => { if (month===11) { setMonth(0); setYear(y=>y+1); } else setMonth(m=>m+1); };
  const first = new Date(year, month, 1).getDay();
  const days = new Date(year, month+1, 0).getDate();
  const offset = first===0 ? 6 : first-1;
  const measures = leads.filter(l => l.status==='measure');
  const getForDay = (d:number) => measures.filter(l => l.deadline === year+'-'+String(month+1).padStart(2,'0')+'-'+String(d).padStart(2,'0'));
  const cells: React.ReactNode[] = [];
  for (let i=0; i<offset; i++) cells.push(<td key={'e'+i} className="p-1" />);
  for (let d=1; d<=days; d++) {
    const dayLeads = getForDay(d);
    const isToday = d===new Date().getDate() && month===new Date().getMonth() && year===new Date().getFullYear();
    cells.push(<td key={d} className={'p-1 align-top border border-white/5 '+(isToday?'bg-indigo-500/20':'')}>
      <span className={'text-xs font-bold '+(isToday?'text-indigo-400':'text-white')}>{d}</span>
      {dayLeads.map(l => <div key={l.id} className="mt-0.5 text-[9px] bg-amber-500/20 border border-amber-500/30 rounded px-1 truncate text-amber-300">{l.name}</div>)}
    </td>);
  }
  const rows: React.ReactNode[] = [];
  for (let i=0; i<cells.length; i+=7) rows.push(<tr key={'r'+i}>{cells.slice(i,i+7)}</tr>);
  return (<div className="p-6 fade-in">
    <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2"><Calendar size={20} className="text-indigo-400" /> Календарь замеров</h2>
    <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
      <div className="flex items-center justify-between mb-4">
        <button onClick={prev} className="p-2 hover:bg-white/10 rounded-xl"><ChevronLeft size={18} className="text-white" /></button>
        <span className="text-white font-bold">{MONTHS[month]} {year}</span>
        <button onClick={next} className="p-2 hover:bg-white/10 rounded-xl"><ChevronRight size={18} className="text-white" /></button>
      </div>
      <table className="w-full"><thead><tr>{DAYS.map(d => <th key={d} className="text-[10px] text-slate-500 uppercase font-bold p-1">{d}</th>)}</tr></thead><tbody>{rows}</tbody></table>
    </div>
  </div>);
}