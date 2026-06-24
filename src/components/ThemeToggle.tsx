import React from 'react';
import { Sun, Moon } from 'lucide-react';

interface ThemeToggleProps {
  theme: 'light' | 'dark';
  onToggle: () => void;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ theme, onToggle }) => {
  return (
    <button
      onClick={onToggle}
      className="w-10 h-10 rounded-full glass-panel flex items-center justify-center text-white bg-white/10 border border-white/15 shadow-sm hover:text-white hover:bg-white/20 transition-all"
      title={theme === 'dark' ? 'Светлая тема' : 'Тёмная тема'}
      aria-label={theme === 'dark' ? 'Включить светлую тему' : 'Включить тёмную тему'}
      role="switch"
      aria-checked={theme === 'light'}
    >
      {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
};

export default ThemeToggle;