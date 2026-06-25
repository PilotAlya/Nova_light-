import React, { useState, useEffect, useMemo, useRef } from "react";
import { ClipboardList, ArrowLeft, Plus, Store, MessageCircle, Calendar, MapPin, Clock, CheckCircle2, Scissors, Layers, Package, Search, History, X, ArrowRight, ChevronRight, ListChecks, Briefcase, CreditCard, FileText, HelpCircle, Trash2 } from "lucide-react";
import { fetchOrders, createOrder, updateOrder, Order } from "../api/orders";

interface OrdersPageProps {
  onNavigateCalculator: () => void;
  currentUserName: string | null;
}

const LDSP_STATUSES = ["новый", "утверждён", "в сборке", "готов к выдаче", "выдан"];

const DEFAULT_MANAGER_TASKS = [
  "Посчитать наличку в кассе",
  "Закрыть смену в Инфопредприятие",
  "Перепроверить чеки за день",
  "Сверить остатки материалов",
  "Подготовить отчёт по заказам",
];

const ORDER_QUESTIONS = [
  { id: "edge_side", label: "С какой стороны кромить?", options: ["Левая", "Правая", "Обе", "Без кромки"] },
  { id: "color", label: "Цвет", options: ["Дуб Сонома", "Дуб Молочный", "Ясень Шимо", "Белый", "Чёрный", "Другой"] },
  { id: "urgency", label: "Срочность", options: ["Обычный (7 дней)", "Срочный (3 дня)", "Очень срочный (1 день)"] },
];

