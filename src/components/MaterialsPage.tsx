import React, { useState, useEffect } from "react";
import { Package, Plus, Trash2, Edit3, ChevronDown, ChevronUp, ClipboardList, BarChart, BookOpen } from "lucide-react";
import { fetchMaterials, createMaterial, updateMaterial, deleteMaterial, consumeMaterial, fetchConsumption, Material, MaterialConsumption } from "../api/materials";
import { fetchOrders, Order } from "../api/orders";

const MaterialsPage: React.FC = () => {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState({ name: "", total_qty: "", unit: "лист", notes: "" });
  const [expandId, setExpandId] = useState<number | null>(null);
  const [consumption, setConsumption] = useState<Record<number, MaterialConsumption[]>>({});
  const [consumeForm, setConsumeForm] = useState<Record<number, { qty: string; order_id: string }>>({});

  const SEED_MATERIALS: Material[] = [
    { id: 1, name: "ЛДСП Egger — Дуб Кантри натуральный", total_qty: 25, unit: "лист", used_qty: 8, notes: "16мм, 2800×2070", created_at: "2026-06-01", updated_at: "2026-06-10" },
    { id: 2, name: "ЛДСП Egger — Белый монохром", total_qty: 18, unit: "лист", used_qty: 5, notes: "16мм, 2800×2070", created_at: "2026-06-01", updated_at: "2026-06-10" },
    { id: 3, name: "ЛДСП Kronospan — Серый графит", total_qty: 12, unit: "лист", used_qty: 3, notes: "18мм, 2800×2070", created_at: "2026-06-01", updated_at: "2026-06-10" },
    { id: 4, name: "Кромка ПВХ Rehau 2мм — Белый", total_qty: 200, unit: "м", used_qty: 74, notes: "Кромкование торцов столешниц", created_at: "2026-06-01", updated_at: "2026-06-10" },
    { id: 5, name: "Кромка ПВХ Rehau 0.4мм — Дуб Кантри", total_qty: 350, unit: "м", used_qty: 120, notes: "Кромкование ЛДСП", created_at: "2026-06-01", updated_at: "2026-06-10" },
    { id: 6, name: "Петли Blum Clip-Top 110°", total_qty: 80, unit: "шт", used_qty: 32, notes: "Накладные, с пружиной", created_at: "2026-06-01", updated_at: "2026-06-10" },
    { id: 7, name: "Направляющие Blum Tandem 550мм", total_qty: 40, unit: "шт", used_qty: 14, notes: "Выдвижные ящики, полное выдвижение", created_at: "2026-06-01", updated_at: "2026-06-10" },
  ];

  const load = async () => {
    try {
      const [mat, ord] = await Promise.all([
        fetchMaterials(),
        fetchOrders().catch(() => [] as Order[]),
      ]);
      if (Array.isArray(mat) && mat.length > 0) {
        setMaterials(mat);
      } else {
        setMaterials(SEED_MATERIALS);
      }
      setOrders(Array.isArray(ord) ? ord : []);
    } catch {
      setMaterials(SEED_MATERIALS);
    }
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    const data = { name: form.name, total_qty: parseFloat(form.total_qty) || 0, unit: form.unit, notes: form.notes };
    if (editId) {
      await updateMaterial(editId, data);
    } else {
      await createMaterial(data);
    }
    setForm({ name: "", total_qty: "", unit: "лист", notes: "" });
    setEditId(null);
    setShowForm(false);
    load();
  };

  const startEdit = (m: Material) => {
    setEditId(m.id);
    setForm({ name: m.name, total_qty: String(m.total_qty), unit: m.unit, notes: m.notes });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Удалить материал?")) return;
    await deleteMaterial(id);
    load();
  };

  const toggleExpand = async (id: number) => {
    if (expandId === id) {
      setExpandId(null);
      return;
    }
    setExpandId(id);
    if (!consumption[id]) {
      try {
        const c = await fetchConsumption(id);
        setConsumption(prev => ({ ...prev, [id]: c }));
      } catch {}
    }
  };

  const handleConsume = async (materialId: number) => {
    const cf = consumeForm[materialId];
    if (!cf || !cf.qty) return;
    const qty = parseFloat(cf.qty);
    if (!qty) return;
    await consumeMaterial(materialId, qty, cf.order_id ? parseInt(cf.order_id) : undefined);
    setConsumeForm(prev => ({ ...prev, [materialId]: { qty: "", order_id: "" } }));
    load();
    if (expandId === materialId) {
      const c = await fetchConsumption(materialId);
      setConsumption(prev => ({ ...prev, [materialId]: c }));
    }
  };

  const remaining = (m: Material) => Math.max(0, m.total_qty - m.used_qty);
  const usagePercent = (m: Material) => m.total_qty > 0 ? Math.min(100, Math.round((m.used_qty / m.total_qty) * 100)) : 0;

  return (
    <div className="max-w-6xl mx-auto fade-in space-y-6">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight">Материалы (ЛДСП)</h2>
          <p className="text-slate-400 text-sm mt-1">Учёт листового материала — поступление и расход</p>
        </div>
        <button onClick={() => { setEditId(null); setForm({ name: "", total_qty: "", unit: "лист", notes: "" }); setShowForm(!showForm); }} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all">
          <Plus size={16} /> Добавить материал
        </button>
      </div>

      {showForm && (
        <div className="glass-panel rounded-2xl p-5 border border-indigo-500/30 space-y-4">
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid grid-cols-4 gap-3">
              <div className="col-span-2">
                <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Название</label>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="ЛДСП 16мм Дуб" required className="mt-1.5 w-full bg-black/30 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500/50" />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Количество</label>
                <input type="number" value={form.total_qty} onChange={e => setForm(f => ({ ...f, total_qty: e.target.value }))} placeholder="10" className="mt-1.5 w-full bg-black/30 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500/50" />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Ед. изм.</label>
                <select value={form.unit} onChange={e => setForm(f => ({ ...f, unit: e.target.value }))} className="mt-1.5 w-full bg-black/30 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500/50">
                  <option value="лист">лист</option>
                  <option value="м²">м²</option>
                  <option value="шт">шт</option>
                </select>
              </div>
              <div className="col-span-4">
                <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Примечание</label>
                <input value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} className="mt-1.5 w-full bg-black/30 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500/50" />
              </div>
            </div>
            <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2.5 rounded-xl transition-all text-sm">
              {editId ? "Сохранить" : "Добавить"}
            </button>
          </form>
        </div>
      )}

      {materials.length === 0 ? (
        <div className="text-center text-slate-500 py-16 text-sm">Нет материалов. Добавьте первый лист ЛДСП.</div>
      ) : (
        <>
          <div className="space-y-3">
            {materials.map(m => {
            const rem = remaining(m);
            const pct = usagePercent(m);
            return (
              <div key={m.id} className="glass-panel rounded-2xl border border-white/5 overflow-hidden">
                <div className="p-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
                        <Package size={18} />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-white">{m.name}</h3>
                        <p className="text-[10px] text-slate-500">{m.unit} · {m.notes || "—"}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="text-xs text-slate-400">Всего</p>
                        <p className="text-sm font-bold text-white">{m.total_qty}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-slate-400">Израсход.</p>
                        <p className="text-sm font-bold text-amber-400">{m.used_qty}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-slate-400">Остаток</p>
                        <p className={`text-sm font-bold ${rem < 2 ? "text-rose-400" : "text-emerald-400"}`}>{rem}</p>
                      </div>
                      <div className="flex gap-1">
                        <button onClick={() => startEdit(m)} className="p-2 text-slate-400 hover:text-white transition-colors"><Edit3 size={14} /></button>
                        <button onClick={() => handleDelete(m.id)} className="p-2 text-rose-400 hover:text-rose-300 transition-colors"><Trash2 size={14} /></button>
                        <button onClick={() => toggleExpand(m.id)} className="p-2 text-slate-400 hover:text-white transition-colors">
                          {expandId === m.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Usage bar */}
                  <div className="mt-3 w-full h-2 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: pct > 80 ? "#f43f5e" : pct > 50 ? "#f59e0b" : "#34d399" }} />
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">{pct}% использовано</p>
                </div>

                {/* Expanded: consumption log + add consumption */}
                {expandId === m.id && (
                  <div className="border-t border-white/5 p-4 bg-black/20 space-y-4">
                    {/* Add consumption */}
                    <div className="flex items-end gap-3">
                      <div>
                        <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Списать</label>
                        <input type="number" value={consumeForm[m.id]?.qty || ""} onChange={e => setConsumeForm(prev => ({ ...prev, [m.id]: { ...prev[m.id], qty: e.target.value, order_id: prev[m.id]?.order_id || "" } }))} placeholder="Кол-во" className="mt-1 w-24 bg-black/30 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500/50" />
                      </div>
                      <div>
                        <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Заказ №</label>
                        <select value={consumeForm[m.id]?.order_id || ""} onChange={e => setConsumeForm(prev => ({ ...prev, [m.id]: { ...prev[m.id], order_id: e.target.value, qty: prev[m.id]?.qty || "" } }))} className="mt-1 w-32 bg-black/30 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500/50">
                          <option value="">—</option>
                          {orders.filter(o => o.status !== "выдан").map(o => (
                            <option key={o.id} value={o.id}>#{String(o.id).slice(-4)} {o.client_name}</option>
                          ))}
                        </select>
                      </div>
                      <button onClick={() => handleConsume(m.id)} className="bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 px-3 py-2 rounded-xl text-xs font-bold transition-all">Списать</button>
                    </div>

                    {/* Consumption history */}
                    <div>
                      <h4 className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-2">История расхода</h4>
                      {(!consumption[m.id] || consumption[m.id].length === 0) ? (
                        <p className="text-xs text-slate-500">Нет записей</p>
                      ) : (
                        <div className="space-y-1.5">
                          {consumption[m.id].map(c => {
                            const order = orders.find(o => o.id === c.order_id);
                            return (
                              <div key={c.id} className="flex items-center justify-between py-1.5 px-3 rounded-lg bg-white/5 text-xs">
                                <div className="flex items-center gap-3">
                                  <span className="text-red-400 font-bold">-{c.qty} {m.unit}</span>
                                  {order && <span className="text-slate-400">#{String(order.id).slice(-4)} {order.client_name}</span>}
                                  {c.notes && <span className="text-slate-500">{c.notes}</span>}
                                </div>
                                <span className="text-slate-500 text-[10px]">{new Date(c.created_at).toLocaleString("ru-RU")}</span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Справочник декоров ЛДСП */}
        <details className="glass-panel rounded-2xl border border-sky-500/20 group">
          <summary className="flex items-center gap-3 px-5 py-4 cursor-pointer hover:bg-white/[0.02] transition-all list-none">
            <BookOpen size={16} className="text-sky-400" />
            <span className="text-xs font-bold text-sky-300 uppercase tracking-widest">Справочник декоров ЛДСП Egger</span>
            <ChevronDown size={14} className="text-slate-500 ml-auto group-open:rotate-180 transition-transform" />
          </summary>
          <div className="px-5 pb-5">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-slate-300">
                <thead>
                  <tr className="text-[10px] uppercase tracking-widest text-slate-500 font-bold border-b border-white/10">
                    <th className="text-left py-2 pr-4">Декор</th>
                    <th className="text-left py-2 pr-4">Формат</th>
                    <th className="text-left py-2 pr-4">Цена листа</th>
                    <th className="text-left py-2">Код</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  <tr><td className="py-2 pr-4">Дуб Сонома</td><td className="py-2 pr-4">2800×2070×16</td><td className="py-2 pr-4">2 650 ₽</td><td className="py-2">EG-101</td></tr>
                  <tr><td className="py-2 pr-4">Дуб Молочный</td><td className="py-2 pr-4">2800×2070×16</td><td className="py-2 pr-4">2 650 ₽</td><td className="py-2">EG-102</td></tr>
                  <tr><td className="py-2 pr-4">Ясень Шимо</td><td className="py-2 pr-4">2800×2070×16</td><td className="py-2 pr-4">2 850 ₽</td><td className="py-2">EG-201</td></tr>
                  <tr><td className="py-2 pr-4">Белый</td><td className="py-2 pr-4">2800×2070×16</td><td className="py-2 pr-4">2 450 ₽</td><td className="py-2">EG-001</td></tr>
                  <tr><td className="py-2 pr-4">Чёрный</td><td className="py-2 pr-4">2800×2070×16</td><td className="py-2 pr-4">2 450 ₽</td><td className="py-2">EG-002</td></tr>
                  <tr><td className="py-2 pr-4">Дуб Наварра</td><td className="py-2 pr-4">2800×2070×16</td><td className="py-2 pr-4">2 750 ₽</td><td className="py-2">EG-103</td></tr>
                </tbody>
              </table>
            </div>
            <p className="text-[10px] text-slate-500 mt-3">* Цены ориентировочные, уточняйте у поставщика.</p>
          </div>
        </details>
        </>
      )}
    </div>
  );
};

export default MaterialsPage;
