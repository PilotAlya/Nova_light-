import React, { useState } from 'react';
import { Package, MessageSquare, Clock, Plus } from 'lucide-react';
import { Lead, LeadStatus } from '../types';
import { KanbanCard, KanbanTask } from './KanbanCard';

interface KanbanBoardProps {
  leads: Lead[];
  statusConfig: Record<string, any>;
  getByStatus: (status: LeadStatus) => Lead[];
  handleDragStart: (e: React.DragEvent, id: string) => void;
  handleDragOver: (e: React.DragEvent) => void;
  handleDrop: (e: React.DragEvent, status: LeadStatus) => void;
  draggedLeadId: string | null;
  setSelectedLead: (lead: Lead) => void;
  setIsDrawerOpen: (open: boolean) => void;
  isOverdue: (deadline: string) => boolean;
  setActiveTab: (tab: any) => void;
  borisAvatarStyle: React.CSSProperties;
  onQuickCreate: (status: LeadStatus, name: string, type: string, phone?: string) => void;
  formatPhone?: (val: string) => string;
  onStatusChange: (id: string, newStatus: any) => void;
  qcProgressMap?: Record<string, number>;
}

const KanbanBoard: React.FC<KanbanBoardProps> = ({
  leads,
  statusConfig,
  getByStatus,
  handleDragStart,
  handleDragOver,
  handleDrop,
  draggedLeadId,
  setSelectedLead,
  setIsDrawerOpen,
  isOverdue,
  setActiveTab,
  borisAvatarStyle,
  onQuickCreate,
  formatPhone,
  onStatusChange,
  qcProgressMap,
}) => {
  const [quickCreateCol, setQuickCreateCol] = useState<LeadStatus | null>(null);
  const [quickName, setQuickName] = useState("");
  const [quickPhone, setQuickPhone] = useState("");
  const [quickType, setQuickType] = useState("Кухня");
  const [collapsedCols, setCollapsedCols] = useState<Record<string, boolean>>({});
  const [dragOverCol, setDragOverCol] = useState<string | null>(null);

  const parseBudget = (s: string) => Number(s.replace(/[^\d]/g, '')) || 0;

  const formatMoney = (n: number): string => {
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 1) + "М";
    if (n >= 1_000) return (n / 1_000).toFixed(n % 1_000 === 0 ? 0 : 0) + "к";
    return String(n);
  };

  const totalBudget = leads.reduce((s, l) => s + parseBudget(l.budget), 0);
  const avgCheck = leads.length ? Math.round(totalBudget / leads.length) : 0;

  const handleQuickSubmit = (status: LeadStatus) => {
    if (!quickName.trim()) return;
    onQuickCreate(status, quickName.trim(), quickType, quickPhone.trim() || undefined);
    setQuickName("");
    setQuickPhone("");
    setQuickType("Кухня");
    setQuickCreateCol(null);
  };

  return (
    <div className="h-full flex flex-col fade-in">
      <div className="flex justify-between items-end mb-6">
          <div className="grid grid-cols-5 gap-4 flex-1 mr-8">
          <div className="glass-panel px-4 py-3 rounded-2xl border-l-2 border-sky-400">
            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">Новые лиды</p>
            <h4 className="text-lg font-bold text-white">{getByStatus("new").length}</h4>
          </div>
          <div className="glass-panel px-4 py-3 rounded-2xl border-l-2 border-purple-400">
            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">В работе</p>
            <h4 className="text-lg font-bold text-white">{getByStatus("project").length}</h4>
          </div>
          <div className="glass-panel px-4 py-3 rounded-2xl border-l-2 border-amber-400">
            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">Средний чек</p>
            <h4 className="text-lg font-bold text-white">{formatMoney(avgCheck)}</h4>
          </div>
          <div className="glass-panel px-4 py-3 rounded-2xl border-l-2 border-emerald-400">
            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">Выручка</p>
            <h4 className="text-lg font-bold text-white">{formatMoney(totalBudget)}</h4>
          </div>
        </div>

        <div
          className="glass-panel p-2.5 rounded-full flex items-center gap-3 pr-4 border-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.2)] cursor-pointer"
          onClick={() => {
            setActiveTab("ai-navigator");
          }}
        >
          <div
            style={borisAvatarStyle}
            className="w-8 h-8 rounded-full border border-indigo-500/50 object-cover"
          />
          <p className="text-xs text-indigo-300 font-medium">
            Системное уведомление: проверь спецификации по проектам.
          </p>
        </div>
      </div>

      <div className="flex gap-6 h-[calc(100%-80px)] overflow-x-auto pb-4">
        {(Object.entries(statusConfig) as Array<[LeadStatus, any]>).map(
          ([sk, cfg]) => (
            <div
              key={sk}
              onDragOver={handleDragOver}
              onDrop={(e) => { handleDrop(e, sk); setDragOverCol(null); }}
              onDragEnter={() => setDragOverCol(sk)}
              onDragLeave={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setDragOverCol(null); }}
              className={`${collapsedCols[sk] ? 'min-w-[60px] max-w-[60px]' : 'flex-1 min-w-[300px]'} flex flex-col rounded-3xl border p-2 transition-all duration-300 ${
                dragOverCol === sk && draggedLeadId
                  ? 'border-purple-500/50 bg-purple-500/5 shadow-[0_0_25px_rgba(168,85,247,0.3)]'
                  : draggedLeadId
                    ? 'border-white/20 bg-white/5'
                    : 'border-white/5'
              } ${cfg.colClass}`}
            >
              {collapsedCols[sk] ? (
                <div className="flex-1 flex flex-col items-center justify-center gap-3 py-4">
                  <button
                    onClick={() => setCollapsedCols(prev => ({ ...prev, [sk]: false }))}
                    className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all"
                    title="Развернуть"
                  >
                    ▶
                  </button>
                  <span className="text-xs font-semibold text-white" style={{ writingMode: 'vertical-rl' }}>{cfg.label}</span>
                  <span className="bg-black/30 backdrop-blur-md border border-white/10 text-xs px-2 py-0.5 rounded-full text-slate-300 font-medium">{getByStatus(sk).length}</span>
                </div>
              ) : (
                <>
                  <div className="px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`flex items-center justify-center w-6 h-6 rounded-full ${cfg.bg} ${cfg.color}`}>
                        {cfg.icon}
                      </span>
                      <h3 className="font-semibold text-white tracking-wide text-sm">{cfg.label}</h3>
                    </div>
                    <div className="flex items-center">
                      <span className="bg-black/30 backdrop-blur-md border border-white/10 text-xs px-2.5 py-1 rounded-full text-slate-300 font-medium">
                        {getByStatus(sk).length}
                      </span>
                      <button
                        onClick={() => setCollapsedCols(prev => ({ ...prev, [sk]: !prev[sk] }))}
                        className="ml-2 w-5 h-5 rounded flex items-center justify-center text-slate-500 hover:text-white hover:bg-white/10 transition-all text-xs"
                        title={collapsedCols[sk] ? "Развернуть" : "Свернуть"}
                        aria-label={collapsedCols[sk] ? "Развернуть колонку" : "Свернуть колонку"}
                      >
                        {collapsedCols[sk] ? "▶" : "◀"}
                      </button>
                    </div>
                  </div>

                  <div className="p-2 flex-1 overflow-y-auto space-y-3 chat-scroll">
                    {getByStatus(sk).map((lead) => (
                      <div
                        key={lead.id}
                        onClick={() => {
                          setSelectedLead(lead);
                          setIsDrawerOpen(true);
                        }}
                        className="transition-all duration-300"
                      >
                        <KanbanCard
                          task={{
                            id: lead.id,
                            title: lead.name,
                            customer: lead.source,
                            status: lead.status as any,
                          }}
                          lead={lead}
                          onStatusChange={(id, newStatus) => onStatusChange(id, newStatus)}
                          onDragStart={handleDragStart}
                          overdue={isOverdue(lead.deadline)}
                          qcProgress={qcProgressMap?.[lead.id]}
                        />
                      </div>
                    ))}
                  </div>

                  <div className="px-2 pb-2">
                    {quickCreateCol === sk ? (
                      <div className="glass-card rounded-2xl p-3 space-y-2 border border-indigo-500/30">
                        <input
                          type="text"
                          value={quickName}
                          onChange={(e) => setQuickName(e.target.value)}
                          placeholder="Имя клиента"
                          className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500/50"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleQuickSubmit(sk);
                            if (e.key === "Escape") { setQuickCreateCol(null); setQuickName(""); setQuickPhone(""); }
                          }}
                        />
                        <input
                          type="text"
                          value={quickPhone}
                          onChange={(e) => setQuickPhone(formatPhone ? formatPhone(e.target.value) : e.target.value)}
                          placeholder="Телефон (необязательно)"
                          className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500/50"
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleQuickSubmit(sk);
                            if (e.key === "Escape") { setQuickCreateCol(null); setQuickName(""); setQuickPhone(""); }
                          }}
                        />
                        <select
                          value={quickType}
                          onChange={(e) => setQuickType(e.target.value)}
                          className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-indigo-500/50 appearance-none"
                        >
                          {["Кухня", "Шкаф-купе", "Гардеробная", "Прихожая", "Офис"].map((t) => (
                            <option key={t} value={t} className="bg-slate-900">{t}</option>
                          ))}
                        </select>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleQuickSubmit(sk)}
                            className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold py-1.5 rounded-lg transition-colors"
                          >
                            Добавить
                          </button>
                          <button
                            onClick={() => { setQuickCreateCol(null); setQuickName(""); setQuickPhone(""); }}
                            className="px-3 bg-white/10 hover:bg-white/20 text-slate-300 text-xs rounded-lg transition-colors"
                          >
                            Отмена
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => { setQuickCreateCol(sk); setQuickType("Кухня"); }}
                        className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl border border-dashed border-white/10 text-slate-500 hover:text-slate-300 hover:border-white/20 hover:bg-white/5 transition-all text-xs font-medium"
                      >
                        <Plus size={14} /> Добавить карточку
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          ),
        )}
      </div>
    </div>
  );
};

export default KanbanBoard;