import React, { useState, useEffect, useRef } from 'react';
import { X, User, Briefcase, Smile, Upload, Check } from 'lucide-react';
import { TeamMember } from '../types';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUserKey: string | null;
  teamMembers: Record<string, TeamMember>;
  setTeamMembers: React.Dispatch<React.SetStateAction<Record<string, TeamMember>>>;
  setCurrentUser: (name: string) => void;
}

const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  currentUserKey,
  teamMembers,
  setTeamMembers,
  setCurrentUser
}) => {
  const [formData, setFormData] = useState<TeamMember | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && currentUserKey && teamMembers[currentUserKey]) {
      setFormData({ ...teamMembers[currentUserKey] });
    }
  }, [isOpen, currentUserKey, teamMembers]);

  if (!isOpen || !formData || !currentUserKey) return null;

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      setFormData({ ...formData, avatar: dataUrl });
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    setTeamMembers(prev => ({
      ...prev,
      [currentUserKey]: formData
    }));
    
    if (formData.name !== teamMembers[currentUserKey].name) {
      setCurrentUser(formData.name);
      const authData = localStorage.getItem("nova_light_auth");
      if (authData) {
        const parsed = JSON.parse(authData);
        parsed.user = formData.name;
        localStorage.setItem("nova_light_auth", JSON.stringify(parsed));
      }
    }
    
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[120] flex items-center justify-center p-4 animate-in fade-in" onClick={onClose}>
      <div 
        className="relative w-full max-w-md bg-slate-900 border border-white/10 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-white/10 bg-black/20 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-white">Профиль пользователя</h2>
            <p className="text-xs text-slate-400 mt-1">Настройте свои личные данные</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 transition-colors"
          >
            <X size={18} />
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="flex justify-center mb-6">
            <div className="relative group">
              <img 
                src={formData.avatar} 
                alt="Avatar" 
                className="w-24 h-24 rounded-full border-4 border-indigo-500/30 object-cover shadow-xl"
              />
              <div
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 bg-black/60 rounded-full flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              >
                <Upload size={20} className="text-white mb-1" />
                <span className="text-[10px] font-bold text-white uppercase tracking-widest">Загрузить</span>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarUpload}
              />
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase mb-2 flex items-center gap-2">
                <User size={14} /> Имя
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500/50"
              />
            </div>
            
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase mb-2 flex items-center gap-2">
                <Briefcase size={14} /> Должность
              </label>
              <input
                type="text"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500/50"
              />
            </div>
            
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase mb-2 flex items-center gap-2">
                <Smile size={14} /> Личный статус
              </label>
              <input
                type="text"
                value={formData.status || ""}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                placeholder="Например: В отпуске, На объекте, Занят"
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500/50"
              />
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-white/10 bg-black/20 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            Отмена
          </button>
          <button
            onClick={handleSave}
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-lg flex items-center gap-2"
          >
            <Check size={16} /> Сохранить
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserProfileModal;
