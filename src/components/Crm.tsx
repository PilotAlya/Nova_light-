import React, { useState, useEffect, useCallback } from 'react';
import { User, Phone, MapPin, ShoppingBag, DollarSign, MessageCircle, CheckCircle2, Clock, Calendar, Plus, ChevronRight, ChevronDown, CreditCard, ListTodo, X, Send } from 'lucide-react';
import { api } from "../api/client";
import { Lead } from '../types';

interface PaymentRecord {
  id: string;
  date: string;
  amount: number;
  type: "prepayment" | "payment" | "full";
  note: string;
}

interface Communication {
  date: string;
  text: string;
  from: "manager" | "client";
  channel: "telegram" | "vk" | "phone" | "whatsapp";
}

interface Client {
  id: string;
  name: string;
  phone: string;
  address: string;
  totalPurchases: number;
  preferences: string;
  leadIds: string[];
  payments: PaymentRecord[];
  communications: Communication[];
}

interface DailyTask {
  id: string;
  text: string;
  leadId: string;
  assignee: string;
  done: boolean;
}

interface CrmProps {
  leads: Lead[];
  teamMembers: Record<string, { name: string; avatar: string }>;
  currentUser?: string | null;
  onLeadClick?: (lead: Lead) => void;
}

const FALLBACK_CLIENTS: Client[] = [
  {
    id: "CL-001",
    name: "Анна Смирнова",
    phone: "+7 (912) 345-67-89",
    address: "ул. Ленина, 45, кв. 12",
    totalPurchases: 285000,
    preferences: "Светлые тона, минимализм, Blum-фурнитура",
    leadIds: ["LD-001", "LD-008"],
    payments: [
      { id: "P-001", date: "2026-04-10", amount: 100000, type: "prepayment", note: "Предоплата 35%" },
      { id: "P-002", date: "2026-04-25", amount: 100000, type: "payment", note: "Промежуточный платёж" },
    ],
    communications: [
      { date: "2026-04-08 10:30", text: "Добрый день! Хочу заказать кухню.", from: "client", channel: "telegram" },
      { date: "2026-04-08 10:35", text: "Здравствуйте! Подскажите, какие материалы предпочитаете?", from: "manager", channel: "telegram" },
      { date: "2026-04-12 14:00", text: "Согласовали эскиз, жду спецификацию.", from: "client", channel: "whatsapp" },
    ],
  },
  {
    id: "CL-002",
    name: "Сергей Кузнецов",
    phone: "+7 (915) 678-90-12",
    address: "пр. Комсомольский, 78, кв. 5",
    totalPurchases: 160000,
    preferences: "Шкаф-купе, раздвижные двери, эмаль",
    leadIds: ["LD-002"],
    payments: [
      { id: "P-003", date: "2026-04-15", amount: 80000, type: "prepayment", note: "50% предоплата" },
    ],
    communications: [
      { date: "2026-04-13 09:00", text: "Нужен шкаф в нишу 2.5м.", from: "client", channel: "vk" },
    ],
  },
  {
    id: "CL-003",
    name: "Елена Попова",
    phone: "+7 (919) 111-22-33",
    address: "ул. Сибирская, 23, кв. 45",
    totalPurchases: 420000,
    preferences: "Эко-стиль, натуральное дерево, открытые полки",
    leadIds: ["LD-003", "LD-010"],
    payments: [
      { id: "P-004", date: "2026-05-05", amount: 210000, type: "prepayment", note: "50%" },
      { id: "P-005", date: "2026-05-20", amount: 150000, type: "payment", note: "Оплата после замера" },
    ],
    communications: [
      { date: "2026-05-01 11:20", text: "Интересует гардеробная комната.", from: "client", channel: "telegram" },
      { date: "2026-05-01 11:25", text: "Можем предложить эко-стиль с натуральным шпоном.", from: "manager", channel: "telegram" },
    ],
  },
];

