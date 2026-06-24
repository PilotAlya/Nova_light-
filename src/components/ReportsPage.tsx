import React, { useState, useEffect, useMemo } from "react";
import { TrendingUp, PieChart, BarChart, Store, MessageCircle, Download } from "lucide-react";
import { fetchOrders, Order } from "../api/orders";

const MONTHS = ["Янв", "Фев", "Мар", "Апр", "Май", "Июн", "Июл", "Авг", "Сен", "Окт", "Ноя", "Дек"];

const statusColors: Record<string, string> = {
  "новый": "#60a5fa",
  "в раскрое": "#f59e0b",
  "на кромковании": "#a78bfa",
  "готов к выдаче": "#34d399",
  "выдан": "#64748b",
};

const BarChartSVG: React.FC<{ data: { label: string; value: number; color: string }[] }> = ({ data }) => {
  const maxVal = Math.max(...data.map(d => d.value), 1);
  return (
    <div className="flex items-end gap-2 h-40 pt-4">
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
          <span className="text-[9px] font-bold text-white">{d.value.toLocaleString()}</span>
          <div className="w-full rounded-lg relative" style={{ height: `${Math.max((d.value / maxVal) * 100, 4)}%`, backgroundColor: d.color, minHeight: 4 }} />
          <span className="text-[8px] text-slate-500 text-center">{d.label}</span>
        </div>
      ))}
    </div>
  );
};

const DoughnutChart: React.FC<{ data: { label: string; value: number; color: string }[] }> = ({ data }) => {
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  const segments: { percent: number; color: string }[] = [];
  data.forEach((d, i) => {
    if (i === data.length - 1) {
      segments.push({ percent: 100 - segments.reduce((s, s_) => s + s_.percent, 0), color: d.color });
    } else {
      segments.push({ percent: (d.value / total) * 100, color: d.color });
    }
  });

  const r = 60;
  const circumference = 2 * Math.PI * r;
  let offset = 0;

  return (
    <div className="flex flex-col items-center gap-3">
      <svg width="160" height="160" viewBox="0 0 160 160">
        <circle cx="80" cy="80" r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="20" />
        {segments.map((s, i) => {
          const dashLength = (s.percent / 100) * circumference;
          const seg = <circle key={i} cx="80" cy="80" r={r} fill="none" stroke={s.color} strokeWidth="20" strokeDasharray={`${dashLength} ${circumference - dashLength}`} strokeDashoffset={-offset} transform="rotate(-90 80 80)" />;
          offset += dashLength;
          return seg;
        })}
        <text x="80" y="80" textAnchor="middle" dominantBaseline="central" fill="white" fontSize="24" fontWeight="bold">
          {total}
        </text>
      </svg>
      <div className="flex flex-wrap gap-3 justify-center">
        {data.filter(d => d.value > 0).map((d, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }} />
            <span className="text-[10px] text-slate-400">{d.label}: <strong className="text-white">{d.value}</strong></span>
          </div>
        ))}
      </div>
    </div>
  );
};

const ReportsPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeChart, setActiveChart] = useState<"revenue" | "orders">("revenue");

  useEffect(() => {
    fetchOrders().then(setOrders).catch(() => {});
  }, []);

  const revenueByMonth = useMemo(() => {
    const byMonth: Record<string, number> = {};
    orders.forEach(o => {
      const m = new Date(o.created_at).getMonth();
      byMonth[m] = (byMonth[m] || 0) + (o.total_cost || 0);
    });
    return MONTHS.map((label, i) => ({ label, value: byMonth[i] || 0, color: "#818cf8" }));
  }, [orders]);

  const revenueData = useMemo(() => {
    const total = revenueByMonth.reduce((s, m) => s + m.value, 0);
    return { total, months: revenueByMonth };
  }, [revenueByMonth]);

  const ordersByStatus = useMemo(() => {
    const counts: Record<string, number> = {};
    orders.forEach(o => { counts[o.status] = (counts[o.status] || 0) + 1; });
    return Object.entries(counts).map(([k, v]) => ({
      label: k,
      value: v,
      color: statusColors[k] || "#64748b",
    }));
  }, [orders]);

  const ordersBySource = useMemo(() => {
    const salon = orders.filter(o => o.source === "салон").length;
    const vk = orders.filter(o => o.source === "ВК").length;
    return [
      { label: "Салон", value: salon, color: "#f59e0b" },
      { label: "ВК", value: vk, color: "#38bdf8" },
    ];
  }, [orders]);

  const avgOrderValue = useMemo(() => {
    if (orders.length === 0) return 0;
    return Math.round(orders.reduce((s, o) => s + (o.total_cost || 0), 0) / orders.length);
  }, [orders]);

  const exportProfitReport = () => {
    const rows = orders.map(o => [
      o.id,
      o.client_name,
      o.status,
      o.source,
      o.total_cost,
      o.created_at?.slice(0, 10),
    ]);
    const csv = [["ID", "Клиент", "Статус", "Источник", "Сумма", "Дата"], ...rows]
      .map(r => r.map(v => `"${v}"`).join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `profit_report_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <div className="max-w-6xl mx-auto fade-in space-y-6">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight">Отчёты</h2>
          <p className="text-slate-400 text-sm mt-1">Аналитика по заказам и выручке</p>
        </div>
        <button onClick={exportProfitReport} className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 px-4 py-2 rounded-xl text-sm font-semibold transition-all">
          <Download size={16} /> Выгрузить отчёт
        </button>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-4 gap-4">
        <div className="glass-panel rounded-2xl p-4 border border-white/5">
          <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Всего заказов</p>
          <p className="text-2xl font-bold text-white mt-1">{orders.length}</p>
        </div>
        <div className="glass-panel rounded-2xl p-4 border border-white/5">
          <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Общая выручка</p>
          <p className="text-2xl font-bold text-emerald-400 mt-1">{revenueData.total.toLocaleString()} ₽</p>
        </div>
        <div className="glass-panel rounded-2xl p-4 border border-white/5">
          <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Средний чек</p>
          <p className="text-2xl font-bold text-indigo-400 mt-1">{avgOrderValue.toLocaleString()} ₽</p>
        </div>
        <div className="glass-panel rounded-2xl p-4 border border-white/5">
          <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Активных</p>
          <p className="text-2xl font-bold text-amber-400 mt-1">{orders.filter(o => o.status !== "выдан").length}</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-2 gap-6">
        {/* Revenue chart */}
        <div className="glass-panel rounded-2xl p-5 border border-white/5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp size={16} className="text-indigo-400" />
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Выручка по месяцам</h3>
            </div>
            <span className="text-xs text-white font-bold">{revenueData.total.toLocaleString()} ₽</span>
          </div>
          <BarChartSVG data={revenueData.months} />
        </div>

        {/* Orders by status */}
        <div className="glass-panel rounded-2xl p-5 border border-white/5">
          <div className="flex items-center gap-2 mb-4">
            <PieChart size={16} className="text-indigo-400" />
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Заказы по статусам</h3>
          </div>
          <DoughnutChart data={ordersByStatus} />
        </div>
      </div>

      {/* Orders by source */}
      <div className="glass-panel rounded-2xl p-5 border border-white/5">
        <div className="flex items-center gap-2 mb-4">
          <BarChart size={16} className="text-indigo-400" />
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Заказы по источникам</h3>
        </div>
        <div className="grid grid-cols-2 gap-6">
          {ordersBySource.map(s => (
            <div key={s.label} className="bg-black/30 rounded-xl p-4 border border-white/5 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                {s.label === "Салон" ? <Store size={16} className="text-amber-400" /> : <MessageCircle size={16} className="text-sky-400" />}
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{s.label}</span>
              </div>
              <p className="text-3xl font-bold text-white">{s.value}</p>
              <p className="text-[10px] text-slate-500 mt-1">
                {orders.length > 0 ? Math.round((s.value / orders.length) * 100) : 0}% от общего
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Recent orders table */}
      <div className="glass-panel rounded-2xl p-5 border border-white/5">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Последние заказы</h3>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-[10px] text-slate-500 uppercase tracking-widest border-b border-white/5">
              <th className="text-left py-2 pr-4">Клиент</th>
              <th className="text-left py-2 pr-4">Сумма</th>
              <th className="text-left py-2 pr-4">Статус</th>
              <th className="text-left py-2 pr-4">Источник</th>
              <th className="text-left py-2 pr-4">Дата</th>
            </tr>
          </thead>
          <tbody>
            {[...orders].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 10).map(o => (
              <tr key={o.id} className="border-b border-white/5 text-xs text-slate-300">
                <td className="py-2.5 pr-4 font-medium text-white">{o.client_name || `#${o.id}`}</td>
                <td className="py-2.5 pr-4 font-bold text-emerald-400">{o.total_cost?.toLocaleString()} ₽</td>
                <td className="py-2.5 pr-4"><span className={`text-[10px] px-2 py-0.5 rounded font-bold`} style={{ backgroundColor: `${statusColors[o.status]}20`, color: statusColors[o.status] }}>{o.status}</span></td>
                <td className="py-2.5 pr-4 text-slate-400">{o.source === "ВК" ? "ВК" : "Салон"}</td>
                <td className="py-2.5 text-slate-500">{new Date(o.created_at).toLocaleDateString("ru-RU")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ReportsPage;
