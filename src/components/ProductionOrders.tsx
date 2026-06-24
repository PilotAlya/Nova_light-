import React, { useState, useMemo } from 'react';
import { Package, ClipboardList, Ruler, Wrench, Truck, ShieldCheck, ChevronRight, Clock, CheckCircle2, AlertTriangle } from 'lucide-react';
import { Lead } from '../types';

interface ProductionOrdersProps {
  leads: Lead[];
}

const stageConfig: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  new: { label: "Новый заказ", icon: <ClipboardList size={16} />, color: "border-l-sky-500 bg-sky-500/5" },
  project: { label: "Проектирование", icon: <Ruler size={16} />, color: "border-l-purple-500 bg-purple-500/5" },
  measure: { label: "Замер", icon: <Ruler size={16} />, color: "border-l-amber-500 bg-amber-500/5" },
  production: { label: "Производство", icon: <Wrench size={16} />, color: "border-l-emerald-500 bg-emerald-500/5" },
  mounting: { label: "Монтаж", icon: <Truck size={16} />, color: "border-l-rose-500 bg-rose-500/5" },
};

const stageOrder = ["new", "project", "measure", "production", "mounting"];

const materialColors: Record<string, string> = {
  "ЛДСП EGGER": "bg-amber-500/20 text-amber-300",
  "МДФ Эмаль": "bg-sky-500/20 text-sky-300",
  "HPL Пластик": "bg-violet-500/20 text-violet-300",
  "Натуральное дерево": "bg-emerald-500/20 text-emerald-300",
};

const sketchColors = ["#38bdf8", "#a78bfa", "#fbbf24", "#34d399", "#f472b6", "#fb923c"];

const ProductionOrders: React.FC<ProductionOrdersProps> = ({ leads }) => {
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  const filteredLeads = useMemo(() => {
    return leads.filter(l => l.status !== "new" && l.status !== "mounting");
  }, [leads]);

  const groupedByStage = useMemo(() => {
    const groups: Record<string, Lead[]> = {};
    stageOrder.forEach(s => { groups[s] = []; });
    filteredLeads.forEach(l => { groups[l.status]?.push(l); });
    return groups;
  }, [filteredLeads]);

  const getStageIndex = (status: string) => stageOrder.indexOf(status);

  return (
    <div className="max-w-7xl mx-auto fade-in">
      <div className="flex items-center gap-4 border-b border-white/10 pb-6 mb-6">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500/30 to-teal-500/30 flex items-center justify-center border border-emerald-500/30">
          <Package size={24} className="text-emerald-300" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Производственные заказы</h2>
          <p className="text-sm text-slate-400">Отслеживание заказов по этапам производства</p>
        </div>
      </div>

      {/* Pipeline stages */}
      <div className="space-y-8">
        {stageOrder.map((status, stageIdx) => {
          const cfg = stageConfig[status];
          const items = groupedByStage[status] || [];
          if (items.length === 0) return null;

          return (
            <div key={status} className="glass-panel rounded-2xl border border-white/5 overflow-hidden">
              <div className={`flex items-center gap-3 px-5 py-3 border-l-4 ${cfg.color}`}>
                <span className="text-white">{cfg.icon}</span>
                <h3 className="font-bold text-white">{cfg.label}</h3>
                <span className="text-xs text-slate-500 ml-auto">{items.length} заказ(ов)</span>
              </div>
              <div className="divide-y divide-white/5">
                {items.map((lead) => {
                  const isExpanded = expandedOrder === lead.id;
                  const sketchColor = sketchColors[lead.id.length % sketchColors.length];

                  return (
                    <div key={lead.id}>
                      <button
                        onClick={() => setExpandedOrder(isExpanded ? null : lead.id)}
                        className="w-full flex items-center gap-4 px-5 py-4 hover:bg-white/5 transition-all text-left"
                      >
                        <div
                          className="w-12 h-12 rounded-xl flex items-center justify-center text-white text-lg font-bold shrink-0"
                          style={{ backgroundColor: sketchColor }}
                        >
                          {lead.type.slice(0, 1)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-white truncate">{lead.name}</p>
                            <span className="text-[10px] text-slate-500 font-mono">{lead.id}</span>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-slate-400">{lead.type}</span>
                            <span className="text-[10px] text-slate-600">•</span>
                            <span className="text-xs text-slate-400">{lead.budget}</span>
                            <span className="text-[10px] text-slate-600">•</span>
                            <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${materialColors[lead.material] || "bg-slate-500/20 text-slate-300"}`}>
                              {lead.material}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1">
                            {stageOrder.slice(0, getStageIndex(status) + 1).map((s, i) => (
                              <div key={s} className={`w-2 h-2 rounded-full ${i <= getStageIndex(status) ? 'bg-emerald-500' : 'bg-slate-600'}`} />
                            ))}
                          </div>
                          <ChevronRight size={16} className={`text-slate-500 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                        </div>
                      </button>

                      {isExpanded && (
                        <div className="px-5 pb-4 pt-2 border-t border-white/5 bg-black/20">
                          <div className="grid grid-cols-3 gap-4">
                            <div className="bg-black/30 rounded-xl p-3 border border-white/5">
                              <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Клиент</p>
                              <p className="text-sm text-white">{lead.name}</p>
                              <p className="text-xs text-slate-400">{lead.phone}</p>
                            </div>
                            <div className="bg-black/30 rounded-xl p-3 border border-white/5">
                              <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Дедлайн</p>
                              <p className="text-sm text-white">{lead.deadline}</p>
                              <p className="text-xs text-slate-400">{lead.source}</p>
                            </div>
                            <div className="bg-black/30 rounded-xl p-3 border border-white/5">
                              <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Ответственный</p>
                              <div className="flex items-center gap-2">
                                <img src={lead.assignee.avatar} className="w-6 h-6 rounded-full" alt="" />
                                <p className="text-sm text-white">{lead.assignee.name}</p>
                              </div>
                            </div>
                          </div>

                          {/* Sketch placeholder */}
                          <div
                            className="mt-3 rounded-xl border border-dashed border-white/10 p-4 flex items-center justify-center"
                            style={{ backgroundColor: sketchColor + "15" }}
                          >
                            <div className="text-center">
                              <div className="w-16 h-16 mx-auto rounded-lg flex items-center justify-center mb-2" style={{ backgroundColor: sketchColor + "30" }}>
                                <span className="text-2xl" style={{ color: sketchColor }}>📐</span>
                              </div>
                              <p className="text-xs text-slate-500">Эскиз проекта {lead.id}</p>
                              <p className="text-[10px] text-slate-600 mt-1">{lead.type} · {lead.material}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProductionOrders;