const FALLBACK_TASKS: DailyTask[] = [
  { id: "DT-001", text: "Позвонить Петровой для согласования цвета фасадов", leadId: "LD-001", assignee: "Елена Морозова", done: false },
  { id: "DT-002", text: "Передать заказ Сидорова в цех", leadId: "LD-002", assignee: "Елена Морозова", done: true },
  { id: "DT-003", text: "Встреча с Козловой на замере", leadId: "LD-003", assignee: "Сергей Кузнецов", done: false },
  { id: "DT-004", text: "Подготовить спецификацию для ООО «Ремонт-Про»", leadId: "LD-009", assignee: "Дмитрий Волков", done: false },
];

function transformApiClient(ac: any): Client {
  let total = 0;
  const payments: PaymentRecord[] = (ac.orders || []).flatMap((o: any) =>
    (o.payments || []).map((p: any) => {
      total += Number(p.amount) || 0;
      return { id: String(p.id), date: p.paid_at?.slice(0, 10) || "", amount: Number(p.amount) || 0, type: p.type === "full" ? "full" : p.type === "prepayment" ? "prepayment" : "payment", note: p.note || "" };
    })
  );
  const communications: Communication[] = (ac.communications || []).map((c: any) => ({
    date: c.created_at || "",
    text: c.message || "",
    from: c.direction === "incoming" ? "client" : "manager",
    channel: (["telegram", "vk", "phone", "whatsapp"].includes(c.channel) ? c.channel : "telegram") as Communication["channel"],
  }));
  return {
    id: String(ac.id),
    name: ac.name || "",
    phone: ac.phone || "",
    address: ac.notes?.slice(0, 60) || "",
    totalPurchases: total || Number(ac.notes?.match(/\d+/)?.[0]) || 0,
    preferences: "",
    leadIds: (ac.lead_ids || []).map(String),
    payments,
    communications,
  };
}

