import React, { useState } from 'react';
import { Plus, Calendar, X } from 'lucide-react';

interface Promo {
  id: number;
  title: string;
  desc: string;
  validity: string;
  type: string;
  img: string;
  url?: string;
  supplier?: string;
}

const defaultPromos: Promo[] = [
  { id: 1, title: "Скидка 15% на фурнитуру Blum", desc: "Действует на направляющие Tandembox и петли Clip Top.", validity: "До 31 мая", type: "Фурнитура", img: "bg-gradient-to-br from-orange-500 to-red-500" },
  { id: 2, title: "Бесплатная мойка Omoikiri", desc: "При заказе кухни от 300 000 руб. мойка в подарок.", validity: "До 15 июня", type: "Техника", img: "bg-gradient-to-br from-blue-500 to-cyan-500" },
  { id: 3, title: "ЛДСП Egger по старой цене", desc: "Распродажа складских остатков декоров дуба.", validity: "Пока в наличии", type: "Материалы", img: "bg-gradient-to-br from-emerald-500 to-teal-600" },
];

const gradients = [
  "bg-gradient-to-br from-orange-500 to-red-500",
  "bg-gradient-to-br from-blue-500 to-cyan-500",
  "bg-gradient-to-br from-emerald-500 to-teal-600",
  "bg-gradient-to-br from-purple-500 to-pink-500",
  "bg-gradient-to-br from-yellow-500 to-amber-600",
  "bg-gradient-to-br from-indigo-500 to-violet-500",
];

const Promos = () => {
  const [promos, setPromos] = useState<Promo[]>(defaultPromos);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", desc: "", validity: "", type: "", url: "", supplier: "" });

  const addPromo = () => {
    if (!form.title.trim() || !form.desc.trim()) return;
    const newPromo: Promo = {
      id: Date.now(),
      title: form.title,
      desc: form.desc,
      validity: form.validity || "Бессрочно",
      type: form.type || "Акция",
      img: gradients[promos.length % gradients.length],
      url: form.url || "",
      supplier: form.supplier || "",
    };
    setPromos((prev) => [...prev, newPromo]);
    setForm({ title: "", desc: "", validity: "", type: "", url: "", supplier: "" });
    setShowForm(false);
  };

  return (
    <div className="max-w-5xl mx-auto fade-in">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">Акции и Скидки</h2>
          <p className="text-slate-400">Актуальные маркетинговые предложения для клиентов.</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-indigo-600 hover:bg-indigo-500 text-white force-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
        >
          <Plus size={16} /> Добавить акцию
        </button>
      </div>

      {showForm && (
        <div className="glass-panel p-6 rounded-2xl mb-6 border border-indigo-500/30 space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-white">Новая акция</h3>
            <button onClick={() => setShowForm(false)} className="text-slate-500 hover:text-white transition-colors">
              <X size={16} />
            </button>
          </div>
          <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Название акции" className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500/50" />
          <textarea value={form.desc} onChange={(e) => setForm({ ...form, desc: e.target.value })} placeholder="Описание" className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500/50 resize-none" rows={2} />
          <div className="flex gap-3">
            <input type="text" value={form.validity} onChange={(e) => setForm({ ...form, validity: e.target.value })} placeholder="Срок действия" className="flex-1 bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500/50" />
            <input type="text" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} placeholder="Тип (Фурнитура/Техника/...)" className="flex-1 bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500/50" />
          </div>
          <div className="flex gap-3">
            <input type="url" value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} placeholder="Ссылка на акцию (URL)" className="flex-1 bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500/50" />
            <input type="text" value={form.supplier} onChange={(e) => setForm({ ...form, supplier: e.target.value })} placeholder="Поставщик (Рондо, Roomatic...)" className="flex-1 bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500/50" />
          </div>
          <button onClick={addPromo} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white force-white font-bold py-2 rounded-lg transition-colors text-sm">
            Сохранить
          </button>
        </div>
      )}

      <div className="grid grid-cols-3 gap-6">
        {promos.map((promo) => (
          <div key={promo.id} className={`rounded-2xl p-6 relative overflow-hidden group cursor-pointer ${promo.img}`}>
            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-all"></div>
            <div className="relative z-10 flex flex-col h-full">
              <span className="text-[10px] font-bold tracking-widest uppercase bg-white/20 text-white px-2 py-1 rounded-md w-max mb-4 backdrop-blur-sm">
                {promo.type}
              </span>
              <h3 className="text-xl font-bold text-white mb-2 leading-tight">{promo.title}</h3>
              <p className="text-sm text-white/80 mb-6 flex-1">{promo.desc}</p>
              {promo.supplier && <p className="text-[10px] text-white/70 mb-2 font-semibold">Поставщик: {promo.supplier}</p>}
              {promo.url && <a href={promo.url} target="_blank" rel="noopener noreferrer" className="text-[10px] text-white/90 underline mb-2 inline-block">Перейти к акции →</a>}
              <div className="flex items-center text-xs font-semibold text-white/90 bg-black/30 w-max px-3 py-1.5 rounded-lg backdrop-blur-sm">
                <Calendar size={14} className="mr-1.5" /> {promo.validity}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Promos;