import { useState, type FormEvent } from "react";
import { Trash2 } from "lucide-react";
import { workApi, type WorkDay } from "../api/work";

function isDone(v: number | boolean): boolean {
  return v === true || v === 1;
}

function money(n: number): string {
  return new Intl.NumberFormat("ru-RU", { minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(n || 0);
}

interface WorkLoadersTabProps {
  date: string;
  day: WorkDay;
  onReload: () => Promise<void>;
}

const EMPTY_FORM = { order_title: "", amount: 0, loader_name: "", signed: false, money_from: "касса", comment: "" };

export default function WorkLoadersTab({ date, day, onReload }: WorkLoadersTabProps) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState("");

  async function add(e: FormEvent) {
    e.preventDefault();
    setError("");
    try {
      await workApi.addLoader({ date, ...form, amount: Number(form.amount) || 0 });
      setForm(EMPTY_FORM);
      await onReload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка");
    }
  }

  const inputClass =
    "w-full bg-black/30 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500/50";

  return (
    <div className="space-y-6">
      {error && <p className="text-sm text-red-400">{error}</p>}
      <form onSubmit={add} className="glass-panel rounded-2xl border border-white/5 p-5 grid gap-3 max-w-xl">
        <input className={inputClass} placeholder="Заказ / что привезли" value={form.order_title} onChange={(e) => setForm({ ...form, order_title: e.target.value })} required />
        <input className={inputClass} type="number" step="0.01" placeholder="Сумма" value={form.amount || ""} onChange={(e) => setForm({ ...form, amount: Number(e.target.value) || 0 })} />
        <input className={inputClass} placeholder="Грузчик (ФИО)" value={form.loader_name} onChange={(e) => setForm({ ...form, loader_name: e.target.value })} />
        <input className={inputClass} placeholder="Откуда деньги" value={form.money_from} onChange={(e) => setForm({ ...form, money_from: e.target.value })} />
        <label className="flex items-center gap-2 text-sm text-slate-300">
          <input type="checkbox" className="accent-indigo-500" checked={form.signed} onChange={(e) => setForm({ ...form, signed: e.target.checked })} />
          Подпись получена
        </label>
        <button type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2.5 rounded-xl transition-all text-sm">
          Добавить
        </button>
      </form>
      <ul className="space-y-2">
        {day.loaders.map((row) => (
          <li key={row.id} className="glass-panel flex items-center justify-between rounded-xl border border-white/5 px-4 py-3">
            <div>
              <p className="font-bold text-white text-sm">{row.order_title}</p>
              <p className="text-xs text-slate-400 mt-0.5">
                {row.loader_name || "—"} · {money(row.amount)} ₽ · {row.money_from}
                {isDone(row.signed) ? " · подпись есть" : " · без подписи"}
              </p>
            </div>
            <button
              className="text-red-400 hover:text-red-300 transition-colors p-1"
              onClick={async () => {
                await workApi.deleteLoader(row.id);
                await onReload();
              }}
            >
              <Trash2 size={14} />
            </button>
          </li>
        ))}
        {day.loaders.length === 0 && <p className="text-sm text-slate-500 py-4 text-center">Пока пусто</p>}
      </ul>
    </div>
  );
}