const Crm: React.FC<CrmProps> = ({ leads, teamMembers, currentUser, onLeadClick }) => {
  const [clients, setClients] = useState<Client[]>(() => [...FALLBACK_CLIENTS]);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [expandedTasks, setExpandedTasks] = useState(true);
  const [expandedPayments, setExpandedPayments] = useState<Record<string, boolean>>({});
  const [showAddForm, setShowAddForm] = useState(false);
  const [addForm, setAddForm] = useState({ name: "", phone: "" });
  const [newComm, setNewComm] = useState("");
  const [loading, setLoading] = useState(true);

  const getLeadById = useCallback((id: string) => leads.find(l => l.id === id), [leads]);

  const tasks = currentUser ? FALLBACK_TASKS.filter(t => {
    const member = Object.values(teamMembers).find(m => m.name === currentUser);
    return t.assignee === currentUser || !member;
  }) : FALLBACK_TASKS;

  const [dailyTasks, setDailyTasks] = useState(tasks);

  useEffect(() => {
    (async () => {
      try {
        const data: any[] = await api.get("/clients");
        if (data && data.length > 0) {
          const mapped = data.map(transformApiClient);
          setClients(mapped);
          setSelectedClientId(String(mapped[0].id));
        }
      } catch {
        // Fallback data already set
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const createClient = async () => {
    if (!addForm.name.trim()) return;
    try {
      const created: any = await api.post("/clients", { name: addForm.name, phone: addForm.phone });
      const mapped = transformApiClient(created);
      setClients(prev => [...prev, mapped]);
      setSelectedClientId(mapped.id);
      setAddForm({ name: "", phone: "" });
      setShowAddForm(false);
    } catch {
      const fallback: Client = {
        id: "CL-" + String(Date.now()).slice(-3),
        name: addForm.name,
        phone: addForm.phone,
        address: "",
        totalPurchases: 0,
        preferences: "",
        leadIds: [],
        payments: [],
        communications: [],
      };
      setClients(prev => [...prev, fallback]);
      setSelectedClientId(fallback.id);
      setShowAddForm(false);
    }
  };

  const addCommunication = async () => {
    if (!newComm.trim() || !selectedClientId) return;
    const client = clients.find(c => c.id === selectedClientId);
    if (!client) return;
    try {
      await api.post(`/clients/${selectedClientId}/communications`, { message: newComm, channel: "telegram", direction: "outgoing" });
    } catch {}
    setClients(prev => prev.map(c => c.id === selectedClientId ? {
      ...c,
      communications: [...c.communications, { date: new Date().toISOString(), text: newComm, from: "manager", channel: "telegram" }],
    } : c));
    setNewComm("");
  };

  const toggleTask = (taskId: string) => {
    setDailyTasks(prev => prev.map(t => t.id === taskId ? { ...t, done: !t.done } : t));
  };

  const remainingTasks = dailyTasks.filter(t => !t.done).length;
  const selectedClient = clients.find(c => c.id === selectedClientId) || null;

  const calcRemainingPayment = (client: Client) => {
    const total = client.totalPurchases;
    const paid = client.payments.reduce((s, p) => s + p.amount, 0);
    return total - paid;
  };

  return (
    <div className="max-w-6xl mx-auto fade-in">
      <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center">
            <User className="text-indigo-400" size={22} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Клиенты и CRM</h2>
            <p className="text-xs text-slate-400">История заказов, коммуникации, оплаты и задачи на день</p>
          </div>
        </div>
        <button onClick={() => setShowAddForm(true)} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all">
          <Plus size={14} /> Новый клиент
        </button>
      </div>

      {showAddForm && (
        <div className="glass-panel rounded-2xl p-5 border border-indigo-500/30 mb-6 space-y-3">
          <div className="flex items-center justify-between mb-1">
            <h4 className="text-xs font-bold text-indigo-300 uppercase tracking-widest">Новый клиент</h4>
            <button onClick={() => setShowAddForm(false)} className="text-slate-400 hover:text-white transition-colors"><X size={16} /></button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input value={addForm.name} onChange={e => setAddForm(f => ({ ...f, name: e.target.value }))} placeholder="Имя *" className="bg-black/30 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500/50" />
            <input value={addForm.phone} onChange={e => setAddForm(f => ({ ...f, phone: e.target.value }))} placeholder="Телефон" className="bg-black/30 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500/50" />
          </div>
          <button onClick={createClient} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2.5 rounded-xl transition-all text-sm">Создать</button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <div className="glass-panel rounded-2xl p-4 border border-white/5">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
              <User size={14} /> Клиенты {!loading && <span className="text-[10px] text-slate-500 font-normal">({clients.length})</span>}
            </h3>
            <div className="space-y-2">
              {loading ? (
                <p className="text-xs text-slate-500 text-center py-4">Загрузка...</p>
              ) : clients.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-4">Нет клиентов</p>
              ) : clients.map(client => (
                <button
                  key={client.id}
                  onClick={() => setSelectedClientId(client.id)}
                  className={`w-full text-left p-3 rounded-xl transition-all ${
                    selectedClientId === client.id ? "bg-indigo-500/15 border border-indigo-500/25" : "bg-white/5 hover:bg-white/10 border border-transparent"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-bold text-white">{client.name}</div>
                    <ChevronRight size={12} className={selectedClientId === client.id ? "text-indigo-400" : "text-slate-500"} />
                  </div>
                  <div className="flex items-center gap-1.5 mt-1">
                    <Phone size={10} className="text-slate-500" />
                    <span className="text-[10px] text-slate-400">{client.phone || "—"}</span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <ShoppingBag size={10} className="text-slate-500" />
                    <span className="text-[10px] text-slate-400">{client.leadIds.length} заказа · {client.totalPurchases.toLocaleString()} ₽</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="glass-panel rounded-2xl p-4 border border-white/5">
            <button
              onClick={() => setExpandedTasks(!expandedTasks)}
              className="w-full flex items-center justify-between"
            >
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <ListTodo size={14} /> Задачи на день
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded-full">{remainingTasks}</span>
              </h3>
              {expandedTasks ? <ChevronDown size={14} className="text-slate-500" /> : <ChevronRight size={14} className="text-slate-500" />}
            </button>
            {expandedTasks && (
              <div className="mt-3 space-y-2">
                {dailyTasks.map(task => {
                  const lead = getLeadById(task.leadId);
                  return (
                    <div key={task.id} className="flex items-start gap-2 p-2 rounded-xl bg-black/20 border border-white/5">
                      <button
                        onClick={() => toggleTask(task.id)}
                        className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 mt-0.5 ${
                          task.done ? "bg-emerald-500 border-emerald-500" : "border-white/20"
                        }`}
                      >
                        {task.done && <CheckCircle2 size={10} className="text-white" />}
                      </button>
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs ${task.done ? "text-slate-500 line-through" : "text-slate-200"}`}>{task.text}</p>
                        {lead && (
                          <button
                            onClick={() => onLeadClick?.(lead)}
                            className="text-[9px] text-indigo-400 hover:text-indigo-300 mt-0.5 flex items-center gap-1"
                          >
                            {lead.id} · {lead.name} <ChevronRight size={8} />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-2 space-y-4">
          {!selectedClient ? (
            <div className="glass-panel rounded-3xl flex flex-col items-center justify-center text-center p-8 border-dashed border-2 border-white/10">
              <User size={48} className="text-slate-600 mb-4" />
              <h3 className="text-xl font-bold text-slate-400">Выберите клиента</h3>
            </div>
          ) : (
            <>
              <div className="glass-panel rounded-2xl p-5 border border-white/5">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xl font-bold">
                      {selectedClient.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">{selectedClient.name}</h3>
                      <div className="flex flex-wrap gap-3 mt-1">
                        <span className="text-[10px] text-slate-400 flex items-center gap-1"><Phone size={10} /> {selectedClient.phone || "—"}</span>
                        {selectedClient.address && <span className="text-[10px] text-slate-400 flex items-center gap-1"><MapPin size={10} /> {selectedClient.address}</span>}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-emerald-400">{selectedClient.totalPurchases.toLocaleString()} ₽</p>
                    <p className="text-[10px] text-slate-500">Всего покупок</p>
                  </div>
                </div>
                {selectedClient.preferences && (
                  <div className="mt-3 bg-black/30 rounded-xl p-3 border border-white/5">
                    <span className="text-[10px] text-slate-500 font-bold uppercase">Предпочтения</span>
                    <p className="text-xs text-slate-300 mt-0.5">{selectedClient.preferences}</p>
                  </div>
                )}
              </div>

              <div className="glass-panel rounded-2xl p-5 border border-white/5">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <ShoppingBag size={14} /> Заказы клиента
                </h4>
                <div className="space-y-2">
                  {selectedClient.leadIds.length === 0 ? (
                    <p className="text-xs text-slate-500 text-center py-3">Нет связанных заказов</p>
                  ) : selectedClient.leadIds.map(leadId => {
                    const lead = getLeadById(leadId);
                    if (!lead) return null;
                    return (
                      <button
                        key={leadId}
                        onClick={() => onLeadClick?.(lead)}
                        className="w-full flex items-center justify-between bg-white/5 hover:bg-white/10 rounded-xl px-4 py-3 transition-all text-left"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                            <ShoppingBag size={14} className="text-indigo-400" />
                          </div>
                          <div>
                            <div className="text-xs font-bold text-white">{lead.name}</div>
                            <div className="text-[9px] text-slate-500">{lead.id} · {lead.type} · {lead.status}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs font-bold text-white">{lead.budget}</div>
                          <div className="text-[9px] text-slate-500">{lead.deadline}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="glass-panel rounded-2xl p-5 border border-white/5">
                <button
                  onClick={() => setExpandedPayments(prev => ({ ...prev, [selectedClient.id]: !prev[selectedClient.id] }))}
                  className="w-full flex items-center justify-between"
                >
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <CreditCard size={14} /> Оплаты
                  </h4>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] text-slate-400">
                      Оплачено: <span className="text-emerald-400 font-bold">{selectedClient.payments.reduce((s, p) => s + p.amount, 0).toLocaleString()} ₽</span>
                    </span>
                    {expandedPayments[selectedClient.id] ? <ChevronDown size={14} className="text-slate-500" /> : <ChevronRight size={14} className="text-slate-500" />}
                  </div>
                </button>
                {expandedPayments[selectedClient.id] && (
                  <div className="mt-3 space-y-2">
                    {selectedClient.payments.length === 0 ? (
                      <p className="text-xs text-slate-500 text-center py-2">Нет оплат</p>
                    ) : selectedClient.payments.map(p => (
                      <div key={p.id} className="flex items-center justify-between bg-black/20 rounded-xl px-3 py-2">
                        <div className="flex items-center gap-2">
                          <DollarSign size={12} className="text-emerald-400" />
                          <div>
                            <div className="text-xs font-bold text-white">{p.amount.toLocaleString()} ₽</div>
                            <div className="text-[9px] text-slate-500">{p.note} · {p.date}</div>
                          </div>
                        </div>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                          p.type === "prepayment" ? "text-amber-400 bg-amber-500/10" :
                          p.type === "full" ? "text-emerald-400 bg-emerald-500/10" : "text-sky-400 bg-sky-500/10"
                        }`}>
                          {p.type === "prepayment" ? "Предоплата" : p.type === "full" ? "Полная" : "Частичная"}
                        </span>
                      </div>
                    ))}
                    {selectedClient.totalPurchases > 0 && (
                      <div className="border-t border-white/10 pt-2 flex items-center justify-between px-3">
                        <span className="text-xs text-slate-400">Остаток к доплате</span>
                        <span className={`text-sm font-bold ${calcRemainingPayment(selectedClient) > 0 ? "text-amber-400" : "text-emerald-400"}`}>
                          {calcRemainingPayment(selectedClient) > 0 ? `${calcRemainingPayment(selectedClient).toLocaleString()} ₽` : "0 ₽ ✓"}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="glass-panel rounded-2xl p-5 border border-white/5">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <MessageCircle size={14} /> История коммуникаций
                </h4>
                <div className="space-y-3 max-h-64 overflow-y-auto chat-scroll mb-3">
                  {selectedClient.communications.length === 0 ? (
                    <p className="text-xs text-slate-500 text-center py-3">Нет сообщений</p>
                  ) : selectedClient.communications.map((c, i) => (
                    <div key={i} className={`flex gap-3 ${c.from === "manager" ? "flex-row-reverse" : ""}`}>
                      <div className="flex-1 max-w-[80%]">
                        <div className={`p-3 rounded-2xl text-xs ${
                          c.from === "manager"
                            ? "bg-indigo-600/60 text-white rounded-tr-sm"
                            : "bg-white/5 border border-white/5 text-slate-200 rounded-tl-sm"
                        }`}>
                          <p>{c.text}</p>
                        </div>
                        <div className={`flex items-center gap-1.5 mt-1 ${c.from === "manager" ? "justify-end" : ""}`}>
                          <span className="text-[8px] text-slate-500">{c.date?.slice(0, 16) || ""}</span>
                          <span className={`text-[8px] px-1 py-0.5 rounded-full ${
                            c.channel === "telegram" ? "text-sky-400 bg-sky-500/10" :
                            c.channel === "vk" ? "text-blue-400 bg-blue-500/10" :
                            c.channel === "whatsapp" ? "text-emerald-400 bg-emerald-500/10" :
                            "text-slate-400 bg-slate-500/10"
                          }`}>{c.channel}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input value={newComm} onChange={e => setNewComm(e.target.value)} placeholder="Написать сообщение..." className="flex-1 bg-black/30 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500/50" onKeyDown={e => e.key === "Enter" && addCommunication()} />
                  <button onClick={addCommunication} className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 rounded-xl transition-all"><Send size={16} /></button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Crm;
