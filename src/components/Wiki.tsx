import React, { useState, useEffect } from 'react';
import { FileText, PlayCircle, Database, AlertTriangle, Lightbulb, Download, Package, Plus, Tag, BookOpen, X, Edit3, Save, MessageSquare, CreditCard, ChevronDown, Trash2 } from 'lucide-react';
import { loadData, saveData } from "../api/sync";

interface WikiProps {
  wikiSection: "company" | "training" | "cheatsheets" | "bugs" | "suggestions" | "pro100";
  setWikiSection: (section: "company" | "training" | "cheatsheets" | "bugs" | "suggestions" | "pro100") => void;
  borisAvatarStyle: React.CSSProperties;
  bugsList: { id: number; title: string; solution: string; severity: string }[];
  setBugsList: React.Dispatch<React.SetStateAction<{ id: number; title: string; solution: string; severity: string }[]>>;
  suggestionsList: { id: number; text: string; author: string; date: string }[];
  setSuggestionsList: React.Dispatch<React.SetStateAction<{ id: number; text: string; author: string; date: string }[]>>;
  currentUserName: string | null;
}

type CheatSheet = { id: number; title: string; content: string; color: string };

const DEFAULT_CHEATSHEETS: CheatSheet[] = [
  { id: 1, title: "Обязательные вопросы при оформлении заказа", content: "Перед созданием заказа обязательно уточнить у клиента:\n1. С какой стороны кромить? (Левая / Правая / Обе / Без кромки)\n2. Цвет ЛДСП? (Дуб Сонома / Дуб Молочный / Ясень Шимо / Белый / Чёрный / Другой)\n3. Срочность? (Обычный 7 дней / Срочный 3 дня / Очень срочный 1 день)", color: "amber" },
  { id: 2, title: "Оплата картой (эквайринг)", content: "Менеджер открывает Инфопредприятие при клиенте:\n1. Инфопредприятие → Платёжные документы\n2. Вкладка «Оплата по эквайрингу»\n3. Выбрать: Физ-лицо, П1, основание: Л/.../26, без НДС\n4. Напечатать чек\n5. Написать номер заказа на чеке\n6. Отпустить клиента", color: "indigo" },
  { id: 3, title: "Оплата наличными", content: "1. Инфопредприятие → Платёжные документы\n2. «Поступление в кассу»\n3. Выбрать Физ-лицо, основание: Л/.../26, без НДС\n4. Напечатать чек", color: "emerald" },
  { id: 4, title: "Выставить счёт", content: "1. Инфопредприятие → вкладка «Счёт»\n2. Нажать + (новый счёт)\n3. Вписать номер заказа: Л/.../26\n4. В составе услуги выбрать: наши услуги\n5. Добавить ЛДСП (код: 02107)\n6. Сохранить и напечатать", color: "purple" },
  { id: 5, title: "Когда заказ готов", content: "1. Менеджер проверяет готовность заказа\n2. Звонит клиенту: «Заказ готов, можно забирать в салоне РЭЛАН»\n3. Перевести статус заказа на «готов к выдаче» в дашборде", color: "rose" },
];

type WikiContent = Record<string, string>;

