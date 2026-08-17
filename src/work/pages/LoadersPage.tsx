import { useState, type FormEvent } from "react";
import { workApi, type WorkDay } from "../api";
import { isDone, money } from "../format";

export default function LoadersPage({
  date,
  day,
  onReload,
}: {
  date: string;
  day: WorkDay;
  onReload: () => Promise<void>;
}) {
  const empty = { order_title: "", amount: 0, loader_name: "", signed: false, money_from: "касса", comment: "" };
  const [form, setForm] = useState(empty);
  const [error, setError] = useState("");

  async function add(e: FormEvent) {
    e.preventDefault();
    setError("");
    try {
      await workApi.addLoader({ date, ...form, amount: Number(form.amount) || 0 });
      setForm(empty);
      await onReload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка");
    }
  }

  return (
    <section>
      <h1 className="text-2xl font-semibold text-zinc-900">Грузчики</h1>
      <p className="mt-1 text-sm text-zinc-500">Как тетрадь: заказ, сумма, кто расписался.</p>
      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      <form onSubmit={add} className="mt-6 grid max-w-xl gap-3 rounded-xl border border-zinc-200 bg-white p-4">
        <input
          className="work-input"
          placeholder="Заказ / что привезли"
          value={form.order_title}
          onChange={(e) => setForm({ ...form, order_title: e.target.value })}
          required
        />
        <input
          className="work-input"
          type="number"
          step="0.01"
          placeholder="Сумма"
          value={form.amount || ""}
          onChange={(e) => setForm({ ...form, amount: Number(e.target.value) || 0 })}
        />
        <input
          className="work-input"
          placeholder="Грузчик (ФИО)"
          value={form.loader_name}
          onChange={(e) => setForm({ ...form, loader_name: e.target.value })}
        />
        <input
          className="work-input"
          placeholder="Откуда деньги"
          value={form.money_from}
          onChange={(e) => setForm({ ...form, money_from: e.target.value })}
        />
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.signed}
            onChange={(e) => setForm({ ...form, signed: e.target.checked })}
          />
          Подпись получена
        </label>
        <button type="submit" className="work-btn">
          Добавить
        </button>
      </form>
      <ul className="mt-6 space-y-2">
        {day.loaders.map((row) => (
          <li key={row.id} className="flex items-center justify-between rounded-xl border border-zinc-200 bg-white px-4 py-3">
            <div>
              <p className="font-medium text-zinc-900">{row.order_title}</p>
              <p className="text-sm text-zinc-500">
                {row.loader_name || "—"} · {money(row.amount)} ₽ · {row.money_from}
                {isDone(row.signed) ? " · подпись есть" : " · без подписи"}
              </p>
            </div>
            <button
              className="text-sm text-red-600"
              onClick={async () => {
                await workApi.deleteLoader(row.id);
                await onReload();
              }}
            >
              Удалить
            </button>
          </li>
        ))}
        {day.loaders.length === 0 && <p className="text-sm text-zinc-500">Пока пусто</p>}
      </ul>
    </section>
  );
}
