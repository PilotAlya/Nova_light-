import { useState, useEffect } from "react";
import { keyLogin } from "../api/sync";

type Session = {
  id: string;
  user: string;
  role: string;
  device: string;
  ip: string;
  since: string;
  active: boolean;
};

export function useAuth(defaultUser: string | null) {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    try {
      const saved = localStorage.getItem("nova_auth");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.authenticated && parsed.user) return true;
      }
    } catch { /* ignore */ }
    return false;
  });
  const [currentUser, setCurrentUser] = useState<string | null>(() => {
    try {
      const saved = localStorage.getItem("nova_auth");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.authenticated && parsed.user) return parsed.user;
      }
    } catch { /* ignore */ }
    return defaultUser;
  });
  const [blockedUsers, setBlockedUsers] = useState<string[]>(() => {
    if (typeof window === "undefined") return [];
    const saved = localStorage.getItem("nova_blocked_users");
    return saved ? JSON.parse(saved) : [];
  });
  const [loginKey, setLoginKey] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  const defaultSessions: Session[] = [
    { id: "S-001", user: "Администратор", role: "Владелец / Директор", device: "Chrome / Windows", ip: "192.168.1.10", since: "2026-06-16 08:00", active: true },
    { id: "S-002", user: "Елена Морозова", role: "Менеджер салона", device: "Safari / iPhone", ip: "192.168.1.20", since: "2026-06-16 08:30", active: true },
    { id: "S-003", user: "Сергей Кузнецов", role: "Замерщик", device: "Chrome / Android", ip: "192.168.1.30", since: "2026-06-16 09:00", active: true },
    { id: "S-004", user: "Дмитрий Волков", role: "Производство / Сборка", device: "Chrome / Windows", ip: "192.168.1.40", since: "2026-06-16 09:15", active: false },
    { id: "S-005", user: "Андрей Сидоров", role: "Кладовщик / Логистика", device: "Firefox / Windows", ip: "192.168.1.50", since: "2026-06-16 09:30", active: false },
  ];
  const [sessions, setSessions] = useState<Session[]>(defaultSessions);

  const handleKillSession = (userId: string) => {
    setBlockedUsers((prev) => {
      const next = Array.from(new Set([...prev, userId]));
      localStorage.setItem("nova_blocked_users", JSON.stringify(next));
      return next;
    });
    setSessions((prev) => prev.map((s) => (s.user === userId ? { ...s, active: false } : s)));
    if (currentUser === userId) {
      localStorage.removeItem("nova_auth");
      localStorage.removeItem("nova_token");
      setIsAuthenticated(false);
      setCurrentUser(defaultUser);
    }
  };

  useEffect(() => {
    if (isAuthenticated && currentUser && blockedUsers.includes(currentUser)) {
      localStorage.removeItem("nova_auth");
      localStorage.removeItem("nova_token");
      setIsAuthenticated(false);
      setCurrentUser(defaultUser);
    }
  }, [blockedUsers, currentUser, isAuthenticated]);

  return {
    isAuthenticated, setIsAuthenticated,
    currentUser, setCurrentUser,
    blockedUsers, setBlockedUsers,
    loginKey, setLoginKey,
    loginError, setLoginError,
    loginLoading, setLoginLoading,
    sessions, setSessions,
    handleKillSession,
    keyLogin,
  };
}
