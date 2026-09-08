import React, { useState } from 'react';
import { TrendingUp, Calculator, ClipboardList, ClipboardCheck, MoreHorizontal, X, Smartphone } from 'lucide-react';
import { getVisibleGroups, NavTabKey } from './Sidebar';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface BottomNavProps {
  activeTab: string;
  setActiveTab: (tab: NavTabKey) => void;
  userRole: string;
  notificationCounts: Record<string, number>;
  accentColor: string;
}

const MAIN_TABS: { key: NavTabKey; label: string; icon: React.ReactNode }[] = [
  { key: 'dashboard', label: 'Дашборд', icon: <TrendingUp size={20} /> },
  { key: 'calculator', label: 'Калькулятор', icon: <Calculator size={20} /> },
  { key: 'orders', label: 'Задачи', icon: <ClipboardList size={20} /> },
  { key: 'work-desk', label: 'Смена', icon: <ClipboardCheck size={20} /> },
];

const MAIN_KEYS = new Set(MAIN_TABS.map((t) => t.key));

const BottomNav: React.FC<BottomNavProps> = ({ activeTab, setActiveTab, userRole, notificationCounts, accentColor }) => {
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const { canInstall, promptInstall } = usePWAInstall();

  const moreGroups = getVisibleGroups(userRole)
    .map((g) => ({ ...g, items: g.items.filter((n) => !MAIN_KEYS.has(n.key)) }))
    .filter((g) => g.items.length > 0);

  const isMoreActive = !MAIN_KEYS.has(activeTab as NavTabKey);

  const handleSelect = (key: NavTabKey) => {
    setActiveTab(key);
    setIsMoreOpen(false);
  };

  return (
    <>
      {isMoreOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex flex-col justify-end bg-black/60 backdrop-blur-sm">
          <div className="fixed inset-0" onClick={() => setIsMoreOpen(false)} aria-hidden="true" />
          <div
            className="mobile-more-sheet relative bg-[#13151f] border-t border-white/10 rounded-t-3xl p-4 shadow-2xl space-y-3 max-h-[75vh] overflow-y-auto"
            style={{ paddingBottom: 'max(1.25rem, calc(env(safe-area-inset-bottom, 0px) + 1rem))' }}
          >
            <div className="flex items-center justify-between pb-2 border-b border-white/5">
              <h3 className="text-sm font-bold text-white">Все разделы</h3>
              <button
                onClick={() => setIsMoreOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
                aria-label="Закрыть"
              >
                <X size={16} />
              </button>
            </div>

            {moreGroups.map((group) => (
              <div key={group.label}>
                <p className="text-[10px] uppercase tracking-wider font-semibold text-slate-500 px-1 mb-1">{group.label}</p>
                <div className="space-y-0.5">
                  {group.items.map((n) => {
                    const isActive = activeTab === n.key;
                    const badge = n.badgeKey && notificationCounts[n.badgeKey] ? notificationCounts[n.badgeKey] : null;
                    return (
                      <button
                        key={n.key}
                        onClick={() => handleSelect(n.key)}
                        className={`nav-row w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                          isActive ? 'active text-white bg-white/10' : 'text-slate-300 hover:bg-white/5'
                        }`}
                      >
                        <span aria-hidden="true">{n.icon}</span>
                        <span className="flex-1 text-left">{n.label}</span>
                        {badge && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 min-w-[18px] text-center">
                            {badge > 99 ? '99+' : badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

            {canInstall && (
              <button
                onClick={() => {
                  promptInstall();
                  setIsMoreOpen(false);
                }}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold"
              >
                <Smartphone size={16} />
                Установить на телефон
              </button>
            )}
          </div>
        </div>
      )}

      <nav
        className="mobile-bottom-nav md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0b0c10]/95 backdrop-blur-md border-t border-white/10 px-2 pt-1.5"
        style={{ paddingBottom: 'max(0.5rem, calc(env(safe-area-inset-bottom, 0px) + 0.25rem))' }}
      >
        <div className="flex items-center justify-around">
          {MAIN_TABS.map((item) => {
            const isActive = activeTab === item.key;
            return (
              <button
                key={item.key}
                onClick={() => handleSelect(item.key)}
                aria-current={isActive ? 'page' : undefined}
                className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all ${
                  isActive ? 'active text-white font-semibold' : 'text-slate-400 font-medium'
                }`}
              >
                <div
                  className="p-1.5 rounded-xl transition-all"
                  style={isActive ? { backgroundColor: accentColor, color: '#fff' } : undefined}
                >
                  {item.icon}
                </div>
                <span className="text-[10px] tracking-tight mt-0.5">{item.label}</span>
              </button>
            );
          })}

          <button
            onClick={() => setIsMoreOpen(true)}
            className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all ${
              isMoreActive ? 'active text-white font-semibold' : 'text-slate-400 font-medium'
            }`}
          >
            <div
              className="p-1.5 rounded-xl transition-all"
              style={isMoreActive ? { backgroundColor: accentColor, color: '#fff' } : undefined}
            >
              <MoreHorizontal size={20} />
            </div>
            <span className="text-[10px] tracking-tight mt-0.5">Ещё</span>
          </button>
        </div>
      </nav>
    </>
  );
};

export default BottomNav;
