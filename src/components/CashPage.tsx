import React, { useState, useEffect } from "react";
import { CreditCard, DollarSign, MinusCircle, Plus, X, Wallet, TrendingUp, ArrowUpRight, ArrowDownRight, Package } from "lucide-react";
import { fetchTodayShift, openShift, closeShift, addEntry, deleteEntry, CashShift, CashEntry } from "../api/cash";

interface CashPageProps {
  currentUserName: string | null;
}

const EXPENSE_CATEGORIES = ["Канцелярия", "Хозтовары", "Кофе/чай", "Транспорт", "Реклама", "Другое"];

interface LineItem {
  id: number;
  name: string;
  price: number;
}

const CashPage: React.FC<CashPageProps> = ({ currentUserName }) => {
  const [shift, setShift] = useState<CashShift | null>(null);
  const [activeTab, setActiveTab] = useState<"sales" | "expenses">("sales");
  const [showAddForm, setShowAddForm] = useState(false);
  const [addForm, setAddForm] = useState({ type: "sale", method: "cash", category: "Другое", notes: "" });
  const [items, setItems] = useState<LineItem[]>([{ id: 1, name: "", price: 0 }]);
  const [startAmount, setStartAmount] = useState("0");
  const [closeAmount, setCloseAmount] = useState("0");
  const [loading, setLoading] = useState(true);

  const SEED_SHIFT: CashShift = {
    id: 1,
    date: new Date().toISOString().slice(0, 10),
    status: "open",
    start_amount: 10000,
    opened_by: "Елена Морозова",
    opened_at: new Date().toISOString(),
    cash_total: 10150,
    cashless_total: 3000,
    expense_total: 500,
    expected_balance: 19650,
    actual_balance: 0,
    closed_by: "",
    closed_at: "",
    entries: [
      { id: 1, shift_id: 1, type: "sale", amount: 3000, method: "cash", category: "", notes: "Петли Blum Clip-Top × 10", created_at: "09:30" },
      { id: 2, shift_id: 1, type: "sale", amount: 4500, method: "cash", category: "", notes: "Кромка ПВХ Rehau 2мм × 15м", created_at: "11:15" },
      { id: 3, shift_id: 1, type: "sale", amount: 2650, method: "cashless", category: "", notes: "ЛДСП Egger Дуб Кантри × 1 лист", created_at: "13:45" },
      { id: 4, shift_id: 1, type: "expense", amount: 500, method: "cash", category: "Кофе/чай", notes: "Кофе для салона", created_at: "14:00" },
    ],
  };

  const loadToday = async () => {
    try {
      const s = await fetchTodayShift();
      setShift(s);
      setCloseAmount(String(s.actual_balance || 0));
    } catch {
      setShift(SEED_SHIFT);
      setCloseAmount(String(10000 + 10150 - 500));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadToday(); }, []);

  const handleOpenShift = async () => {
    if (!shift) return;
    const updated = await openShift(shift.id, Number(startAmount) || 0, currentUserName || "Администратор");
    setShift(updated);
  };

  const handleCloseShift = async () => {
    if (!shift) return;
    const updated = await closeShift(shift.id, Number(closeAmount) || 0, currentUserName || "Администратор");
    setShift(updated);
  };

  const addItem = () => {
    setItems(prev => [...prev, { id: Date.now(), name: "", price: 0 }]);
  };

  const removeItem = (id: number) => {
    setItems(prev => prev.filter(i => i.id !== id));
  };

  const updateItem = (id: number, field: keyof LineItem, value: string | number) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, [field]: value } : i));
  };

  const totalAmount = items.reduce((sum, i) => sum + (i.price || 0), 0);

  const formatItemsNotes = (items: LineItem[]): string => {
    const valid = items.filter(i => i.name.trim());
    if (valid.length === 0) return "";
    return valid.map(i => `${i.name}:${i.price}₽`).join(" | ");
  };

  const parseItemsFromNotes = (notes: string): { name: string; price: number }[] => {
    if (!notes || !notes.includes(":")) return [];
    return notes.split(" | ").map(part => {
      const [name, rest] = part.split(":");
      const price = parseInt(rest) || 0;
      return { name: name.trim(), price };
    });
  };

  const handleAddEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shift || totalAmount <= 0) return;
    const formattedItems = formatItemsNotes(items);
    const notesText = formattedItems ? `${formattedItems}${addForm.notes ? ` · ${addForm.notes}` : ""}` : addForm.notes;
    const newEntry: CashEntry = {
      id: Date.now(),
      shift_id: shift.id,
      type: addForm.type as "sale" | "expense",
      amount: totalAmount,
      method: addForm.method as "cash" | "cashless",
      category: addForm.type === "expense" ? addForm.category : "",
      notes: notesText,
      created_at: new Date().toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" }),
    };
    // Optimistic update
    setShift(prev => {
      if (!prev) return prev;
      const entries = [...(prev.entries || []), newEntry];
      const cashTotal = entries.filter(e => e.type === "sale" && e.method === "cash").reduce((s, e) => s + e.amount, 0);
      const cashlessTotal = entries.filter(e => e.type === "sale" && e.method === "cashless").reduce((s, e) => s + e.amount, 0);
      const expenseTotal = entries.filter(e => e.type === "expense").reduce((s, e) => s + e.amount, 0);
      return { ...prev, entries, cash_total: cashTotal, cashless_total: cashlessTotal, expense_total: expenseTotal };
    });
    // Save to localStorage
    const saved = localStorage.getItem("nova_light_cash_entries");
    const fallback = saved ? JSON.parse(saved) : [];
    fallback.push(newEntry);
    localStorage.setItem("nova_light_cash_entries", JSON.stringify(fallback));
    setAddForm({ type: "sale", method: "cash", category: "Другое", notes: "" });
    setItems([{ id: 1, name: "", price: 0 }]);
    setShowAddForm(false);
    try { await addEntry({ shift_id: shift.id, type: addForm.type, amount: totalAmount, method: addForm.method, category: addForm.type === "expense" ? addForm.category : "", notes: notesText }); } catch {}
  };

  const handleDeleteEntry = async (id: number) => {
    setShift(prev => {
      if (!prev) return prev;
      const entries = (prev.entries || []).filter(e => e.id !== id);
      const cashTotal = entries.filter(e => e.type === "sale" && e.method === "cash").reduce((s, e) => s + e.amount, 0);
      const cashlessTotal = entries.filter(e => e.type === "sale" && e.method === "cashless").reduce((s, e) => s + e.amount, 0);
      const expenseTotal = entries.filter(e => e.type === "expense").reduce((s, e) => s + e.amount, 0);
      return { ...prev, entries, cash_total: cashTotal, cashless_total: cashlessTotal, expense_total: expenseTotal };
    });
    const saved = localStorage.getItem("nova_light_cash_entries");
    if (saved) {
      const fallback = JSON.parse(saved).filter((e: any) => e.id !== id);
      localStorage.setItem("nova_light_cash_entries", JSON.stringify(fallback));
    }
    try { await deleteEntry(id); } catch {}
  };

  const entries = shift?.entries || [];
  const sales = entries.filter(e => e.type === "sale");
  const expenses = entries.filter(e => e.type === "expense");
  const displayedEntries = activeTab === "sales" ? sales : expenses;

  if (loading) {
    return <div className="text-center text-slate-500 py-16">Загрузка...</div>;
  }

  return (
    <div className="max-w-5xl mx-auto fade-in space-y-6">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight">Касса</h2>
          <p className="text-slate-400 text-sm mt-1">{shift ? shift.date : "—"}</p>
        </div>
        {shift?.status === "open" && (
          <button onClick={() => setShowAddForm(!showAddForm)} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all">
            <Plus size={16} /> {activeTab === "sales" ? "Продажа" : "Расход"}
          </button>
        )}
      </div>

      <div className="glass-panel rounded-2xl p-6 border border-white/5">
        <div className="flex items-center gap-3 mb-5">
          <Wallet size={24} className="text-indigo-400" />
          <h3 className="text-sm font-bold text-white uppercase tracking-widest">
            {shift?.status === "open" ? "Смена открыта" : "Смена закрыта"}
          </h3>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${shift?.status === "open" ? "bg-emerald-500/20 text-emerald-400" : "bg-slate-500/20 text-slate-400"}`}>
            {shift?.status === "open" ? "Открыта" : "Закрыта"}
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
          <div className="bg-black/30 rounded-xl p-4 border border-white/5">
            <p className="text-[10px] text-slate-500 uppercase tracking-widest">Начало дня</p>
            {shift?.status === "open" && shift.start_amount === 0 ? (
              <div className="flex gap-2 mt-1.5">
                <input type="number" value={startAmount} onChange={e => setStartAmount(e.target.value)} className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-indigo-500/50" />
                <button onClick={handleOpenShift} className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg whitespace-nowrap">OK</button>
              </div>
            ) : (
              <p className="text-xl font-bold text-white mt-1">{shift?.start_amount.toLocaleString()} ₽</p>
            )}
          </div>
          <div className="bg-black/30 rounded-xl p-4 border border-white/5">
            <p className="text-[10px] text-slate-500 uppercase tracking-widest flex items-center gap-1"><ArrowUpRight size={12} className="text-emerald-400" /> Наличные</p>
            <p className="text-xl font-bold text-emerald-400 mt-1">+{shift?.cash_total.toLocaleString()} ₽</p>
          </div>
          <div className="bg-black/30 rounded-xl p-4 border border-white/5">
            <p className="text-[10px] text-slate-500 uppercase tracking-widest flex items-center gap-1"><TrendingUp size={12} className="text-sky-400" /> Безнал</p>
            <p className="text-xl font-bold text-sky-400 mt-1">+{shift?.cashless_total.toLocaleString()} ₽</p>
          </div>
          <div className="bg-black/30 rounded-xl p-4 border border-white/5">
            <p className="text-[10px] text-slate-500 uppercase tracking-widest flex items-center gap-1"><ArrowDownRight size={12} className="text-red-400" /> Расходы</p>
            <p className="text-xl font-bold text-red-400 mt-1">-{shift?.expense_total.toLocaleString()} ₽</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-indigo-500/10 rounded-xl p-4 border border-indigo-500/20">
            <p className="text-[10px] text-indigo-300 uppercase tracking-widest">Ожидаемый остаток</p>
            <p className="text-2xl font-bold text-white mt-1">
              {((shift?.start_amount || 0) + (shift?.cash_total || 0) - (shift?.expense_total || 0)).toLocaleString()} ₽
            </p>
          </div>
          <div className="bg-amber-500/10 rounded-xl p-4 border border-amber-500/20">
            <p className="text-[10px] text-amber-300 uppercase tracking-widest">Фактический (закрытие)</p>
            {shift?.status === "open" ? (
              <div className="flex gap-2 mt-1">
                <input type="number" value={closeAmount} onChange={e => setCloseAmount(e.target.value)} className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-indigo-500/50" />
                <button onClick={handleCloseShift} className="bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg whitespace-nowrap">Закрыть</button>
              </div>
            ) : (
              <p className="text-2xl font-bold text-amber-400 mt-1">{shift?.actual_balance.toLocaleString()} ₽</p>
            )}
          </div>
        </div>
      </div>

      <div className="flex gap-2 border-b border-white/10 pb-3">
        <button onClick={() => setActiveTab("sales")} className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === "sales" ? "bg-indigo-500/20 text-indigo-300" : "text-slate-400 hover:text-white"}`}>
          <DollarSign size={14} /> Продажи <span className="text-slate-500">({sales.length})</span>
        </button>
        <button onClick={() => setActiveTab("expenses")} className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === "expenses" ? "bg-red-500/20 text-red-300" : "text-slate-400 hover:text-white"}`}>
          <MinusCircle size={14} /> Расходы <span className="text-slate-500">({expenses.length})</span>
        </button>
      </div>

      {showAddForm && (
        <div className="glass-panel rounded-2xl p-5 border border-indigo-500/30 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-indigo-300 uppercase tracking-widest">{activeTab === "sales" ? "Новая продажа" : "Новый расход"}</h4>
            <button onClick={() => setShowAddForm(false)} className="text-slate-400 hover:text-white transition-colors"><X size={16} /></button>
          </div>
          <form onSubmit={handleAddEntry} className="space-y-3">
            <div>
              <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-2 block">Товары / позиции</label>
              <div className="space-y-2">
                {items.map((item, idx) => (
                  <div key={item.id} className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-500 w-5 font-bold">#{idx + 1}</span>
                    <input
                      value={item.name}
                      onChange={e => updateItem(item.id, "name", e.target.value)}
                      placeholder="Название товара"
                      className="flex-1 bg-black/30 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500/50"
                    />
                    <input
                      type="number"
                      value={item.price || ""}
                      onChange={e => updateItem(item.id, "price", Number(e.target.value))}
                      placeholder="Цена"
                      className="w-24 bg-black/30 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500/50"
                    />
                    <span className="text-[10px] text-slate-500 w-5">₽</span>
                    {items.length > 1 && (
                      <button type="button" onClick={() => removeItem(item.id)} className="text-red-400 hover:text-red-300 transition-colors p-1">
                        <X size={14} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <button type="button" onClick={addItem} className="mt-2 flex items-center gap-1 text-[10px] font-bold text-indigo-400 hover:text-indigo-300 transition-colors uppercase tracking-widest">
                <Plus size={12} /> Добавить позицию
              </button>
            </div>

            {activeTab === "sales" && (
              <div>
                <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold block mb-2">Способ оплаты</label>
                <div className="flex gap-2">
                  {["cash", "cashless"].map(m => (
                    <button key={m} type="button" onClick={() => setAddForm(f => ({ ...f, method: m }))} className={`flex-1 py-2.5 rounded-xl text-xs font-bold border transition-all ${addForm.method === m ? "bg-indigo-500/20 border-indigo-500/40 text-indigo-300" : "bg-white/5 border-white/10 text-slate-400"}`}>
                      {m === "cash" ? "Наличные" : "Безнал"}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {activeTab === "expenses" && (
              <div>
                <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold block mb-2">Категория</label>
                <select value={addForm.category} onChange={e => setAddForm(f => ({ ...f, category: e.target.value }))} className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500/50">
                  {EXPENSE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            )}
            <div>
              <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold block mb-2">Примечание</label>
              <input value={addForm.notes} onChange={e => setAddForm(f => ({ ...f, notes: e.target.value }))} placeholder="Дополнительно..." className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500/50" />
            </div>

            <div className="flex items-center justify-between bg-black/30 rounded-xl px-4 py-3 border border-white/5">
              <span className="text-xs text-slate-400 font-bold uppercase tracking-widest">Итого:</span>
              <span className="text-lg font-bold text-white">{totalAmount.toLocaleString("ru-RU")} ₽</span>
            </div>

            <button type="submit" disabled={totalAmount <= 0} className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-bold py-2.5 rounded-xl transition-all text-sm">
              Добавить
            </button>
          </form>
        </div>
      )}

      <div className="glass-panel rounded-2xl overflow-hidden border border-white/5">
        {displayedEntries.length === 0 ? (
          <div className="text-center text-slate-500 py-12 text-sm">Нет записей</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-black/40 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                <th className="px-5 py-3 text-left">Сумма</th>
                <th className="px-5 py-3 text-left">Товары</th>
                <th className="px-5 py-3 text-left">Метод</th>
                <th className="px-5 py-3 text-left">Категория</th>
                <th className="px-5 py-3 text-left">Примечание</th>
                <th className="px-5 py-3 text-left">Время</th>
                {shift?.status === "open" && <th className="px-5 py-3"></th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {displayedEntries.map(entry => {
                const parsedItems = parseItemsFromNotes(entry.notes);
                return (
                  <tr key={entry.id} className="hover:bg-white/5 transition-colors group">
                    <td className="px-5 py-3">
                      <span className={`font-bold ${entry.type === "expense" ? "text-red-400" : "text-emerald-400"}`}>
                        {entry.type === "expense" ? "-" : "+"}{entry.amount.toLocaleString()} ₽
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      {parsedItems.length > 0 ? (
                        <div className="space-y-0.5">
                          {parsedItems.map((item, i) => (
                            <div key={i} className="flex items-center gap-1.5 text-xs text-slate-300">
                              <Package size={10} className="text-slate-500 shrink-0" />
                              <span>{item.name}</span>
                              <span className="text-slate-500">{item.price.toLocaleString()}₽</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-slate-500 text-xs">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-slate-400 text-xs">{entry.method === "cash" ? "Наличные" : "Безнал"}</td>
                    <td className="px-5 py-3 text-slate-400 text-xs">{entry.category || "—"}</td>
                    <td className="px-5 py-3 text-slate-400 text-xs max-w-[150px] truncate">{entry.notes || "—"}</td>
                    <td className="px-5 py-3 text-slate-500 text-xs">{entry.created_at?.slice(11, 16) || ""}</td>
                    {shift?.status === "open" && (
                      <td className="px-5 py-3 text-right">
                        <button onClick={() => handleDeleteEntry(entry.id)} className="text-red-400 hover:text-red-300 opacity-0 group-hover:opacity-100 transition-opacity p-1"><X size={14} /></button>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default CashPage;