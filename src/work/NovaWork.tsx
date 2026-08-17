import { useCallback, useEffect, useState } from "react";
import { workApi, type WorkDay, type WorkFitting } from "./api";
import { todayIso } from "./format";
import TodayPage from "./pages/TodayPage";
import CashPage from "./pages/CashPage";
import LoadersPage from "./pages/LoadersPage";
import FittingsPage from "./pages/FittingsPage";
import OrdersPage from "./pages/OrdersPage";
import "./work.css";

type Tab = "today" | "cash" | "loaders" | "fittings" | "orders";

const TABS: { id: Tab; label: string }[] = [
  { id: "today", label: "Сегодня" },
  { id: "cash", label: "Касса" },
  { id: "loaders", label: "Грузчики" },
  { id: "fittings", label: "Фурнитура" },
  { id: "orders", label: "Заявки" },
];

export default function NovaWork() {
  const [date, setDate] = useState(todayIso);
  const [tab, setTab] = useState<Tab>("today");
  const [day, setDay] = useState<WorkDay | null>(null);
  const [fittings, setFittings] = useState<WorkFitting[]>([]);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setError("");
    try {
      const [d, f] = await Promise.all([workApi.day(date), workApi.fittings()]);
      setDay(d);
      setFittings(f);
    } catch (e) {
      setDay(null);
      setError(
        e instanceof Error
          ? `${e.message}. Запусти бэкенд: cd backend && npm run dev (порт 3002).`
          : "Нет связи с сервером",
      );
    }
  }, [date]);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", "light");
    document.body.classList.add("work-body");
    return () => {
      document.body.classList.remove("work-body");
    };
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="work-root">
      <header className="work-header">
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-sky-700">Nova 2.0</p>
          <h1 className="text-lg font-semibold text-zinc-900">Рэлан — рабочий стол</h1>
        </div>
        <label className="text-sm text-zinc-600">
          Дата{" "}
          <input
            type="date"
            className="work-input ml-2 inline-block w-auto"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </label>
      </header>
      <nav className="work-nav">
        {TABS.map((t) => (
          <button
            key={t.id}
            className={tab === t.id ? "work-tab work-tab-active" : "work-tab"}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </nav>
      <main className="work-main">
        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div>
        )}
        {day && tab === "today" && <TodayPage date={date} day={day} onReload={load} />}
        {day && tab === "cash" && <CashPage date={date} day={day} onReload={load} />}
        {day && tab === "loaders" && <LoadersPage date={date} day={day} onReload={load} />}
        {tab === "fittings" && <FittingsPage rows={fittings} onReload={load} />}
        {tab === "orders" && <OrdersPage rows={fittings} />}
      </main>
    </div>
  );
}
