import { useEffect, useState } from "react";
import { getToken, setToken, api } from "../api/client";
import type { Lead, TimelineEntry, TeamMember, Message, ActivityEntry } from "../types";

const MOCK_TEAM: Record<string, TeamMember> = {
  admin: { name: "Администратор", role: "Владелец / Директор", avatar: "https://i.pravatar.cc/150?u=admin" },
  sergey: { name: "Сергей Кузнецов", role: "Замерщик", avatar: "https://ui-avatars.com/api/?name=Сергей+К&background=3B82F6&color=fff" },
  elena: { name: "Елена Морозова", role: "Менеджер салона", avatar: "https://ui-avatars.com/api/?name=Елена+М&background=A855F7&color=fff" },
  dmitry: { name: "Дмитрий Волков", role: "Производство / Сборка", avatar: "https://ui-avatars.com/api/?name=Дмитрий+В&background=22C55E&color=fff" },
  andrey: { name: "Андрей Сидоров", role: "Кладовщик / Логистика", avatar: "https://ui-avatars.com/api/?name=Андрей+С&background=F59E0B&color=fff" },
};

const STATUS_MAP: Record<string, string> = {
  new: "new", negotiation: "project", measurement: "measure",
  contract: "project", production: "production", delivery: "mounting",
  completed: "mounting", cancelled: "new",
};

const MOCK_LEADS: Lead[] = [
  { id: "LD-001", name: "Иванов Алексей", phone: "+7 (999) 111-11-11", status: "new", budget: "15 000 ₽", deadline: "2026-06-20", material: "ЛДСП Дуб Сонома", type: "Кухня", contactMethod: "Звонок", source: "Салон", messages: [], assignee: MOCK_TEAM.sergey },
  { id: "LD-002", name: "Петрова Мария", phone: "+7 (999) 222-22-22", status: "project", budget: "22 000 ₽", deadline: "2026-06-22", material: "ЛДСП Белый монохром", type: "Шкаф-купе", contactMethod: "WhatsApp", source: "Сайт", messages: [], assignee: MOCK_TEAM.elena },
  { id: "LD-003", name: "Сидоров Павел", phone: "+7 (999) 333-33-33", status: "production", budget: "18 500 ₽", deadline: "2026-06-18", material: "ЛДСП Серый графит", type: "Кухня", contactMethod: "Звонок", source: "Рекомендация", messages: [], assignee: MOCK_TEAM.dmitry },
  { id: "LD-004", name: "Козлова Ольга", phone: "+7 (999) 444-44-44", status: "mounting", budget: "31 000 ₽", deadline: "2026-06-15", material: "ЛДСП Ясень шимо", type: "Гардеробная", contactMethod: "Telegram", source: "Реклама", messages: [], assignee: MOCK_TEAM.elena },
  { id: "LD-005", name: "ООО «Ремонт-Про»", phone: "+7 (999) 555-55-55", status: "mounting", budget: "45 000 ₽", deadline: "2026-06-10", material: "ЛДСП Дуб кантри", type: "Кухня", contactMethod: "Звонок", source: "VIP", messages: [], assignee: MOCK_TEAM.sergey },
  { id: "LD-006", name: "Смирнов Игорь", phone: "+7 (999) 666-66-66", status: "new", budget: "0 ₽", deadline: "2026-06-25", material: "ЛДСП Белый монохром", type: "Шкаф-купе", contactMethod: "WhatsApp", source: "Сайт", messages: [], assignee: MOCK_TEAM.dmitry },
  { id: "LD-007", name: "Волков Дмитрий", phone: "+7 (999) 777-77-77", status: "production", budget: "27 000 ₽", deadline: "2026-06-19", material: "ЛДСП Дуб Сонома", type: "Кухня", contactMethod: "Telegram", source: "Реклама", messages: [], assignee: MOCK_TEAM.sergey },
];

