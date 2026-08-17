import { SUPPLIERS, type WorkFitting } from "../api";
import { groupOrderRows } from "../orders";

export default function OrdersPage({ rows }: { rows: WorkFitting[] }) {
  const grouped = groupOrderRows(rows);
  return (
    <section>
      <h1 className="text-2xl font-semibold text-zinc-900">Заявки поставщикам</h1>
      <p className="mt-1 text-sm text-zinc-500">
        Собирается само из фурнитуры, где «Заказать» больше нуля. Печатай или диктуй по колонкам.
      </p>
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {SUPPLIERS.map((s) => {
          const items = grouped[s.id] || [];
          return (
            <article key={s.id} className="rounded-xl border border-zinc-200 bg-white p-4">
              <h2 className="font-semibold text-zinc-900">{s.label}</h2>
              <p className="text-xs text-zinc-500">{items.length} позиций</p>
              <ul className="mt-3 space-y-2">
                {items.map((item) => (
                  <li key={item.id} className="border-b border-zinc-100 pb-2 text-sm last:border-0">
                    <span className="font-mono text-xs text-zinc-500">{item.code}</span>
                    <p className="text-zinc-800">{item.name || "без названия"}</p>
                    <p className="text-zinc-600">
                      заказать <b>{item.order_qty}</b>
                      {item.last_delivery_qty ? ` · последний привоз ${item.last_delivery_qty}` : ""}
                    </p>
                  </li>
                ))}
                {items.length === 0 && <p className="text-sm text-zinc-400">Нечего заказывать</p>}
              </ul>
            </article>
          );
        })}
      </div>
    </section>
  );
}
