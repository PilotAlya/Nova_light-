import type { ChangeEvent, FormEvent, ReactNode } from "react";
import { useEffect, useState } from "react";
import { workApi, type WorkCash, type WorkDay } from "../api";

export default function CashPage({
  date,
  day,
  onReload,
}: {
  date: string;
  day: WorkDay;
  onReload: () => Promise<void>;
}) {
  const [form, setForm] = useState<WorkCash>(day.cash);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    setForm(day.cash);
  }, [day.cash]);

  const expected = (Number(form.cash_start) || 0) + (Number(form.cash_in) || 0) - (Number(form.expense_other) || 0);
  const matches = Number(form.cash_end_fact) === Number(form.cash_in_program);

  async function save(e: FormEvent) {
    e.preventDefault();
    setError("");
    setStatus("Сохраняю…");
    try {
      await workApi.saveCash({
        date,
        cash_start: Number(form.cash_start) || 0,
        cash_in: Number(form.cash_in) || 0,
        acquiring_in: Number(form.acquiring_in) || 0,
        expense_other: Number(form.expense_other) || 0,
        expense_other_note: form.expense_other_note,
        cash_end_fact: Number(form.cash_end_fact) || 0,
        cash_in_program: Number(form.cash_in_program) || 0,
        receipts_to_accountant: Boolean(form.receipts_to_accountant),
        comment: form.comment,
      });
      await onReload();
      setStatus("Сохранено");
    } catch (err) {
      setStatus("");
      setError(err instanceof Error ? err.message : "Ошибка");
    }
  }

  function num(key: keyof WorkCash) {
    return {
      value: String(form[key] ?? ""),
      onChange: (e: ChangeEvent<HTMLInputElement>) =>
        setForm({ ...form, [key]: e.target.value === "" ? 0 : Number(e.target.value) }),
    };
  }

  return (
    <section>
      <h1 className="text-2xl font-semibold text-zinc-900">Касса</h1>
      <p className="mt-1 text-sm text-zinc-500">Наличка, эквайринг, расход прочее. Грузчик — отдельная вкладка.</p>
      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      <form onSubmit={save} className="mt-6 grid max-w-xl gap-4">
        <Field label="Наличка на начало">
          <input type="number" step="0.01" className="work-input" {...num("cash_start")} />
        </Field>
        <Field label="Приход нал">
          <input type="number" step="0.01" className="work-input" {...num("cash_in")} />
        </Field>
        <Field label="Приход эквайринг (сверка)">
          <input type="number" step="0.01" className="work-input" {...num("acquiring_in")} />
        </Field>
        <Field label="Расход прочее">
          <input type="number" step="0.01" className="work-input" {...num("expense_other")} />
        </Field>
        <Field label="Описание расхода прочее">
          <input
            className="work-input"
            value={form.expense_other_note || ""}
            onChange={(e) => setForm({ ...form, expense_other_note: e.target.value })}
          />
        </Field>
        <Field label="Наличка на конец (факт, пересчёт)">
          <input type="number" step="0.01" className="work-input" {...num("cash_end_fact")} />
        </Field>
        <Field label="Наличка в программе">
          <input type="number" step="0.01" className="work-input" {...num("cash_in_program")} />
        </Field>
        <p className="text-sm text-zinc-600">
          Ожидаемый остаток нал (начало + приход − расход прочее): <b>{expected}</b>
          {" · "}
          Факт vs программа:{" "}
          <b className={matches ? "text-emerald-700" : "text-amber-700"}>{matches ? "сходится" : "не сходится"}</b>
        </p>
        <label className="flex items-center gap-2 text-sm text-zinc-800">
          <input
            type="checkbox"
            checked={Boolean(form.receipts_to_accountant)}
            onChange={(e) => setForm({ ...form, receipts_to_accountant: e.target.checked })}
          />
          Чеки отданы бухгалтеру
        </label>
        <Field label="Комментарий">
          <input
            className="work-input"
            value={form.comment || ""}
            onChange={(e) => setForm({ ...form, comment: e.target.value })}
          />
        </Field>
        <button type="submit" className="work-btn">
          Сохранить кассу
        </button>
        {status && <p className="text-sm text-emerald-700">{status}</p>}
      </form>
    </section>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-zinc-500">{label}</span>
      {children}
    </label>
  );
}
