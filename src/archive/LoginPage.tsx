import { useState } from "react";
import { Loader2 } from "lucide-react";

const USERS = [
  { key: "admin", name: "Администратор", role: "Владелец / Директор", avatar: "https://i.pravatar.cc/150?u=admin" },
  { key: "elena", name: "Елена Морозова", role: "Менеджер салона", avatar: "https://ui-avatars.com/api/?name=Елена+М&background=A855F7&color=fff" },
];

export default function LoginPage({ onLogin }: { onLogin: () => void }) {
  const [selectedUser, setSelectedUser] = useState<string>("Администратор");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    setTimeout(() => {
      const expectedKey = selectedUser === "Администратор" ? "nova2026" : "elena2026";
      if (password === expectedKey) {
        localStorage.setItem("nova_light_auth", JSON.stringify({ authenticated: true, user: selectedUser }));
        onLogin();
      } else {
        setError("Неверный ключ доступа");
      }
      setLoading(false);
    }, 400);
  };

  return (
    <div className="min-h-screen bg-[#0f111b] flex items-center justify-center p-4">
      <div className="w-full max-w-sm glass-panel rounded-3xl p-8 border border-indigo-500/20">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center shadow-[0_0_30px_rgba(99,102,241,0.3)] mb-4">
            <span className="text-2xl font-bold text-white">N</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Рэлан</h1>
          <p className="text-sm text-slate-400 mt-1">Панель управления салоном</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs text-slate-500 uppercase font-bold block mb-2">Пользователь</label>
            <div className="space-y-2">
              {USERS.map((u) => (
                <button
                  type="button"
                  key={u.key}
                  onClick={() => { setSelectedUser(u.name); setError(""); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl border transition-all text-left ${
                    selectedUser === u.name
                      ? "border-indigo-500/50 bg-indigo-500/10"
                      : "border-white/10 hover:border-white/20 bg-white/5"
                  }`}
                >
                  <img src={u.avatar} className="w-10 h-10 rounded-full object-cover border border-white/10" alt="" />
                  <div>
                    <p className="text-sm font-semibold text-white">{u.name}</p>
                    <p className="text-[10px] text-slate-500">{u.role}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-500 uppercase font-bold block mb-1">Ключ доступа</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Введите ключ"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
              required
            />
          </div>

          {error && <p className="text-xs text-red-400">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : null}
            {loading ? "Вход..." : "Войти"}
          </button>
        </form>

        <p className="text-[10px] text-slate-600 text-center mt-6">
          Демо: Администратор (nova2026) · Елена Морозова (elena2026)
        </p>
      </div>
    </div>
  );
}
