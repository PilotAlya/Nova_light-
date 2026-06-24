import React, { useState } from 'react';
import { CheckSquare, AlertCircle, CheckCircle2, Clock, ChevronRight, Search, User, Plus, X, Edit3 } from 'lucide-react';
import { Lead } from '../types';

interface RealityCheckProps {
  leads: Lead[];
  currentUser?: string | null;
}

interface ChecklistItem {
  id: string;
  label: string;
  completed: boolean;
}

interface ProjectQC {
  leadId: string;
  projectType: string;
  steps: {
    measurement: ChecklistItem[];
    design: ChecklistItem[];
    production: ChecklistItem[];
    logistics: ChecklistItem[];
  };
}

type StepLabels = { measurement: string[]; design: string[]; production: string[]; logistics: string[]; };
const TASK_TEMPLATES: Record<string, StepLabels> = {
  "Кухня": {
    measurement: [
      "Замер углов стен (90°)",
      "Проверка высоты потолка (3 точки)",
      "Расположение розеток и выводов воды",
      "Проверка вентиляции",
      "Уровень пола (уклон)",
    ],
    design: [
      "Согласование цвета фасадов",
      "Выбор фурнитуры (Blum/Boyard)",
      "Схема расположения техники",
      "Подпись спецификации клиентом",
      "Утверждение материалов столешницы",
    ],
    production: [
      "Распил ЛДСП (OpenCutList)",
      "Кромление (2.0 мм видимые)",
      "Присадка отверстий",
      "Сборка корпусов",
      "Комплектация фасадов",
    ],
    logistics: [
      "Упаковка в гофрокартон",
      "Комплектация фурнитурой",
      "Маркировка деталей",
    ],
  },
  "Шкаф-купе": {
    measurement: [
      "Замер ниши (ширина/высота/глубина)",
      "Уровни пола и стен",
      "Проверка углов (отклонения)",
      "Препятствия (плинтусы, карнизы)",
    ],
    design: [
      "3D визуализация в SketchUp",
      "Наполнение шкафа (полки/штанги/ящики)",
      "Выбор профиля дверей",
      "Расчёт направляющих",
      "Подпись чертежа клиентом",
    ],
    production: [
      "Изготовление дверей-купе",
      "Нарезка треков (верх/низ)",
      "Сборка корпуса",
      "Установка наполнения",
    ],
    logistics: [
      "Упаковка дверей",
      "Комплектация фурнитурой",
      "Маркировка коробок",
    ],
  },
  "Гардеробная": {
    measurement: [
      "Замер помещения",
      "Проверка углов и уровня пола",
      "Расположение освещения",
    ],
    design: [
      "Планировка секций",
      "Выбор системы хранения",
      "Схема освещения",
    ],
    production: [
      "Изготовление корпусов",
      "Нарезка полок",
      "Сборка модулей",
    ],
    logistics: [
      "Упаковка",
      "Комплектация крепежом",
    ],
  },
};

const initStepsFromType = (type: string) => {
  const template = TASK_TEMPLATES[type] || TASK_TEMPLATES["Кухня"];
  return {
    measurement: template.measurement.map((label, i) => ({ id: `m${i}`, label, completed: false })),
    design: template.design.map((label, i) => ({ id: `d${i}`, label, completed: false })),
    production: template.production.map((label, i) => ({ id: `p${i}`, label, completed: false })),
    logistics: template.logistics.map((label, i) => ({ id: `l${i}`, label, completed: false })),
  };
};

