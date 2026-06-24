import React, { useState, useEffect, useRef, useCallback } from "react";
import { Search, X, ArrowRight, Package, ClipboardList, FileText, MessageCircle, Store } from "lucide-react";
import { fetchOrders, Order } from "../api/orders";
import { fetchMaterials, Material } from "../api/materials";
import { Lead } from "../types";

interface GlobalSearchProps {
  leads: Lead[];
  onNavigate: (tab: string) => void;
}

interface SearchResult {
  id: string;
  type: "order" | "material" | "lead";
  label: string;
  subtitle: string;
  tab: string;
  icon: React.ReactNode;
}

const GlobalSearch: React.FC<GlobalSearchProps> = ({ leads, onNavigate }) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [orders, setOrders] = useState<Order[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const loadData = useCallback(async () => {
    try {
      const [o, m] = await Promise.all([
        fetchOrders().catch(() => [] as Order[]),
        fetchMaterials().catch(() => [] as Material[]),
      ]);
      setOrders(Array.isArray(o) ? o : []);
      setMaterials(Array.isArray(m) ? m : []);
    } catch {}
  }, []);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setOpen(prev => !prev);
      }
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, []);

  useEffect(() => {
    if (open) {
      loadData();
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setQuery("");
    }
  }, [open, loadData]);

  const results = React.useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    const res: SearchResult[] = [];

    orders.forEach(o => {
      if (
        (o.client_name || "").toLowerCase().includes(q) ||
        (o.phone || "").includes(q) ||
        String(o.id).includes(q)
      ) {
        res.push({
          id: `order-${o.id}`,
          type: "order",
          label: o.client_name || `Заказ #${o.id}`,
          subtitle: `${o.status} · ${o.total_cost?.toLocaleString()} ₽ · ${o.source === "ВК" ? "ВК" : "Салон"}`,
          tab: "orders",
          icon: <ClipboardList size={14} />,
        });
      }
    });

    materials.forEach(m => {
      if (m.name.toLowerCase().includes(q)) {
        const rem = Math.max(0, m.total_qty - m.used_qty);
        res.push({
          id: `mat-${m.id}`,
          type: "material",
          label: m.name,
          subtitle: `${m.used_qty}/${m.total_qty} ${m.unit} · остаток ${rem}`,
          tab: "materials",
          icon: <Package size={14} />,
        });
      }
    });

    leads.forEach(l => {
      if (
        (l.name || "").toLowerCase().includes(q) ||
        (l.phone || "").includes(q)
      ) {
        res.push({
          id: `lead-${l.id}`,
          type: "lead",
          label: l.name,
          subtitle: `${l.status} · ${l.phone || ""}`,
          tab: "orders",
          icon: <FileText size={14} />,
        });
      }
    });

    return res.slice(0, 20);
  }, [query, orders, materials, leads]);

  const handleSelect = (r: SearchResult) => {
    setOpen(false);
    onNavigate(r.tab);
  };

  return (
    <>
      <button onClick={() => setOpen(true)} className="w-10 h-10 rounded-full glass-panel flex items-center justify-center border border-white/15 hover:border-indigo-500/50 transition-all" title="Поиск (Ctrl+K)">
        <Search size={16} className="text-slate-300" />
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-start justify-center z-50 pt-[15vh]" onClick={() => setOpen(false)}>
          <div className="w-full max-w-xl" onClick={e => e.stopPropagation()}>
            <div className="glass-panel rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
              <div className="flex items-center gap-3 p-4 border-b border-white/5">
                <Search size={18} className="text-slate-500 shrink-0" />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="Поиск заказов, материалов, лидов..."
                  className="flex-1 bg-transparent text-white text-sm placeholder:text-slate-500 focus:outline-none"
                />
                <div className="flex items-center gap-2">
                  <kbd className="text-[10px] text-slate-600 bg-white/5 px-2 py-0.5 rounded font-mono">Esc</kbd>
                  <button onClick={() => setOpen(false)} className="text-slate-500 hover:text-white p-1">
                    <X size={16} />
                  </button>
                </div>
              </div>

              <div className="max-h-80 overflow-y-auto">
                {query.trim() && results.length === 0 && (
                  <div className="p-8 text-center text-slate-500 text-sm">Ничего не найдено</div>
                )}
                {!query.trim() && (
                  <div className="p-8 text-center text-slate-500 text-sm">
                    Начните вводить — поиск по заказам, материалам и лидам
                  </div>
                )}
                {results.length > 0 && (
                  <div className="p-2 space-y-0.5">
                    {results.map(r => (
                      <button key={r.id} onClick={() => handleSelect(r)} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-all text-left">
                        <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400">
                          {r.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-white truncate">{r.label}</p>
                          <p className="text-[11px] text-slate-400 truncate">{r.subtitle}</p>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{r.type}</span>
                          <ArrowRight size={14} className="text-slate-600" />
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default GlobalSearch;
