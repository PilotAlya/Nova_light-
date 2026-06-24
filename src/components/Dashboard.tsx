import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Calendar, Clock, TrendingUp, CreditCard, Package, AlertTriangle,
  ArrowRight, CheckCircle, XCircle, Users, DollarSign, ShoppingBag,
  Sparkles
} from "lucide-react";
import { Lead, TimelineEntry } from "../types";
import { Order } from "../api/orders";
import { CashShift, CashEntry, fetchTodayShift, fetchCleaning, CleaningItem } from "../api/cash";

interface DashboardProps {
  currentUser: string | null;
  leads: Lead[];
  projectTimeline: TimelineEntry[];
  onNavigate: (tab: any) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ currentUser, leads, projectTimeline, onNavigate }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [cashShift, setCashShift] = useState<CashShift | null>(null);
  const [cleaningTasks, setCleaningTasks] = useState<CleaningItem[]>([]);
  const [loading, setLoading] = useState(true);
  const seeded = useRef(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ordersRes, shift, cleaning] = await Promise.all([
          fetch("/api/orders").then(r => r.ok ? r.json() : []),
          fetchTodayShift().catch(() => null),
          fetchCleaning().catch(() => [] as CleaningItem[]),
        ]);
        const list = Array.isArray(ordersRes) ? ordersRes : [];
        if (list.length === 0 && !seeded.current) {
          seeded.current = true;
          setOrders([{
            id: 17,
            client_name: "Дмитрий Иванов",
            phone: "+7 (999) 123-45-67",
            source: "салон",
            material: "ЛДСП Дуб Сонома",
            status: "новый",
            payment_status: "не оплачено",
            total_cost: 0,
            positions_json: JSON.stringify([{ width: 500, height: 1000, edge: "0.4мм", hinges: 0 }]),
            deadline: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            responsible: "",
            pickup_location: "салон РЭЛАН",
          }]);
        } else {
          setOrders(list);
        }
        setCashShift(shift);
        setCleaningTasks(Array.isArray(cleaning) ? cleaning : []);
      } catch {
        if (!seeded.current) {
          seeded.current = true;
          setOrders([{
            id: 17,
            client_name: "Дмитрий Иванов",
            phone: "+7 (999) 123-45-67",
            source: "салон",
            material: "ЛДСП Дуб Сонома",
            status: "новый",
            payment_status: "не оплачено",
            total_cost: 0,
            positions_json: JSON.stringify([{ width: 500, height: 1000, edge: "0.4мм", hinges: 0 }]),
            deadline: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            responsible: "",
            pickup_location: "салон РЭЛАН",
          }]);
        }
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  const todayTasks = useMemo(() => {
    const today = new Date().toISOString().split("T")[0];
    return projectTimeline.filter(
      t => t.member === currentUser && t.start === today && t.status !== "done"
    );
  }, [projectTimeline, currentUser]);

  const todayCleaning = useMemo(() => {
    const dayOfWeek = new Date().getDay() || 7;
    const tasks = cleaningTasks.filter(i => i.day_of_week === dayOfWeek);
    const byAssignee = tasks.reduce<Record<string, CleaningItem[]>>((acc, item) => {
      const key = item.assignee || "Без ответственного";
      if (!acc[key]) acc[key] = [];
      acc[key].push(item);
      return acc;
    }, {});
    return { tasks, byAssignee };
  }, [cleaningTasks]);

  const upcomingDeadlines = useMemo(() => {
    const today = new Date();
    const weekLater = new Date(today);
    weekLater.setDate(weekLater.getDate() + 7);
    return orders
      .filter(o => o.deadline && o.status !== "выдан")
      .sort((a, b) => new Date(a.deadline!).getTime() - new Date(b.deadline!).getTime())
      .slice(0, 10);
  }, [orders]);

  const todayCash = useMemo(() => {
    if (!cashShift) return { cashTotal: 0, cashlessTotal: 0, expenseTotal: 0 };
    const entries = cashShift.entries || [];
    const cashTotal = entries.filter(e => e.type === "sale" && e.method === "cash").reduce((s, e) => s + e.amount, 0);
    const cashlessTotal = entries.filter(e => e.type === "sale" && e.method === "cashless").reduce((s, e) => s + e.amount, 0);
    const expenseTotal = entries.filter(e => e.type === "expense").reduce((s, e) => s + e.amount, 0);
    return { cashTotal, cashlessTotal, expenseTotal };
  }, [cashShift]);

  const recentOrders = useMemo(() => {
    return [...orders].sort((a, b) => new Date(b.created_at || "").getTime() - new Date(a.created_at || "").getTime()).slice(0, 5);
  }, [orders]);

  const statusLabels: Record<string, string> = {
    "новый": "Новый", "утверждён": "Утверждён", "в сборке": "В сборке",
    "готов к выдаче": "Готов к выдаче", "выдан": "Выдан",
  };

  const statusColors: Record<string, string> = {
    "новый": "text-yellow-400 bg-yellow-500/10",
    "утверждён": "text-indigo-400 bg-indigo-500/10",
    "в сборке": "text-amber-400 bg-amber-500/10",
    "готов к выдаче": "text-green-400 bg-green-500/10",
    "выдан": "text-slate-500 bg-white/5",
  };

  const getDeadlineDays = (deadline?: string) => {
    if (!deadline) return null;
    const diff = Math.ceil((new Date(deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto fade-in">
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin w-6 h-6 border-2 border-indigo-400 border-t-transparent rounded-full" />
        </div>
      </div>
    );
  }

  const WidgetCard = ({ title, icon, children, onClick, className = "" }: any) => (
    <div className={`glass-panel rounded-2xl p-5 border border-white/5 hover:border-indigo-500/20 transition-all ${onClick ? "cursor-pointer" : ""} ${className}`} onClick={onClick}>
      <div className="flex items-center gap-2 mb-4">
        <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400">{icon}</div>
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">{title}</h3>
      </div>
      {children}
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto fade-in space-y-6">
      <div className="mb-2">
        <h2 className="text-3xl font-bold text-white tracking-tight">Рэлан - {currentUser}</h2>
        <p className="text-slate-400 text-sm mt-1">
          Демо-приложение для управления салоном - управление заказами, задачами, материалами и персоналом
        </p>
      </div>

      {/* App features showcase */}
      <div className="grid grid-cols-3 gap-6 mb-6">
        <WidgetCard title="Канбан Лиды" icon={<Package size={16} />} onClick={() => onNavigate("orders")}>
          <div className="text-sm text-slate-300 mb-3">
            Перетаскивайте заказы между этапами: Новые → Утверждены → В сборке → Готово → Выдано
          </div>
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-24 bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-indigo-500 rounded-full" style={{ width: "35%" }}></div>
            </div>
            <span className="text-[10px] text-slate-500">3/10 активных</span>
          </div>
        </WidgetCard>

        <WidgetCard title="Уборка персонала" icon={<CheckCircle size={16} />} onClick={() => onNavigate("cleaning")}>
          <div className="text-sm text-slate-300 mb-3">
            Суточные задачи и график проветривания для сотрудников
          </div>
          <div className="flex items-center gap-3">
            <div className="flex -space-x-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="w-6 h-6 rounded-full border-2 border-white/20 bg-indigo-500/20" />
              ))}
            </div>
            <span className="text-[10px] text-slate-500">3 сотрудника</span>
          </div>
        </WidgetCard>

        <WidgetCard title="Шпаргалки" icon={<Users size={16} />} onClick={() => onNavigate("wiki")}>
          <div className="text-sm text-slate-300 mb-3">
            Редактируемые инструкции по Инфопредприятию и контактам с клиентами
          </div>
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-24 bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-purple-500 rounded-full" style={{ width: "80%" }}></div>
            </div>
            <span className="text-[10px] text-slate-500">8 карточек</span>
          </div>
        </WidgetCard>
      </div>

      <div className="grid grid-cols-3 gap-6">

        {/* Recent orders */}
        <WidgetCard title="Последние заказы" icon={<Package size={16} />} onClick={() => onNavigate("orders")} className="col-span-2">
          <div className="space-y-2">
            {recentOrders.length === 0 ? (
              <div className="text-slate-500 text-sm py-4 text-center">Нет заказов</div>
            ) : recentOrders.map(order => {
              const daysLeft = getDeadlineDays(order.deadline);
              return (
                <div key={order.id} className="flex items-center justify-between py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-2 h-2 rounded-full ${order.status === "выдан" ? "bg-green-400" : "bg-indigo-400"}`} />
                    <div className="min-w-0">
                      <div className="text-sm font-bold text-white truncate">{order.client_name || `Заказ #${order.id}`}</div>
                      <div className="text-[10px] text-slate-500">{order.phone || ""}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className={`text-[10px] px-2 py-1 rounded-lg font-bold ${statusColors[order.status] || "text-slate-400 bg-white/5"}`}>
                      {statusLabels[order.status] || order.status}
                    </span>
                    {order.total_cost && <span className="text-xs font-bold text-emerald-400">{order.total_cost.toLocaleString()} ₽</span>}
                    {daysLeft !== null && daysLeft <= 3 && (
                      <span className={`text-[10px] font-bold ${daysLeft <= 0 ? "text-rose-400" : "text-yellow-400"}`}>
                        {daysLeft <= 0 ? "× Просрочен" : `${daysLeft} дн.`}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-3 text-right">
            <button onClick={() => onNavigate("orders")} className="text-[10px] text-indigo-400 hover:text-indigo-300 font-bold uppercase tracking-widest flex items-center gap-1 ml-auto">
              Все заказы <ArrowRight size={12} />
            </button>
          </div>
        </WidgetCard>

        {/* Upcoming deadlines */}
        <WidgetCard title="Ближайшие дедлайны" icon={<Clock size={16} />}>
          <div className="space-y-2">
            {upcomingDeadlines.length === 0 ? (
              <div className="text-slate-500 text-sm py-4 text-center">Нет активных заказов</div>
            ) : upcomingDeadlines.map(order => {
              const daysLeft = getDeadlineDays(order.deadline);
              const isOverdue = daysLeft !== null && daysLeft <= 0;
              return (
                <div key={order.id} className={`flex items-center justify-between py-2 px-3 rounded-xl transition-all ${isOverdue ? "bg-rose-500/10 border border-rose-500/20" : "bg-white/5 hover:bg-white/10"}`}>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-white truncate">{order.client_name || `#${order.id}`}</div>
                    <div className="text-[10px] text-slate-500">{order.source === "salon" ? "Салон" : "ВК"}</div>
                  </div>
                  <div className={`text-xs font-bold shrink-0 ${isOverdue ? "text-rose-400 animate-pulse" : daysLeft !== null && daysLeft <= 2 ? "text-yellow-400" : "text-slate-400"}`}>
                    {isOverdue ? `× ${Math.abs(daysLeft!)} дн.` : `${daysLeft} дн.`}
                  </div>
                </div>
              );
            })}
          </div>
        </WidgetCard>

      </div>

      {/* Cleaning tasks today */}
      <WidgetCard title="Уборка сегодня" icon={<CheckCircle size={16} />} onClick={() => onNavigate("cleaning")}>
        {todayCleaning.tasks.length === 0 ? (
          <div className="text-slate-500 text-sm py-4 text-center">На сегодня задач нет</div>
        ) : (
          <div className="space-y-3">
            {Object.entries(todayCleaning.byAssignee).map(([assignee, tasks]) => (
              <div key={assignee}>
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                  <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest">{assignee}</span>
                </div>
                <div className="space-y-1 ml-3">
                  {tasks.map(task => (
                    <div key={task.id} className="flex items-center gap-2 py-1.5 px-3 rounded-lg bg-white/5">
                      <span className="text-xs text-slate-300">{task.task_name}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </WidgetCard>

    </div>
  );
};

export default Dashboard;
