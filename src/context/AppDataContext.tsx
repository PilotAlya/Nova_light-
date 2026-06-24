import React, { createContext, useContext } from "react";
import type { TeamMember } from "../types";

const team: Record<string, TeamMember> = {
  admin: { name: "Администратор", role: "Владелец / Директор", avatar: "https://i.pravatar.cc/150?u=admin" },
  sergey: { name: "Сергей Кузнецов", role: "Замерщик", avatar: "https://ui-avatars.com/api/?name=Сергей+К&background=3B82F6&color=fff" },
  elena: { name: "Елена Морозова", role: "Менеджер салона", avatar: "https://ui-avatars.com/api/?name=Елена+М&background=A855F7&color=fff" },
  dmitry: { name: "Дмитрий Волков", role: "Производство / Сборка", avatar: "https://ui-avatars.com/api/?name=Дмитрий+В&background=22C55E&color=fff" },
  andrey: { name: "Андрей Сидоров", role: "Кладовщик / Логистика", avatar: "https://ui-avatars.com/api/?name=Андрей+С&background=F59E0B&color=fff" },
};

export type UserRole = "admin" | "manager" | "designer";

export interface AppContextValue {
  team: Record<string, TeamMember>;
}

const AppDataContext = createContext<AppContextValue | null>(null);

export function AppDataProvider({ children }: { children: React.ReactNode }) {
  return (
    <AppDataContext.Provider value={{ team }}>
      {children}
    </AppDataContext.Provider>
  );
}

export function useAppContext() {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error("useAppContext must be used within AppDataProvider");
  return ctx;
}