const MOCK_TIMELINE: TimelineEntry[] = [
  { id: "T-001", member: "Елена Морозова", task: "Подготовка КП для LD-005", project: "Проект LD-005", leadId: "LD-001", start: "2026-06-01", end: "2026-06-05", status: "done", color: "rgba(56,189,248,0.85)" },
  { id: "T-002", member: "Сергей Кузнецов", task: "Замер и чертёж LD-006", project: "Проект LD-006", leadId: "LD-002", start: "2026-06-03", end: "2026-06-10", status: "active", color: "rgba(168,85,247,0.9)" },
  { id: "T-003", member: "Дмитрий Волков", task: "Запуск производства LD-007", project: "Проект LD-007", start: "2026-06-08", end: "2026-06-18", status: "active", color: "rgba(34,197,94,0.85)" },
  { id: "T-004", member: "Елена Морозова", task: "Оплата и отгрузка LD-008", project: "Проект LD-008", start: "2026-06-16", end: "2026-06-21", status: "planned", color: "rgba(249,115,22,0.85)" },
  { id: "T-005", member: "Администратор", task: "Координация графика", project: "Общий план", start: "2026-06-01", end: "2026-06-22", status: "active", color: "rgba(59,130,246,0.8)" },
  { id: "T-006", member: "Сергей Кузнецов", task: "Замер кухни LD-001", project: "Проект LD-001", leadId: "LD-001", start: "2026-06-02", end: "2026-06-04", status: "done", color: "rgba(56,189,248,0.85)" },
  { id: "T-007", member: "Елена Морозова", task: "Согласование КП с клиентом", project: "Проект LD-001", leadId: "LD-001", start: "2026-06-05", end: "2026-06-08", status: "done", color: "rgba(56,189,248,0.85)" },
  { id: "T-008", member: "Дмитрий Волков", task: "Раскрой ЛДСП", project: "Проект LD-002", leadId: "LD-002", start: "2026-06-04", end: "2026-06-09", status: "active", color: "rgba(168,85,247,0.9)" },
  { id: "T-009", member: "Андрей Сидоров", task: "Комплектация фурнитуры", project: "Проект LD-002", leadId: "LD-002", start: "2026-06-10", end: "2026-06-14", status: "planned", color: "rgba(249,115,22,0.85)" },
  { id: "T-010", member: "Дмитрий Волков", task: "Сборка корпуса", project: "Проект LD-003", start: "2026-06-12", end: "2026-06-17", status: "planned", color: "rgba(249,115,22,0.85)" },
  { id: "T-011", member: "Андрей Сидоров", task: "Закупка фурнитуры", project: "Проект LD-003", start: "2026-06-06", end: "2026-06-11", status: "active", color: "rgba(168,85,247,0.9)" },
  { id: "T-012", member: "Елена Морозова", task: "Выставление счёта", project: "Проект LD-005", leadId: "LD-001", start: "2026-06-06", end: "2026-06-07", status: "done", color: "rgba(56,189,248,0.85)" },
  { id: "T-013", member: "Сергей Кузнецов", task: "Монтаж на объекте", project: "Проект LD-006", start: "2026-06-13", end: "2026-06-20", status: "planned", color: "rgba(249,115,22,0.85)" },
  { id: "T-014", member: "Дмитрий Волков", task: "Фотофиксация готового объекта", project: "Проект LD-006", start: "2026-06-21", end: "2026-06-23", status: "planned", color: "rgba(249,115,22,0.85)" },
  { id: "T-015", member: "Администратор", task: "Переговоры с салоном «Престиж»", project: "Проект LD-011", leadId: "LD-011", start: "2026-06-18", end: "2026-06-23", status: "active", color: "rgba(59,130,246,0.85)" },
  { id: "T-016", member: "Администратор", task: "Согласование проекта ЖК «Невский»", project: "Проект LD-012", leadId: "LD-012", start: "2026-06-20", end: "2026-06-27", status: "planned", color: "rgba(168,85,247,0.85)" },
  { id: "T-017", member: "Администратор", task: "Выезд на замер ресторана «Восток»", project: "Проект LD-013", leadId: "LD-013", start: "2026-06-22", end: "2026-06-26", status: "planned", color: "rgba(249,115,22,0.85)" },
  { id: "T-018", member: "Администратор", task: "Контроль производства стенда шоурум", project: "Проект LD-014", leadId: "LD-014", start: "2026-06-17", end: "2026-06-30", status: "active", color: "rgba(34,197,94,0.85)" },
];

const NAME_TO_KEY: Record<string, string> = {
  "Администратор": "admin",
  "Сергей Кузнецов": "sergey",
  "Елена Морозова": "elena",
  "Дмитрий Волков": "dmitry",
  "Андрей Сидоров": "andrey",
};

function apiLeadToApp(l: any, team: Record<string, TeamMember>): Lead {
  const teamEntry = Object.entries(team).find(([, v]) => v.name === l.assigned_to_name);
  const nameEntry = Object.entries(NAME_TO_KEY).find(([name]) => name === l.assigned_to_name);
  let member: TeamMember;
  if (teamEntry) {
    member = teamEntry[1];
  } else if (nameEntry) {
    member = team[nameEntry[1]];
  } else {
    member = Object.values(team)[0];
  }
  return {
    id: `LD-${String(l.id).padStart(3, "0")}`,
    name: l.title || l.name,
    phone: l.phone || "",
    status: (STATUS_MAP[l.status] || "new") as Lead["status"],
    budget: l.budget ? `${Number(l.budget).toLocaleString()} ₽` : "0 ₽",
    deadline: l.deadline || "",
    material: l.material || "ЛДСП EGGER",
    type: l.type || "Кухня",
    typeCustom: l.type_custom || undefined,
    contactMethod: l.source || "",
    source: l.source || "",
    sourceCustom: l.source_custom || undefined,
    messages: [],
    activityLog: [],
    assignee: { name: member.name, avatar: member.avatar },
  };
}

