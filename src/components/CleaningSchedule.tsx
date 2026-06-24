import React, { useState, useEffect } from "react";
import { Plus, X, Trash2, Check, User, Wind, ListChecks } from "lucide-react";
import { fetchCleaning, createCleaning, updateCleaning, deleteCleaning, CleaningItem } from "../api/cash";

const DAYS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];
const DAY_NAMES = ["Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота", "Воскресенье"];

const VENTILATION_TIMES = ["10:00", "13:00", "16:00"];

const CleaningSchedule: React.FC = () => {
  const [items, setItems] = useState<CleaningItem[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState<CleaningItem | null>(null);
  const [form, setForm] = useState({ task_name: "", day_of_week: 1, assignee: "", notes: "" });
  const [ventilationLog, setVentilationLog] = useState<{ time: string; done: boolean }[]>(() => {
    const today = new Date().toDateString();
    const saved = localStorage.getItem("nova_light_ventilation_log");
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.date === today) return parsed.times;
    }
    return VENTILATION_TIMES.map(t => ({ time: t, done: false }));
  });
  const [todayDone, setTodayDone] = useState<Record<string, boolean>>(() => {
    const saved = localStorage.getItem("nova_light_cleaning_today");
    const today = new Date().toDateString();
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.date === today) return parsed.done;
    }
    return {};
  });

  const todayDayOfWeek = new Date().getDay() || 7; // Пн=1, Вс=7
  const todayItems = items.filter(i => i.day_of_week === todayDayOfWeek);
  const todayByAssignee = todayItems.reduce<Record<string, CleaningItem[]>>((acc, item) => {
    const key = item.assignee || "Без ответственного";
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});

  useEffect(() => {
    localStorage.setItem("nova_light_ventilation_log", JSON.stringify({
      date: new Date().toDateString(),
      times: ventilationLog,
    }));
  }, [ventilationLog]);

  useEffect(() => {
    localStorage.setItem("nova_light_cleaning_today", JSON.stringify({
      date: new Date().toDateString(),
      done: todayDone,
    }));
  }, [todayDone]);

  const toggleToday = (itemId: number) => {
    setTodayDone(prev => ({ ...prev, [`item-${itemId}`]: !prev[`item-${itemId}`] }));
  };

  const toggleVent = (idx: number) => {
    setVentilationLog(prev => prev.map((v, i) => i === idx ? { ...v, done: !v.done } : v));
  };

  const SEED_CLEANING: CleaningItem[] = [
    { id: 1, task_name: "Убрать витрину и зону приёма", day_of_week: 1, assignee: "Елена", notes: "Протереть стеклянные поверхности, выровнять образцы" },
    { id: 2, task_name: "Вынести мусор из цеха", day_of_week: 1, assignee: "Андрей", notes: "Контейнеры с опилками и обрезками" },
    { id: 3, task_name: "Протереть рабочие места в цехе", day_of_week: 1, assignee: "Все", notes: "Столы, верстаки, инструмент" },
    { id: 4, task_name: "Проветрить салон", day_of_week: 1, assignee: "Сергей", notes: "Открыть окна на 15 минут" },
    { id: 5, task_name: "Проверить расходники", day_of_week: 1, assignee: "Андрей", notes: "Перчатки, тряпки, моющие" },
    { id: 6, task_name: "Убрать витрину и зону приёма", day_of_week: 2, assignee: "Елена", notes: "" },
    { id: 7, task_name: "Протереть рабочие места в цехе", day_of_week: 2, assignee: "Все", notes: "" },
    { id: 8, task_name: "Вынести мусор из цеха", day_of_week: 3, assignee: "Андрей", notes: "" },
    { id: 9, task_name: "Протереть рабочие места в цехе", day_of_week: 3, assignee: "Все", notes: "" },
    { id: 10, task_name: "Проветрить цех", day_of_week: 3, assignee: "Дмитрий", notes: "Проверить вентиляцию" },
    { id: 11, task_name: "Убрать витрину и зону приёма", day_of_week: 4, assignee: "Елена", notes: "" },
    { id: 12, task_name: "Протереть рабочие места в цехе", day_of_week: 4, assignee: "Все", notes: "" },
    { id: 13, task_name: "Вынести мусор из цеха", day_of_week: 5, assignee: "Андрей", notes: "" },
    { id: 14, task_name: "Протереть рабочие места в цехе", day_of_week: 5, assignee: "Все", notes: "" },
    { id: 15, task_name: "Проверить расходники", day_of_week: 5, assignee: "Андрей", notes: "" },
    { id: 16, task_name: "Убрать витрину и зону приёма", day_of_week: 5, assignee: "Елена", notes: "" },
    { id: 17, task_name: "Вынести мусор из цеха", day_of_week: 6, assignee: "Андрей", notes: "" },
    { id: 18, task_name: "Протереть рабочие места в цехе", day_of_week: 6, assignee: "Все", notes: "" },
    { id: 19, task_name: "Проветрить салон", day_of_week: 6, assignee: "Сергей", notes: "" },
  ];

  const load = async () => {
    try {
      const data = await fetchCleaning();
      if (Array.isArray(data) && data.length > 0) {
        setItems(data);
      } else {
        setItems(SEED_CLEANING);
      }
    } catch {
      setItems(SEED_CLEANING);
    }
  };

  useEffect(() => { load(); }, []);

  const taskNames = [...new Set(items.map(i => i.task_name))];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.task_name.trim()) return;
    if (editItem) {
      await updateCleaning(editItem.id, form);
    } else {
      await createCleaning(form);
    }
    setForm({ task_name: "", day_of_week: 1, assignee: "", notes: "" });
    setEditItem(null);
    setShowForm(false);
    load();
  };

  const startEdit = (item: CleaningItem) => {
    setEditItem(item);
    setForm({ task_name: item.task_name, day_of_week: item.day_of_week, assignee: item.assignee, notes: item.notes });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    await deleteCleaning(id);
    load();
  };

  const toggleAssignee = async (item: CleaningItem) => {
    const newAssignee = item.assignee ? "" : "Администратор";
    await updateCleaning(item.id, { ...item, assignee: newAssignee } as any);
    load();
  };

  const weekDays: { day: number; name: string; short: string }[] = DAYS.map((short, i) => ({ day: i + 1, name: DAY_NAMES[i], short }));

  return (
    <div className="max-w-6xl mx-auto fade-in space-y-6">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight">График уборки</h2>
          <p className="text-slate-400 text-sm mt-1">Недельное расписание — задачи и ответственные</p>
        </div>
        <button onClick={() => { setEditItem(null); setForm({ task_name: "", day_of_week: 1, assignee: "", notes: "" }); setShowForm(!showForm); }} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all">
          <Plus size={16} /> Добавить задачу
        </button>
      </div>

      {showForm && (
        <div className="glass-panel rounded-2xl p-5 border border-indigo-500/30 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-indigo-300 uppercase tracking-widest">{editItem ? "Редактировать" : "Новая задача"}</h4>
            <button onClick={() => { setShowForm(false); setEditItem(null); }} className="text-slate-400 hover:text-white transition-colors"><X size={16} /></button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Задача</label>
                <input value={form.task_name} onChange={e => setForm(f => ({ ...f, task_name: e.target.value }))} placeholder="Например: Влажная уборка" required className="mt-1.5 w-full bg-black/30 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500/50" />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">День недели</label>
                <div className="mt-1.5 flex gap-1.5 flex-wrap">
                  {weekDays.map(d => (
                    <button key={d.day} type="button" onClick={() => setForm(f => ({ ...f, day_of_week: d.day }))} className={`w-9 h-9 rounded-lg text-xs font-bold border transition-all ${form.day_of_week === d.day ? "bg-indigo-500/20 border-indigo-500/40 text-indigo-300" : "bg-white/5 border-white/10 text-slate-400 hover:text-white"}`}>{d.short}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Ответственный</label>
                <input value={form.assignee} onChange={e => setForm(f => ({ ...f, assignee: e.target.value }))} placeholder="Имя сотрудника" className="mt-1.5 w-full bg-black/30 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500/50" />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Примечание</label>
                <input value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} className="mt-1.5 w-full bg-black/30 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500/50" />
              </div>
            </div>
            <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2.5 rounded-xl transition-all text-sm">
              {editItem ? "Сохранить" : "Добавить"}
            </button>
          </form>
        </div>
      )}

      {/* Ventilation schedule */}
      <div className="glass-panel rounded-2xl p-5 border border-white/5">
        <div className="flex items-center gap-3 mb-4">
          <Wind size={20} className="text-emerald-400" />
          <h3 className="text-sm font-bold text-white uppercase tracking-widest">График проветривания</h3>
        </div>
        <div className="flex gap-4">
          {ventilationLog.map((v, i) => (
            <button
              key={v.time}
              onClick={() => toggleVent(i)}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl border text-sm font-bold transition-all ${
                v.done
                  ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300"
                  : "bg-white/5 border-white/10 text-slate-400 hover:text-white"
              }`}
            >
              <span>{v.time}</span>
              {v.done && <Check size={16} className="text-emerald-400" />}
            </button>
          ))}
        </div>
      </div>

      {/* Today's tasks by assignee */}
      <div className="glass-panel rounded-2xl p-5 border border-white/5">
        <div className="flex items-center gap-3 mb-4">
          <ListChecks size={20} className="text-indigo-400" />
          <h3 className="text-sm font-bold text-white uppercase tracking-widest">Список дел на сегодня</h3>
          <span className="text-[10px] text-slate-500 font-bold ml-auto">
            {Object.values(todayDone).filter(Boolean).length}/{todayItems.length}
          </span>
        </div>
        {todayItems.length === 0 ? (
          <p className="text-center text-slate-500 text-sm py-8">
            На сегодня ({DAY_NAMES[todayDayOfWeek - 1]}) нет запланированных задач. Добавьте задачу в сетке ниже.
          </p>
        ) : (
          <div className="space-y-4">
            {Object.entries(todayByAssignee).map(([assignee, tasks]) => (
              <div key={assignee}>
                <div className="flex items-center gap-2 mb-2">
                  <User size={14} className="text-indigo-400" />
                  <span className="text-xs font-bold text-indigo-300 uppercase tracking-widest">{assignee}</span>
                </div>
                <div className="space-y-1 ml-5">
                  {tasks.map(item => (
                    <button
                      key={item.id}
                      onClick={() => toggleToday(item.id)}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl border transition-all text-left ${
                        todayDone[`item-${item.id}`]
                          ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-300"
                          : "bg-white/5 border-white/10 text-slate-300 hover:text-white"
                      }`}
                    >
                      <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                        todayDone[`item-${item.id}`] ? "border-emerald-400 bg-emerald-500/20" : "border-white/20"
                      }`}>
                        {todayDone[`item-${item.id}`] && <Check size={12} className="text-emerald-400" />}
                      </span>
                      <span className={`text-sm ${todayDone[`item-${item.id}`] ? "line-through opacity-60" : ""}`}>{item.task_name}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Weekly grid */}
      <div className="glass-panel rounded-2xl overflow-hidden border border-white/5">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-black/40 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
              <th className="px-4 py-3 text-left min-w-[160px]">Задача</th>
              {weekDays.map(d => (
                <th key={d.day} className="px-3 py-3 text-center">{d.short}</th>
              ))}
              <th className="px-3 py-3 text-center w-16"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {taskNames.length === 0 ? (
              <tr>
                <td colSpan={9} className="text-center text-slate-500 py-12 text-sm">Нет задач. Добавьте первую задачу уборки.</td>
              </tr>
            ) : taskNames.map(taskName => {
              const taskItems = items.filter(i => i.task_name === taskName);
              return (
                <tr key={taskName} className="hover:bg-white/5 transition-colors">
                  <td className="px-4 py-3">
                    <span className="font-semibold text-white text-xs">{taskName}</span>
                  </td>
                  {weekDays.map(d => {
                    const item = taskItems.find(i => i.day_of_week === d.day);
                    return (
                      <td key={d.day} className="px-3 py-3 text-center">
                        {item ? (
                          <div className="inline-flex items-center gap-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-lg px-2.5 py-1.5 cursor-pointer hover:bg-indigo-500/20 transition-all" onClick={() => startEdit(item)}>
                            <User size={10} className="text-indigo-400" />
                            <span className="text-[10px] font-bold text-indigo-300">{item.assignee || "—"}</span>
                          </div>
                        ) : (
                          <button onClick={() => { setEditItem(null); setForm({ task_name: taskName, day_of_week: d.day, assignee: "", notes: "" }); setShowForm(true); }} className="text-slate-600 hover:text-slate-400 transition-colors p-1">
                            <Plus size={14} />
                          </button>
                        )}
                      </td>
                    );
                  })}
                  <td className="px-3 py-3 text-center">
                    {taskItems.map(item => (
                      <button key={item.id} onClick={() => handleDelete(item.id)} className="text-red-400 hover:text-red-300 opacity-0 group-hover:opacity-100 transition-opacity p-1"><Trash2 size={14} /></button>
                    ))}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CleaningSchedule;
