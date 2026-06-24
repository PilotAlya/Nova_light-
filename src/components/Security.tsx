import React from 'react';
import { ShieldAlert, Smartphone, Cpu, Wifi } from 'lucide-react';

interface Session {
  id: string;
  user: string;
  role: string;
  device: string;
  ip: string;
  since: string;
  active: boolean;
}

interface SecurityProps {
  sessions: Session[];
  getAvatarByName: (name: string) => string;
  handleKillSession: (userId: string) => void;
}

const Security: React.FC<SecurityProps> = ({ sessions, getAvatarByName, handleKillSession }) => {
  return (
    <div className="max-w-5xl mx-auto fade-in">
      <h2 className="text-3xl font-bold text-white mb-2 tracking-tight flex items-center gap-3">
        <ShieldAlert size={32} className="text-red-500" /> Security & Sessions
      </h2>
      <div className="glass-panel rounded-2xl overflow-hidden border border-red-500/10 mt-6">
        <div className="grid grid-cols-6 gap-4 p-4 border-b border-white/10 bg-black/40 text-xs font-bold text-slate-400 uppercase tracking-wider">
          <div className="col-span-2">Сотрудник</div>
          <div>Устройство</div>
          <div>IP Адрес</div>
          <div>Начало сессии</div>
          <div className="text-right">Управление</div>
        </div>
        <div className="divide-y divide-white/5">
          {sessions.map((s) => (
            <div
              key={s.id}
              className={`grid grid-cols-6 gap-4 p-4 items-center transition-colors hover:bg-white/5 ${
                !s.active ? "opacity-50 grayscale" : ""
              }`}
            >
              <div className="col-span-2 flex items-center gap-3">
                <img
                  src={getAvatarByName(s.user)}
                  className="w-10 h-10 rounded-full"
                  alt="avatar"
                />
                <div>
                  <p className="font-bold text-white text-sm">{s.user}</p>
                  <p className="text-[10px] text-indigo-400 uppercase tracking-widest">{s.role}</p>
                </div>
              </div>
              <div className="text-sm text-slate-300 flex items-center gap-2">
                {s.device.includes("iPhone") ? (
                  <Smartphone size={14} className="text-slate-500" />
                ) : (
                  <Cpu size={14} className="text-slate-500" />
                )}
                {s.device}
              </div>
              <div className="text-sm text-slate-400 font-mono flex items-center gap-2">
                <Wifi size={14} className="text-slate-500" /> {s.ip}
              </div>
              <div className="text-sm text-slate-400">{s.since}</div>
              <div className="text-right flex justify-end">
                {s.active ? (
                  <button
                    onClick={() => handleKillSession(s.user)}
                    className="bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white px-4 py-1.5 rounded-lg text-xs font-bold transition-all border border-red-500/20"
                  >
                    KILL SESSION
                  </button>
                ) : (
                  <span className="text-xs font-bold text-slate-500 px-4 py-1.5 border border-slate-700 rounded-lg">
                    ТЕРМИНИРОВАНА
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Security;