const RealityCheck: React.FC<RealityCheckProps> = ({ leads, currentUser }) => {
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(leads[0]?.id || null);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedAssignees, setExpandedAssignees] = useState<Record<string, boolean>>(() => {
    if (currentUser) return { [currentUser]: true };
    return {};
  });

  const [qcData, setQcData] = useState<Record<string, ProjectQC>>(() => {
    const initial: Record<string, ProjectQC> = {};
    for (const lead of leads) {
      initial[lead.id] = {
        leadId: lead.id,
        projectType: lead.type,
        steps: initStepsFromType(lead.type),
      };
    }
    return initial;
  });

  const [addingIn, setAddingIn] = useState<{ leadId: string; category: keyof ProjectQC['steps'] } | null>(null);
  const [newTaskLabel, setNewTaskLabel] = useState("");

  const toggleStep = (leadId: string, category: keyof ProjectQC['steps'], stepId: string) => {
    setQcData(prev => {
      const project = prev[leadId];
      if (!project) return prev;
      const newSteps = { ...project.steps };
      newSteps[category] = newSteps[category].map(item =>
        item.id === stepId ? { ...item, completed: !item.completed } : item
      );
      return { ...prev, [leadId]: { ...project, steps: newSteps } };
    });
  };

  const addCustomTask = (leadId: string, category: keyof ProjectQC['steps']) => {
    if (!newTaskLabel.trim()) return;
    setQcData(prev => {
      const project = prev[leadId];
      if (!project) return prev;
      const idx = project.steps[category].length;
      const newSteps = { ...project.steps };
      newSteps[category] = [...newSteps[category], { id: `custom_${Date.now()}`, label: newTaskLabel.trim(), completed: false }];
      return { ...prev, [leadId]: { ...project, steps: newSteps } };
    });
    setNewTaskLabel("");
    setAddingIn(null);
  };

  const selectedLead = leads.find(l => l.id === selectedLeadId);
  const selectedQC = selectedLeadId ? qcData[selectedLeadId] : null;

  const calculateProgress = (qc: ProjectQC) => {
    const allSteps = [
      ...qc.steps.measurement, ...qc.steps.design,
      ...qc.steps.production, ...qc.steps.logistics,
    ];
    const completed = allSteps.filter(s => s.completed).length;
    return allSteps.length ? Math.round((completed / allSteps.length) * 100) : 0;
  };

  const filteredLeads = leads.filter(l =>
    l.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const groupedByAssignee = filteredLeads.reduce((acc, lead) => {
    const assigneeName = lead.assignee?.name || "Без ответственного";
    if (!acc[assigneeName]) acc[assigneeName] = [];
    acc[assigneeName].push(lead);
    return acc;
  }, {} as Record<string, Lead[]>);

  const sortedGroupEntries = Object.entries(groupedByAssignee).sort(([aName], [bName]) => {
    if (currentUser && aName === currentUser) return -1;
    if (currentUser && bName === currentUser) return 1;
    return 0;
  });

  return (
    <div className="max-w-6xl mx-auto h-[calc(100vh-140px)] flex gap-6 fade-in">
      <div className="w-80 flex flex-col gap-4 h-full">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
          <input
            type="text"
            placeholder="Поиск проекта..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-black/30 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-indigo-500/50 transition-all"
          />
        </div>

        <div className="flex-1 glass-panel rounded-2xl overflow-y-auto chat-scroll p-2 border border-white/5">
          <div className="space-y-3">
            {sortedGroupEntries.map(([assignee, assigneeLeads]) => {
              const isExpanded = expandedAssignees[assignee] !== false;
              const isCurrentUser = currentUser && assignee === currentUser;
              const assigneeProgress = assigneeLeads.reduce((sum, l) => {
                const qc = qcData[l.id];
                return sum + (qc ? calculateProgress(qc) : 0);
              }, 0) / assigneeLeads.length;

              return (
                <div key={assignee}>
                  <button
                    onClick={() => setExpandedAssignees(prev => ({ ...prev, [assignee]: !isExpanded }))}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-left transition-all ${
                      isCurrentUser
                        ? "bg-emerald-500/15 border border-emerald-500/25"
                        : "bg-indigo-500/10 border border-indigo-500/20 hover:bg-indigo-500/15"
                    }`}
                  >
                    <User size={14} className={isCurrentUser ? "text-emerald-400" : "text-indigo-400"} flex-shrink-0 />
                    <span className={`text-xs font-bold flex-1 truncate ${isCurrentUser ? "text-emerald-300" : "text-indigo-300"}`}>
                      {assignee}
                      {isCurrentUser && <span className="ml-1.5 text-[9px] text-emerald-400/70">(Я)</span>}
                    </span>
                    <span className="text-[10px] text-slate-400">{assigneeLeads.length} шт.</span>
                    <span className={`text-[10px] font-bold ${Math.round(assigneeProgress) >= 80 ? "text-emerald-400" : "text-indigo-400"}`}>
                      {Math.round(assigneeProgress)}%
                    </span>
                    <span className="text-[10px] text-slate-500">{isExpanded ? "▼" : "▶"}</span>
                  </button>

                  {isExpanded && (
                    <div className="mt-1 ml-2 space-y-1">
                      {assigneeLeads.map(lead => {
                        const qc = qcData[lead.id];
                        const progress = qc ? calculateProgress(qc) : 0;
                        const isActive = selectedLeadId === lead.id;

                        return (
                          <button
                            key={lead.id}
                            onClick={() => setSelectedLeadId(lead.id)}
                            className={`w-full text-left p-2.5 rounded-xl transition-all duration-300 group ${
                              isActive ? "bg-white/10 border border-white/10" : "hover:bg-white/5 border border-transparent"
                            }`}
                          >
                            <div className="flex items-center gap-2 mb-1.5">
                              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0 ${
                                isActive ? "bg-indigo-500/20 text-indigo-300" : "bg-black/40 text-slate-500"
                              }`}>
                                {lead.id}
                              </span>
                              <span className="flex-1 text-xs font-semibold text-white truncate">{lead.name}</span>
                              <span className="text-[9px] text-slate-500 flex-shrink-0">{lead.type}</span>
                              <span className={`text-xs font-bold flex-shrink-0 ${progress === 100 ? "text-emerald-400" : "text-indigo-400"}`}>
                                {progress}%
                              </span>
                            </div>
                            <div className="w-full h-1 bg-black/40 rounded-full overflow-hidden">
                              <div
                                className={`h-full transition-all duration-500 rounded-full ${progress === 100 ? "bg-emerald-500" : "bg-indigo-500"}`}
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col gap-6 h-full overflow-y-auto chat-scroll pr-2">
        {!selectedLead ? (
          <div className="flex-1 glass-panel rounded-3xl flex flex-col items-center justify-center text-center p-8 border-dashed border-2 border-white/10">
            <CheckSquare size={48} className="text-slate-600 mb-4" />
            <h3 className="text-xl font-bold text-slate-400">Выберите проект для проверки</h3>
            <p className="text-sm text-slate-500 mt-2">Контроль качества на каждом этапе производства Nova.</p>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-xs font-bold text-indigo-400 bg-indigo-500/10 px-2 py-1 rounded-full border border-indigo-500/20">{selectedLead.id}</span>
              <h3 className="text-lg font-bold text-white">{selectedLead.name}</h3>
              <span className="text-[10px] text-slate-500 bg-white/5 px-2 py-0.5 rounded-full">{selectedLead.type}</span>
              {selectedLead.assignee && (
                <span className="text-[10px] text-slate-400 flex items-center gap-1 ml-auto"><User size={12} /> {selectedLead.assignee.name}</span>
              )}
            </div>
            <div className="grid grid-cols-2 gap-6">
              {([
                { key: 'measurement' as const, label: '1. Замер и Техзадание', color: 'text-sky-400', icon: <ChevronRight size={18} /> },
                { key: 'design' as const, label: '2. Проектирование', color: 'text-purple-400', icon: <ChevronRight size={18} /> },
                { key: 'production' as const, label: '3. Производство', color: 'text-amber-400', icon: <AlertCircle size={18} /> },
                { key: 'logistics' as const, label: '4. Логистика и Сборка', color: 'text-emerald-400', icon: <CheckCircle2 size={18} /> },
              ]).map(section => (
                <div key={section.key} className="glass-panel rounded-3xl p-5 border border-white/5 hover:border-white/10 transition-all">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg bg-black/40 flex items-center justify-center ${section.color}`}>
                        {section.icon}
                      </div>
                      <h4 className="font-bold text-slate-200 text-sm">{section.label}</h4>
                    </div>
                    <button
                      onClick={() => setAddingIn({ leadId: selectedLead.id, category: section.key })}
                      className="w-6 h-6 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center transition-all"
                      title="Добавить задачу"
                    >
                      <Plus size={12} className="text-slate-400" />
                    </button>
                  </div>

                  <div className="space-y-2">
                    {selectedQC?.steps[section.key].map(step => (
                      <button
                        key={step.id}
                        onClick={() => toggleStep(selectedLead.id, section.key, step.id)}
                        className="w-full flex items-center gap-3 p-3 rounded-xl bg-black/20 border border-white/5 hover:bg-black/30 transition-all text-left group"
                      >
                        <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                          step.completed ? "bg-indigo-500 border-indigo-500" : "border-white/10 group-hover:border-white/30"
                        }`}>
                          {step.completed && <CheckCircle2 size={14} className="text-white" />}
                        </div>
                        <span className={`text-xs transition-colors ${step.completed ? "text-slate-400 line-through" : "text-slate-200"}`}>
                          {step.label}
                        </span>
                      </button>
                    ))}
                    {addingIn?.leadId === selectedLead.id && addingIn?.category === section.key && (
                      <form
                        onSubmit={(e) => { e.preventDefault(); addCustomTask(selectedLead.id, section.key); }}
                        className="flex items-center gap-2 p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/30"
                      >
                        <input
                          type="text"
                          value={newTaskLabel}
                          onChange={(e) => setNewTaskLabel(e.target.value)}
                          placeholder="Новая задача..."
                          className="flex-1 bg-black/40 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500/50"
                          autoFocus
                          onKeyDown={(e) => { if (e.key === 'Escape') { setAddingIn(null); setNewTaskLabel(''); } }}
                        />
                        <button type="submit" className="w-6 h-6 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
                          <Plus size={12} />
                        </button>
                        <button type="button" onClick={() => { setAddingIn(null); setNewTaskLabel(''); }} className="w-6 h-6 rounded-lg bg-white/5 flex items-center justify-center text-slate-400">
                          <X size={12} />
                        </button>
                      </form>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default RealityCheck;