const DEFAULT_CONTENT: WikiContent = {
  company: `<div class="space-y-6">
  <h3 class="text-2xl font-bold text-white">О компании РЭЛАН</h3>
  <p class="text-slate-300 leading-relaxed">РЭЛАН — мебельный салон в городе Лысва. Специализируется на продаже мебельной фурнитуры и ЛДСП под заказ.</p>

  <div class="grid grid-cols-2 gap-4 mt-6">
    <div class="bg-white/5 rounded-2xl p-5 border border-white/10">
      <h4 class="text-sm font-bold text-indigo-300 mb-2">Миссия</h4>
      <p class="text-sm text-slate-300">Делать мебельное производство доступным: качественные материалы, честные сроки, индивидуальный подход к каждому заказу.</p>
    </div>
    <div class="bg-white/5 rounded-2xl p-5 border border-white/10">
      <h4 class="text-sm font-bold text-emerald-300 mb-2">Ценности</h4>
      <p class="text-sm text-slate-300">Надёжность, прозрачность расчётов, внимание к деталям, соблюдение сроков, уважение к клиенту.</p>
    </div>
  </div>

  <h4 class="text-lg font-bold text-white mt-6">Направления работы</h4>
  <ul class="space-y-2 text-sm text-slate-300">
    <li class="flex items-center gap-2"><span class="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>Продажа мебельной фурнитуры (Blum, Hettich, GTV, Boyard)</li>
    <li class="flex items-center gap-2"><span class="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>ЛДСП под заказ (Egger, Kronospan — Дуб Сонома, Белый, Ясень Шимо, Чёрный)</li>
    <li class="flex items-center gap-2"><span class="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>Кромкование панелей (ПВХ 0.4мм / 2.0мм)</li>
    <li class="flex items-center gap-2"><span class="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>Комплектация мебельных производств</li>
    <li class="flex items-center gap-2"><span class="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>Распил ЛДСП по размерам клиента</li>
  </ul>

  <div class="bg-white/5 rounded-2xl p-5 border border-white/10 mt-6">
    <h4 class="text-sm font-bold text-amber-300 mb-2">Контакты</h4>
    <ul class="space-y-1 text-sm text-slate-300">
      <li>📍 Город Лысва, Пермский край</li>
      <li>🕐 Пн-Пт: 9:00–18:00, Сб: 10:00–15:00</li>
      <li>📞 Приём заказов: салон РЭЛАН / ВКонтакте</li>
    </ul>
  </div>
</div>`,
  training: `<div class="space-y-6">
  <h3 class="text-2xl font-bold text-white">Стандарты и процессы</h3>

  <div class="bg-white/5 rounded-2xl p-5 border border-white/10">
    <h4 class="text-sm font-bold text-amber-300 mb-3 flex items-center gap-2"><span class="w-2 h-2 rounded-full bg-amber-400"></span>Работа с заказом Л-ки</h4>
    <ul class="space-y-2 text-sm text-slate-300">
      <li class="flex items-start gap-2"><span class="text-emerald-400 mt-0.5">—</span>Клиент приходит в салон или пишет ВК → менеджер фиксирует размеры, материал, кромку</li>
      <li class="flex items-start gap-2"><span class="text-emerald-400 mt-0.5">—</span>Расчёт стоимости через калькулятор Л-ки: ширина × высота × цена м² + кромка + петли + доставка</li>
      <li class="flex items-start gap-2"><span class="text-emerald-400 mt-0.5">—</span>Заказ создаётся в дашборде со статусом «Новый» → менеджер уточняет детали → «Утверждён»</li>
      <li class="flex items-start gap-2"><span class="text-emerald-400 mt-0.5">—</span>Обязательные вопросы: сторона кромки (левая/правая/обе), цвет ЛДСП, срочность (7/3/1 день)</li>
    </ul>
  </div>

  <div class="bg-white/5 rounded-2xl p-5 border border-white/10">
    <h4 class="text-sm font-bold text-purple-300 mb-3 flex items-center gap-2"><span class="w-2 h-2 rounded-full bg-purple-400"></span>Замеры</h4>
    <ul class="space-y-2 text-sm text-slate-300">
      <li class="flex items-start gap-2"><span class="text-emerald-400 mt-0.5">—</span>Замерщик выезжает к клиенту, фиксирует размеры в календаре замеров</li>
      <li class="flex items-start gap-2"><span class="text-emerald-400 mt-0.5">—</span>Фото помещения, обмерный план, заметки по коммуникациям (розетки, трубы)</li>
      <li class="flex items-start gap-2"><span class="text-emerald-400 mt-0.5">—</span>После замера — передача данных менеджеру для формирования спецификации</li>
    </ul>
  </div>

  <div class="bg-white/5 rounded-2xl p-5 border border-white/10">
    <h4 class="text-sm font-bold text-rose-300 mb-3 flex items-center gap-2"><span class="w-2 h-2 rounded-full bg-rose-400"></span>Производство</h4>
    <ul class="space-y-2 text-sm text-slate-300">
      <li class="flex items-start gap-2"><span class="text-emerald-400 mt-0.5">—</span>Распил ЛДСП — строго по картам раскроя, экономия материала</li>
      <li class="flex items-start gap-2"><span class="text-emerald-400 mt-0.5">—</span>Кромкование: ПВХ 2мм (видимые стороны фасадов), ПВХ 0.4мм (внутренние торцы)</li>
      <li class="flex items-start gap-2"><span class="text-emerald-400 mt-0.5">—</span>Присадка петель и направляющих — по спецификации заказа</li>
      <li class="flex items-start gap-2"><span class="text-emerald-400 mt-0.5">—</span>Срок изготовления: обычный 7 дней, срочный 3 дня</li>
    </ul>
  </div>

  <div class="bg-white/5 rounded-2xl p-5 border border-white/10">
    <h4 class="text-sm font-bold text-sky-300 mb-3 flex items-center gap-2"><span class="w-2 h-2 rounded-full bg-sky-400"></span>Выдача и оплата</h4>
    <ul class="space-y-2 text-sm text-slate-300">
      <li class="flex items-start gap-2"><span class="text-emerald-400 mt-0.5">—</span>Заказ готов → менеджер звонит клиенту → статус «Готов к выдаче»</li>
      <li class="flex items-start gap-2"><span class="text-emerald-400 mt-0.5">—</span>Оплата через Инфопредприятие: наличные (поступление в кассу) / карта (эквайринг)</li>
      <li class="flex items-start gap-2"><span class="text-emerald-400 mt-0.5">—</span>Счёт выставляется в Инфопредприятие → вкладка «Счёт» → основание: Л/XXX/26</li>
      <li class="flex items-start gap-2"><span class="text-emerald-400 mt-0.5">—</span>После оплаты → статус «Выдан», клиент забирает заказ из салона</li>
    </ul>
  </div>
</div>`,
  pro100: `<div class="space-y-6">
  <h3 class="text-2xl font-bold text-white">Библиотека модулей Pro100</h3>
  <p class="text-slate-300 leading-relaxed">Pro100 — программа для проектирования мебели. Ниже — список常用的 модулей и библиотек, которые используем в работе.</p>

  <div class="grid grid-cols-1 gap-4 mt-6">
    <div class="bg-white/5 rounded-2xl p-5 border border-white/10">
      <h4 class="text-sm font-bold text-indigo-300 mb-2">Кухни</h4>
      <ul class="space-y-1 text-sm text-slate-300">
        <li>— Кухонные шкафы (навесные, напольные, угловые)</li>
        <li>— Фасады (МДФ, пластик, эмаль)</li>
        <li>— Столешницы (ЛДСП, искусственный камень)</li>
        <li>— Бортики, цоколь, плинтусы</li>
      </ul>
    </div>
    <div class="bg-white/5 rounded-2xl p-5 border border-white/10">
      <h4 class="text-sm font-bold text-emerald-300 mb-2">Гардеробные</h4>
      <ul class="space-y-1 text-sm text-slate-300">
        <li>— Корпуса (своими руками / раздвижные двери)</li>
        <li>— Наполнение (полки, ящики, штанги, корзины)</li>
        <li>— Системы раздвижных дверей (Roleo, Slido)</li>
      </ul>
    </div>
    <div class="bg-white/5 rounded-2xl p-5 border border-white/10">
      <h4 class="text-sm font-bold text-amber-300 mb-2">Шкафы-купе</h4>
      <ul class="space-y-1 text-sm text-slate-300">
        <li>— Корпуса (прямые, угловые, радиальные)</li>
        <li>— Раздвижные системы (Egger, Hardware, Komandor)</li>
        <li>— Зеркала, стекло, пескоструй</li>
      </ul>
    </div>
    <div class="bg-white/5 rounded-2xl p-5 border border-white/10">
      <h4 class="text-sm font-bold text-purple-300 mb-2">Прихожие</h4>
      <ul class="space-y-1 text-sm text-slate-300">
        <li>— Вешалки, обувницы, зеркала</li>
        <li>— Тумбы под обувь, банкетки</li>
        <li>— Полки для ключей и аксессуаров</li>
      </ul>
    </div>
    <div class="bg-white/5 rounded-2xl p-5 border border-white/10">
      <h4 class="text-sm font-bold text-rose-300 mb-2">Детские</h4>
      <ul class="space-y-1 text-sm text-slate-300">
        <li>— Кровати (одноярусные, двухъярусные)</li>
        <li>— Письменные столы, полки, шкафы</li>
        <li>— Рабочие зоны, этажёрки</li>
      </ul>
    </div>
    <div class="bg-white/5 rounded-2xl p-5 border border-white/10">
      <h4 class="text-sm font-bold text-sky-300 mb-2">Фурнитура (справочник)</h4>
      <ul class="space-y-1 text-sm text-slate-300">
        <li>— Петли: Blum Clip-Top, Hettich Sensys, GTV</li>
        <li>— Направляющие: Blum Tandem, Hettich Quadro</li>
        <li>— Подъёмники: Blum Aventos, Hettich WingLine</li>
        <li>— Ручки, штанги, фиксаторы</li>
      </ul>
    </div>
  </div>

  <div class="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-5 mt-6">
    <h4 class="text-sm font-bold text-amber-300 mb-2">Советы по работе в Pro100</h4>
    <ul class="space-y-1 text-sm text-slate-300">
      <li>— Сохраняйте проект перед каждымmajor изменением</li>
      <li>— Используйте слои для разделения элементов (корпус, фасад, фурнитура)</li>
      <li>— Экспорт в чертёж для замерщика: Файл → Печать → Масштаб 1:1</li>
      <li>— Библиотеки хранятся в папке: C:\Program Files\Pro100\Libraries</li>
    </ul>
  </div>
</div>`,
};

