import { useEffect, useState, type FormEvent } from "react";
import { X } from "lucide-react";
import { SUPPLIERS, workApi, type WorkFitting } from "../api/work";

const EMPTY_FORM: Partial<WorkFitting> = {
  code: "",
  name: "",
  supplier: "rondo",
  stock_fact: 0,
  stock_program: 0,
  last_delivery_qty: 0,
  order_qty: 0,
};

const inputClass =
  "w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500/50";

interface WorkFittingsTabProps {
  rows: WorkFitting[];
  onReload: () => Promise<void>;
}

export default function WorkFittingsTab({ rows, onReload }: WorkFittingsTabProps) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState("");

  async function add(e: FormEvent) {
    e.preventDefault();
    setError("");
    try {
      await workApi.addFitting(form);
      setForm(EMPTY_FORM);
      await onReload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка");
    }
  }

  return (
    <div className="space-y-6">
      <p className="text-sm text-slate-400">
        Одна позиция = один код из Инфо. Добавила сюда — она уже на складе. «Заказать сейчас» попадёт в заявку поставщику.
      </p>
      {error && <p className="text-sm text-red-400">{error}</p>}
      <form onSubmit={add} className="glass-panel rounded-2xl border border-white/5 p-5 grid gap-2 md:grid-cols-4">
        <input className={inputClass} placeholder="Код (Инфо)" value={form.code || ""} onChange={(e) => setForm({ ...form, code: e.target.value })} required />
        <input className={`${inputClass} md:col-span-2`} placeholder="Название как в программе" value={form.name || ""} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <select className={inputClass} value={form.supplier || "rondo"} onChange={(e) => setForm({ ...form, supplier: e.target.value })}>
          {SUPPLIERS.map((s) => (
            <option key={s.id} value={s.id}>{s.label}</option>
          ))}
        </select>
        <input className={inputClass} type="number" placeholder="Последний привоз" value={form.last_delivery_qty || ""} onChange={(e) => setForm({ ...form, last_delivery_qty: Number(e.target.value) || 0 })} />
        <input className={inputClass} type="number" placeholder="Заказать сейчас" value={form.order_qty || ""} onChange={(e) => setForm({ ...form, order_qty: Number(e.target.value) || 0 })} />
        <button type="submit" className="md:col-span-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2.5 rounded-xl transition-all text-sm">
          Добавить на склад
        </button>
      </form>
      <div className="glass-panel rounded-2xl overflow-hidden border border-white/5 overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead>
            <tr className="bg-black/40 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
              <th className="px-3 py-3">Код</th>
              <th className="px-3 py-3">Название</th>
              <th className="px-3 py-3">Поставщик</th>
              <th className="px-3 py-3">Факт</th>
              <th className="px-3 py-3">Программа</th>
              <th className="px-3 py-3">Последний привоз</th>
              <th className="px-3 py-3">Заказать</th>
              <th className="px-3 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {rows.map((row) => (
              <FittingRow key={row.id} row={row} onReload={onReload} onError={setError} />
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={8} className="px-3 py-6 text-center text-slate-500">
                  Пока пусто — добавь закончившуюся фурнитуру
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
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
    <tr className="hover:bg-white/5 transition-colors">
      <td className="px-3 py-2 font-mono text-xs text-slate-400">{row.code}</td>
      <td className="px-3 py-2">
        <input
          className={inputClass}
          value={local.name}
          onChange={(e) => setLocal({ ...local, name: e.target.value })}
          onBlur={() => {
            if (local.name !== row.name) void save({ name: local.name });
          }}
        />
      </td>
      <td className="px-3 py-2">
        <select
          className={inputClass}
          value={local.supplier}
          onChange={(e) => {
            const supplier = e.target.value;
            setLocal({ ...local, supplier });
            void save({ supplier });
          }}
        >
          {SUPPLIERS.map((s) => (
            <option key={s.id} value={s.id}>{s.label}</option>
          ))}
        </select>
      </td>
      <NumCell value={local.stock_fact} onChange={(v) => setLocal({ ...local, stock_fact: v })} onSave={() => save({ stock_fact: local.stock_fact })} />
      <NumCell value={local.stock_program} onChange={(v) => setLocal({ ...local, stock_program: v })} onSave={() => save({ stock_program: local.stock_program })} />
      <NumCell value={local.last_delivery_qty} onChange={(v) => setLocal({ ...local, last_delivery_qty: v })} onSave={() => save({ last_delivery_qty: local.last_delivery_qty })} />
      <NumCell value={local.order_qty} onChange={(v) => setLocal({ ...local, order_qty: v })} onSave={() => save({ order_qty: local.order_qty })} />
      <td className="px-3 py-2">
        <button
          className="text-red-400 hover:text-red-300 transition-colors p-1"
          onClick={async () => {
            await workApi.deleteFitting(row.id);
            await onReload();
          }}
        >
          <X size={14} />
        </button>
      </td>
    </tr>
  );
}

function NumCell({ value, onChange, onSave }: { value: number; onChange: (v: number) => void; onSave: () => void }) {
  return (
    <td className="px-3 py-2">
      <input className={`${inputClass} w-24`} type="number" value={value} onChange={(e) => onChange(Number(e.target.value) || 0)} onBlur={onSave} />
    </td>
  );
}