function apiTimelineToApp(e: any, team: Record<string, TeamMember>): TimelineEntry {
  return {
    id: `T-${String(e.id).padStart(3, "0")}`,
    member: e.member?.name || e.member_name || "—",
    task: e.task,
    project: `Проект ${e.lead_id ? `LD-${String(e.lead_id).padStart(3, "0")}` : "—"}`,
    leadId: e.lead_id ? `LD-${String(e.lead_id).padStart(3, "0")}` : undefined,
    start: e.start_date,
    end: e.end_date,
    status: e.status,
    color: e.color || "rgba(99,102,241,0.85)",
  };
}

export interface AppData {
  team: Record<string, TeamMember>;
  leads: Lead[];
  timeline: TimelineEntry[];
  heroes: Record<string, Partial<TeamMember>>;
  loading: boolean;
  error: string | null;
  connected: boolean;
}

const HEROES_META: Record<string, Partial<TeamMember>> = {
  admin: { superpower: "Архитектор Экосистемы", achievements: ["Основатель салона", "Стратег", "1000+ решений"] },
  sergey: { superpower: "Мастер точного замера", achievements: ["Лазерный глаз", "Безошибочные чертежи", "Выезд за 24ч"] },
  elena: { superpower: "Душа салона", achievements: ["Лид продаж", "Образцы ЛДСП", "Вежливость 24/7"] },
  dmitry: { superpower: "Стальной характер", achievements: ["Точность до мм", "Сложные проекты", "Наставник цеха"] },
  andrey: { superpower: "Хранитель склада", achievements: ["Всё на учёте", "Ноль потерь", "Расходники под рукой"] },
};

export function useAppData(): AppData {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);
  const [team, setTeam] = useState<Record<string, TeamMember>>(MOCK_TEAM);
  const [leads, setLeads] = useState<Lead[]>(MOCK_LEADS);
  const [timeline, setTimeline] = useState<TimelineEntry[]>(MOCK_TIMELINE);

  useEffect(() => {
    let cancelled = false;
    let token = getToken();

    async function autoLogin() {
      try {
        const res = await api.post<{ token: string }>("/auth/login", { email: "admin@relan.ru", password: "demo123" });
        if (!cancelled) {
          setToken(res.token);
          token = res.token;
        }
      } catch {}
    }

    async function load() {
      if (!token) {
        await autoLogin();
        token = getToken();
      }
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const [apiUsers, apiLeads, apiTimeline] = await Promise.all([
          api.get<any[]>("/users").catch(() => null),
          api.get<any[]>("/leads").catch(() => null),
          api.get<any[]>("/timeline").catch(() => null),
        ]);

        if (cancelled) return;

        let resolvedTeam = MOCK_TEAM;
        let resolvedLeads = MOCK_LEADS;
        let resolvedTimeline = MOCK_TIMELINE;

        if (apiUsers) {
          resolvedTeam = {};
          apiUsers.forEach((u) => {
            const key = NAME_TO_KEY[u.name] || u.name.toLowerCase().replace(/\s+/g, "_");
            resolvedTeam[key] = { name: u.name, avatar: u.avatar || `https://i.pravatar.cc/150?u=${encodeURIComponent(u.name)}`, role: translateRole(u.role) };
          });
          setConnected(true);
          setTeam(resolvedTeam);
        }

        if (apiLeads) {
          resolvedLeads = apiLeads.map((l) => apiLeadToApp(l, resolvedTeam));
          setLeads(resolvedLeads);
          setConnected(true);
        }

        if (apiTimeline) {
          resolvedTimeline = apiTimeline.map((e) => apiTimelineToApp(e, resolvedTeam));
          setTimeline(resolvedTimeline);
          setConnected(true);
        }

      } catch (e: any) {
        if (!cancelled) setError(e.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, []);

  return { team, leads, timeline, heroes: HEROES_META, loading, error, connected };
}

function translateRole(role: string): string {
  const map: Record<string, string> = {
    director: "Владелец / Директор",
    manager: "Менеджер салона",
    designer: "Замерщик",
    production: "Производство / Сборка",
    warehouseman: "Кладовщик / Логистика",
  };
  return map[role] || role;
}
