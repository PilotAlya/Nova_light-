import React, { useState } from 'react';
import { Clock, CheckCircle2, Circle, Filter, Edit3, Trash2, Save, X } from 'lucide-react';
import type { TimelineEntry } from '../types';

interface ProjectTimelineProps {
  entries: TimelineEntry[];
  setEntries: (entries: TimelineEntry[]) => void;
  editingId: string | null;
  setEditingId: (id: string | null) => void;
}

const statusColors: Record<string, string> = {
  planned: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  active: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  done: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
};

const statusLabels: Record<string, string> = {
  planned: 'Запланировано',
  active: 'В работе',
  done: 'Выполнено',
};

export default function ProjectTimeline({ entries, setEntries, editingId, setEditingId }: ProjectTimelineProps) {
  const [filter, setFilter] = useState<'all' | 'planned' | 'active' | 'done'>('all');
  const [projectFilter, setProjectFilter] = useState('all');

  const projects = ['all', ...Array.from(new Set(entries.map(e => e.project)))];
  const filtered = entries.filter(e => {
    if (filter !== 'all' && e.status !== filter) return false;
    if (projectFilter !== 'all' && e.project !== projectFilter) return false;
    return true;
  });

  const toggleStatus = (id: string) => {
    setEntries(entries.map(e => {
      if (e.id !== id) return e;
      const next = e.status === 'planned' ? 'active' : e.status === 'active' ? 'done' : 'planned';
      return { ...e, status: next };
    }));
  };

  const deleteEntry = (id: string) => {
    if (confirm('Удалить задачу из таймлайна?')) {
      setEntries(entries.filter(e => e.id !== id));
    }
  };

  const [editData, setEditData] = useState<Partial<TimelineEntry>>({});

  const startEdit = (e: TimelineEntry) => {
    setEditingId(e.id);
    setEditData({ ...e });
  };

  const saveEdit = () => {
    if (editData.id) {
      setEntries(entries.map(e => e.id === editData.id ? { ...e, ...editData } as TimelineEntry : e));
      setEditingId(null);
      setEditData({});
    }
  };

  return (
    <div className="p-6 fade-in">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Clock size={20} className="text-indigo-400" /> Таймлайн проектов
        </h2>
        <div className="flex gap-2">
          <select value={projectFilter} onChange={e => setProjectFilter(e.target.value)} className="bg-black/40 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white">
            {projects.map(p => <option key={p} value={p}>{p === 'all' ? 'Все проекты' : p}</option>)}
          </select>
          <div className="flex bg-white/5 rounded-xl p-0.5">
            {(['all', 'planned', 'active', 'done'] as const).map(s => (
              <button key={s} onClick={() => setFilter(s)} className={`px-3 py-1.5 text-xs rounded-lg transition-all ${filter === s ? 'bg-indigo-500/30 text-white' : 'text-slate-500 hover:text-white'}`}>
                {s === 'all' ? 'Все' : statusLabels[s]}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-2">
        {filtered.length === 0 && <p className="text-slate-500 text-sm text-center py-8">Нет задач в таймлайне</p>}
        {filtered.map(entry => (
          <div key={entry.id} className="bg-white/5 border border-white/10 rounded-2xl p-4 hover:border-white/20 transition-all">
            {editingId === entry.id ? (
              <div className="space-y-3">
                <input value={editData.task || ''} onChange={e => setEditData({ ...editData, task: e.target.value })} className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-white" />
                <input value={editData.member || ''} onChange={e => setEditData({ ...editData, member: e.target.value })} className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-white" placeholder="Участник" />
                <div className="flex gap-2">
                  <input value={editData.start || ''} onChange={e => setEditData({ ...editData, start: e.target.value })} className="flex-1 bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-white" placeholder="Начало" />
                  <input value={editData.end || ''} onChange={e => setEditData({ ...editData, end: e.target.value })} className="flex-1 bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-white" placeholder="Конец" />
                </div>
                <div className="flex gap-2">
                  <button onClick={saveEdit} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-colors flex items-center gap-1"><Save size={14} /> Сохранить</button>
                  <button onClick={() => setEditingId(null)} className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl transition-colors flex items-center gap-1"><X size={14} /> Отмена</button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <button onClick={() => toggleStatus(entry.id)} className="flex-shrink-0">
                  {entry.status === 'done' ? <CheckCircle2 size={20} className="text-emerald-400" /> : entry.status === 'active' ? <Clock size={20} className="text-blue-400" /> : <Circle size={20} className="text-amber-400" />}
                </button>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">{entry.task}</p>
                  <p className="text-slate-500 text-xs mt-0.5">{entry.project} • {entry.member}</p>
                  <p className="text-slate-600 text-[10px] mt-0.5">{entry.start} → {entry.end}</p>
                </div>
                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${statusColors[entry.status]}`}>{statusLabels[entry.status]}</span>
                <div className="flex gap-1">
                  <button onClick={() => startEdit(entry)} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"><Edit3 size={14} className="text-slate-400" /></button>
                  <button onClick={() => deleteEntry(entry.id)} className="p-1.5 hover:bg-red-500/20 rounded-lg transition-colors"><Trash2 size={14} className="text-red-400" /></button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}