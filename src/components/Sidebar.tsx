import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Database, TrendingUp, BookOpen, Users, Bot, MessageSquare, ShieldAlert, Pin, PinOff, Search, X, ChevronDown, Calculator, ClipboardList, CreditCard, Sparkles, Package } from 'lucide-react';

interface NavItem {
  key: string;
  label: string;
  icon: React.ReactNode;
  badgeKey?: string;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: any) => void;
  pinnedSections: string[];
  onTogglePin: (key: string) => void;
  accentColor: string;
  notificationCounts: Record<string, number>;
  userRole: string;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

const allGroups: NavGroup[] = [
    {
      label: "Главная",
      items: [
        { key: "dashboard", label: "Дашборд", icon: <TrendingUp size={18} /> },
      ],
    },
    {
      label: "Работа",
      items: [
        { key: "calculator", label: "Калькулятор Л-ок", icon: <Calculator size={18} /> },
        { key: "orders", label: "Пайплайн задач", icon: <ClipboardList size={18} /> },
      ],
    },
    {
      label: "Продажи",
      items: [
        { key: "cash", label: "Касса", icon: <CreditCard size={18} /> },
        { key: "reports", label: "Аналитика", icon: <TrendingUp size={18} /> },
      ],
    },
    {
      label: "Производство",
      items: [
        { key: "sklad", label: "Склад", icon: <Database size={18} /> },
        { key: "materials", label: "Материалы (ЛДСП)", icon: <Package size={18} /> },
      ],
    },
    {
      label: "Команда",
      items: [
        { key: "chat", label: "Командный чат", icon: <MessageSquare size={18} />, badgeKey: "chat" },
        { key: "cleaning", label: "Уборка", icon: <Sparkles size={18} /> },
        { key: "community", label: "Наши герои", icon: <Users size={18} /> },
      ],
    },
    {
      label: "Система",
      items: [
        { key: "wiki", label: "База Знаний", icon: <BookOpen size={18} /> },
        { key: "ai-navigator", label: "ИИ-Штурман", icon: <Bot size={18} /> },
        { key: "security", label: "Security", icon: <ShieldAlert size={18} /> },
      ],
    },
  ];

