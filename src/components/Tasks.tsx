import React, { useState, useRef } from 'react';
import { CheckCircle2, Clock, Plus, X, User, AlertCircle, Calendar, Flag, GripVertical, Edit3, Trash2 } from 'lucide-react';
import { InlineTodoItem } from './InlineTodoItem';
import { Lead, LeadStatus } from '../types';

interface Task {
  id: string;
  title: string;
  assignee: string;
  dueDate: string;
  status: "todo" | "in-progress" | "done";
  priority: "low" | "medium" | "high";
  leadId?: string;
  description?: string;
  createdAt: string;
}

const defaultTasks: Task[] = [
  { id: "1", title: "Сделать замер по проекту Л/001/26", assignee: "Сергей Кузнецов", dueDate: "2026-06-20", status: "todo", priority: "high", leadId: "LD-001", createdAt: "2026-06-10" },
  { id: "2", title: "Подготовить КП для Петровой", assignee: "Елена Морозова", dueDate: "2026-06-22", status: "in-progress", priority: "medium", leadId: "LD-002", createdAt: "2026-06-08" },
  { id: "3", title: "Проверить спецификацию фурнитуры", assignee: "Андрей Сидоров", dueDate: "2026-06-18", status: "done", priority: "low", createdAt: "2026-06-12" },
  { id: "4", title: "Обновить каталог ЛДСП Egger", assignee: "Елена Морозова", dueDate: "2026-06-25", status: "todo", priority: "low", createdAt: "2026-06-13" },
  { id: "5", title: "Согласовать кромку с клиентом", assignee: "Елена Морозова", dueDate: "2026-06-15", status: "in-progress", priority: "high", leadId: "LD-001", createdAt: "2026-06-02" },
  { id: "6", title: "Подобрать петли Blum для кухни", assignee: "Андрей Сидоров", dueDate: "2026-06-22", status: "todo", priority: "medium", leadId: "LD-003", createdAt: "2026-06-09" },
  { id: "7", title: "Сверить остатки на складе", assignee: "Сергей Кузнецов", dueDate: "2026-06-18", status: "done", priority: "medium", createdAt: "2026-06-05" },
  { id: "8", title: "Отправить договор клиенту", assignee: "Дмитрий Волков", dueDate: "2026-06-23", status: "todo", priority: "high", leadId: "LD-004", createdAt: "2026-06-09" },
];

const teamMembers = ["Все", "Сергей Кузнецов", "Елена Морозова", "Андрей Сидоров", "Дмитрий Волков"];

const loadTasks = (): Task[] => {
  try {
    const saved = localStorage.getItem("nova_light_tasks");
    return saved ? JSON.parse(saved) : defaultTasks;
  } catch { return defaultTasks; }
};

