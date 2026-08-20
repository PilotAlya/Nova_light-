import { useCallback, useEffect, useState, type ReactNode } from "react";
import { ClipboardCheck, Truck, Wrench } from "lucide-react";
import { workApi, type WorkDay, type WorkFitting } from "../api/work";
import WorkTodayTab from "./WorkTodayTab";
import WorkLoadersTab from "./WorkLoadersTab";
import WorkFittingsTab from "./WorkFittingsTab";

function todayIso(): string {
  const d = new Date();
  const z = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${z(d.getMonth() + 1)}-${z(d.getDate())}`;
}

type SubTab = "today" | "loaders" | "fittings";

const SUB_TABS: { id: SubTab; label: string; icon: ReactNode }[] = [
  { id: "today", label: "Сегодня", icon: <ClipboardCheck size={14} /> },
  { id: "loaders", label: "Грузчики", icon: <Truck size={14} /> },
  { id: "fittings", label: "Фурнитура", icon: <Wrench size={14} /> },
];

export default function WorkDeskPage() {
  const [date, setDate] = useState(todayIso);
  const [subTab, setSubTab] = useState<SubTab>("today");
  const [day, setDay] = useState<WorkDay | null>(null);
  const [fittings, setFittings] = useState<WorkFitting[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setError("");
    try {
      const [d, f] = await Promise.all([workApi.day(date), workApi.fittings()]);
      setDay(d);
      setFittings(f);
    } catch (e) {
      setDay(null);
      setError(e instanceof Error ? `${e.message}. Запусти бэкенд: cd backend && npm run dev (порт 3002).` : "Нет связи с сервером");
    } finally {
      setLoading(false);
    }
  }, [date]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="max-w-5xl mx-auto fade-in space-y-6">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight">Рабочий стол</h2>
          <p className="text-slate-400 text-sm mt-1">Чеклист смены, грузчики, фурнитура на складе</p>
        </div>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="bg-black/30 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500/50"
        />
      </div>

      {error && (
        <div className="glass-panel rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</div>
      )}

      <div className="flex gap-2 border-b border-white/10 pb-3">
        {SUB_TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setSubTab(t.id)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              subTab === t.id ? "bg-indigo-500/20 text-indigo-300" : "text-slate-400 hover:text-white"
            }`}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center text-slate-500 py-16">Загрузка...</div>
      ) : day ? (
        <>
          {subTab === "today" && <WorkTodayTab date={date} day={day} onReload={load} />}
          {subTab === "loaders" && <WorkLoadersTab date={date} day={day} onReload={load} />}
          {subTab === "fittings" && <WorkFittingsTab rows={fittings} onReload={load} />}
        </>
      ) : null}
    </div>
  );
}