const DESIGNER_KEYS = new Set(["dashboard", "calculator", "orders", "wiki", "sklad", "materials", "chat", "community", "ai-navigator", "reports", "cash", "cleaning", "security"]);
const getVisibleGroups = (role: string) =>
  role === "designer"
    ? allGroups.map((g) => ({ ...g, items: g.items.filter((n) => DESIGNER_KEYS.has(n.key)) })).filter((g) => g.items.length > 0)
    : allGroups;

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, pinnedSections, onTogglePin, accentColor, notificationCounts, userRole, mobileOpen, onMobileClose }) => {
  const [navSearch, setNavSearch] = useState("");
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});
  const navRef = useRef<HTMLDivElement>(null);
  const drawerRef = useRef<HTMLElement>(null);

  const visibleGroups = getVisibleGroups(userRole);

  const toggleGroup = (label: string) => {
    setCollapsedGroups((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  // Focus trap + ESC for mobile drawer
  useEffect(() => {
    if (!mobileOpen || !drawerRef.current) return;
    const firstFocusable = drawerRef.current.querySelector('button');
    firstFocusable?.focus();
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && onMobileClose) {
        onMobileClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [mobileOpen, onMobileClose]);

  // Keyboard navigation with arrow keys
  const handleNavKeyDown = useCallback((e: React.KeyboardEvent, index: number, total: number) => {
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
    e.preventDefault();
    const step = e.key === 'ArrowDown' ? 1 : -1;
    const nextIndex = Math.min(Math.max(index + step, 0), total - 1);
    const items = navRef.current?.querySelectorAll('button[role="menuitem"]');
    if (items && items[nextIndex]) {
      (items[nextIndex] as HTMLElement).focus();
    }
  }, []);

  const allItems = visibleGroups.flatMap((g) => g.items);
  const searchFiltered = navSearch.trim()
    ? allItems.filter((n) => n.label.toLowerCase().includes(navSearch.toLowerCase()))
    : null;

  const renderItem = (n: NavItem, index: number) => {
    const isActive = activeTab === n.key;
    const isPinned = pinnedSections.includes(n.key);
    const badge = n.badgeKey && notificationCounts[n.badgeKey] ? notificationCounts[n.badgeKey] : null;

    return (
      <div key={n.key} className="group relative">
        <button
          onClick={() => { setActiveTab(n.key); onMobileClose?.(); }}
          onKeyDown={(e) => handleNavKeyDown(e, index, allItems.length)}
          role="menuitem"
          aria-current={isActive ? 'page' : undefined}
          aria-label={n.label + (badge ? ` (${badge})` : '')}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-300 text-sm font-medium relative overflow-hidden ${
            isActive ? "text-white bg-white/10 shadow-sm" : "text-slate-400 hover:text-white hover:bg-white/5"
          }`}
        >
          {isActive && (
            <div
              className="absolute left-0 top-0 bottom-0 w-1 rounded-r-full animate-pulse"
              style={{ backgroundColor: accentColor, boxShadow: `0 0 10px ${accentColor}` }}
            />
          )}
          <span className="transition-colors" aria-hidden="true">{n.icon}</span>
          <span className="flex-1 text-left truncate">{n.label}</span>
          {badge && (
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center ${
              isActive
                ? "bg-white/20 text-white"
                : "bg-indigo-500/20 text-indigo-300"
            }`}>
              {badge > 99 ? "99+" : badge}
            </span>
          )}
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onTogglePin(n.key); }}
          className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-white/10 text-slate-500 hover:text-white"
          title={isPinned ? "Открепить" : "Закрепить"}
          aria-label={isPinned ? `Открепить ${n.label}` : `Закрепить ${n.label}`}
        >
          {isPinned ? <PinOff size={12} /> : <Pin size={12} />}
        </button>
      </div>
    );
  };

  const renderGroup = (group: NavGroup) => {
    const isCollapsed = collapsedGroups[group.label];
    const hasActive = group.items.some((n) => n.key === activeTab);

    return (
      <div key={group.label} className="mb-1">
        <button
          onClick={() => toggleGroup(group.label)}
          className={`w-full flex items-center gap-2 px-2 py-1.5 text-[10px] uppercase tracking-wider font-semibold transition-colors ${
            hasActive ? "text-indigo-400" : "text-slate-500 hover:text-slate-300"
          }`}
        >
          <ChevronDown
            size={12}
            className={`transition-transform duration-200 ${isCollapsed ? "-rotate-90" : ""}`}
          />
          {group.label}
        </button>
        {!isCollapsed && (
          <div className="space-y-0.5">
            {group.items.map((n, i) => renderItem(n, i))}
          </div>
        )}
      </div>
    );
  };

  const sidebarContent = (
    <>
      <div className="p-6 pb-2">
        <div className="flex items-center gap-2 mb-8">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white text-sm shrink-0"
              style={{ background: `linear-gradient(135deg, ${accentColor}, #a855f7)` }}
            >
              N
            </div>
            <div className="min-w-0">
              <h1 className="text-xl font-bold tracking-tight text-white truncate">NOVA_Light</h1>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest truncate">Dashboard</p>
            </div>
        </div>
        {/* Sidebar search */}
        <div className="relative mb-3 px-2">
          <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
          <input
            type="text"
            value={navSearch}
            onChange={(e) => setNavSearch(e.target.value)}
            placeholder="Поиск в меню..."
            className="w-full bg-black/30 border border-white/10 rounded-lg py-1.5 pl-8 pr-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500/50 transition-all"
            aria-label="Поиск по меню"
          />
        </div>
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 px-2" role="heading" aria-level={2}>Main Menu</p>
      </div>

      <nav ref={navRef} className="flex-1 px-4 space-y-1 overflow-y-auto" role="menu" aria-label="Навигация">
        {searchFiltered ? (
          searchFiltered.length > 0 ? (
            searchFiltered.map((n, i) => renderItem(n, i))
          ) : (
            <p className="text-xs text-slate-500 text-center py-8">Ничего не найдено</p>
          )
        ) : (
          visibleGroups.map((g) => renderGroup(g))
        )}
      </nav>
    </>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-64 flex-col border-r border-white/5 bg-black/20 backdrop-blur-xl relative z-10 transition-all duration-300">
        {sidebarContent}
      </aside>

      {/* Tablet sidebar — narrow icon bar */}
      <aside className="hidden md:flex lg:hidden w-16 flex-col border-r border-white/5 bg-black/20 backdrop-blur-xl relative z-10 items-center py-6 transition-all duration-300">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white text-sm mb-8"
          style={{ background: `linear-gradient(135deg, ${accentColor}, #a855f7)` }}
        >
          N
        </div>
        <nav className="flex-1 space-y-2 px-2" role="menu" aria-label="Навигация">
          {allItems.map((n) => {
            const isActive = activeTab === n.key;
            const badge = n.badgeKey && notificationCounts[n.badgeKey] ? notificationCounts[n.badgeKey] : null;
            return (
              <button
                key={n.key}
                onClick={() => setActiveTab(n.key)}
                role="menuitem"
                aria-current={isActive ? 'page' : undefined}
                aria-label={n.label}
                title={n.label}
                className={`w-full flex items-center justify-center p-2 rounded-lg transition-all relative ${
                  isActive ? "text-white bg-white/10" : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
              >
                {isActive && (
                  <div
                    className="absolute left-0 top-0 bottom-0 w-0.5 rounded-r-full"
                    style={{ backgroundColor: accentColor }}
                  />
                )}
                <span aria-hidden="true">{n.icon}</span>
                {badge && (
                  <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-indigo-500 rounded-full text-[8px] font-bold flex items-center justify-center text-white">
                    {badge > 9 ? "!" : badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Mobile drawer overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 md:hidden"
          onClick={onMobileClose}
          aria-hidden="true"
        />
      )}

      {/* Mobile drawer */}
      <aside
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-label="Навигационное меню"
        className={`fixed top-0 left-0 h-full w-72 z-50 flex flex-col border-r border-white/5 bg-[#0b0c10] backdrop-blur-xl transition-transform duration-300 md:hidden ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex justify-end p-4">
          <button
            onClick={onMobileClose}
            className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
            aria-label="Закрыть меню"
          >
            <X size={16} />
          </button>
        </div>
        {sidebarContent}
      </aside>
    </>
  );
};

export default Sidebar;