const SECTION_LABELS: Record<string, string> = {
  company: "О Компании",
  training: "Обучение ПО",
  cheatsheets: "Шпаргалки",
  bugs: "Баги и Костыли",
  suggestions: "Предложения",
  pro100: "Pro100 Модули",
};

const Wiki: React.FC<WikiProps> = ({ wikiSection, setWikiSection, borisAvatarStyle, bugsList, setBugsList, suggestionsList, setSuggestionsList, currentUserName }) => {
  const [showBugForm, setShowBugForm] = useState(false);
  const [bugForm, setBugForm] = useState({ title: "", solution: "", severity: "medium" });
  const [showSuggestionForm, setShowSuggestionForm] = useState(false);
  const [suggestionText, setSuggestionText] = useState("");
  const [wikiContent, setWikiContent] = useState<WikiContent>(() => ({ ...DEFAULT_CONTENT }));
  const [editing, setEditing] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [cheatsheets, setCheatsheets] = useState<CheatSheet[]>(() => {
    const saved = localStorage.getItem("nova_light_cheatsheets");
    return saved ? JSON.parse(saved) : DEFAULT_CHEATSHEETS;
  });
  const [showCheatForm, setShowCheatForm] = useState(false);
  const [cheatEditId, setCheatEditId] = useState<number | null>(null);
  const [cheatForm, setCheatForm] = useState({ title: "", content: "", color: "indigo" });

  const isAdmin = currentUserName === "Администратор";

  useEffect(() => {
    loadData<WikiContent>("wiki").then(d => {
      if (d) setWikiContent(prev => ({ ...prev, ...d }));
    });
  }, []);

  useEffect(() => {
    localStorage.setItem("nova_light_cheatsheets", JSON.stringify(cheatsheets));
  }, [cheatsheets]);

  const handleSave = async (section: string) => {
    const next = { ...wikiContent, [section]: editValue };
    setWikiContent(next);
    setEditing(null);
    await saveData("wiki", next);
  };

  const startEdit = (section: string) => {
    setEditValue(wikiContent[section] || "");
    setEditing(section);
  };

  const submitBug = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bugForm.title.trim()) return;
    setBugsList((prev) => [
      ...prev,
      { id: Date.now(), title: bugForm.title, solution: bugForm.solution || "Решение пока не найдено.", severity: bugForm.severity },
    ]);
    setBugForm({ title: "", solution: "", severity: "medium" });
    setShowBugForm(false);
  };

  const submitSuggestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!suggestionText.trim()) return;
    setSuggestionsList((prev) => [
      ...prev,
      { id: Date.now(), text: suggestionText, author: currentUserName || "Аноним", date: new Date().toLocaleDateString("ru-RU") },
    ]);
    setSuggestionText("");
    setShowSuggestionForm(false);
  };

  const COLOR_MAP: Record<string, string> = {
    amber: "bg-amber-500/10 border-amber-500/20 text-amber-300",
    indigo: "bg-indigo-500/10 border-indigo-500/20 text-indigo-300",
    emerald: "bg-emerald-500/10 border-emerald-500/20 text-emerald-300",
    purple: "bg-purple-500/10 border-purple-500/20 text-purple-300",
    rose: "bg-rose-500/10 border-rose-500/20 text-rose-300",
    sky: "bg-sky-500/10 border-sky-500/20 text-sky-300",
  };

  const startCheatEdit = (c: CheatSheet) => {
    setCheatEditId(c.id);
    setCheatForm({ title: c.title, content: c.content, color: c.color });
    setShowCheatForm(true);
  };

  const submitCheat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cheatForm.title.trim() || !cheatForm.content.trim()) return;
    if (cheatEditId) {
      setCheatsheets(prev => prev.map(c => c.id === cheatEditId ? { ...c, ...cheatForm } : c));
    } else {
      setCheatsheets(prev => [...prev, { id: Date.now(), ...cheatForm }]);
    }
    setCheatForm({ title: "", content: "", color: "indigo" });
    setCheatEditId(null);
    setShowCheatForm(false);
  };

  const deleteCheat = (id: number) => {
    if (!confirm("Удалить шпаргалку?")) return;
    setCheatsheets(prev => prev.filter(c => c.id !== id));
  };

  const renderView = (section: string) => (
    <div dangerouslySetInnerHTML={{ __html: wikiContent[section] || "" }} />
  );

  const renderEdit = (section: string) => (
    <div className="space-y-3">
      <textarea
        className="w-full h-[400px] bg-black/40 border border-indigo-500/30 rounded-xl p-4 text-sm text-white font-mono focus:outline-none focus:border-indigo-500 resize-y"
        value={editValue}
        onChange={e => setEditValue(e.target.value)}
      />
      <div className="flex gap-2 justify-end">
        <button onClick={() => setEditing(null)} className="px-4 py-2 rounded-lg text-xs font-bold text-slate-400 hover:text-white border border-white/10 hover:border-white/20 transition-all">Отмена</button>
        <button onClick={() => handleSave(section)} className="px-4 py-2 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition-all flex items-center gap-1"><Save size={14} /> Сохранить</button>
      </div>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto fade-in">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">База Знаний (Wiki)</h2>
        <p className="text-slate-400">Документация, стандарты и инструкции по работе — салон РЭЛАН.</p>
      </div>
      <div className="flex gap-4 mb-6 border-b border-white/10 pb-4 overflow-x-auto">
        {(["company", "training", "cheatsheets", "bugs", "suggestions", "pro100"] as const).map((s) => (
          <button key={s} onClick={() => setWikiSection(s)} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${wikiSection === s ? (s === "bugs" ? "bg-red-500/20 text-red-300" : s === "suggestions" ? "bg-amber-500/20 text-amber-300" : s === "cheatsheets" ? "bg-purple-500/20 text-purple-300" : s === "pro100" ? "bg-sky-500/20 text-sky-300" : "bg-indigo-500/20 text-indigo-300") : "text-slate-400 hover:text-white"}`}>
            {s === "company" && <FileText size={16} />}
            {s === "training" && <PlayCircle size={16} />}
            {s === "cheatsheets" && <CreditCard size={16} />}
            {s === "bugs" && <AlertTriangle size={16} />}
            {s === "suggestions" && <Lightbulb size={16} />}
            {s === "pro100" && <Package size={16} />}
            {SECTION_LABELS[s]}
          </button>
        ))}
      </div>
      <div className="glass-panel rounded-2xl p-8 max-h-[60vh] overflow-y-auto chat-scroll relative">
        {editing === wikiSection && (wikiSection === "company" || wikiSection === "training" || wikiSection === "pro100") ? (
          renderEdit(wikiSection)
        ) : wikiSection === "company" || wikiSection === "training" || wikiSection === "pro100" ? (
          <>
            {isAdmin && (
              <button
                onClick={() => startEdit(wikiSection)}
                className="absolute top-4 right-4 bg-indigo-500/20 hover:bg-indigo-500/40 text-indigo-300 text-xs font-bold px-3 py-1.5 rounded-lg border border-indigo-500/30 transition-all flex items-center gap-1.5 z-10"
              >
                <Edit3 size={14} /> Редактировать
              </button>
            )}
            {renderView(wikiSection)}
          </>
        ) : wikiSection === "cheatsheets" ? (
          <>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-white">Шпаргалки по Инфопредприятие</h3>
              <button onClick={() => { setCheatEditId(null); setCheatForm({ title: "", content: "", color: "indigo" }); setShowCheatForm(true); }} className="bg-purple-600/20 hover:bg-purple-600/40 text-purple-300 text-xs font-bold px-4 py-2 rounded-lg border border-purple-500/30 transition-all flex items-center gap-2">
                <Plus size={14} /> Новая шпаргалка
              </button>
            </div>

            {showCheatForm && (
              <div className="bg-black/40 border border-purple-500/20 rounded-2xl p-6 space-y-4 mb-6">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-bold text-purple-300 uppercase tracking-widest">{cheatEditId ? "Редактировать" : "Новая"} шпаргалка</h4>
                  <button onClick={() => { setShowCheatForm(false); setCheatEditId(null); }} className="text-slate-400 hover:text-white transition-colors"><X size={16} /></button>
                </div>
                <form onSubmit={submitCheat} className="space-y-3">
                  <div>
                    <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Название *</label>
                    <input type="text" value={cheatForm.title} onChange={e => setCheatForm(f => ({ ...f, title: e.target.value }))} placeholder="Например: Оплата картой" className="mt-1.5 w-full bg-black/30 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500/50" required />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Содержание *</label>
                    <textarea value={cheatForm.content} onChange={e => setCheatForm(f => ({ ...f, content: e.target.value }))} placeholder="Пошаговая инструкция..." rows={6} className="mt-1.5 w-full bg-black/30 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500/50 resize-y" required />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Цвет</label>
                    <div className="mt-1.5 flex gap-2">
                      {(["amber", "indigo", "emerald", "purple", "rose", "sky"] as const).map(color => (
                        <button key={color} type="button" onClick={() => setCheatForm(f => ({ ...f, color }))} className={`w-8 h-8 rounded-lg border-2 transition-all ${COLOR_MAP[color]?.split(" ")[0] || ""} ${cheatForm.color === color ? "ring-2 ring-white/40 scale-110" : "opacity-50 hover:opacity-100"}`} />
                      ))}
                    </div>
                  </div>
                  <button type="submit" className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-2.5 rounded-xl transition-all text-sm">
                    {cheatEditId ? "Сохранить" : "Добавить"}
                  </button>
                </form>
              </div>
            )}

            {cheatsheets.length === 0 ? (
              <p className="text-center text-slate-500 text-sm py-8">Нет шпаргалок. Создайте первую!</p>
            ) : (
              <div className="space-y-3">
                {cheatsheets.map(c => {
                  const borderColor = COLOR_MAP[c.color] || COLOR_MAP.indigo;
                  return (
                    <div key={c.id} className={`rounded-2xl p-5 border ${borderColor}`}>
                      <div className="flex items-start justify-between mb-3">
                        <h4 className="text-sm font-bold">{c.title}</h4>
                        <div className="flex gap-1 shrink-0 ml-3">
                          <button onClick={() => startCheatEdit(c)} className="p-1.5 text-slate-400 hover:text-white transition-colors"><Edit3 size={13} /></button>
                          <button onClick={() => deleteCheat(c.id)} className="p-1.5 text-rose-400 hover:text-rose-300 transition-colors"><Trash2 size={13} /></button>
                        </div>
                      </div>
                      <div className="text-sm text-slate-300 whitespace-pre-line leading-relaxed">{c.content}</div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        ) : wikiSection === "bugs" ? (
          <>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-white">Баги и Костыли</h3>
              <button onClick={() => setShowBugForm(true)} className="bg-red-600/20 hover:bg-red-600/40 text-red-300 text-xs font-bold px-4 py-2 rounded-lg border border-red-500/30 transition-all flex items-center gap-2">
                <Plus size={14} /> Зафиксировать баг
              </button>
            </div>
            {showBugForm && (
              <div className="bg-black/40 border border-red-500/20 rounded-2xl p-6 space-y-4 mb-6">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-bold text-red-300 uppercase tracking-widest">Новый баг</h4>
                  <button onClick={() => setShowBugForm(false)} className="text-slate-400 hover:text-white transition-colors"><X size={16} /></button>
                </div>
                <form onSubmit={submitBug} className="space-y-3">
                  <div>
                    <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Проблема *</label>
                    <input type="text" value={bugForm.title} onChange={(e) => setBugForm(f => ({ ...f, title: e.target.value }))} placeholder="Опиши баг кратко..." className="mt-1.5 w-full bg-black/30 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-red-500/50" required />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Решение / Костыль</label>
                    <input type="text" value={bugForm.solution} onChange={(e) => setBugForm(f => ({ ...f, solution: e.target.value }))} placeholder="Как обойти проблему..." className="mt-1.5 w-full bg-black/30 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-red-500/50" />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Приоритет</label>
                    <div className="mt-1.5 flex gap-2">
                      {[{ value: "low", label: "Низкий", color: "bg-slate-500/20 border-slate-500/30 text-slate-300" }, { value: "medium", label: "Средний", color: "bg-amber-500/20 border-amber-500/30 text-amber-300" }, { value: "high", label: "Высокий", color: "bg-red-500/20 border-red-500/30 text-red-300" }].map(s => (
                        <button key={s.value} type="button" onClick={() => setBugForm(f => ({ ...f, severity: s.value }))} className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${s.color} ${bugForm.severity === s.value ? "ring-2 ring-white/20 scale-105" : "opacity-60 hover:opacity-100"}`}>{s.label}</button>
                      ))}
                    </div>
                  </div>
                  <button type="submit" className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-2.5 rounded-xl transition-all text-sm">Добавить в список</button>
                </form>
              </div>
            )}
            <div className="glass-panel rounded-2xl overflow-hidden border border-white/5">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-black/40 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                    <th className="px-6 py-4">Проблема (Баг)</th>
                    <th className="px-6 py-4">Решение (Костыль)</th>
                    <th className="px-6 py-4">Приоритет</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {bugsList.map(bug => (
                    <tr key={bug.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4"><p className="text-sm font-bold text-slate-200">{bug.title}</p></td>
                      <td className="px-6 py-4 text-xs text-slate-400 leading-relaxed">{bug.solution}</td>
                      <td className="px-6 py-4">
                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${bug.severity === "high" ? "bg-red-500/20 text-red-400" : bug.severity === "medium" ? "bg-amber-500/20 text-amber-400" : "bg-slate-500/20 text-slate-400"}`}>{bug.severity}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-white">Предложения и пожелания</h3>
              <button onClick={() => setShowSuggestionForm(true)} className="bg-amber-600/20 hover:bg-amber-600/40 text-amber-300 text-xs font-bold px-4 py-2 rounded-lg border border-amber-500/30 transition-all flex items-center gap-2">
                <Plus size={14} /> Добавить предложение
              </button>
            </div>
            {showSuggestionForm && (
              <div className="bg-black/40 border border-amber-500/20 rounded-2xl p-6 space-y-4 mb-6">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-bold text-amber-300 uppercase tracking-widest">Новое предложение</h4>
                  <button onClick={() => setShowSuggestionForm(false)} className="text-slate-400 hover:text-white transition-colors"><X size={16} /></button>
                </div>
                <form onSubmit={submitSuggestion} className="space-y-3">
                  <div>
                    <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Предложение или пожелание *</label>
                    <textarea
                      value={suggestionText}
                      onChange={(e) => setSuggestionText(e.target.value)}
                      placeholder="Опишите ваше предложение..."
                      className="mt-1.5 w-full bg-black/30 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500/50 resize-y min-h-[100px]"
                      required
                    />
                  </div>
                  <button type="submit" className="w-full bg-amber-600 hover:bg-amber-500 text-white font-bold py-2.5 rounded-xl transition-all text-sm">Отправить</button>
                </form>
              </div>
            )}
            <div className="space-y-3">
              {suggestionsList.length === 0 && (
                <p className="text-center text-slate-500 text-sm py-8">Пока нет предложений. Будьте первым!</p>
              )}
              {suggestionsList.map(s => (
                <div key={s.id} className="bg-black/20 border border-white/5 rounded-xl p-4 hover:bg-black/40 transition-colors">
                  <p className="text-sm text-slate-200 leading-relaxed">{s.text}</p>
                  <div className="flex items-center gap-3 mt-2 text-[10px] text-slate-500">
                    <span className="flex items-center gap-1"><MessageSquare size={10} /> {s.author}</span>
                    <span>{s.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Wiki;
