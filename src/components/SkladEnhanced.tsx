import React, { useState, useEffect, useRef } from 'react';
import { Package, Plus, X, AlertTriangle, Minus, Edit3, Trash2, Check, Store, Factory } from 'lucide-react';
import { api } from "../api/client";

interface InventoryItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  minThreshold: number;
  notes?: string;
  supplier?: string;
}

type SkladType = "retail" | "workshop";

interface ToastMessage {
  id: number;
  text: string;
  type: "success" | "info" | "warning";
}

const retailDefaults: InventoryItem[] = [
  { id: "r1", name: "Ручка-скоба Партнер 128мм", category: "Ручки", quantity: 45, unit: "шт", minThreshold: 10, notes: "Хитовый товар", supplier: "Боярд" },
  { id: "r2", name: "Ручка-раковина Рондо 96мм", category: "Ручки", quantity: 30, unit: "шт", minThreshold: 8, supplier: "Боярд" },
  { id: "r3", name: "Петля мебельная 4-шарнирная", category: "Петли", quantity: 200, unit: "шт", minThreshold: 50, notes: "Универсальная", supplier: "GTV" },
  { id: "r4", name: "Петля Blum Clip Top 110°", category: "Петли", quantity: 60, unit: "шт", minThreshold: 15, notes: "Премиум", supplier: "Blum" },
  { id: "r5", name: "Опора регулируемая 100мм", category: "Опоры", quantity: 80, unit: "шт", minThreshold: 20, notes: "Хром", supplier: "Hettich" },
  { id: "r6", name: "Опора пластиковая 150мм", category: "Опоры", quantity: 50, unit: "шт", minThreshold: 15, supplier: "Hettich" },
  { id: "r7", name: "Направляющие Blum Tandembox", category: "Фурнитура", quantity: 15, unit: "компл", minThreshold: 5, supplier: "Blum" },
];

const workshopDefaults: InventoryItem[] = [
  { id: "w1", name: "ЛДСП Egger 16мм Белый", category: "ЛДСП", quantity: 12, unit: "листов", minThreshold: 3, notes: "Основной склад", supplier: "Egger" },
  { id: "w2", name: "ЛДСП Egger 16мм Дуб Наварра", category: "ЛДСП", quantity: 5, unit: "листов", minThreshold: 3, supplier: "Egger" },
  { id: "w3", name: "МДФ Эмаль Белый", category: "Фасады", quantity: 8, unit: "м²", minThreshold: 4, notes: "Заказ Иванова", supplier: "Крона" },
  { id: "w4", name: "МДФ Эмаль Графит", category: "Фасады", quantity: 3, unit: "м²", minThreshold: 4, notes: "Резерв LD-012", supplier: "Крона" },
  { id: "w5", name: "Кромка ПВХ 0.4мм Белая", category: "Кромка", quantity: 2, unit: "рулона", minThreshold: 1, supplier: "Rehau" },
  { id: "w6", name: "Кромка ПВХ 2.0мм Дуб", category: "Кромка", quantity: 1, unit: "рулона", minThreshold: 1, notes: "Под заказ", supplier: "Rehau" },
  { id: "w7", name: "Конфирматы 6.3x50", category: "Расходники", quantity: 500, unit: "шт", minThreshold: 100, supplier: "GTV" },
  { id: "w8", name: "Шканты 8x30", category: "Расходники", quantity: 200, unit: "шт", minThreshold: 50, supplier: "GTV" },
];

const categories: Record<SkladType, string[]> = {
  retail: ["Ручки", "Петли", "Опоры", "Фурнитура", "Другое"],
  workshop: ["ЛДСП", "Фасады", "Фурнитура", "Кромка", "Расходники", "Другое"],
};

function toApiItem(item: InventoryItem, zone: SkladType) {
  return { zone, name: item.name, category: item.category, unit: item.unit, quantity: item.quantity, supplier: item.supplier || null, note: item.notes || null, minThreshold: item.minThreshold };
}

function fromApiItem(a: any): InventoryItem {
  return { id: String(a.id), name: a.name, category: a.category || "", quantity: Number(a.quantity) || 0, unit: a.unit || "шт", minThreshold: Number(a.minThreshold) || 0, notes: a.note || "", supplier: a.supplier || "" };
}

