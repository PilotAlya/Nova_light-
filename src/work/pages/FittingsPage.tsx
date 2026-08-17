import { useEffect, useState, type FormEvent } from "react";
import { SUPPLIERS, workApi, type WorkFitting } from "../api";

const empty: Partial<WorkFitting> = {
  code: "",
  name: "",
  supplier: "rondo",
  stock_fact: 0,
  stock_program: 0,
  last_delivery_qty: 0,
  order_qty: 0,
};

export default function FittingsPage({
  rows,
  onReload,
}: {
  rows: WorkFitting[];
  onReload: () => Promise<void>;
}) {
  const [form, setForm] = useState(empty);
  const [error, setError] = useState("");

  async function add(e: FormEvent) {
    e.preventDefault();
    setError("");
    try {
      await workApi.addFitting(form);
      setForm(empty);
      await onReload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка");
    }
  }

  return (
    <section>
      <h1 className="text-2xl font-semibold text-zinc-900">Фурнитура / склад</h1>
      <p className="mt-1 text-sm text-zinc-500">
        Одна позиция = один код из Инфо. Добавила сюда — она уже на складе. «Заказать сейчас» попадёт в заявку поставщику.
        Количество бери из Инфо → Отчёты → Количественно-сумовой → галочка «Розница».
      </p>
      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      <form onSubmit={add} className="mt-6 grid gap-2 rounded-xl border border-zinc-200 bg-white p-4 md:grid-cols-4">
        <input
          className="work-input"
          placeholder="Код (Инфо)"
          value={form.code || ""}
          onChange={(e) => setForm({ ...form, code: e.target.value })}
          required
        />
        <input
          className="work-input md:col-span-2"
          placeholder="Название как в программе"
          value={form.name || ""}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <select
          className="work-input"
          value={form.supplier || "rondo"}
          onChange={(e) => setForm({ ...form, supplier: e.target.value })}
        >
          {SUPPLIERS.map((s) => (
            <option key={s.id} value={s.id}>
              {s.label}
            </option>
          ))}
        </select>
        <input
          className="work-input"
          type="number"
          placeholder="Последний привоз"
          value={form.last_delivery_qty || ""}
          onChange={(e) => setForm({ ...form, last_delivery_qty: Number(e.target.value) || 0 })}
        />
        <input
          className="work-input"
          type="number"
          placeholder="Заказать сейчас"
          value={form.order_qty || ""}
          onChange={(e) => setForm({ ...form, order_qty: Number(e.target.value) || 0 })}
        />
        <button type="submit" className="work-btn md:col-span-2">
          Добавить на склад
        </button>
      </form>
      <div className="mt-6 overflow-x-auto rounded-xl border border-zinc-200 bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-zinc-50 text-xs uppercase text-zinc-500">
            <tr>
              <th className="px-3 py-2">Код</th>
              <th className="px-3 py-2">Название</th>
              <th className="px-3 py-2">Поставщик</th>
              <th className="px-3 py-2">Факт</th>
              <th className="px-3 py-2">Программа</th>
              <th className="px-3 py-2">Последний привоз</th>
              <th className="px-3 py-2">Заказать</th>
              <th className="px-3 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <FittingRow key={row.id} row={row} onReload={onReload} onError={setError} />
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={8} className="px-3 py-6 text-center text-zinc-500">
                  Пока пусто — добавь закончившуюся фурнитуру
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function FittingRow({
  row,
  onReload,
  onError,
}: {
  row: WorkFitting;
  onReload: () => Promise<void>;
  onError: (msg: string) => void;
}) {
  const [local, setLocal] = useState(row);
  useEffect(() => {
    setLocal(row);
  }, [row]);

  async function save(patch: Partial<WorkFitting>) {
    onError("");
    try {
      await workApi.saveFitting(row.id, { ...local, ...patch });
      await onReload();
    } catch (err) {
      onError(err instanceof Error ? err.message : "Ошибка");
    }
  }

  return (
    <tr className="border-t border-zinc-100">
      <td className="px-3 py-2 font-mono text-xs">{row.code}</td>
      <td className="px-3 py-2">
        <input
          className="work-input"
          value={local.name}
          onChange={(e) => setLocal({ ...local, name: e.target.value })}
          onBlur={() => {
            if (local.name !== row.name) void save({ name: local.name });
          }}
        />
      </td>
      <td className="px-3 py-2">
        <select
          className="work-input"
          value={local.supplier}
          onChange={(e) => {
            const supplier = e.target.value;
            setLocal({ ...local, supplier });
            void save({ supplier });
          }}
        >
          {SUPPLIERS.map((s) => (
            <option key={s.id} value={s.id}>
              {s.label}
            </option>
          ))}
        </select>
      </td>
      <NumCell
        value={local.stock_fact}
        onChange={(v) => setLocal({ ...local, stock_fact: v })}
        onSave={() => save({ stock_fact: local.stock_fact })}
      />
      <NumCell
        value={local.stock_program}
        onChange={(v) => setLocal({ ...local, stock_program: v })}
        onSave={() => save({ stock_program: local.stock_program })}
      />
      <NumCell
        value={local.last_delivery_qty}
        onChange={(v) => setLocal({ ...local, last_delivery_qty: v })}
        onSave={() => save({ last_delivery_qty: local.last_delivery_qty })}
      />
      <NumCell
        value={local.order_qty}
        onChange={(v) => setLocal({ ...local, order_qty: v })}
        onSave={() => save({ order_qty: local.order_qty })}
      />
      <td className="px-3 py-2">
        <button
          className="text-red-600"
          onClick={async () => {
            await workApi.deleteFitting(row.id);
            await onReload();
          }}
        >
          ×
        </button>
      </td>
    </tr>
  );
}

function NumCell({
  value,
  onChange,
  onSave,
}: {
  value: number;
  onChange: (v: number) => void;
  onSave: () => void;
}) {
  return (
    <td className="px-3 py-2">
      <input
        className="work-input w-24"
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value) || 0)}
        onBlur={onSave}
      />
    </td>
  );
}
