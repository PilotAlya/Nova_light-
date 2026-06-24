import React, { useState, useEffect, useRef, useCallback } from "react";
import { Bell, AlertTriangle, Clock, X, ChevronRight } from "lucide-react";
import { fetchOrders, Order } from "../api/orders";

interface NotificationsProps {
  onNavigate: (tab: string, orderId?: number) => void;
}

interface Notification {
  id: string;
  type: "overdue" | "deadline";
  orderId: number;
  clientName: string;
  message: string;
  daysLeft: number;
}

const Notifications: React.FC<NotificationsProps> = ({ onNavigate }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const checkNotifications = useCallback(async () => {
    try {
      const orders = await fetchOrders();
      const result: Notification[] = [];
      const now = new Date();

      orders.forEach(o => {
        if (o.status === "выдан") return;
        if (!o.deadline) return;

        const deadline = new Date(o.deadline);
        const daysLeft = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        const name = o.client_name || `#${o.id}`;

        if (daysLeft <= 0) {
          result.push({
            id: `overdue-${o.id}`,
            type: "overdue",
            orderId: o.id,
            clientName: name,
            message: `Просрочен на ${Math.abs(daysLeft)} дн.`,
            daysLeft,
          });
        } else if (daysLeft <= 3) {
          result.push({
            id: `deadline-${o.id}`,
            type: "deadline",
            orderId: o.id,
            clientName: name,
            message: `Осталось ${daysLeft} дн.`,
            daysLeft,
          });
        }
      });

      setNotifications(result);
    } catch {}
  }, []);

  useEffect(() => {
    checkNotifications();
    const interval = setInterval(checkNotifications, 60000);
    return () => clearInterval(interval);
  }, [checkNotifications]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleClickNotification = (n: Notification) => {
    setOpen(false);
    onNavigate("orders", n.orderId);
  };

  const overdueCount = notifications.filter(n => n.type === "overdue").length;
  const totalCount = notifications.length;

  if (totalCount === 0 && overdueCount === 0) return null;

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen(!open)} className="relative w-10 h-10 rounded-full glass-panel flex items-center justify-center border border-white/15 hover:border-indigo-500/50 transition-all" title="Уведомления">
        <Bell size={16} className="text-slate-300" />
        {overdueCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4.5 h-4.5 bg-rose-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
            {overdueCount}
          </span>
        )}
        {overdueCount === 0 && totalCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-amber-500 text-white text-[8px] font-bold rounded-full flex items-center justify-center">
            {totalCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-12 w-80 glass-panel rounded-2xl border border-white/10 shadow-2xl z-50 overflow-hidden">
          <div className="p-4 border-b border-white/5">
            <h3 className="text-xs font-bold text-white uppercase tracking-widest">Уведомления</h3>
          </div>
          <div className="max-h-72 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-slate-500 text-sm">Нет уведомлений</div>
            ) : (
              notifications.map(n => (
                <button key={n.id} onClick={() => handleClickNotification(n)} className="w-full flex items-start gap-3 p-3 hover:bg-white/5 transition-all text-left border-b border-white/5 last:border-0">
                  <div className={`mt-0.5 p-1.5 rounded-lg ${n.type === "overdue" ? "bg-rose-500/20 text-rose-400" : "bg-amber-500/20 text-amber-400"}`}>
                    {n.type === "overdue" ? <AlertTriangle size={14} /> : <Clock size={14} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-white truncate">{n.clientName}</p>
                    <p className="text-[10px] text-slate-400">{n.message}</p>
                  </div>
                  <ChevronRight size={14} className="text-slate-600 mt-1 shrink-0" />
                </button>
              ))
            )}
          </div>
          <div className="p-2 border-t border-white/5">
            <button onClick={() => { setOpen(false); onNavigate("orders"); }} className="w-full text-center text-[10px] text-indigo-400 hover:text-indigo-300 font-bold uppercase tracking-widest py-1">
              Все заказы
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Notifications;
