import React, { useState, useEffect } from "react";
import { Calculator, Plus, Trash2, Settings, ArrowRight, History, Store, MessageCircle, MapPin, Calendar } from "lucide-react";
import { fetchPrices, savePrices, createOrder } from "../api/orders";

interface Position {
  id: number;
  width: string;
  height: string;
  edgeType: "none" | "long" | "short" | "all";
  hinges: string;
}

interface CalculatorProps {
  onNavigateOrders: () => void;
  currentUserName: string | null;
}

const CalculatorV2: React.FC<CalculatorProps> = ({ onNavigateOrders, currentUserName }) => {
  const [positions, setPositions] = useState<Position[]>([{ id: 1, width: "", height: "", edgeType: "none", hinges: "" }]);
  const [showSettings, setShowSettings] = useState(false);
  const [prices, setPrices] = useState({ price_l_ka: 1400, price_edge: 300, price_hinge: 50, price_internal_operation: 200 });
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [source, setSource] = useState("салон");
  const [showOrderForm, setShowOrderForm] = useState(false);

  const formatPhone = (val: string): string => {
    const digits = val.replace(/\D/g, "").slice(0, 11);
    if (!digits) return "";
    let result = "+7";
    if (digits.length > 1) result += " (" + digits.slice(1, 4);
    if (digits.length > 4) result += ") " + digits.slice(4, 7);
    if (digits.length > 7) result += "-" + digits.slice(7, 9);
    if (digits.length > 9) result += "-" + digits.slice(9, 11);
    return result;
  };

  useEffect(() => {
    fetchPrices().then(data => {
      if (data.price_l_ka) setPrices(data);
    }).catch(() => {});
  }, []);

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPrices({ ...prices, [e.target.name]: Number(e.target.value) });
  };

  const savePriceSettings = async () => {
    await savePrices(prices);
    setShowSettings(false);
  };

  const addPosition = () => {
    setPositions([...positions, { id: Date.now(), width: "", height: "", edgeType: "none", hinges: "" }]);
  };

  const updatePosition = (id: number, field: keyof Position, value: string) => {
    setPositions(positions.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  const removePosition = (id: number) => {
    if (positions.length > 1) setPositions(positions.filter(p => p.id !== id));
  };

  const calculateEdge = (w: number, h: number, edgeType: "none" | "long" | "short" | "all"): number => {
    // w, h in mm. Edge length in mm.
    if (edgeType === "none") return 0;
    if (edgeType === "all") return 2 * (w + h);
    if (edgeType === "long") return 2 * Math.max(w, h);
    if (edgeType === "short") return 2 * Math.min(w, h);
    return 0;
  };

  const calculateTotal = () => {
    let total = 0;
    positions.forEach(p => {
      const w = Number(p.width) || 0;
      const h = Number(p.height) || 0;
      const area = (w / 1000) * (h / 1000); // m²
      const edgeLen = calculateEdge(w, h, p.edgeType) / 1000; // m
      const hingesCount = Number(p.hinges) || 0;
      const posTotal = (area * prices.price_l_ka) + (edgeLen * prices.price_edge) + (hingesCount * prices.price_hinge);
      total += posTotal;
    });
    if (total > 0) total += prices.price_internal_operation;
    return Math.round(total);
  };

  const computeDeadline = () => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().slice(0, 10);
  };

  const handleCreateOrder = async () => {
    const totalCost = calculateTotal();
    const deadline = computeDeadline();
    const now = new Date().toISOString();
    const orderData = {
      client_name: clientName,
      phone: clientPhone,
      source,
      total_cost: totalCost,
      positions_json: JSON.stringify(positions),
      responsible: currentUserName || "Администратор",
      deadline,
      pickup_location: "салон РЭЛАН",
      material: "ЛДСП",
      status: "новый",
      payment_status: "не оплачено",
      created_at: now,
      updated_at: now,
    };
    try {
      await createOrder(orderData);
    } catch {
      // Fallback: save to localStorage
      const saved = localStorage.getItem("nova_light_orders_fallback");
      const existing = saved ? JSON.parse(saved) : [];
      const maxId = existing.length > 0 ? Math.max(...existing.map((o: any) => o.id)) : 0;
      const fallbackOrder = { ...orderData, id: maxId + 1 };
      existing.push(fallbackOrder);
      localStorage.setItem("nova_light_orders_fallback", JSON.stringify(existing));
    }
    onNavigateOrders();
  };

  const totalCost = calculateTotal();

  return (
    <div className="max-w-4xl mx-auto fade-in space-y-6">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight">Калькулятор Л-ок</h2>
          <p className="text-slate-400 text-sm mt-1">Расчёт стоимости ЛДСП-панелей — ширина, высота, кромка, петли</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setShowSettings(true)} className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-slate-300 px-4 py-2 rounded-xl text-sm font-medium transition-all border border-white/10">
            <Settings size={16} /> Цены
          </button>
          <button onClick={onNavigateOrders} className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-slate-300 px-4 py-2 rounded-xl text-sm font-medium transition-all border border-white/10">
            <History size={16} /> Заказы
          </button>
        </div>
      </div>

      {/* Info cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-black/30 rounded-xl p-3 text-center border border-white/5">
          <Calendar size={16} className="mx-auto mb-1 text-indigo-400" />
          <p className="text-[10px] text-slate-500">Срок</p>
          <p className="text-sm font-bold text-white">7 дней</p>
        </div>
        <div className="bg-black/30 rounded-xl p-3 text-center border border-white/5">
          <MapPin size={16} className="mx-auto mb-1 text-emerald-400" />
          <p className="text-[10px] text-slate-500">Выдача</p>
          <p className="text-sm font-bold text-white">салон РЭЛАН</p>
        </div>
        <div className="bg-black/30 rounded-xl p-3 text-center border border-white/5">
          <button onClick={() => setSource("салон")} className={`inline-flex items-center gap-1 px-2 py-1 rounded text-[10px] font-bold mr-1 ${source === "салон" ? "bg-amber-500/20 text-amber-300" : "bg-white/5 text-slate-400"}`}><Store size={12} /> Салон</button>
          <button onClick={() => setSource("ВК")} className={`inline-flex items-center gap-1 px-2 py-1 rounded text-[10px] font-bold ${source === "ВК" ? "bg-sky-500/20 text-sky-300" : "bg-white/5 text-slate-400"}`}><MessageCircle size={12} /> ВК</button>
          <p className="text-[10px] text-slate-500 mt-1">Источник заказа</p>
        </div>
      </div>

      <div className="space-y-4">
        {positions.map((pos, index) => (
          <div key={pos.id} className="glass-panel rounded-2xl p-6 border border-white/5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Позиция {index + 1}</h3>
              <button onClick={() => removePosition(pos.id)} className="text-red-400 hover:text-red-300 transition-colors p-1">
                <Trash2 size={16} />
              </button>
            </div>
            <div className="grid grid-cols-4 gap-4">
              <div>
                <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Ширина (мм)</label>
                <input type="number" value={pos.width} onChange={(e) => updatePosition(pos.id, "width", e.target.value)} placeholder="0" className="mt-1.5 w-full bg-black/30 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500/50" />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Высота (мм)</label>
                <input type="number" value={pos.height} onChange={(e) => updatePosition(pos.id, "height", e.target.value)} placeholder="0" className="mt-1.5 w-full bg-black/30 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500/50" />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Кромка</label>
                <div className="mt-1.5 flex gap-1">
                  {[
                    { value: "none" as const, label: "Нет" },
                    { value: "long" as const, label: "Длин." },
                    { value: "short" as const, label: "Корот." },
                    { value: "all" as const, label: "Все" },
                  ].map(opt => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => updatePosition(pos.id, "edgeType", opt.value)}
                      className={`flex-1 px-1.5 py-2 rounded-lg text-[10px] font-bold border transition-all ${
                        pos.edgeType === opt.value
                          ? "bg-indigo-500/20 border-indigo-500/40 text-indigo-300"
                          : "bg-black/30 border-white/10 text-slate-500 hover:text-white"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Петли (шт)</label>
                <input type="number" value={pos.hinges} onChange={(e) => updatePosition(pos.id, "hinges", e.target.value)} placeholder="0" className="mt-1.5 w-full bg-black/30 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500/50" />
              </div>
            </div>
            {pos.edgeType !== "none" && Number(pos.width) > 0 && Number(pos.height) > 0 && (
              <p className="text-[10px] text-slate-500 mt-2">
                Кромка: {calculateEdge(Number(pos.width), Number(pos.height), pos.edgeType)} мм ({(calculateEdge(Number(pos.width), Number(pos.height), pos.edgeType) / 1000).toFixed(2)} м)
              </p>
            )}
          </div>
        ))}

        <button onClick={addPosition} className="w-full border-2 border-dashed border-indigo-500/30 hover:border-indigo-500/60 bg-indigo-500/5 hover:bg-indigo-500/10 text-indigo-300 rounded-2xl py-4 text-sm font-semibold transition-all flex items-center justify-center gap-2">
          <Plus size={18} /> Добавить позицию
        </button>
      </div>

      {showOrderForm && (
        <div className="glass-panel rounded-2xl p-6 border border-indigo-500/30 space-y-4">
          <h3 className="text-sm font-bold text-white">Данные заказчика</h3>
          <div className="grid grid-cols-2 gap-4">
            <input value={clientName} onChange={e => setClientName(e.target.value)} placeholder="ФИО заказчика" className="bg-black/30 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500/50" />
            <input value={clientPhone} onChange={e => setClientPhone(formatPhone(e.target.value))} placeholder="+7 (999) 123-45-67" className="bg-black/30 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500/50" />
          </div>
          <div className="flex gap-3 justify-end">
            <button onClick={() => setShowOrderForm(false)} className="px-4 py-2 rounded-xl text-sm text-slate-400 border border-white/10 hover:text-white">Отмена</button>
            <button onClick={handleCreateOrder} className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-6 py-2 rounded-xl text-sm transition-all flex items-center gap-2">
              <ArrowRight size={16} /> Создать заказ
            </button>
          </div>
        </div>
      )}

      <div className="bg-indigo-600 rounded-2xl p-6 text-white space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm opacity-90">{positions.length} поз. + доставка в магазин {prices.price_internal_operation} ₽</p>
            <p className="text-4xl font-bold mt-1">{totalCost.toLocaleString("ru-RU")} ₽</p>
            <p className="text-xs opacity-75 mt-1">
              <MapPin size={10} className="inline mr-1" />
              Выдача: салон РЭЛАН · {computeDeadline()} · {source === "ВК" ? "заказ через ВК" : "заказ в салоне"}
            </p>
          </div>
          <button onClick={() => setPositions([{ id: 1, width: "", height: "", edgeType: "none", hinges: "" }])} className="text-sm underline opacity-80 hover:opacity-100">Сбросить</button>
        </div>
        <button onClick={() => setShowOrderForm(true)} className="w-full bg-white/20 hover:bg-white/30 text-white font-semibold py-3 rounded-xl transition-all flex items-center justify-center gap-2">
          <ArrowRight size={18} /> Создать заказ
        </button>
        <p className="text-xs text-center opacity-75">Срок изготовления: 7 дней · Забрать в салоне РЭЛАН</p>
      </div>

      {showSettings && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setShowSettings(false)}>
          <div className="glass-panel rounded-2xl p-6 w-full max-w-md border border-white/10 mx-4" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-white mb-1">Настройка цен</h3>
            <p className="text-xs text-slate-400 mb-5">Изменения сохранятся и будут применяться ко всем расчётам</p>
            <div className="space-y-4">
              {[
                { label: "Цена за 1 м² Л-ки (₽)", key: "price_l_ka" },
                { label: "Цена за 1 м кромки (₽)", key: "price_edge" },
                { label: "Цена за 1 отверстие / петлю (₽)", key: "price_hinge" },
                { label: "Доставка в магазин, фикс. (₽)", key: "price_internal_operation" },
              ].map(({ label, key }) => (
                <div key={key}>
                  <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">{label}</label>
                  <input type="number" name={key} value={(prices as any)[key]} onChange={handlePriceChange} className="mt-1.5 w-full bg-black/30 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500/50" />
                </div>
              ))}
            </div>
            <button onClick={savePriceSettings} className="w-full mt-6 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 rounded-xl transition-all">Сохранить цены</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalculatorV2;