const priorityConfig = {
  low: { color: "text-slate-400", bg: "bg-slate-500/10", border: "border-slate-500/20", label: "Низкий" },
  medium: { color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20", label: "Средний" },
  high: { color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/20", label: "Высокий" },
};

const statusLabels: Record<string, string> = {
  todo: "К выполнению",
  "in-progress": "В работе",
  done: "Готово",
};

const statusIcons: Record<string, React.ReactNode> = {
  todo: <Clock size={12} />,
  "in-progress": <AlertCircle size={12} />,
  done: <CheckCircle2 size={12} />,
};

const emptyForm = { title: "", assignee: "Сергей Кузнецов", dueDate: "", priority: "medium" as Task["priority"], leadId: "", description: "" };

const Tasks = () => {
  const [tasks, setTasks] = useState<Task[]>(loadTasks);
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [filterMember, setFilterMember] = useState("Все");
  const [form, setForm] = useState(emptyForm);
  const dragId = useRef<string | null>(null);
  const dragOverCol = useRef<string | null>(null);

  const save = (newTasks: Task[]) => {
    setTasks(newTasks);
    localStorage.setItem("nova_light_tasks", JSON.stringify(newTasks));
  };

  const handleUpdateText = (id: string, newText: string) => {
    save(tasks.map((t) => t.id === id ? { ...t, title: newText } : t));
  };

  const handleToggleComplete = (id: string) => {
    save(tasks.map((t) => t.id === id ? { ...t, status: t.status === "done" ? "todo" : "done" } : t));
  };

  const openNewForm = () => {
    setEditingTask(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const openEditForm = (task: Task) => {
    setEditingTask(task);
    setForm({ title: task.title, assignee: task.assignee, dueDate: task.dueDate, priority: task.priority, leadId: task.leadId || "", description: task.description || "" });
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    if (editingTask) {
      const updated = tasks.map((t) => t.id === editingTask.id ? { ...t, title: form.title, assignee: form.assignee, dueDate: form.dueDate || t.dueDate, priority: form.priority, leadId: form.leadId, description: form.description } : t);
      save(updated);
    } else {
      const task: Task = {
        ...form, id: Date.now().toString(), status: "todo", dueDate: form.dueDate || new Date().toISOString().slice(0, 10), createdAt: new Date().toISOString().slice(0, 10),
      };
      save([...tasks, task]);
    }
    setShowForm(false);
  };

  const moveTask = (id: string, status: Task["status"]) => {
    save(tasks.map((t) => (t.id === id ? { ...t, status } : t)));
  };

  const deleteTask = (id: string) => {
    if (confirm("Удалить задачу?")) save(tasks.filter((t) => t.id !== id));
  };

  const handleDragStart = (id: string) => {
    dragId.current = id;
  };

  const handleDragOver = (e: React.DragEvent, col: string) => {
    e.preventDefault();
    dragOverCol.current = col;
  };

  const handleDrop = (col: Task["status"]) => {
    if (dragId.current) {
      moveTask(dragId.current, col);
      dragId.current = null;
    }
  };

  const handleDragEnd = () => {
    dragId.current = null;
  };

  const filtered = filterMember === "Все" ? tasks : tasks.filter((t) => t.assignee === filterMember);
  const columns: Task["status"][] = ["todo", "in-progress", "done"];

  const columnColors = {
    todo: { header: "bg-slate-500/10 text-slate-300 border-slate-500/20", dot: "bg-slate-500", count: "bg-slate-500/20 text-slate-400", dropBorder: "border-slate-500/30" },
    "in-progress": { header: "bg-amber-500/10 text-amber-300 border-amber-500/20", dot: "bg-amber-400", count: "bg-amber-500/20 text-amber-400", dropBorder: "border-amber-500/30" },
    done: { header: "bg-emerald-500/10 text-emerald-300 border-emerald-500/20", dot: "bg-emerald-400", count: "bg-emerald-500/20 text-emerald-400", dropBorder: "border-emerald-500/30" },
  };

  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="max-w-6xl mx-auto fade-in h-[calc(100vh-140px)] flex flex-col">
      <div className="flex items-center justify-between mb-6 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
            <CheckCircle2 className="text-purple-400" size={22} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Задачи сотрудникам</h2>
            <p className="text-xs text-slate-400">Планирование и контроль выполнения</p>
          </div>
        </div>
        <button onClick={openNewForm} className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(168,85,247,0.3)]">
          <Plus size={16} /> Добавить задачу
        </button>
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto pb-2 flex-shrink-0">
        {teamMembers.map((m) => (
          <button key={m} onClick={() => setFilterMember(m)}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
              filterMember === m
                ? "bg-purple-500/20 text-purple-300 border border-purple-500/30 shadow-[0_0_10px_rgba(168,85,247,0.15)]"
                : "bg-black/40 text-slate-400 border border-white/10 hover:text-white hover:border-white/20"
            }`}>
            {m === "Все" ? "Все" : <><User size={12} className="inline mr-1" />{m}</>}
          </button>
        ))}
      </div>

      <div className="flex-1 grid grid-cols-3 gap-4 overflow-hidden">
        {columns.map((col) => {
          const colTasks = filtered.filter((t) => t.status === col);
          const isOver = dragOverCol.current === col;
          const cc = columnColors[col];
          return (
            <div key={col}
              onDragOver={(e) => handleDragOver(e, col)}
              onDragLeave={() => { if (dragOverCol.current === col) dragOverCol.current = null; }}
              onDrop={() => handleDrop(col)}
              className={`flex flex-col rounded-2xl border transition-all duration-200 ${
                isOver ? `${cc.dropBorder} bg-white/5` : "border-white/5 bg-black/20"
              } p-3`}>
              <div className={`flex items-center gap-2 px-2 py-2 mb-2 flex-shrink-0 rounded-lg ${cc.header} border`}>
                <span className={`w-2 h-2 rounded-full ${cc.dot}`} />
                <h3 className="text-xs font-bold uppercase tracking-widest">{statusLabels[col]}</h3>
                <span className={`text-[10px] font-bold ml-auto px-1.5 py-0.5 rounded ${cc.count}`}>{colTasks.length}</span>
              </div>
                  <div className="flex-1 overflow-y-auto chat-scroll space-y-2 pr-1">
                    {colTasks.map((task) => {
                      const prio = priorityConfig[task.priority];
                      const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== "done";
                      const isToday = task.dueDate === today;
                      return (
                         <div key={task.id} draggable
                          onDragStart={() => handleDragStart(task.id)}
                          onDragEnd={handleDragEnd}
                          onDoubleClick={() => openEditForm(task)}
                          className={`bg-black/30 border border-white/5 rounded-xl p-3 hover:bg-black/40 hover:border-white/10 transition-all group cursor-pointer active:scale-[0.98] ${dragId.current === task.id ? "opacity-50 ring-2 ring-purple-500/40" : ""} ${isOverdue ? "risk-glow" : ""}`}>
                          <div className="flex justify-between items-start mb-2">
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${prio.bg} ${prio.color} ${prio.border} border`}>
                              <Flag size={10} className="inline mr-0.5" />{prio.label}
                            </span>
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                              {col === "todo" && <button onClick={(e) => { e.stopPropagation(); moveTask(task.id, "in-progress"); }} className="text-[10px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 border border-amber-500/20">В работу</button>}
                              {col === "in-progress" && <button onClick={(e) => { e.stopPropagation(); moveTask(task.id, "done"); }} className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20 border border-emerald-500/20">Готово</button>}
                              {col === "todo" && <button onClick={(e) => { e.stopPropagation(); moveTask(task.id, "done"); }} className="text-[10px] px-1.5 py-0.5 rounded bg-slate-500/10 text-slate-400 hover:bg-slate-500/20 border border-slate-500/20">✓</button>}
                            </div>
                          </div>
                          <div className="flex items-start gap-2">
                            <GripVertical size={12} className="text-slate-600 mt-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-all cursor-grab" />
                            <div className="flex-1 min-w-0">
                              <InlineTodoItem
                                id={task.id}
                                initialText={task.title}
                                isCompleted={task.status === "done"}
                                onUpdateText={handleUpdateText}
                                onToggleComplete={handleToggleComplete}
                              />
                              {task.leadId && <span className="text-[9px] text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded border border-indigo-500/20 inline-block mb-2 mt-1"> {task.leadId}</span>}
                            </div>
                          </div>
                          <div className="flex justify-between items-center mt-2">
                            <div className="flex items-center gap-1.5 text-slate-500">
                              <User size={10} /> <span className="text-slate-400">{task.assignee}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              {task.dueDate && (
                                <span className={`text-[10px] flex items-center gap-1 ${isOverdue ? "text-red-400 font-bold" : isToday ? "text-amber-400 font-bold" : "text-slate-500"}`}>
                                  <Calendar size={10} /> {task.dueDate}
                                </span>
                              )}
                              <button onClick={(e) => { e.stopPropagation(); deleteTask(task.id); }} className="p-0.5 rounded hover:bg-white/10 text-slate-500 hover:text-red-400 ml-1 opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={10} /></button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    {colTasks.length === 0 && (
                      <div className="text-center py-10 text-slate-500 text-xs border border-dashed border-white/5 rounded-xl">
                        <Plus size={16} className="mx-auto mb-1 opacity-30" />
                        Перетащите задачу сюда
                      </div>
                    )}
                  </div>
            </div>
          );
        })}
      </div>

      {showForm && (
        <>
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[90]" onClick={() => setShowForm(false)} />
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="w-full max-w-lg glass-panel rounded-3xl p-6 shadow-[0_0_50px_rgba(0,0,0,0.5)]" onClick={(e) => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-5">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
                    {editingTask ? <Edit3 size={16} className="text-purple-400" /> : <Plus size={16} className="text-purple-400" />}
                  </div>
                  <h3 className="text-lg font-bold text-white">{editingTask ? "Редактировать задачу" : "Новая задача"}</h3>
                </div>
                <button onClick={() => setShowForm(false)} className="p-1 rounded-lg hover:bg-white/10 text-slate-400"><X size={18} /></button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Название задачи</label>
                  <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Что нужно сделать?" className="mt-1 w-full bg-black/30 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-purple-500/50 transition-all" required />
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Описание</label>
                  <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Подробности задачи..." rows={2} className="mt-1 w-full bg-black/30 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-purple-500/50 transition-all resize-none" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Ответственный</label>
                    <select value={form.assignee} onChange={(e) => setForm({ ...form, assignee: e.target.value })} className="mt-1 w-full bg-black/30 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500/50 transition-all">
                      {teamMembers.filter((m) => m !== "Все").map((m) => <option key={m} value={m} className="bg-[#1a1e2b]">{m}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Дедлайн</label>
                    <input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} className="mt-1 w-full bg-black/30 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500/50 transition-all" />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1.5 block">Приоритет</label>
                  <div className="flex gap-2">
                    {(["low","medium","high"] as const).map((p) => (
                      <button key={p} type="button" onClick={() => setForm({ ...form, priority: p })}
                        className={`flex-1 py-2 rounded-lg text-xs font-bold border transition-all ${
                          form.priority === p
                            ? priorityConfig[p].bg + " " + priorityConfig[p].border + " " + priorityConfig[p].color + " shadow-[0_0_10px_rgba(168,85,247,0.1)]"
                            : "bg-black/30 border-white/10 text-slate-400 hover:border-white/20"
                        }`}>
                        <Flag size={12} className="inline mr-1" />{priorityConfig[p].label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">ID проекта (опционально)</label>
                  <input type="text" value={form.leadId} onChange={(e) => setForm({ ...form, leadId: e.target.value })} placeholder="LD-001" className="mt-1 w-full bg-black/30 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-purple-500/50 transition-all" />
                </div>
                <div className="flex gap-3 pt-2">
                  {editingTask && (
                    <button type="button" onClick={() => { if (confirm("Удалить задачу?")) { deleteTask(editingTask.id); setShowForm(false); } }} className="px-4 py-3 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-500/10 text-sm transition-all border border-red-500/20 hover:border-red-500/30 flex items-center gap-2">
                      <Trash2 size={14} /> Удалить
                    </button>
                  )}
                  <button type="submit" className="flex-1 bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 rounded-xl transition-all text-sm shadow-[0_0_20px_rgba(168,85,247,0.2)]">
                    {editingTask ? "Сохранить" : "Создать задачу"}
                  </button>
                  <button type="button" onClick={() => setShowForm(false)} className="px-6 py-3 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 text-sm transition-all border border-white/10">
                    Отмена
                  </button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Tasks;