const SkladEnhanced = () => {
  const mounted = useRef(false);
  const [skladType, setSkladType] = useState<SkladType>("retail");
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [backupItems, setBackupItems] = useState<Record<SkladType, InventoryItem[]>>({ retail: retailDefaults, workshop: workshopDefaults });
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("all");
  const [form, setForm] = useState({ name: "", category: "Ручки", quantity: 0, unit: "шт", minThreshold: 1, notes: "", supplier: "" });
  const [customCategory, setCustomCategory] = useState("");
  const [customUnit, setCustomUnit] = useState("");
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [detailItem, setDetailItem] = useState<InventoryItem | null>(null);

  const loadFromApi = async (zone: SkladType) => {
    try {
      const data: any[] = await api.get(`/inventory?zone=${zone}`);
      if (data && data.length > 0) {
        const mapped = data.map(fromApiItem);
        setBackupItems(prev => ({ ...prev, [zone]: mapped }));
        return mapped;
      }
    } catch {}
    return backupItems[zone];
  };

  useEffect(() => {
    mounted.current = true;
    (async () => {
      setLoading(true);
      const loaded = await loadFromApi(skladType);
      if (mounted.current) {
        setItems(loaded);
        setFilter("all");
        setLoading(false);
      }
    })();
    return () => { mounted.current = false; };
  }, [skladType]);

  const addToast = (text: string, type: ToastMessage["type"] = "info") => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, text, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 5000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    const finalCategory = form.category === "Другое" ? customCategory || "Другое" : form.category;
    const finalUnit = form.unit === "Другое" ? customUnit || "Другое" : form.unit;
    const apiItem = toApiItem({ ...form, id: "0", category: finalCategory, unit: finalUnit }, skladType);

    if (editingId) {
      try {
        const updated: any = await api.put(`/inventory/${editingId}`, apiItem);
        const mapped = fromApiItem(updated);
        setItems(prev => prev.map(i => i.id === editingId ? mapped : i));
        setBackupItems(prev => ({ ...prev, [skladType]: backupItems[skladType].map(i => i.id === editingId ? mapped : i) }));
      } catch {
        setItems(prev => prev.map(i => i.id === editingId ? { ...i, ...form, category: finalCategory, unit: finalUnit } : i));
      }
      setEditingId(null);
      addToast("✓ Товар обновлён", "success");
    } else {
      try {
        const created: any = await api.post("/inventory", apiItem);
        const mapped = fromApiItem(created);
        setItems(prev => [...prev, mapped]);
        setBackupItems(prev => ({ ...prev, [skladType]: [...prev[skladType], mapped] }));
      } catch {
        const fallback = { ...form, id: `${skladType === "retail" ? "r" : "w"}${Date.now()}`, category: finalCategory, unit: finalUnit };
        setItems(prev => [...prev, fallback]);
        setBackupItems(prev => ({ ...prev, [skladType]: [...prev[skladType], fallback] }));
      }
      addToast("✓ Товар добавлен", "success");
    }
    setForm({ name: "", category: "Ручки", quantity: 0, unit: "шт", minThreshold: 1, notes: "", supplier: "" });
    setShowForm(false);
  };

  const deleteItem = async (id: string) => {
    try {
      await api.del(`/inventory/${id}`);
    } catch {}
    setItems(prev => prev.filter(item => item.id !== id));
    setBackupItems(prev => ({ ...prev, [skladType]: prev[skladType].filter(i => i.id !== id) }));
    addToast("✓ Товар удалён", "success");
  };

  const startEdit = (item: InventoryItem) => {
    setForm({ name: item.name, category: item.category, quantity: item.quantity, unit: item.unit, minThreshold: item.minThreshold, notes: item.notes || "", supplier: item.supplier || "" });
    setEditingId(item.id);
    setShowForm(true);
  };

  const updateQuantity = async (id: string, delta: number) => {
    const item = items.find(i => i.id === id);
    if (!item) return;
    const newQty = Math.max(0, item.quantity + delta);
    setItems(prev => prev.map(i => i.id === id ? { ...i, quantity: newQty } : i));
    setBackupItems(prev => ({ ...prev, [skladType]: prev[skladType].map(i => i.id === id ? { ...i, quantity: newQty } : i) }));
    try {
      await api.put(`/inventory/${id}`, toApiItem({ ...item, quantity: newQty }, skladType));
    } catch {}
  };

  const filteredItems = filter === "all" ? items : items.filter(item => item.category === filter);
  const lowStockItems = filteredItems.filter(item => item.quantity <= item.minThreshold);

  return (
    <div className="max-w-7xl mx-auto fade-in">
      <div className="mb-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2 tracking-tight flex items-center gap-3">
              <Package size={32} className="text-indigo-400" />
              {skladType === "retail" ? "Фурнитура" : "Материалы"}
            </h2>
            <p className="text-slate-400">{skladType === "retail" ? "Розница и комплектующие" : "Основные материалы и расходники"}</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setSkladType("retail")}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${skladType === "retail" ? "bg-indigo-600 text-white" : "bg-white/5 text-slate-300 border border-white/10 hover:bg-white/10"}`}>
              <Store size={18} className="inline mr-2" /> Фурнитура
            </button>
            <button onClick={() => setSkladType("workshop")}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${skladType === "workshop" ? "bg-indigo-600 text-white" : "bg-white/5 text-slate-300 border border-white/10 hover:bg-white/10"}`}>
              <Factory size={18} className="inline mr-2" /> Материалы
            </button>
            <button onClick={() => setShowForm(!showForm)}
              className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition-all flex items-center gap-2">
              <Plus size={18} /> Добавить
            </button>
          </div>
        </div>

        {showForm && (
          <div className="mt-6 glass-panel rounded-2xl border border-white/10 p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <input type="text" placeholder="Название товара" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                  className="col-span-2 bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500" required />
                <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
                  className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-500">
                  {categories[skladType].map(cat => <option key={cat} value={cat} className="bg-slate-900">{cat}</option>)}
                </select>
                {form.category === "Другое" && (
                  <input type="text" placeholder="Своя категория" value={customCategory} onChange={e => setCustomCategory(e.target.value)}
                    className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500" />
                )}
                <input type="number" placeholder="Кол-во" value={form.quantity} onChange={e => setForm({ ...form, quantity: parseInt(e.target.value) || 0 })}
                  className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-500" min="0" />
                <select value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })}
                  className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-500">
                  <option value="шт" className="bg-slate-900">шт</option>
                  <option value="м²" className="bg-slate-900">м²</option>
                  <option value="м" className="bg-slate-900">м</option>
                  <option value="рулона" className="bg-slate-900">рулона</option>
                  <option value="компл" className="bg-slate-900">компл</option>
                  <option value="Другое" className="bg-slate-900">Другое</option>
                </select>
                <input type="number" placeholder="Мин. запас" value={form.minThreshold} onChange={e => setForm({ ...form, minThreshold: parseInt(e.target.value) || 1 })}
                  className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-500" min="1" />
                <input type="text" placeholder="Поставщик" value={form.supplier} onChange={e => setForm({ ...form, supplier: e.target.value })}
                  className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500" />
                <textarea placeholder="Примечания" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })}
                  className="col-span-2 bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500" rows={2} />
              </div>
              <div className="flex gap-2 justify-end">
                <button type="button" onClick={() => { setShowForm(false); setEditingId(null); }}
                  className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10">Отмена</button>
                <button type="submit" className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold flex items-center gap-2">
                  <Check size={18} /> {editingId ? "Обновить" : "Добавить"}
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="mt-6 flex flex-wrap gap-2">
          <button onClick={() => setFilter("all")}
            className={`px-4 py-2 rounded-lg font-semibold transition-all ${filter === "all" ? "bg-indigo-600 text-white" : "bg-white/5 text-slate-300 border border-white/10 hover:bg-white/10"}`}>
            Все ({filteredItems.length})
          </button>
          {[...new Set(items.map(item => item.category))].map(cat => (
            <button key={cat} onClick={() => setFilter(cat)}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${filter === cat ? "bg-indigo-600 text-white" : "bg-white/5 text-slate-300 border border-white/10 hover:bg-white/10"}`}>
              {cat} ({items.filter(i => i.category === cat).length})
            </button>
          ))}
        </div>

        {lowStockItems.length > 0 && (
          <div className="mt-6 glass-panel rounded-2xl border border-yellow-500/20 bg-yellow-500/10 p-4 flex gap-3">
            <AlertTriangle size={24} className="text-yellow-400 flex-shrink-0" />
            <div>
              <p className="text-yellow-300 font-semibold">⚠️ Низкие запасы</p>
              <p className="text-yellow-200/70 text-sm">{lowStockItems.map(item => item.name).join(", ")}</p>
            </div>
          </div>
        )}

        {loading ? (
          <div className="text-center py-16 text-slate-500">Загрузка...</div>
        ) : (
          <div className="mt-6 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 text-slate-500 text-xs uppercase tracking-wider">
                  <th className="text-left py-3 px-4">Название</th>
                  <th className="text-left py-3 px-4">Категория</th>
                  <th className="text-right py-3 px-4">Кол-во</th>
                  <th className="text-right py-3 px-4">Мин. запас</th>
                  <th className="text-left py-3 px-4">Поставщик</th>
                  <th className="text-right py-3 px-4"></th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map(item => (
                  <tr key={item.id}
                    onClick={() => setDetailItem(item)}
                    className="border-b border-white/5 hover:bg-white/[0.03] cursor-pointer transition-colors group">
                    <td className="py-3 px-4">
                      <span className="font-semibold text-white">{item.name}</span>
                      {item.notes && <span className="text-xs text-slate-500 ml-2">— {item.notes}</span>}
                    </td>
                    <td className="py-3 px-4 text-slate-400">{item.category}</td>
                    <td className={`py-3 px-4 text-right font-bold ${item.quantity <= item.minThreshold ? "text-red-400" : "text-indigo-400"}`}>
                      {item.quantity} <span className="text-slate-500 font-normal">{item.unit}</span>
                    </td>
                    <td className="py-3 px-4 text-right text-slate-500">{item.minThreshold}</td>
                    <td className="py-3 px-4 text-slate-400">{item.supplier || "—"}</td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={e => { e.stopPropagation(); updateQuantity(item.id, -1); }}
                          className="p-1.5 rounded hover:bg-red-500/20 text-slate-500 hover:text-red-400 transition-colors"><Minus size={14} /></button>
                        <button onClick={e => { e.stopPropagation(); updateQuantity(item.id, 1); }}
                          className="p-1.5 rounded hover:bg-emerald-500/20 text-slate-500 hover:text-emerald-400 transition-colors"><Plus size={14} /></button>
                        <button onClick={e => { e.stopPropagation(); startEdit(item); }}
                          className="p-1.5 rounded hover:bg-indigo-500/20 text-slate-500 hover:text-indigo-400 transition-colors"><Edit3 size={14} /></button>
                        <button onClick={e => { e.stopPropagation(); deleteItem(item.id); }}
                          className="p-1.5 rounded hover:bg-red-500/20 text-slate-500 hover:text-red-400 transition-colors"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && filteredItems.length === 0 && (
          <div className="text-center py-16">
            <Package size={48} className="mx-auto text-slate-600 mb-4" />
            <p className="text-slate-400 mb-4">Нет товаров в этой категории</p>
            <button onClick={() => setShowForm(true)} className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold">
              <Plus size={18} className="inline mr-2" /> Добавить товар
            </button>
          </div>
        )}
      </div>

      {detailItem && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100] flex items-center justify-center p-4" onClick={() => setDetailItem(null)}>
          <div className="w-full max-w-lg glass-panel rounded-3xl border border-white/10 p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider">{detailItem.category}</p>
                <h3 className="text-xl font-bold text-white mt-1">{detailItem.name}</h3>
              </div>
              <button onClick={() => setDetailItem(null)} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-slate-400 hover:text-white"><X size={16} /></button>
            </div>
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="bg-white/5 rounded-xl p-3 text-center">
                <p className="text-[10px] text-slate-500 uppercase mb-1">Количество</p>
                <p className="text-2xl font-bold text-indigo-400">{detailItem.quantity}</p>
                <p className="text-xs text-slate-400">{detailItem.unit}</p>
              </div>
              <div className="bg-white/5 rounded-xl p-3 text-center">
                <p className="text-[10px] text-slate-500 uppercase mb-1">Мин. запас</p>
                <p className="text-2xl font-bold text-amber-400">{detailItem.minThreshold}</p>
                <p className="text-xs text-slate-400">{detailItem.unit}</p>
              </div>
              <div className="bg-white/5 rounded-xl p-3 text-center">
                <p className="text-[10px] text-slate-500 uppercase mb-1">Поставщик</p>
                <p className="text-lg font-bold text-emerald-400">{detailItem.supplier || "—"}</p>
              </div>
            </div>
            {detailItem.quantity <= detailItem.minThreshold && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 flex items-center gap-2 mb-4">
                <AlertTriangle size={16} className="text-red-400" />
                <span className="text-sm text-red-300 font-semibold">Низкий запас</span>
              </div>
            )}
            {detailItem.notes && (
              <div className="bg-black/20 rounded-xl p-3 border border-white/5 mb-4">
                <p className="text-[10px] text-slate-500 uppercase mb-1">Примечания</p>
                <p className="text-sm text-slate-200">{detailItem.notes}</p>
              </div>
            )}
            <div className="flex gap-2">
              <button onClick={() => { startEdit(detailItem); setDetailItem(null); }}
                className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center justify-center gap-2"><Edit3 size={14} /> Редактировать</button>
              <button onClick={() => { deleteItem(detailItem.id); setDetailItem(null); }}
                className="py-2.5 px-4 rounded-xl bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/20 text-xs font-bold"><Trash2 size={14} /></button>
            </div>
          </div>
        </div>
      )}

      <div className="fixed bottom-4 right-4 space-y-2 pointer-events-none">
        {toasts.map(toast => (
          <div key={toast.id} className={`px-4 py-3 rounded-lg text-white font-semibold flex items-center gap-2 ${toast.type === "success" ? "bg-emerald-600" : toast.type === "warning" ? "bg-yellow-600" : "bg-blue-600"}`}>
            <Package size={18} /> {toast.text}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SkladEnhanced;