const statusMeta: Record<string, { icon: React.ReactNode; color: string; label: string }> = {
  "новый": { icon: <ClipboardList size={14} />, color: "bg-blue-500/20 text-blue-300 border-blue-500/30", label: "Новый" },
  "утверждён": { icon: <FileText size={14} />, color: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30", label: "Утверждён" },
  "в сборке": { icon: <Scissors size={14} />, color: "bg-amber-500/20 text-amber-300 border-amber-500/30", label: "В сборке" },
  "готов к выдаче": { icon: <Package size={14} />, color: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30", label: "Готов к выдаче" },
  "выдан": { icon: <CheckCircle2 size={14} />, color: "bg-slate-500/20 text-slate-400 border-slate-500/30", label: "Выдан" },
};

function computeDeadline(order: Order): Date {
  if (order.deadline) return new Date(order.deadline);
  return new Date(new Date(order.created_at).getTime() + 7 * 24 * 60 * 60 * 1000);
}

function daysUntil(d: Date): number {
  return Math.ceil((d.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}

function formatDate(d: Date): string {
  return d.toLocaleDateString("ru-RU", { day: "numeric", month: "long", weekday: "short" });
}

function formatDateTime(d: string): string {
  return new Date(d).toLocaleString("ru-RU", { day: "numeric", month: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

const getNextStatus = (status: string) => {
  const idx = LDSP_STATUSES.indexOf(status);
  return idx >= 0 && idx < LDSP_STATUSES.length - 1 ? LDSP_STATUSES[idx + 1] : null;
};

const statusFieldLabel: Record<string, string> = {
  status: "Статус",
  source: "Источник",
  client_name: "Клиент",
  phone: "Телефон",
  material: "Материал",
  payment_status: "Оплата",
  total_cost: "Сумма",
  deadline: "Дедлайн",
};

const formatOrderId = (id: number) => {
  const year = new Date().getFullYear().toString().slice(-2);
  return `Л/${String(id).padStart(3, "0")}/${year}`;
};

const OrdersPage: React.FC<OrdersPageProps> = ({ onNavigateCalculator, currentUserName }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [editId, setEditId] = useState<number | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterSource, setFilterSource] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showHistory, setShowHistory] = useState(false);
  const [editForm, setEditForm] = useState({ client_name: "", phone: "", source: "салон", material: "ЛДСП 16мм", payment_status: "предоплата", status: "новый" });
  const [viewMode, setViewMode] = useState<"list" | "kanban">("kanban");
  const [showManagerTasks, setShowManagerTasks] = useState(false);
  const [managerTasks, setManagerTasks] = useState<{ id: string; text: string; done: boolean }[]>(() => {
    const saved = localStorage.getItem("nova_light_manager_tasks");
    if (saved) return JSON.parse(saved);
    return DEFAULT_MANAGER_TASKS.map((text, i) => ({ id: `mt-${i}`, text, done: false }));
  });
  const [orderAnswers, setOrderAnswers] = useState<Record<string, string>>(() => {
    const saved = localStorage.getItem("nova_light_order_answers");
    return saved ? JSON.parse(saved) : {};
  });
  const [showPaymentInfo, setShowPaymentInfo] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "card" | "">("");
  const [invoiceStatus, setInvoiceStatus] = useState<Record<number, "not_issued" | "issued">>(() => {
    const saved = localStorage.getItem("nova_light_invoice_status");
    return saved ? JSON.parse(saved) : {};
  });
  const [draggedOrderId, setDraggedOrderId] = useState<number | null>(null);
  const seeded = useRef(false);

  const SEED_ORDERS: Order[] = [
    { id: 1, client_name: "Иванов Алексей", phone: "+7 (999) 111-11-11", source: "салон", material: "ЛДСП Дуб Сонома", status: "новый", payment_status: "не оплачено", total_cost: 15000, positions_json: "[]", deadline: "2026-06-20", created_at: "2026-06-10T09:00:00", updated_at: "2026-06-10T09:00:00", responsible: "Сергей Кузнецов", pickup_location: "салон РЭЛАН" },
    { id: 2, client_name: "Петрова Мария", phone: "+7 (999) 222-22-22", source: "сайт", material: "ЛДСП Белый монохром", status: "утверждён", payment_status: "предоплата", total_cost: 22000, positions_json: "[]", deadline: "2026-06-22", created_at: "2026-06-08T10:30:00", updated_at: "2026-06-11T14:00:00", responsible: "Елена Морозова", pickup_location: "салон РЭЛАН" },
    { id: 3, client_name: "Сидоров Павел", phone: "+7 (999) 333-33-33", source: "звонок", material: "ЛДСП Серый графит", status: "в сборке", payment_status: "оплачено", total_cost: 18500, positions_json: "[]", deadline: "2026-06-18", created_at: "2026-06-05T11:00:00", updated_at: "2026-06-12T09:00:00", responsible: "Дмитрий Волков", pickup_location: "цех" },
    { id: 4, client_name: "Козлова Ольга", phone: "+7 (999) 444-44-44", source: "реклама", material: "ЛДСП Ясень шимо", status: "готов к выдаче", payment_status: "оплачено", total_cost: 31000, positions_json: "[]", deadline: "2026-06-15", created_at: "2026-06-02T14:00:00", updated_at: "2026-06-13T10:00:00", responsible: "Елена Морозова", pickup_location: "салон РЭЛАН" },
    { id: 5, client_name: "ООО «Ремонт-Про»", phone: "+7 (999) 555-55-55", source: "звонок", material: "ЛДСП Дуб кантри", status: "выдан", payment_status: "оплачено", total_cost: 45000, positions_json: "[]", deadline: "2026-06-10", created_at: "2026-05-28T08:00:00", updated_at: "2026-06-10T16:00:00", responsible: "Сергей Кузнецов", pickup_location: "доставка" },
    { id: 6, client_name: "Смирнов Игорь", phone: "+7 (999) 666-66-66", source: "сайт", material: "ЛДСП Белый монохром", status: "новый", payment_status: "не оплачено", total_cost: 0, positions_json: "[]", deadline: "2026-06-25", created_at: "2026-06-13T08:30:00", updated_at: "2026-06-13T08:30:00", responsible: "Дмитрий Волков", pickup_location: "салон РЭЛАН" },
    { id: 7, client_name: "Волков Дмитрий", phone: "+7 (999) 777-77-77", source: "реклама", material: "ЛДСП Дуб Сонома", status: "в сборке", payment_status: "предоплата", total_cost: 27000, positions_json: "[]", deadline: "2026-06-19", created_at: "2026-06-09T15:00:00", updated_at: "2026-06-12T11:00:00", responsible: "Сергей Кузнецов", pickup_location: "салон РЭЛАН" },
  ];

  useEffect(() => {
    fetchOrders()
      .then(data => {
        if (data.length === 0 && !seeded.current) {
          seeded.current = true;
          // Load from localStorage fallback
          const saved = localStorage.getItem("nova_light_orders_fallback");
          const fallbackOrders = saved ? JSON.parse(saved) : [];
          setOrders([...SEED_ORDERS, ...fallbackOrders]);
        } else {
          setOrders(data);
        }
      })
      .catch(() => {
        if (!seeded.current) {
          seeded.current = true;
          const saved = localStorage.getItem("nova_light_orders_fallback");
          const fallbackOrders = saved ? JSON.parse(saved) : [];
          setOrders([...SEED_ORDERS, ...fallbackOrders]);
        }
      });
  }, []);

  useEffect(() => {
    localStorage.setItem("nova_light_manager_tasks", JSON.stringify(managerTasks));
  }, [managerTasks]);

  useEffect(() => {
    localStorage.setItem("nova_light_order_answers", JSON.stringify(orderAnswers));
  }, [orderAnswers]);

  useEffect(() => {
    localStorage.setItem("nova_light_invoice_status", JSON.stringify(invoiceStatus));
  }, [invoiceStatus]);

  const toggleManagerTask = (id: string) => {
    setManagerTasks(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t));
  };

  const refreshOrders = () => fetchOrders().then(setOrders).catch(() => {});

  const filteredOrders = useMemo(() => {
    let result = orders;
    if (filterStatus !== "all") result = result.filter(o => o.status === filterStatus);
    if (filterSource !== "all") result = result.filter(o => o.source === filterSource);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(o => (o.client_name || "").toLowerCase().includes(q) || (o.phone || "").includes(q));
    }
    return result;
  }, [orders, filterStatus, filterSource, searchQuery]);

  const openEdit = (order: Order) => {
    setEditId(order.id);
    setShowHistory(false);
    setEditForm({
      client_name: order.client_name || "",
      phone: order.phone || "",
      source: order.source || "салон",
      material: order.material || "ЛДСП 16мм",
      payment_status: order.payment_status || "предоплата",
      status: order.status || "новый",
    });
  };

  const handleSave = async () => {
    if (editId === null) return;
    await updateOrder(editId, { ...editForm, changed_by: currentUserName || "Администратор" });
    setEditId(null);
    refreshOrders();
  };

  const advanceStatus = async (order: Order, toStatus: string) => {
    setOrders(prev => prev.map(o => o.id === order.id ? { ...o, status: toStatus } : o));
    // Save to localStorage fallback
    const saved = localStorage.getItem("nova_light_orders_fallback");
    const fallback = saved ? JSON.parse(saved) : [];
    const idx = fallback.findIndex((o: any) => o.id === order.id);
    if (idx >= 0) fallback[idx] = { ...fallback[idx], status: toStatus };
    localStorage.setItem("nova_light_orders_fallback", JSON.stringify(fallback));
    try { await updateOrder(order.id, { status: toStatus, changed_by: currentUserName || "Администратор" }); } catch {}
  };

  const deleteOrder = async (orderId: number) => {
    if (!confirm("Удалить заказ?")) return;
    setOrders(prev => prev.filter(o => o.id !== orderId));
    const saved = localStorage.getItem("nova_light_orders_fallback");
    const fallback = saved ? JSON.parse(saved) : [];
    localStorage.setItem("nova_light_orders_fallback", JSON.stringify(fallback.filter((o: any) => o.id !== orderId)));
    try { await (await import("../api/orders")).deleteOrder(orderId); } catch {}
  };

  const advanceStatusById = async (orderId: number, toStatus: string) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: toStatus } : o));
    const saved = localStorage.getItem("nova_light_orders_fallback");
    const fallback = saved ? JSON.parse(saved) : [];
    const idx = fallback.findIndex((o: any) => o.id === orderId);
    if (idx >= 0) fallback[idx] = { ...fallback[idx], status: toStatus };
    localStorage.setItem("nova_light_orders_fallback", JSON.stringify(fallback));
    try { await updateOrder(orderId, { status: toStatus, changed_by: currentUserName || "Администратор" }); } catch {}
  };

  const editingOrder = orders.find(o => o.id === editId);
  const historyEntries: { timestamp: string; changed_by: string; fields: Record<string, { from: string; to: string }> }[] = editingOrder?.history || [];

  const countBySource = (source: string) => orders.filter(o => o.source === source).length;
  const countByStatus = (s: string) => orders.filter(o => o.status === s).length;

  return (
    <div className="max-w-6xl mx-auto fade-in space-y-6">
      {editId && editingOrder ? (
        <>
          <div className="flex items-center gap-4 mb-2">
            <button onClick={() => setEditId(null)} className="text-slate-400 hover:text-white transition-colors p-1">
              <ArrowLeft size={20} />
            </button>
            <div className="flex-1">
              <h2 className="text-3xl font-bold text-white tracking-tight">{formatOrderId(editingOrder.id)}</h2>
              <p className="text-slate-400 text-sm">создан {new Date(editingOrder.created_at).toLocaleDateString("ru-RU")}</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setShowHistory(!showHistory)} className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold border transition-all ${showHistory ? "bg-indigo-500/20 border-indigo-500/40 text-indigo-300" : "bg-white/5 border-white/10 text-slate-400 hover:text-white"}`}>
                <History size={14} /> История
              </button>
            </div>
          </div>

          {showHistory ? (
            <div className="glass-panel rounded-2xl p-5 border border-white/5 space-y-3">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">История изменений</h4>
              {historyEntries.length === 0 ? (
                <p className="text-slate-500 text-sm py-4 text-center">Нет записей</p>
              ) : (
                <div className="space-y-2">
                  {[...historyEntries].reverse().map((entry, i) => (
                    <div key={i} className="bg-black/30 rounded-xl p-3 border border-white/5">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-bold text-indigo-300">{entry.changed_by}</span>
                        <span className="text-[10px] text-slate-500">{formatDateTime(entry.timestamp)}</span>
                      </div>
                      <div className="space-y-1">
                        {Object.entries(entry.fields).map(([key, val]) => (
                          <div key={key} className="text-[11px] flex items-center gap-2">
                            <span className="text-slate-500 w-20">{statusFieldLabel[key] || key}:</span>
                            <span className="text-rose-400 line-through">{String(val.from)}</span>
                            <span className="text-slate-400">→</span>
                            <span className="text-emerald-400">{String(val.to)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="glass-panel rounded-2xl p-6 border border-white/5 space-y-5">
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-black/30 rounded-xl p-4 text-center border border-white/5">
                  <Calendar size={16} className="mx-auto mb-1 text-indigo-400" />
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest">Готовность</p>
                  <p className="text-sm font-bold text-white mt-0.5">{formatDate(computeDeadline(editingOrder))}</p>
                  <p className="text-[10px] text-amber-400 font-bold">{daysUntil(computeDeadline(editingOrder))} дн.</p>
                </div>
                <div className="bg-black/30 rounded-xl p-4 text-center border border-white/5">
                  <MapPin size={16} className="mx-auto mb-1 text-emerald-400" />
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest">Выдача</p>
                  <p className="text-sm font-bold text-white mt-0.5">салон РЭЛАН</p>
                </div>
                <div className="bg-black/30 rounded-xl p-4 text-center border border-white/5">
                  <Clock size={16} className="mx-auto mb-1 text-amber-400" />
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest">Срок</p>
                  <p className="text-sm font-bold text-white mt-0.5">7 дней</p>
                </div>
              </div>

              <div className="flex items-center gap-2 py-3">
                {LDSP_STATUSES.map((s, i) => {
                  const currentIdx = LDSP_STATUSES.indexOf(editingOrder.status);
                  const isDone = i <= currentIdx;
                  const isCurrent = i === currentIdx;
                  return (
                    <React.Fragment key={s}>
                      {i > 0 && <div className={`flex-1 h-0.5 ${isDone ? "bg-indigo-500" : "bg-white/10"}`} />}
                      <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold whitespace-nowrap border transition-all ${isCurrent ? "bg-indigo-500/20 border-indigo-500/40 text-indigo-300" : isDone ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-white/5 border-white/10 text-slate-500"}`}>
                        {isDone ? <CheckCircle2 size={12} /> : statusMeta[s]?.icon}
                        {statusMeta[s]?.label || s}
                      </div>
                    </React.Fragment>
                  );
                })}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">ФИО заказчика</label>
                  <input value={editForm.client_name} onChange={e => setEditForm(f => ({ ...f, client_name: e.target.value }))} className="mt-1.5 w-full bg-black/30 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500/50" />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Номер телефона</label>
                  <input value={editForm.phone} onChange={e => setEditForm(f => ({ ...f, phone: e.target.value }))} className="mt-1.5 w-full bg-black/30 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500/50" />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Источник</label>
                  <div className="mt-1.5 flex gap-2">
                    {["салон", "ВК"].map(src => (
                      <button key={src} onClick={() => setEditForm(f => ({ ...f, source: src }))} className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold border transition-all ${editForm.source === src ? "bg-indigo-500/20 border-indigo-500/40 text-indigo-300" : "bg-white/5 border-white/10 text-slate-400 hover:text-white"}`}>
                        {src === "салон" ? <Store size={14} /> : <MessageCircle size={14} />}
                        {src}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Статус</label>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {LDSP_STATUSES.map(s => (
                      <button key={s} onClick={() => setEditForm(f => ({ ...f, status: s }))} className={`px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-all ${editForm.status === s ? (statusMeta[s]?.color || "bg-indigo-500/20 text-indigo-300 border-indigo-500/30") : "bg-white/5 border-white/10 text-slate-400 hover:text-white"}`}>
                        {statusMeta[s]?.label || s}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Материал</label>
                  <input value={editForm.material} onChange={e => setEditForm(f => ({ ...f, material: e.target.value }))} className="mt-1.5 w-full bg-black/30 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500/50" />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Оплата</label>
                  <select value={editForm.payment_status} onChange={e => setEditForm(f => ({ ...f, payment_status: e.target.value }))} className="mt-1.5 w-full bg-black/30 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500/50">
                    <option value="предоплата">Предоплата</option>
                    <option value="полная">Полная оплата</option>
                    <option value="не оплачено">Не оплачено</option>
                  </select>
                </div>
              </div>

              {/* Обязательные вопросы при оформлении */}
              <div className="border-t border-white/10 pt-4 mt-4">
                <h4 className="text-[10px] uppercase tracking-widest text-amber-400 font-bold mb-3 flex items-center gap-2">
                  <HelpCircle size={12} /> Обязательные вопросы
                </h4>
                <div className="grid grid-cols-3 gap-3">
                  {ORDER_QUESTIONS.map(q => (
                    <div key={q.id}>
                      <label className="text-[10px] text-slate-500 font-bold mb-1.5 block">{q.label}</label>
                      <div className="flex flex-wrap gap-1">
                        {q.options.map(opt => (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => setOrderAnswers(prev => ({ ...prev, [q.id]: opt }))}
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all ${
                              orderAnswers[q.id] === opt
                                ? "bg-amber-500/20 border-amber-500/40 text-amber-300"
                                : "bg-white/5 border-white/10 text-slate-400 hover:text-white"
                            }`}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Инфо-панель: оплата в Инфопредприятие */}
              <div className="border-t border-white/10 pt-4 mt-4">
                <button
                  type="button"
                  onClick={() => setShowPaymentInfo(!showPaymentInfo)}
                  className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-indigo-400 font-bold hover:text-indigo-300 transition-all"
                >
                  <CreditCard size={12} /> {showPaymentInfo ? "Скрыть" : "Показать"} порядок оплаты в Инфопредприятие
                  <ChevronRight size={12} className={`transition-transform ${showPaymentInfo ? "rotate-90" : ""}`} />
                </button>
                {showPaymentInfo && (
                  <div className="mt-3 bg-black/30 rounded-xl p-4 border border-indigo-500/20 space-y-3">
                    <div>
                      <label className="text-[10px] text-slate-500 font-bold mb-1.5 block">Способ оплаты</label>
                      <div className="flex gap-2">
                        {(["cash", "card"] as const).map(m => (
                          <button
                            key={m}
                            type="button"
                            onClick={() => setPaymentMethod(m)}
                            className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${
                              paymentMethod === m
                                ? "bg-indigo-500/20 border-indigo-500/40 text-indigo-300"
                                : "bg-white/5 border-white/10 text-slate-400 hover:text-white"
                            }`}
                          >
                            {m === "cash" ? "Наличные" : "Карта"}
                          </button>
                        ))}
                      </div>
                    </div>
                    {paymentMethod === "card" && (
                      <div className="text-xs text-slate-300 space-y-2 bg-black/20 rounded-lg p-3 border border-white/5">
                        <p className="font-bold text-indigo-300 uppercase tracking-widest text-[10px]">Алгоритм (карта):</p>
                        <ol className="list-decimal list-inside space-y-1 text-slate-400">
                          <li>Инфопредприятие → Платёжные документы</li>
                          <li>Вкладка «Оплата по эквайрингу»</li>
                          <li><span className="text-white">Физ-лицо</span>, <span className="text-white">П1</span>, основание: <span className="text-white">{formatOrderId(editingOrder.id)}</span>, без НДС</li>
                          <li>Напечатать чек, написать номер заказа на чеке</li>
                          <li>Отпустить клиента</li>
                        </ol>
                      </div>
                    )}
                    {paymentMethod === "cash" && (
                      <div className="text-xs text-slate-300 space-y-2 bg-black/20 rounded-lg p-3 border border-white/5">
                        <p className="font-bold text-indigo-300 uppercase tracking-widest text-[10px]">Алгоритм (нал):</p>
                        <ol className="list-decimal list-inside space-y-1 text-slate-400">
                          <li>Инфопредприятие → Платёжные документы</li>
                          <li>«Поступление в кассу»</li>
                          <li>Выбрать <span className="text-white">Физ-лицо</span>, основание: <span className="text-white">{formatOrderId(editingOrder.id)}</span>, без НДС</li>
                          <li>Напечатать чек</li>
                        </ol>
                      </div>
                    )}
                    <div className="text-xs text-slate-300 space-y-2 bg-black/20 rounded-lg p-3 border border-white/5">
                      <p className="font-bold text-indigo-300 uppercase tracking-widest text-[10px]">Счёт:</p>
                      <ol className="list-decimal list-inside space-y-1 text-slate-400">
                        <li>Инфопредприятие → вкладка «Счёт» → <span className="text-white">+</span></li>
                        <li>Номер заказа: <span className="text-white">{formatOrderId(editingOrder.id)}</span></li>
                        <li>Состав: наши услуги + ЛДСП (код: 02107)</li>
                      </ol>
                    </div>
                  </div>
                )}
              </div>

              <button onClick={handleSave} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 rounded-xl transition-all">Сохранить</button>
            </div>
          )}
        </>
      ) : (
        <>
          <div className="flex items-center justify-between mb-2">
            <div>
              <h2 className="text-3xl font-bold text-white tracking-tight">Лиды</h2>
              <p className="text-slate-400 text-sm mt-1">Заказы Л-ки (ЛДСП) · Всего: {orders.length} · Срок: 7 дней · Выдача: салон РЭЛАН</p>
            </div>
            <div className="flex gap-3">
              <button onClick={onNavigateCalculator} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all">
                <Plus size={16} /> Новый расчёт
              </button>
            </div>
          </div>

          {/* Ежедневные задачи менеджера */}
          <div className="glass-panel rounded-2xl border border-white/5 overflow-hidden">
            <button
              onClick={() => setShowManagerTasks(!showManagerTasks)}
              className="w-full flex items-center gap-2 px-4 py-2.5 bg-white/[0.02] hover:bg-white/[0.04] transition-all"
            >
              <Briefcase size={14} className="text-amber-400" />
              <span className="text-xs font-bold text-white uppercase tracking-widest">Задачи менеджера</span>
              <span className="text-[10px] text-slate-500 font-bold ml-auto">
                {managerTasks.filter(t => t.done).length}/{managerTasks.length}
              </span>
              <ChevronRight size={14} className={`text-slate-500 transition-transform ${showManagerTasks ? "rotate-90" : ""}`} />
            </button>
            {showManagerTasks && (
              <div className="px-4 pb-3 space-y-0.5">
                {managerTasks.map(task => (
                  <button
                    key={task.id}
                    onClick={() => toggleManagerTask(task.id)}
                    className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all text-left ${
                      task.done
                        ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-300"
                        : "bg-white/5 border-white/10 text-slate-300 hover:text-white"
                    }`}
                  >
                    <span className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                      task.done ? "border-emerald-400 bg-emerald-500/20" : "border-white/20"
                    }`}>
                      {task.done && <CheckCircle2 size={8} className="text-emerald-400" />}
                    </span>
                    <span className={`text-[11px] ${task.done ? "line-through opacity-60" : ""}`}>{task.text}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* View toggle */}
          <div className="flex gap-2">
            <button onClick={() => setViewMode("list")} className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${viewMode === "list" ? "bg-indigo-500/20 border-indigo-500/40 text-indigo-300" : "bg-white/5 border-white/10 text-slate-400 hover:text-white"}`}>
              Список
            </button>
            <button onClick={() => setViewMode("kanban")} className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${viewMode === "kanban" ? "bg-indigo-500/20 border-indigo-500/40 text-indigo-300" : "bg-white/5 border-white/10 text-slate-400 hover:text-white"}`}>
              Доска
            </button>
          </div>

          {/* Search */}
          <div className="relative max-w-xs">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Поиск по клиенту..." className="w-full bg-black/30 border border-white/10 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500/50" />
            {searchQuery && <button onClick={() => setSearchQuery("")} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"><X size={12} /></button>}
          </div>

          {viewMode === "kanban" ? (
            <div
              className="flex gap-4 pb-4 select-none"
              style={{ minHeight: "60vh", overflowX: "auto", cursor: "grab" }}
              onWheel={e => { const t = e.currentTarget; t.scrollLeft += e.deltaY; e.preventDefault(); e.stopPropagation(); }}
            >
              {LDSP_STATUSES.map((status) => {
                const colOrders = filteredOrders.filter(o => o.status === status);
                return (
                  <div
                    key={status}
                    onDragOver={e => { e.preventDefault(); e.currentTarget.classList.add("ring-1", "ring-indigo-500/50"); }}
                    onDragLeave={e => { e.currentTarget.classList.remove("ring-1", "ring-indigo-500/50"); }}
                    onDrop={e => {
                      e.preventDefault();
                      e.currentTarget.classList.remove("ring-1", "ring-indigo-500/50");
                      if (draggedOrderId !== null) {
                        advanceStatusById(draggedOrderId, status);
                        setDraggedOrderId(null);
                      }
                    }}
                    className="flex-shrink-0 w-72 bg-white/5 rounded-2xl border border-white/10 flex flex-col"
                  >
                    <div className={`flex items-center gap-2 px-4 py-3 border-b border-white/10 ${statusMeta[status]?.color || ""}`}>
                      {statusMeta[status]?.icon}
                      <span className="text-xs font-bold uppercase tracking-widest">{statusMeta[status]?.label}</span>
                      <span className="ml-auto text-[10px] text-slate-500 font-bold">{colOrders.length}</span>
                    </div>
                    <div className="flex-1 overflow-y-auto p-3 space-y-2" onWheel={e => e.stopPropagation()}>
                      {colOrders.length === 0 ? (
                        <div className="text-center text-slate-600 text-[10px] py-8 uppercase tracking-widest font-bold">Пусто</div>
                      ) : (
                        colOrders.map(order => {
                          const deadline = computeDeadline(order);
                          const dLeft = daysUntil(deadline);
                          const isOverdue = dLeft <= 0 && order.status !== "выдан";
                          const invStatus = invoiceStatus[order.id] || "not_issued";
                          return (
                            <div
                              key={order.id}
                              draggable
                              onDragStart={() => setDraggedOrderId(order.id)}
                              onClick={() => openEdit(order)}
                              className={`bg-black/40 rounded-xl p-4 border transition-all cursor-pointer hover:bg-black/60 ${
                                isOverdue ? "border-rose-500/60 bg-rose-950/30 shadow-[0_0_20px_rgba(239,68,68,0.25)]" : "border-white/5"
                              } ${draggedOrderId === order.id ? "opacity-40" : ""}`}
                            >
                              <div className="flex items-start justify-between mb-2">
                                <div className="min-w-0 flex-1">
                                  <p className="text-sm font-bold text-white truncate">{formatOrderId(order.id)}</p>
                                  <p className="text-[11px] text-slate-400 mt-0.5 truncate flex items-center gap-1">
                                    {order.source === "ВК" ? <MessageCircle size={10} /> : <Store size={10} />}
                                    {order.client_name || "не указан"}
                                  </p>
                                </div>
                                <span className="text-sm font-bold text-white shrink-0 ml-2">
                                  {order.total_cost.toLocaleString("ru-RU")}₽
                                </span>
                              </div>

                              {/* Счёт */}
                              <div className="mb-2">
                              <button
                                  type="button"
                                  onClick={e => {
                                    e.stopPropagation();
                                    const current = invoiceStatus[order.id] || "not_issued";
                                    if (current === "not_issued") {
                                      if (window.confirm(`Подтвердить выставление счёта для ${formatOrderId(order.id)}?`)) {
                                        setInvoiceStatus(prev => ({ ...prev, [order.id]: "issued" as const }));
                                      }
                                    } else {
                                      setInvoiceStatus(prev => ({ ...prev, [order.id]: "not_issued" as const }));
                                    }
                                  }}
                                  className={`w-full flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-bold border transition-all ${
                                    invStatus === "issued"
                                      ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                                      : "bg-amber-500/10 border-amber-500/20 text-amber-300 hover:bg-amber-500/20"
                                  }`}
                                >
                                  {invStatus === "issued" ? <CheckCircle2 size={12} /> : <FileText size={12} />}
                                  {invStatus === "issued" ? "Счёт выставлен" : "Выставить счёт"}
                                  <ChevronRight size={10} className="ml-auto" />
                                </button>
                              </div>

                              {/* Инструкция если счёт не выставлен */}
                              {invStatus === "not_issued" && (
                                <div className="mb-2 bg-white/5 rounded-lg p-2 border border-white/5 text-[9px] text-slate-400 space-y-1 leading-relaxed">
                                  <p className="font-bold text-amber-300 uppercase tracking-widest">Инфопредприятие:</p>
                                  <ol className="list-decimal list-inside space-y-0.5">
                                    <li>Платёжные документы</li>
                                    <li>«Поступление в кассу»</li>
                                    <li>Физ-лицо, П1, основание: {formatOrderId(order.id)}, без НДС</li>
                                    <li>Напечатать чек</li>
                                  </ol>
                                </div>
                              )}

                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-[10px]">
                                  <Calendar size={10} className="text-slate-500" />
                                  <span className={`font-bold ${isOverdue ? "text-rose-400 animate-pulse" : dLeft <= 3 ? "text-amber-400" : "text-slate-400"}`}>
                                    {dLeft <= 0 ? `× ${Math.abs(dLeft)} дн. ПРОСРОЧЕНО` : `${dLeft} дн.`}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={(e) => { e.stopPropagation(); deleteOrder(order.id); }}
                                    className="p-1 rounded-lg text-rose-400/60 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
                                    title="Удалить"
                                  >
                                    <Trash2 size={12} />
                                  </button>
                                  {getNextStatus(order.status) && (
                                    <button
                                      onClick={(e) => { e.stopPropagation(); advanceStatus(order, getNextStatus(order.status)!); }}
                                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-500/30 transition-all"
                                    >
                                      {statusMeta[getNextStatus(order.status)!]?.icon}
                                      {statusMeta[getNextStatus(order.status)!]?.label}
                                      <ArrowRight size={10} />
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="text-center text-slate-500 py-16 text-sm">Нет заказов {filterStatus !== "all" ? `в статусе "${statusMeta[filterStatus]?.label}"` : ""}</div>
          ) : (
            <div className="space-y-3">
              {filteredOrders.map(order => {
                const deadline = computeDeadline(order);
                const dLeft = daysUntil(deadline);
                const currentIdx = LDSP_STATUSES.indexOf(order.status);
                const isOverdue = dLeft <= 0 && order.status !== "выдан";
                return (
                  <div key={order.id} className={`glass-panel rounded-2xl p-5 border transition-all hover:bg-white/5 ${isOverdue ? "border-rose-500/60 bg-rose-950/20 shadow-[0_0_20px_rgba(239,68,68,0.2)]" : "border-white/5"}`}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer" onClick={() => openEdit(order)}>
                        <h3 className="text-sm font-bold text-white truncate">{formatOrderId(order.id)}</h3>
                        <span className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-lg border flex items-center gap-1 ${(statusMeta[order.status]?.color) || statusMeta["новый"].color}`}>
                          {statusMeta[order.status]?.icon}
                          {statusMeta[order.status]?.label || order.status}
                        </span>
                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border flex items-center gap-1 ${order.source === "ВК" ? "bg-sky-500/20 text-sky-300 border-sky-500/30" : "bg-amber-500/20 text-amber-300 border-amber-500/30"}`}>
                          {order.source === "ВК" ? <MessageCircle size={12} /> : <Store size={12} />}
                          {order.source}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        {order.status !== "выдан" && (
                          <span className={`text-xs font-bold ${isOverdue ? "text-rose-400 animate-pulse" : dLeft <= 3 ? "text-amber-400" : "text-emerald-400"}`}>
                            {dLeft <= 0 ? `× ${Math.abs(dLeft)} дн. ПРОСРОЧЕНО` : `${dLeft} дн.`}
                          </span>
                        )}
                        <span className="text-sm font-bold text-white">{order.total_cost.toLocaleString("ru-RU")} ₽</span>
                        <button onClick={() => openEdit(order)} className="p-1.5 text-slate-500 hover:text-white transition-colors">
                          <ChevronRight size={16} />
                        </button>
                      </div>
                    </div>

                    {/* Этапы */}
                    <div className="flex items-center gap-1 mb-3">
                      {LDSP_STATUSES.map((s, i) => {
                        const isDone = i < currentIdx;
                        const isCurrent = i === currentIdx;
                        const label = statusMeta[s]?.label;
                        return (
                          <React.Fragment key={s}>
                            {i > 0 && (
                              <div className={`flex-1 h-1 rounded-full ${isDone || isCurrent ? "bg-indigo-500" : "bg-white/10"}`} />
                            )}
                            <div className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10px] font-bold whitespace-nowrap border transition-all ${
                              isCurrent
                                ? "bg-indigo-500/20 border-indigo-500/40 text-indigo-300"
                                : isDone
                                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                                : "bg-white/5 border-white/10 text-slate-600"
                            }`}>
                              <span className={`w-2 h-2 rounded-full ${isCurrent ? "bg-indigo-400" : isDone ? "bg-emerald-400" : "bg-white/20"}`} />
                              {label}
                            </div>
                          </React.Fragment>
                        );
                      })}
                      <span className="text-[10px] text-slate-600 ml-1">
                        {currentIdx + 1}/{LDSP_STATUSES.length}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-[11px] text-slate-400">
                        <span>{new Date(order.created_at).toLocaleDateString("ru-RU")}</span>
                        <span className="flex items-center gap-1"><Store size={10} /> {order.client_name || "не указан"}</span>
                        <span className="flex items-center gap-1"><Calendar size={10} /> {formatDate(deadline)}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={(e) => { e.stopPropagation(); deleteOrder(order.id); }}
                          className="p-1.5 rounded-lg text-rose-400/60 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
                          title="Удалить"
                        >
                          <Trash2 size={14} />
                        </button>
                        {getNextStatus(order.status) && (
                          <button
                            onClick={(e) => { e.stopPropagation(); advanceStatus(order, getNextStatus(order.status)!); }}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-500/30 transition-all"
                          >
                            {statusMeta[getNextStatus(order.status)!]?.icon}
                            {statusMeta[getNextStatus(order.status)!]?.label}
                            <ArrowRight size={12} />
                          </button>
                        )}
                        {order.status === "выдан" && (
                          <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1"><CheckCircle2 size={12} /> Выполнен</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default OrdersPage;
