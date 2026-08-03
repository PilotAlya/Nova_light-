import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Calendar,
  CheckCircle,
  Cpu,
  Loader2,
  LogOut,
  MessageSquare,
  Package,
  Plus,
  Search,
  Send,
  Settings,
  TrendingUp,
  Users,
  X,
  AlertTriangle,
  Edit3,
  Trash2,
  Check,
  Clock,
  Menu,
  Ruler,
} from "lucide-react";
import { useKeyboardShortcut } from "./hooks/useKeyboardShortcut";
import { useAudioChime } from "./hooks/useAudioChime";

// Components
import Sidebar from "./components/Sidebar";
import ThemeToggle from "./components/ThemeToggle";
import AiNavigator from "./components/AiNavigator";
import Wiki from "./components/Wiki";
import RealityCheck from "./components/RealityCheck";
import SkladEnhanced from "./components/SkladEnhanced";
import Tasks from "./components/Tasks";
import Community from "./components/Community";
import BorisOnboarding from "./components/BorisOnboarding";
import UserProfileModal from "./components/UserProfileModal";
import Security from "./components/Security";
import TeamChat from "./components/TeamChat";
import BorisGuide from "./components/BorisGuide";
import MeasurementModal from "./components/MeasurementModal";
import ConfettiCanvas from "./components/ConfettiCanvas";
import GlitchSimulation from "./components/GlitchSimulation";
import CalculatorV2 from "./components/CalculatorV2";
import OrdersPage from "./components/OrdersPage";
import CashPage from "./components/CashPage";
import CleaningSchedule from "./components/CleaningSchedule";
import Dashboard from "./components/Dashboard";
import Notifications from "./components/Notifications";
import ReportsPage from "./components/ReportsPage";
import MaterialsPage from "./components/MaterialsPage";
import GlobalSearch from "./components/GlobalSearch";


// Utils
import { runSmartRouting, Specialist } from "./utils/smartRouting";
import { getAiResponse } from "./services/aiService";
import { generateLeadAnalysis } from "./services/aiMock";

// Types
import { Lead, LeadStatus, TimelineEntry, TeamMember, InternQuestTask, Idea } from "./types";
import { loadData, saveData } from "./api/sync";
import { createLead, updateLead as apiUpdateLead, deleteLead as apiDeleteLead } from "./api/leads";
import { useAuth } from "./hooks/useAuth";
import { useLeads } from "./hooks/useLeads";
import { useTeam } from "./hooks/useTeam";
import { useTimeline } from "./hooks/useTimeline";

const TODAY = new Date();
const isOverdue = (d: string) => new Date(d) < TODAY;
const formatTime = (date: Date) =>
  date.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit", hour12: false });
const formatPhone = (val: string): string => {
  const digits = val.replace(/\D/g, "").slice(0, 11);
  if (!digits) return val;
  let result = "+7";
  if (digits.length > 1) result += " (" + digits.slice(1, 4);
  if (digits.length > 4) result += ") " + digits.slice(4, 7);
  if (digits.length > 7) result += "-" + digits.slice(7, 9);
  if (digits.length > 9) result += "-" + digits.slice(9, 11);
  return result;
};

// (Duplicate types removed, using types.ts)

type AiMessage = {
  id: number;
  sender: "user" | "bot";
  text: string;
  time: string;
};

export default function NovaLightDashboard() {
  const initialTeam: Record<string, TeamMember> = {
    admin: {
      name: "Администратор",
      role: "Владелец / Директор",
      avatar: "https://i.pravatar.cc/150?u=admin",
    },
    sergey: {
      name: "Сергей Кузнецов",
      role: "Замерщик",
      avatar: "https://ui-avatars.com/api/?name=Сергей+К&background=3B82F6&color=fff",
    },
    elena: {
      name: "Елена Морозова",
      role: "Менеджер салона",
      avatar: "https://ui-avatars.com/api/?name=Елена+М&background=A855F7&color=fff",
    },
    dmitry: {
      name: "Дмитрий Волков",
      role: "Производство / Сборка",
      avatar: "https://ui-avatars.com/api/?name=Дмитрий+В&background=22C55E&color=fff",
    },
    andrey: {
      name: "Андрей Сидоров",
      role: "Кладовщик / Логистика",
      avatar: "https://ui-avatars.com/api/?name=Андрей+С&background=F59E0B&color=fff",
    },
  };

  const { team, setTeamMembers, getAvatarByName } = useTeam(initialTeam);

  const defaultUser = Object.values(team)[0]?.name || null;

  const [showUserProfile, setShowUserProfile] = useState(false);
  const [showMeasurementModal, setShowMeasurementModal] = useState(false);
  const [selectedLeadForMeasurement, setSelectedLeadForMeasurement] = useState<Lead | null>(null);

  const [activeTab, setActiveTab] = useState<
    | "dashboard"
    | "reports"
    | "materials"
    | "wiki"
    | "community"
    | "ai-navigator"
    | "chat"
    | "security"
    | "sklad"
    | "calculator"
    | "orders"
    | "cash"
    | "cleaning"
  >(() => {
    if (typeof window === "undefined") return "dashboard";
    return (localStorage.getItem("nova_light_start_tab") as any) || "dashboard";
  });

  // ── Auth State ────────────────────────────────────
  const {
    isAuthenticated, setIsAuthenticated,
    currentUser, setCurrentUser,
    blockedUsers, setBlockedUsers,
    loginKey, setLoginKey,
    loginError, setLoginError,
    loginLoading, setLoginLoading,
    sessions,
    handleKillSession,
    keyLogin,
  } = useAuth(defaultUser);

  const ALLOWED_USERS = ["Администратор", "Елена Морозова"];

  // Автоматическое переключение роли при входе
  useEffect(() => {
    if (currentUser === "Администратор") {
      setViewAsRole("admin");
    } else if (currentUser === "Елена Морозова") {
      setViewAsRole("manager");
    }
  }, [currentUser]);

  // Горячие клавиши
  useKeyboardShortcut('k', () => setShowBorisChat(true), true); // Ctrl+K -> Борис
  useKeyboardShortcut('/', () => setShowBorisChat(true), false); // / -> Борис
  useKeyboardShortcut('n', () => setShowNewOrderModal(true), false); // N -> Новый лид
  useKeyboardShortcut('?', () => setShowShortcuts(true), false); // ? -> Справка по клавишам
  useKeyboardShortcut('Escape', () => {
    setShowNewOrderModal(false);
    setShowSettings(false);
    setShowShortcuts(false);
    setIsDrawerOpen(false);
    setIsTimelineDrawerOpen(false);
  }, false);

  const MOCK_PASSWORDS: Record<string, string> = {
    "Администратор": "nova2026",
    "Елена Морозова": "elena2026",
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError("");
    // Mock login — no backend needed
    const user = currentUser || "Администратор";
    const expectedKey = MOCK_PASSWORDS[user];
    if (expectedKey && loginKey === expectedKey) {
      const authData = { authenticated: true, user };
      localStorage.setItem("nova_light_auth", JSON.stringify(authData));
      setIsAuthenticated(true);
      setCurrentUser(user);
      setLoginKey("");
    } else {
      setLoginError("Неверный ключ доступа");
    }
    setLoginLoading(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("nova_light_auth");
    localStorage.removeItem("nova_light_token");
    setShowBorisChat(false);
    setShowSettings(false);
    setActiveGuide(null);
    setOnboardingCompleted(false);
    setIsAuthenticated(false);
    setCurrentUser(defaultUser);
    setLoginKey("");
    setLoginError("");
  };

  const handleCompleteMeasurement = async (leadId: string) => {
    // 1. Найти замерщика и перевести его в available
    const lead = leads.find(l => l.id === leadId);
    if (!lead) return;

    // 2. Выполнить Smart Routing для поиска дизайнера
    // В реальном проекте специалисты были бы в глобальном состоянии
    const specialists: Specialist[] = [
      { id: '1', name: 'Иван (Замерщик)', role: 'measurer', status: 'on-site', efficiencyScore: 0.95, activeTasksLimit: 1, currentTaskId: leadId, avatar: '📐' },
      { id: '2', name: 'Ольга (Дизайнер)', role: 'designer', status: 'available', efficiencyScore: 0.95, activeTasksLimit: 3, currentTaskId: null, avatar: '🎨' },
      { id: '3', name: 'Анна (Дизайнер)', role: 'designer', status: 'available', efficiencyScore: 0.85, activeTasksLimit: 2, currentTaskId: null, avatar: '👩‍🎨' },
      { id: '4', name: 'Дмитрий (Дизайнер)', role: 'designer', status: 'busy', efficiencyScore: 0.70, activeTasksLimit: 4, currentTaskId: '1002', avatar: '👨‍🎨' }
    ];

    // Обновляем статус замерщика на available (он завершил замер)
    const updatedSpecialists: Specialist[] = specialists.map(s => {
      if (s.id === '1') {
        return { ...s, status: 'available' as const, currentTaskId: null };
      }
      return s;
    });

    // Находим лучшего дизайнера
    const { bestDesigner } = runSmartRouting(updatedSpecialists.filter(s => s.role === 'designer'));

    if (!bestDesigner) return;

    // 3. Обновляем данные лида: статус на project, назначаем дизайнера
    const updatedLead = { ...lead, status: 'project' as const, assignee: { ...lead.assignee, name: bestDesigner.name } };

    // 4. Обновляем статус дизайнера на busy и привязываем задачу
    const finalSpecialists = updatedSpecialists.map(s => {
      if (s.id === bestDesigner.id) {
        return { ...s, status: 'busy' as const, currentTaskId: leadId };
      }
      return s;
    });

    // 5. Сохраняем изменения в состоянии
    setLeads(prev => prev.map(l => l.id === leadId ? updatedLead : l));
    // Здесь нужно было бы обновить состояние команды, но для простоты оставляем как есть
    // В реальном приложении нужно обновлять team или specialists состояние

    // 6. Уведомления и эффекты
    playChime();
    setConfettiTrigger(prev => prev + 1);

    // 7. TODO: В реальном приложении здесь нужно обновить статус команды специалистов
    // и добавить toast с именем дизайнера
  };


  const [currentTime, setCurrentTime] = useState(() => new Date());
  useEffect(() => {
    const t = window.setInterval(() => setCurrentTime(new Date()), 1000);
    return () => window.clearInterval(t);
  }, []);

  const borisAvatarStyle: React.CSSProperties = {
    backgroundImage: "url(/boris_avatar.png)",
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    boxShadow: "inset 0 0 10px rgba(0,0,0,0.5)",
  };

  const defaultLeads: Lead[] = [
    {
      id: "LD-001",
      name: "ГРАФ АЛЕКС ХОМЯКОВСКИЙ",
      phone: "8 (963) 164-60-70",
      contactMethod: "Telegram",
      source: "VK Таргет",
      status: "project",
      type: "Кухня",
      budget: "120 000 ₽",
      material: "ЛДСП EGGER",
      deadline: "2026-04-20",
      assignee: team.sergey,
      messages: [
        { from: "client", text: "Здравствуйте! Подскажите, а можно заменить ЛДСП на эмаль?", time: "09:45" },
        { from: "manager", user: team.sergey, text: "Пересчитаю проект и вышлю обновленное КП.", time: "09:50" },
      ],
    },
    {
      id: "LD-002",
      name: "Анна Смирнова",
      phone: "8 (999) 123-45-67",
      contactMethod: "WhatsApp",
      source: "Сайт",
      status: "new",
      type: "Шкаф-купе",
      budget: "85 000 ₽",
      material: "HPL Пластик",
      deadline: "2026-06-20",
      assignee: team.elena,
      messages: [],
    },
    {
      id: "LD-003",
      name: "Пётр Кузнецов",
      phone: "8 (911) 222-33-44",
      contactMethod: "Звонок",
      source: "Рекомендация",
      status: "new",
      type: "Кухня",
      budget: "210 000 ₽",
      material: "МДФ Эмаль",
      deadline: "2026-06-15",
      assignee: team.sergey,
      messages: [],
    },
    {
      id: "LD-004",
      name: "Ольга Морозова",
      phone: "8 (922) 555-66-77",
      contactMethod: "Telegram",
      source: "Instagram",
      status: "new",
      type: "Гардеробная",
      budget: "180 000 ₽",
      material: "ЛДСП EGGER",
      deadline: "2026-06-28",
      assignee: team.elena,
      messages: [],
    },
    {
      id: "LD-005",
      name: "Екатерина Волкова",
      phone: "8 (964) 777-88-99",
      contactMethod: "WhatsApp",
      source: "VK Таргет",
      status: "project",
      type: "Кухня",
      budget: "350 000 ₽",
      material: "Массив Дуба",
      deadline: "2026-07-01",
      assignee: team.sergey,
      messages: [],
    },
    {
      id: "LD-006",
      name: "Иван Петров",
      phone: "8 (915) 444-55-66",
      contactMethod: "Звонок",
      source: "Сайт",
      status: "measure",
      type: "Кухня",
      budget: "95 000 ₽",
      material: "ЛДСП EGGER",
      deadline: "2026-05-10",
      assignee: team.dmitry,
      messages: [],
    },
    {
      id: "LD-007",
      name: "Татьяна Новикова",
      phone: "8 (933) 111-22-33",
      contactMethod: "Telegram",
      source: "Рекомендация",
      status: "measure",
      type: "Прихожая",
      budget: "75 000 ₽",
      material: "HPL Пластик",
      deadline: "2026-05-09",
      assignee: team.andrey,
      messages: [],
    },
    {
      id: "LD-008",
      name: "Дмитрий Соколов",
      phone: "8 (916) 333-44-55",
      contactMethod: "WhatsApp",
      source: "Instagram",
      status: "production",
      type: "Шкаф-купе",
      budget: "160 000 ₽",
      material: "МДФ Эмаль",
      deadline: "2026-05-25",
      assignee: team.dmitry,
      messages: [],
    },
    {
      id: "LD-009",
      name: "Наталья Белова",
      phone: "8 (977) 666-77-88",
      contactMethod: "Звонок",
      source: "VK Таргет",
      status: "production",
      type: "Гардеробная",
      budget: "290 000 ₽",
      material: "ЛДСП EGGER",
      deadline: "2026-05-30",
      assignee: team.elena,
      messages: [],
    },
    {
      id: "LD-010",
      name: "Арсений Орлов",
      phone: "8 (925) 888-99-00",
      contactMethod: "Telegram",
      source: "Сайт",
      status: "new",
      type: "Офис",
      budget: "520 000 ₽",
      material: "Массив Дуба",
      deadline: "2026-07-10",
      assignee: team.admin,
      messages: [],
    },
    {
      id: "LD-011",
      name: "Салон красоты «Престиж»",
      phone: "8 (901) 111-22-33",
      contactMethod: "Звонок",
      source: "VIP-канал",
      status: "new",
      type: "Офис",
      budget: "400 000 ₽",
      material: "ЛДСП EGGER",
      deadline: "2026-07-15",
      assignee: team.admin,
      messages: [],
    },
    {
      id: "LD-012",
      name: "ЖК «Невский» — студия",
      phone: "8 (902) 222-33-44",
      contactMethod: "WhatsApp",
      source: "Рекомендация",
      status: "project",
      type: "Кухня",
      budget: "280 000 ₽",
      material: "МДФ Эмаль",
      deadline: "2026-06-25",
      assignee: team.admin,
      messages: [],
    },
    {
      id: "LD-013",
      name: "Ресторан «Восток»",
      phone: "8 (903) 333-44-55",
      contactMethod: "Telegram",
      source: "Агент",
      status: "measure",
      type: "Барная стойка",
      budget: "180 000 ₽",
      material: "Массив Дуба",
      deadline: "2026-06-05",
      assignee: team.admin,
      messages: [],
    },
    {
      id: "LD-014",
      name: "Шоурум «Интерьер»",
      phone: "8 (904) 444-55-66",
      contactMethod: "Звонок",
      source: "Выставка",
      status: "production",
      type: "Выставочный стенд",
      budget: "650 000 ₽",
      material: "HPL Пластик",
      deadline: "2026-06-01",
      assignee: team.admin,
      messages: [],
    },
    {
      id: "LD-015",
      name: "СПА-салон «Эко Восток»",
      phone: "8 (905) 555-66-77",
      contactMethod: "WhatsApp",
      source: "Рекомендация",
      status: "mounting",
      type: "Гардеробная",
      budget: "200 000 ₽",
      material: "ЛДСП EGGER",
      deadline: "2026-05-28",
      assignee: team.elena,
      messages: [],
    },
  ];
  const { leads, setLeads } = useLeads({ defaultLeads });

  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedTimelineEntry, setSelectedTimelineEntry] = useState<TimelineEntry | null>(null);
  const [isTimelineDrawerOpen, setIsTimelineDrawerOpen] = useState(false);
  const [showMyTasksOnly, setShowMyTasksOnly] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("nova_light_my_tasks_only") !== "false";
  });
  useEffect(() => {
    localStorage.setItem("nova_light_my_tasks_only", String(showMyTasksOnly));
  }, [showMyTasksOnly]);

  const defaultTimeline: TimelineEntry[] = [
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
  const { projectTimeline, saveTimeline } = useTimeline({ defaultTimeline });
  const [selectedTimelineProject, setSelectedTimelineProject] = useState("all");
  const [draggedLeadId, setDraggedLeadId] = useState<string | null>(null);
  const [kanbanFilter, setKanbanFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedLeadId(id);
    e.dataTransfer.effectAllowed = "move";
  };
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };
  const handleDrop = (e: React.DragEvent, status: LeadStatus) => {
    e.preventDefault();
    if (!draggedLeadId) return;
    addActivityLog(draggedLeadId, `Изменил(а) статус на «${getStatusLabel(status)}»`);
    setLeads((prev) => prev.map((l) => (l.id === draggedLeadId ? { ...l, status } : l)));
    apiUpdateLead(draggedLeadId, { status }).catch(() => {});
    setDraggedLeadId(null);
  };

  const handleStatusChange = (id: string, newStatus: LeadStatus) => {
    addActivityLog(id, `Изменил(а) статус на «${getStatusLabel(newStatus)}»`);
    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, status: newStatus } : l)));
    apiUpdateLead(id, { status: newStatus }).catch(() => {});

    if (newStatus === "project") {
      const specialists: Specialist[] = [
        { id: '1', name: 'Иван (Замерщик)', role: 'measurer', status: 'available', efficiencyScore: 0.95, activeTasksLimit: 1, currentTaskId: null, avatar: '📐' },
        { id: '2', name: 'Ольга (Дизайнер)', role: 'designer', status: 'busy', efficiencyScore: 0.95, activeTasksLimit: 3, currentTaskId: '1001', avatar: '🎨' },
        { id: '3', name: 'Анна (Дизайнер)', role: 'designer', status: 'available', efficiencyScore: 0.85, activeTasksLimit: 2, currentTaskId: null, avatar: '👩‍🎨' },
        { id: '4', name: 'Дмитрий (Дизайнер)', role: 'designer', status: 'busy', efficiencyScore: 0.70, activeTasksLimit: 4, currentTaskId: '1002', avatar: '👨‍🎨' },
      ];
      const { bestDesigner, logs } = runSmartRouting(specialists);
      if (bestDesigner) {
        addActivityLog(id, `Smart Routing: назначен дизайнер «${bestDesigner.name}» (R = ${logs.find(l => l.name === bestDesigner.name)?.R})`);
        setLeads((prev) => prev.map((l) => {
          if (l.id === id) {
            const newAssignee = { ...l.assignee, name: bestDesigner.name };
            apiUpdateLead(id, { assignee: newAssignee }).catch(() => {});
            return { ...l, assignee: newAssignee };
          }
          return l;
        }));
      }
      playChime();
      setConfettiTrigger((prev) => prev + 1);
    }
  };

  const statusConfig: Record<
    LeadStatus,
    { label: string; color: string; bg: string; colClass: string; icon: React.ReactNode }
  > = {
    new: {
      label: "Новые лиды",
      color: "text-sky-400",
      bg: "bg-sky-400/20",
      colClass: "kanban-col-1",
      icon: <Users size={16} />,
    },
    project: {
      label: "В проектировании",
      color: "text-purple-400",
      bg: "bg-purple-400/20",
      colClass: "kanban-col-2",
      icon: <Cpu size={16} />,
    },
    measure: {
      label: "Ожидают замер",
      color: "text-yellow-400",
      bg: "bg-yellow-400/20",
      colClass: "kanban-col-3",
      icon: <Calendar size={16} />,
    },
    production: {
      label: "На производстве",
      color: "text-emerald-400",
      bg: "bg-emerald-400/20",
      colClass: "kanban-col-4",
      icon: <CheckCircle size={16} />,
    },
    mounting: {
      label: "На монтаже",
      color: "text-rose-400",
      bg: "bg-rose-400/20",
      colClass: "kanban-col-5",
      icon: <CheckCircle size={16} />,
    },
  };

  const getStatusLabel = (s: LeadStatus) => {
    const labels: Record<LeadStatus, string> = {
      new: "Новые",
      project: "В проектировании",
      measure: "Ожидают замер",
      production: "На производстве",
      mounting: "На монтаже",
    };
    return labels[s];
  };

  const statusProgress: Record<LeadStatus, number> = {
    new: 0,
    project: 25,
    measure: 50,
    production: 75,
    mounting: 100,
  };
  const qcProgressMap = useMemo(() => {
    const map: Record<string, number> = {};
    for (const lead of leads) {
      map[lead.id] = statusProgress[lead.status] ?? 0;
    }
    return map;
  }, [leads]);

  const filteredLeads = useMemo(() => {
    let filtered = leads;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter((l) =>
        l.name.toLowerCase().includes(q) ||
        l.id.toLowerCase().includes(q) ||
        l.source.toLowerCase().includes(q) ||
        l.type.toLowerCase().includes(q) ||
        l.material.toLowerCase().includes(q)
      );
    }
    if (kanbanFilter === "mine") filtered = filtered.filter((l) => l.assignee.name === currentUser);
    if (kanbanFilter === "overdue") filtered = filtered.filter((l) => isOverdue(l.deadline));
    return filtered;
  }, [leads, kanbanFilter, currentUser, searchQuery]);

  const getByStatus = (s: LeadStatus) => filteredLeads.filter((l) => l.status === s);

  const timelineRangeStart = new Date("2026-05-03");
  const timelineRangeEnd = new Date("2026-05-31");
  const timelineGridLabels = ["03–09 мая", "10–16 мая", "17–23 мая", "24–30 мая"];

  const getTimelinePercent = (dateString: string) => {
    const date = new Date(dateString);
    const total = timelineRangeEnd.getTime() - timelineRangeStart.getTime();
    const offset = date.getTime() - timelineRangeStart.getTime();
    return Math.max(0, Math.min(100, (offset / total) * 100));
  };

  const formatShortDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("ru-RU", { day: "2-digit", month: "short" });

  const timelineProjects = ["all", ...Array.from(new Set(projectTimeline.map((item) => item.project)))];
  const filteredTimeline = projectTimeline.filter((entry) => {
    const byMember = showMyTasksOnly && currentUser ? entry.member === currentUser : true;
    const byProject = selectedTimelineProject === "all" ? true : entry.project === selectedTimelineProject;
    return byMember && byProject;
  });

  const isTimelineEntryOverdue = (entry: TimelineEntry) => new Date(entry.end) < new Date() && entry.status !== "done";

  const isAdmin = currentUser === "Администратор";
  const currentUserRole = currentUser
    ? Object.values(team).find((m) => m.name === currentUser)?.role || "коллега"
    : "коллега";

  // AI state
  const [geminiKey, setGeminiKey] = useState(() => localStorage.getItem("gemini_api_key") || "");
  const [tempKey, setTempKey] = useState("");
  const [showBorisChat, setShowBorisChat] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiMessageInput, setAiMessageInput] = useState("");
  const [aiMessages, setAiMessages] = useState<AiMessage[]>(() => {
    const userName = currentUser || "Пользователь";
    const isAdminUser = currentUser === "Администратор";
    const greeting = isAdminUser
      ? `Привет, ${userName}! Я — **Борис**, твой Интеллект-Штурман. 👋<br/><br/>Ты — <strong>${currentUserRole}</strong>, у тебя полный доступ к системе. Могу помочь с аналитикой, контролем команды и настройками.`
      : `Привет, ${userName}! Я — **Борис**, твой Интеллект-Штурман. 👋<br/><br/>Вижу, ты — <strong>${currentUserRole}</strong>. Я здесь, чтобы помогать с регламентами, замерами, дедлайнами и производством.<br/><br/>Что будем делать сегодня?`;
    return [{
      id: 1,
      sender: "bot",
      text: greeting,
      time: formatTime(new Date()),
    }];
  });

  const aiChatEndRef = useRef<HTMLDivElement | null>(null);
  const floatingAiChatEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (activeTab === "ai-navigator" && aiChatEndRef.current) {
      aiChatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
    if (showBorisChat && floatingAiChatEndRef.current) {
      floatingAiChatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [aiMessages, activeTab, showBorisChat, isAiLoading]);

  const saveApiKey = () => {
    console.log("Saving API Key:", tempKey);
    localStorage.setItem("gemini_api_key", tempKey);
    setGeminiKey(tempKey);
    setTempKey("");
    console.log("API Key saved");
  };
  const removeApiKey = () => {
    localStorage.removeItem("gemini_api_key");
    setGeminiKey("");
  };

  const sendAiMessage = async (e?: React.FormEvent, overrideText?: string) => {
    e?.preventDefault();
    const userText = overrideText || aiMessageInput;
    if (!userText.trim()) return;

    setAiMessageInput("");
    const timeNow = formatTime(new Date());

    setIsAiLoading(true);

    const { text: botReply } = await getAiResponse({
      userText,
      currentUser: currentUser || "",
      leadsCount: leads.length,
    });

    setAiMessages((prev) => [
      ...prev,
      { id: Date.now(), sender: "user", text: userText, time: timeNow },
      { id: Date.now() + 1, sender: "bot", text: botReply, time: formatTime(new Date()) },
    ]);
    setIsAiLoading(false);
  };

  // Theme & Brightness state
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    if (typeof window === "undefined") return "dark";
    const saved = localStorage.getItem("nova_light_theme");
    return (saved as "light" | "dark") || "dark";
  });
  const [brightness, setBrightness] = useState(() => {
    if (typeof window === "undefined") return 100;
    const saved = localStorage.getItem("nova_light_brightness");
    return saved ? parseInt(saved) : 100;
  });
  const [showSettings, setShowSettings] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [showGlitch, setShowGlitch] = useState(false);

  // ── Confetti trigger ───────────────────────────────
  const [confettiTrigger, setConfettiTrigger] = useState(0);
  const playChime = useAudioChime();

  // ── Boris Guide ────────────────────────────────────
  const SECTION_GUIDES: Record<string, { title: string; text: string }> = {
    dashboard: { title: "Главная", text: "Обзор всех ключевых метрик: заказы, выручка, задачи и deadlines. Всё на одном экране." },
    kanban: { title: "Order Road", text: "Единый поток заказов: отслеживай статусы, задачи и риски по каждому проекту. Перетаскивай карточки между колонками." },
    wiki: { title: "База Знаний", text: "Хранилище регламентов, инструкций и обучающих материалов. Всё для работы — в одном месте." },
    community: { title: "Наши герои", text: "Знакомься с командой! Здесь живут достижения, суперсилы и общие идеи для улучшения работы." },
    "ai-navigator": { title: "ИИ-Штурман", text: "Я здесь в полный рост! Задавай любые вопросы, анализируй проекты и получай рекомендации. Просто введи ключ доступа и погнали!" },
    chat: { title: "Командный чат", text: "Общайся с коллегами в реальном времени. Отправляй файлы, стикеры и голосовые сообщения." },
    sklad: { title: "Склад", text: "Учёт материалов и расходников. Следи за остатками и пополняй запасы вовремя." },
    materials: { title: "Материалы", text: "Каталог всех ЛДСП, кромок, фурнитуры. Проверяй остатки и цены." },
    security: { title: "Security", text: "Управление доступом и сессиями команды. Только для администратора." },
    calculator: { title: "Калькулятор", text: "Рассчитай стоимость заказа по параметрам: размеры, материал, кромка, фурнитура." },
    orders: { title: "Заказы", text: "Пайплайн всех заказов в виде канбан-доски. Перетаскивай между статусами и отслеживай прогресс." },
    reports: { title: "Отчёты", text: "Аналитика по продажам, загрузке команды и эффективности. Данные для принятия решений." },
    cash: { title: "Касса", text: "Учёт наличных, смен и расходов. Контролируй денежные потоки." },
    cleaning: { title: "Уборка", text: "График уборки салона и цеха. Кто, когда и что должен убрать." },
  };

  const [activeGuide, setActiveGuide] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem("nova_light_theme", theme);
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem("nova_light_brightness", brightness.toString());
    const root = document.documentElement;
    root.style.filter = `brightness(${brightness}%)`;
  }, [brightness]);

  // ── Pinned Sections ─────────────────────────────────
  const [viewAsRole, setViewAsRole] = useState<string>("admin");

  const [pinnedSections, setPinnedSections] = useState<string[]>(() => {
    if (typeof window === "undefined") return [];
    const saved = localStorage.getItem("nova_light_pinned");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem("nova_light_pinned", JSON.stringify(pinnedSections));
  }, [pinnedSections]);

  const togglePin = (key: string) => {
    setPinnedSections((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key],
    );
  };

  // ── Start Tab ───────────────────────────────────────
  const [startTab, setStartTab] = useState(() => {
    if (typeof window === "undefined") return "dashboard";
    return localStorage.getItem("nova_light_start_tab") || "dashboard";
  });

  useEffect(() => {
    localStorage.setItem("nova_light_start_tab", startTab);
  }, [startTab]);

  // ── Accent Color ────────────────────────────────────
  const ACCENT_PRESETS = ["#6366f1", "#8b5cf6", "#10b981", "#3b82f6", "#f43f5e", "#f59e0b", "#06b6d4"];
  const [accentColor, setAccentColor] = useState(() => {
    if (typeof window === "undefined") return "#6366f1";
    return localStorage.getItem("nova_light_accent") || "#6366f1";
  });

  useEffect(() => {
    localStorage.setItem("nova_light_accent", accentColor);
    document.documentElement.style.setProperty("--nova-light-accent", accentColor);
  }, [accentColor]);

  // New Order Modal state
  const [showNewOrderModal, setShowNewOrderModal] = useState(false);
  const [onboardingCompleted, setOnboardingCompleted] = useState(false);

  const notificationCounts = useMemo(() => ({
    chat: 0,
    leads: leads.filter((l) => l.status === "new").length,
    timeline: projectTimeline.filter((t) => new Date(t.end) < new Date() && t.status !== "done").length,
  }), [leads, projectTimeline]);

  const handleOnboardingComplete = () => {
    setOnboardingCompleted(true);
  };

  const deleteLead = (id: string) => {
    if (confirm("Вы уверены, что хотите удалить этот лид?")) {
      setLeads((prev) => prev.filter((l) => l.id !== id));
      setIsDrawerOpen(false);
      setSelectedLead(null);
      apiDeleteLead(id).catch(() => {});
    }
  };

  const [isEditingLead, setIsEditingLead] = useState(false);
  const [editLeadData, setEditLeadData] = useState<Lead | null>(null);

  const [borisAnalysis, setBorisAnalysis] = useState<Record<string, { loading: boolean; result: string }>>({});

  const generateMockAnalysis = (lead: Lead): string => {
    return generateLeadAnalysis(lead);
  };

  const startEditing = () => {
    if (selectedLead) {
      setEditLeadData({ ...selectedLead });
      setIsEditingLead(true);
    }
  };

  const updateLead = () => {
    if (editLeadData) {
      const updated = { ...editLeadData };
      if (updated.material === "Другое" && updated.materialCustom) {
        updated.material = updated.materialCustom;
      }
      if (updated.type === "Другое" && updated.typeCustom) {
        updated.type = updated.typeCustom;
      }
      if (updated.source === "Другое" && updated.sourceCustom) {
        updated.source = updated.sourceCustom;
      }
      delete (updated as any).materialCustom;
      delete (updated as any).typeCustom;
      delete (updated as any).sourceCustom;
      const changes: string[] = [];
      if (editLeadData.material !== updated.material) changes.push(`материал на «${updated.material}»`);
      if (editLeadData.type !== updated.type) changes.push(`тип на «${updated.type}»`);
      if (editLeadData.source !== updated.source) changes.push(`источник на «${updated.source}»`);
      if (editLeadData.budget !== updated.budget) changes.push(`бюджет на «${updated.budget}»`);
      if (editLeadData.deadline !== updated.deadline) changes.push(`дедлайн на «${updated.deadline}»`);
      if (editLeadData.status !== updated.status) {
        changes.push(`статус на «${getStatusLabel(updated.status)}»`);
      }
      if (editLeadData.assignee.name !== updated.assignee.name) {
        changes.push(`ответственного на «${updated.assignee.name}»`);
      }
      if (changes.length > 0) {
        addActivityLog(updated.id, `Изменил(а): ${changes.join(", ")}`);
      }
      setLeads((prev) => prev.map((l) => (l.id === updated.id ? updated : l)));
      setSelectedLead(updated);
      setIsEditingLead(false);
      apiUpdateLead(updated.id, updated).catch(() => {});
    }
  };
  const [newOrderForm, setNewOrderForm] = useState({
    name: "",
    phone: "",
    type: "Кухня",
    budget: "",
    material: "ЛДСП EGGER",
    customMaterial: "",
    source: "Сайт",
    customType: "",
    customSource: "",
    contactMethod: "WhatsApp",
    assigneeKey: "sergey",
    deadline: "",
  });

  const defaultInternQuestTasks = [
    {
      id: 1,
      text: "Изучить базу знаний SketchUp",
      hint: "Открой Wiki → Обучение ПО и смотри первую карточку.",
      done: true,
    },
    {
      id: 2,
      text: "Найти Бориса и вызвать его",
      hint: "Нажми на кнопку Бориса в шапке, чтобы открыть ИИ-чат.",
      done: false,
    },
    {
      id: 3,
      text: "Сдать первый проект без самодеятельности",
      hint: "Не добавляй новые модули вручную — используй стандартную библиотеку.",
      done: false,
    },
    {
      id: 4,
      text: "Пройти первый чек-лист",
      hint: "Проверь задачи по шагам — это поможет быстрее понять процесс.",
      done: false,
    },
  ];

  const questStorageKey = (key: string) => `nova_light_intern_quest_${currentUser || "guest"}_${key}`;

  const [internQuestTasks, setInternQuestTasks] = useState<InternQuestTask[]>(() => {
    if (typeof window === "undefined") return defaultInternQuestTasks;
    const saved = localStorage.getItem(questStorageKey("tasks"));
    return saved ? JSON.parse(saved) : defaultInternQuestTasks;
  });

  const [showInternQuest, setShowInternQuest] = useState(() => {
    if (typeof window === "undefined") return true;
    const saved = localStorage.getItem(questStorageKey("visible"));
    return saved === null ? true : saved === "true";
  });

  const internQuestProgress = Math.round(
    (internQuestTasks.filter((task) => task.done).length / internQuestTasks.length) * 100,
  );

  useEffect(() => {
    if (typeof window === "undefined" || !currentUser) return;
    const savedVisible = localStorage.getItem(questStorageKey("visible"));
    if (savedVisible !== null) {
      setShowInternQuest(savedVisible === "true");
    }
    const savedTasks = localStorage.getItem(questStorageKey("tasks"));
    if (savedTasks) {
      try {
        setInternQuestTasks(JSON.parse(savedTasks));
      } catch {
        setInternQuestTasks(defaultInternQuestTasks);
      }
    }
  }, [currentUser]);

  useEffect(() => {
    if (typeof window === "undefined" || !currentUser) return;
    localStorage.setItem(questStorageKey("visible"), showInternQuest.toString());
    localStorage.setItem(questStorageKey("tasks"), JSON.stringify(internQuestTasks));
  }, [currentUser, internQuestTasks, showInternQuest]);

  const questCompleted = internQuestProgress === 100;

  const toggleInternQuestTask = (taskId: number) => {
    setInternQuestTasks((prev) => {
      const next = prev.map((task) => (task.id === taskId ? { ...task, done: !task.done } : task));
      return next;
    });
  };

  const addActivityLog = (leadId: string, action: string) => {
    setLeads((prev) => {
      const target = prev.find(l => l.id === leadId);
      if (!target) return prev;
      const newLog = [...(target.activityLog || []), { timestamp: new Date().toLocaleString("ru-RU"), action, user: currentUser || "Система" }];
      apiUpdateLead(leadId, { activityLog: newLog } as Partial<Lead>).catch(() => {});
      return prev.map(l => l.id === leadId ? { ...l, activityLog: newLog } : l);
    });
  };

  const handleCreateLead = async () => {
    if (!newOrderForm.name.trim() || !newOrderForm.phone.trim()) return;
    const newLead = {
      name: newOrderForm.name,
      phone: newOrderForm.phone,
      contactMethod: newOrderForm.contactMethod,
      source: newOrderForm.source === "Другое" && newOrderForm.customSource ? newOrderForm.customSource : newOrderForm.source,
      status: "new" as const,
      type: newOrderForm.type === "Другое" && newOrderForm.customType ? newOrderForm.customType : newOrderForm.type,
      budget: newOrderForm.budget ? `${newOrderForm.budget} ₽` : "—",
      material: newOrderForm.material === "Другое" && newOrderForm.customMaterial ? newOrderForm.customMaterial : newOrderForm.material,
      deadline: newOrderForm.deadline || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      assignee: team[newOrderForm.assigneeKey],
      messages: [],
      activityLog: [{ timestamp: new Date().toLocaleString("ru-RU"), action: `Создал(а) лид`, user: currentUser || "Система" }],
    };
    try {
      const created = await createLead(newLead);
      setLeads((prev) => [...prev, created]);
    } catch {
      const fallbackId = `LD-${String(leads.length + 100).padStart(3, "0")}`;
      setLeads((prev) => [...prev, { ...newLead, id: fallbackId }]);
    }
    setShowNewOrderModal(false);
    setActiveTab("orders");
    setNewOrderForm({ name: "", phone: "", type: "Кухня", budget: "", material: "ЛДСП EGGER", customMaterial: "", source: "Сайт", customType: "", customSource: "", contactMethod: "WhatsApp", assigneeKey: "denis", deadline: "" });
  };

  const handleQuickCreate = async (status: LeadStatus, name: string, type: string, phone?: string) => {
    const newLead = {
      name,
      phone: phone || "",
      contactMethod: "WhatsApp",
      source: "Сайт",
      status,
      type,
      budget: "—",
      material: "—",
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      assignee: team["sergey"],
      messages: [],
      activityLog: [{ timestamp: new Date().toLocaleString("ru-RU"), action: `Создал(а) лид через быстрый ввод`, user: currentUser || "Система" }],
    };
    try {
      const created = await createLead(newLead);
      setLeads((prev) => [...prev, created]);
    } catch {
      const fallbackId = `LD-${String(leads.length + 100).padStart(3, "0")}`;
      setLeads((prev) => [...prev, { ...newLead, id: fallbackId }]);
    }
  };

  // ── Wiki ──────────────────────────────────────────────
  const [wikiSection, setWikiSection] = useState<"company"|"training"|"cheatsheets"|"bugs"|"suggestions"|"pro100">("company");



  // ── Community / Ideas ─────────────────────────────────
  const [ideas, setIdeas] = useState<Idea[]>([
    { id: "ID-1", text: "Кофемашина в цехе — устанет бегать в офис за кофе", votes: 5 },
    { id: "ID-2", text: "Вентиляция в зоне кромкования — пахнет ПВХ к концу дня", votes: 3 },
    { id: "ID-3", text: "Интеграция с 1С: автоматический учёт остатков фурнитуры", votes: 7 },
    { id: "ID-4", text: "QR-коды на листах ЛДСП — сканируй и списывай через дашборд", votes: 4 },
    { id: "ID-5", text: "Отдельная зона отдыха для замерщиков между выездами", votes: 2 },
    { id: "ID-6", text: "Авто-расчёт стоимости доставки по району Лысвы", votes: 6 },
    { id: "ID-7", text: "Чек-лист приёмки фурнитуры от поставщика (Blum/Hettich/GTV)", votes: 8 },
  ]);

  // ── Bugs List ─────────────────────────────────────────
  const [bugsList, setBugsList] = useState([
    { id: 1, title: "Не списывается ЛДСП при создании заказа", solution: "Проверить связку材料 → заказ, возможно нужно обновить кэш.", severity: "high" },
    { id: 2, title: "Отчёт по кассе не экспортируется в CSV", solution: "Пока формировать вручную через Excel.", severity: "medium" },
  ]);
  useEffect(() => { saveData("bugs", bugsList); }, [bugsList]);
  useEffect(() => { loadData<typeof bugsList>("bugs").then(d => { if (d && d.length) setBugsList(d); }); }, []);

  // ── Suggestions List ──────────────────────────────────
  const [suggestionsList, setSuggestionsList] = useState<{ id: number; text: string; author: string; date: string }[]>([]);
  useEffect(() => { saveData("suggestions", suggestionsList); }, [suggestionsList]);
  useEffect(() => { loadData<typeof suggestionsList>("suggestions").then(d => { if (d && d.length) setSuggestionsList(d); }); }, []);

  // ── Report Issue (баги самого приложения) ─────────────
  const [showReportIssue, setShowReportIssue] = useState(false);
  const [reportForm, setReportForm] = useState({ title: "", description: "", severity: "medium" });
  const [reportIssues, setReportIssues] = useState<{ id: number; title: string; description: string; severity: string; time: string; user: string }[]>([]);
  const [reportSending, setReportSending] = useState(false);
  const [reportStatus, setReportStatus] = useState<"idle" | "success" | "error">("idle");

  const submitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportForm.title.trim()) return;
    setReportSending(true);
    setReportStatus("idle");

    const time = formatTime(new Date());
    const user = currentUser || "Аноним";
    const severityLabel = reportForm.severity === "high" ? "🔴 Высокий" : reportForm.severity === "medium" ? "🟡 Средний" : "🟢 Низкий";

    // ── Отправка в Telegram ──
    const tgToken = import.meta.env.VITE_TG_BOT_TOKEN;
    const tgChatId = import.meta.env.VITE_TG_CHAT_ID;
    if (tgToken && tgChatId) {
      const text = `🐛 *Новый баг-репорт Nova*\n\n*Заголовок:* ${reportForm.title}\n*Описание:* ${reportForm.description || "—"}\n*Приоритет:* ${severityLabel}\n*Пользователь:* ${user}\n*Время:* ${time}`;
      try {
        await fetch(`https://api.telegram.org/bot${tgToken}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ chat_id: tgChatId, text, parse_mode: "Markdown" }),
        });
      } catch { /* молча игнорируем */ }
    }

    // ── Отправка на Email через EmailJS ──
    const ejsService = import.meta.env.VITE_EMAILJS_SERVICE_ID;
    const ejsTemplate = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
    const ejsKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;
    if (ejsService && ejsTemplate && ejsKey) {
      try {
        const emailjs = await import("@emailjs/browser");
        await emailjs.send(ejsService, ejsTemplate, {
          to_email: import.meta.env.VITE_REPORT_EMAIL,
          from_name: user,
          subject: `[Рэлан Bug] ${reportForm.title}`,
          message: `Приоритет: ${severityLabel}\n\n${reportForm.description || "Описание не указано"}\n\nВремя: ${time}`,
        }, ejsKey);
      } catch { /* молча игнорируем */ }
    }

    setReportIssues((prev) => [...prev, {
      id: Date.now(),
      title: reportForm.title,
      description: reportForm.description,
      severity: reportForm.severity,
      time,
      user,
    }]);
    setReportForm({ title: "", description: "", severity: "medium" });
    setReportSending(false);
    setReportStatus("success");
    setTimeout(() => {
      setReportStatus("idle");
      setShowReportIssue(false);
    }, 2000);
  };

  // ── Drawer ────────────────────────────────────────────
  const renderLeadDrawer = () => {
    if (!selectedLead) return null;
    return (
      <>
        <div
          className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-[90] transition-opacity duration-500 ${
            isDrawerOpen ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
          onClick={() => setIsDrawerOpen(false)}
        />
        <div
          className={`fixed inset-y-0 right-0 w-[420px] z-[100] transition-transform duration-500 ease-in-out ${
            isDrawerOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="h-full glass-panel border-l border-white/10 flex flex-col">
            <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`tag-pill ${statusConfig[selectedLead.status].bg} ${statusConfig[selectedLead.status].color}`}>
                    {selectedLead.id}
                  </span>
                  <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-[10px] font-bold uppercase">
                    <MessageSquare size={10} /> {selectedLead.contactMethod}
                  </div>
                </div>
                {isEditingLead ? (
                  <input
                    value={editLeadData?.name || ""}
                    onChange={(e) => setEditLeadData(prev => prev ? { ...prev, name: e.target.value } : null)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-2xl font-bold text-white focus:outline-none focus:border-indigo-500"
                  />
                ) : (
                  <h2 className="text-2xl font-bold text-white tracking-tight">{selectedLead.name}</h2>
                )}
              </div>
              <div className="flex items-center gap-2">
                {!isEditingLead ? (
                  <>
                    <button
                      onClick={startEditing}
                      className="w-10 h-10 rounded-full hover:bg-white/10 flex items-center justify-center text-indigo-400 hover:text-white transition-all"
                      title="Редактировать"
                    >
                      <Edit3 size={20} />
                    </button>
                    <button
                      onClick={() => deleteLead(selectedLead.id)}
                      className="w-10 h-10 rounded-full hover:bg-white/10 flex items-center justify-center text-red-400 hover:text-white transition-all"
                      title="Удалить"
                    >
                      <Trash2 size={20} />
                    </button>
                    <button
                      onClick={() => { setSelectedLeadForMeasurement(selectedLead); setShowMeasurementModal(true); }}
                      className="w-10 h-10 rounded-full hover:bg-white/10 flex items-center justify-center text-amber-400 hover:text-white transition-all"
                      title="Замер"
                    >
                      <Ruler size={20} />
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={updateLead}
                      className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-white flex items-center justify-center transition-all"
                      title="Сохранить"
                    >
                      <Check size={20} />
                    </button>
                    <button
                      onClick={() => setIsEditingLead(false)}
                      className="w-10 h-10 rounded-full bg-white/5 text-slate-400 hover:bg-white/10 flex items-center justify-center transition-all"
                      title="Отмена"
                    >
                      <X size={20} />
                    </button>
                  </>
                )}
                {!isEditingLead && (
                  <button
                    onClick={() => setIsDrawerOpen(false)}
                    className="w-10 h-10 rounded-full hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-all"
                  >
                    <X size={24} />
                  </button>
                )}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <section>
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Детали проекта</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-black/20 rounded-xl p-3 border border-white/5">
                    <p className="text-[10px] text-slate-500 uppercase mb-1">Материал</p>
                    {isEditingLead ? (
                      <>
                        <select 
                          className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-sm text-white focus:outline-none focus:border-indigo-500"
                          value={editLeadData?.material || ""}
                          onChange={(e) => setEditLeadData(prev => prev ? { ...prev, material: e.target.value } : null)}
                        >
                          {["ЛДСП EGGER", "ЛДСП Kronospan", "МДФ эмаль", "HPL Пластик", "Шпон Дуба", "Другое"].map((m) => (
                            <option key={m} value={m} className="bg-[#1a1e2b]">{m}</option>
                          ))}
                        </select>
                        {editLeadData?.material === "Другое" && (
                          <input type="text" value={editLeadData?.materialCustom || ""} onChange={(e) => setEditLeadData(prev => prev ? { ...prev, materialCustom: e.target.value } : null)} placeholder="Укажите материал" className="mt-2 w-full bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500" />
                        )}
                      </>

                    ) : (
                      <p className="text-sm font-semibold text-white">{selectedLead.material}</p>
                    )}
                  </div>
                  <div className="bg-black/20 rounded-xl p-3 border border-white/5">
                    <p className="text-[10px] text-slate-500 uppercase mb-1">Бюджет</p>
                    {isEditingLead ? (
                      <input 
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-sm text-white focus:outline-none focus:border-indigo-500"
                        value={editLeadData?.budget || ""}
                        onChange={(e) => setEditLeadData(prev => prev ? { ...prev, budget: e.target.value } : null)}
                      />
                    ) : (
                      <p className="text-sm font-bold text-emerald-400">{selectedLead.budget}</p>
                    )}
                  </div>
                  <div className="bg-black/20 rounded-xl p-3 border border-white/5">
                    <p className="text-[10px] text-slate-500 uppercase mb-1">Дедлайн</p>
                    {isEditingLead ? (
                      <input 
                        type="date"
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-sm text-white focus:outline-none focus:border-indigo-500"
                        value={editLeadData?.deadline || ""}
                        onChange={(e) => setEditLeadData(prev => prev ? { ...prev, deadline: e.target.value } : null)}
                      />
                    ) : (
                      <p className={`text-sm font-semibold ${isOverdue(selectedLead.deadline) ? "text-red-400" : "text-slate-200"}`}>
                        {selectedLead.deadline}
                      </p>
                    )}
                  </div>
                  <div className="bg-black/20 rounded-xl p-3 border border-white/5">
                    <p className="text-[10px] text-slate-500 uppercase mb-1">Тип</p>
                    {isEditingLead ? (
                      <>
                        <select 
                          className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-sm text-white focus:outline-none focus:border-indigo-500"
                          value={editLeadData?.type || ""}
                          onChange={(e) => setEditLeadData(prev => prev ? { ...prev, type: e.target.value } : null)}
                        >
                          {["Кухня", "Шкаф-купе", "Гардеробная", "Прихожая", "Офис", "Другое"].map((t) => (
                            <option key={t} value={t} className="bg-[#1a1e2b]">{t}</option>
                          ))}
                        </select>
                        {editLeadData?.type === "Другое" && (
                          <input type="text" value={editLeadData?.typeCustom || ""} onChange={(e) => setEditLeadData(prev => prev ? { ...prev, typeCustom: e.target.value } : null)} placeholder="Укажите тип" className="mt-2 w-full bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500" />
                        )}
                      </>

                    ) : (
                      <p className="text-sm font-semibold text-white flex items-center gap-2">
                        <Package size={14} className="text-indigo-400" /> {selectedLead.type}
                      </p>
                    )}
                  </div>
                  <div className="bg-black/20 rounded-xl p-3 border border-white/5">
                    <p className="text-[10px] text-slate-500 uppercase mb-1">Источник</p>
                    {isEditingLead ? (
                      <>
                        <select 
                          className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-sm text-white focus:outline-none focus:border-indigo-500"
                          value={editLeadData?.source || ""}
                          onChange={(e) => setEditLeadData(prev => prev ? { ...prev, source: e.target.value } : null)}
                        >
                          {["Сайт", "VK", "Telegram", "Instagram", "Сарафан", "2GIS", "Другое"].map((s) => (
                            <option key={s} value={s} className="bg-[#1a1e2b]">{s}</option>
                          ))}
                        </select>
                        {editLeadData?.source === "Другое" && (
                          <input type="text" value={editLeadData?.sourceCustom || ""} onChange={(e) => setEditLeadData(prev => prev ? { ...prev, sourceCustom: e.target.value } : null)} placeholder="Укажите источник" className="mt-2 w-full bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500" />
                        )}
                      </>

                    ) : (
                      <p className="text-sm font-semibold text-white flex items-center gap-2">
                        <TrendingUp size={14} className="text-indigo-400" /> {selectedLead.source}
                      </p>
                    )}
                  </div>
                  <div className="bg-black/20 rounded-xl p-3 border border-white/5">
                    <p className="text-[10px] text-slate-500 uppercase mb-1">Телефон</p>
                    {isEditingLead ? (
                      <input
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-sm text-white focus:outline-none focus:border-indigo-500"
                        value={editLeadData?.phone || ""}
                        onChange={(e) => setEditLeadData(prev => prev ? { ...prev, phone: e.target.value } : null)}
                      />
                    ) : (
                      <p className="text-sm font-semibold text-white">{selectedLead.phone}</p>
                    )}
                  </div>
                  <div className="bg-black/20 rounded-xl p-3 border border-white/5">
                    <p className="text-[10px] text-slate-500 uppercase mb-1">Ответственный</p>
                    {isEditingLead ? (
                      <select
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-sm text-white focus:outline-none focus:border-indigo-500 appearance-none"
                        value={(() => {
                          const entry = Object.entries(team).find(([, v]) => v.name === editLeadData?.assignee.name);
                          return entry ? entry[0] : "";
                        })()}
                        onChange={(e) => {
                          const member = team[e.target.value];
                          if (member) setEditLeadData(prev => prev ? { ...prev, assignee: { name: member.name, avatar: member.avatar } } : null);
                        }}
                      >
                        {Object.entries(team).map(([key, member]) => (
                          <option key={key} value={key} className="bg-[#1a1e2b]">{member.name} ({member.role})</option>
                        ))}
                      </select>
                    ) : (
                      <p className="text-sm font-semibold text-white">{selectedLead.assignee.name}</p>
                    )}
                  </div>
                </div>
              </section>

              <section className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4">
                <h3 className="text-xs font-bold text-amber-200 uppercase tracking-widest mb-3">Анализ Бориса</h3>
                {borisAnalysis[selectedLead.id]?.loading ? (
                  <div className="flex items-center gap-3 py-4">
                    <div className="w-6 h-6 rounded-full border-2 border-amber-400 border-t-transparent animate-spin" />
                    <span className="text-xs text-amber-200">Анализ данных...</span>
                  </div>
                ) : borisAnalysis[selectedLead.id]?.result ? (
                  <div className="mb-4">
                    <p className="text-xs text-amber-100/90 leading-relaxed whitespace-pre-line">{borisAnalysis[selectedLead.id].result}</p>
                    <button onClick={() => setBorisAnalysis((prev) => { const n = { ...prev }; delete n[selectedLead.id]; return n; })} className="mt-2 text-[10px] text-amber-400/60 hover:text-amber-300 underline">Скрыть</button>
                  </div>
                ) : (
                  <p className="text-xs text-slate-300 mb-4 leading-relaxed">
                    Борис поможет с рисками и рекомендациями по этому лиду.
                  </p>
                )}
                {!borisAnalysis[selectedLead.id]?.loading && (
                  <button
                    onClick={() => {
                      const id = selectedLead.id;
                      setBorisAnalysis((prev) => ({ ...prev, [id]: { loading: true, result: "" } }));
                      setTimeout(() => {
                        const mock = generateMockAnalysis(selectedLead);
                        setBorisAnalysis((prev) => ({ ...prev, [id]: { loading: false, result: mock } }));
                      }, 2500);
                    }}
                    className="w-full bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 text-xs font-bold py-2 rounded-lg border border-amber-500/30 transition-all"
                  >
                    {borisAnalysis[selectedLead.id]?.result ? "АНАЛИЗИРОВАТЬ СНОВА" : "ЗАПУСТИТЬ АНАЛИЗ"}
                  </button>
                )}
              </section>

              {/* История изменений */}
              {selectedLead.activityLog && selectedLead.activityLog.length > 0 && (
                <section className="bg-black/30 border border-white/5 rounded-2xl p-4">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <Clock size={14} /> История изменений
                  </h3>
                  <div className="space-y-2 max-h-48 overflow-y-auto chat-scroll">
                    {selectedLead.activityLog.slice().reverse().map((entry, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs border-l-2 border-indigo-500/30 pl-3 py-1">
                        <span className="text-slate-500 whitespace-nowrap shrink-0">{entry.timestamp}</span>
                        <span className="text-slate-300">{entry.action}</span>
                        <span className="text-slate-500 shrink-0">— {entry.user}</span>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              <section>
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Переписка с клиентом</h3>
                {selectedLead.messages.length ? (
                  <div className="space-y-3">
                    {selectedLead.messages.map((m, i) => (
                      <div key={i} className={`flex flex-col ${m.from === "client" ? "items-start" : "items-end"}`}>
                        <div
                          className={`max-w-[85%] p-3 rounded-2xl text-xs leading-relaxed ${
                            m.from === "client"
                              ? "bg-black/40 border border-white/5 text-slate-200 rounded-tl-sm"
                              : "bg-indigo-600/80 text-white rounded-tr-sm"
                          }`}
                        >
                          {m.text}
                        </div>
                        <span className="text-[9px] text-slate-500 mt-1">{m.time}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-xs text-slate-500 py-4">Нет истории сообщений</p>
                )}
              </section>
            </div>
          </div>
        </div>
      {showMeasurementModal && selectedLeadForMeasurement && (
        <MeasurementModal
          leadId={selectedLeadForMeasurement.id}
          leadName={selectedLeadForMeasurement.name}
          onComplete={(leadId) => { handleCompleteMeasurement(leadId); setShowMeasurementModal(false); }}
          onClose={() => setShowMeasurementModal(false)}
        />
      )}
      </>
    );
  };

  const [timelineEditData, setTimelineEditData] = useState<TimelineEntry | null>(null);
  useEffect(() => { if (selectedTimelineEntry) setTimelineEditData(selectedTimelineEntry); }, [selectedTimelineEntry]);
  const statusOptions: TimelineEntry["status"][] = ["planned", "active", "done"];
  const statusLabels: Record<TimelineEntry["status"], string> = { planned: "Запланировано", active: "В работе", done: "Завершено" };

  const renderTimelineDrawer = () => {
    if (!selectedTimelineEntry || !timelineEditData) return null;

    return (
      <>
        <div className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-[90] transition-opacity duration-500 ${isTimelineDrawerOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`} onClick={() => setIsTimelineDrawerOpen(false)} />
        <div className={`fixed inset-y-0 right-0 w-[420px] z-[100] transition-transform duration-500 ease-in-out ${isTimelineDrawerOpen ? "translate-x-0" : "translate-x-full"}`}>
          <div className="h-full glass-panel border-l border-white/10 flex flex-col">
            <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5 shrink-0">
              <h2 className="text-xl font-bold text-white">Редактирование задачи</h2>
              <button onClick={() => setIsTimelineDrawerOpen(false)} className="text-slate-400 hover:text-white"><X size={20} /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <div className="bg-black/20 rounded-xl p-4 border border-white/5">
                <p className="text-[10px] text-slate-500 uppercase mb-1.5">Название задачи</p>
                <input type="text" value={timelineEditData.task || ""} onChange={(e) => setTimelineEditData({ ...timelineEditData, task: e.target.value })} className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500/50" />
              </div>
              <div>
                <p className="text-[10px] text-slate-500 uppercase mb-1.5">ID лида (связь)</p>
                <input type="text" value={timelineEditData.leadId || ""} onChange={(e) => setTimelineEditData({ ...timelineEditData, leadId: e.target.value })} placeholder="LD-001" className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-indigo-500/50" />
              </div>

              <div className="bg-black/20 rounded-xl p-4 border border-white/5">
                <p className="text-[10px] text-slate-500 uppercase mb-1.5">Цвет полосы</p>
                <div className="flex gap-2">
                  {["rgba(56,189,248,0.85)", "rgba(168,85,247,0.9)", "rgba(34,197,94,0.85)", "rgba(249,115,22,0.85)", "rgba(59,130,246,0.8)", "rgba(236,72,153,0.85)"].map((c) => (
                    <button key={c} onClick={() => setTimelineEditData({ ...timelineEditData, color: c })} className={`w-7 h-7 rounded-full border-2 transition-all ${timelineEditData.color === c ? "border-white scale-110" : "border-transparent"}`} style={{ backgroundColor: c }} />
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button onClick={() => { saveTimeline(projectTimeline.map((t) => t.id === timelineEditData.id ? timelineEditData : t)); setSelectedTimelineEntry(timelineEditData); }} className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white py-3 rounded-2xl text-sm font-semibold transition-all">
                  СОХРАНИТЬ
                </button>
                <button onClick={() => { if (confirm("Удалить задачу?")) { saveTimeline(projectTimeline.filter((t) => t.id !== timelineEditData.id)); setIsTimelineDrawerOpen(false); } }} className="px-4 bg-red-600/50 hover:bg-red-500 text-white py-3 rounded-2xl text-sm font-semibold transition-all">
                  <Trash2 size={16} />
                </button>
                <button onClick={() => { setIsTimelineDrawerOpen(false); }} className="px-4 bg-white/5 hover:bg-white/10 text-slate-400 py-3 rounded-2xl text-sm font-semibold transition-all">
                  <X size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </>

    );
  };

  // Basic tab body (fast to render)
  if (!isAuthenticated) {
    return (
      <div className="h-screen bg-app text-slate-200 overflow-y-auto">
        <div className="flex items-center justify-center min-h-full px-4 sm:px-6 py-8 sm:py-16 lg:py-24">
        <div className="w-full max-w-lg glass-panel rounded-[32px] border border-white/10 bg-black/50 p-6 sm:p-10 shadow-2xl">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-3">Вход в Nova</h1>
            <p className="text-sm text-slate-400 leading-relaxed">
              Только администратор имеет доступ к панели управления.
            </p>
          </div>
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="text-[11px] uppercase tracking-[0.24em] text-slate-500">Пользователь</label>
              <div className="mt-3 space-y-2">
              {[
                  { key: "admin", name: "Администратор", role: "Владелец / Директор", avatar: "https://i.pravatar.cc/150?u=admin" },
                  { key: "elena", name: "Елена Морозова", role: "Менеджер салона", avatar: "https://ui-avatars.com/api/?name=Елена+М&background=A855F7&color=fff" },
                ].map((member) => (
                  <button
                    type="button"
                    key={member.key}
                    onClick={() => setCurrentUser(member.name)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl border transition-all text-left ${
                      currentUser === member.name
                        ? "border-indigo-500/50 bg-indigo-500/10"
                        : "border-white/10 hover:border-white/20 bg-white/5"
                    }`}
                  >
                    <img src={member.avatar} className="w-10 h-10 rounded-full object-cover border border-white/10" alt="" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white">{member.name}</p>
                      <p className="text-[10px] text-slate-500">{member.role}</p>
                    </div>
                    <div className={`text-[9px] uppercase tracking-wider font-bold px-2 py-1 rounded-lg border ${
                      member.key === "admin"
                        ? "bg-indigo-500/20 text-indigo-300 border-indigo-500/30"
                        : "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                    }`}>
                      {member.key === "admin" ? "admin" : "доступен"}
                    </div>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-[11px] uppercase tracking-[0.24em] text-slate-500">Ключ доступа</label>
              <input
                type="password"
                value={loginKey}
                onChange={(e) => setLoginKey(e.target.value)}
                placeholder="Введите ключ"
                className="mt-3 w-full rounded-3xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none focus:border-indigo-500/50"
              />
            </div>
            {loginError && (
              <div className="rounded-3xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                {loginError}
              </div>
            )}
            <button
              type="submit"
              disabled={(currentUser !== "Администратор" && currentUser !== "Елена Морозова") || loginLoading}
              className="w-full rounded-3xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loginLoading ? <><Loader2 size={16} className="animate-spin" /> Проверка...</> : "Войти"}
            </button>
          </form>
          {import.meta.env.DEV && (
            <button
              onClick={() => {
                localStorage.removeItem("nova_light_auth");
                window.location.reload();
              }}
              className="mt-4 w-full rounded-3xl border border-amber-500/20 bg-amber-500/10 px-5 py-2.5 text-xs font-semibold text-amber-400 hover:bg-amber-500/20 transition"
            >
              🔄 Сбросить сессию и онбординг (dev)
            </button>
          )}
        </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-app text-slate-200">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} pinnedSections={pinnedSections} onTogglePin={togglePin} accentColor={accentColor} notificationCounts={notificationCounts} userRole={viewAsRole} mobileOpen={mobileSidebarOpen} onMobileClose={() => setMobileSidebarOpen(false)} />

        <main className="flex-1 flex flex-col overflow-hidden relative">
          <header className="h-16 flex items-center justify-between px-8 z-10 mt-2">
            <div className="flex items-center gap-4">
              {/* Hamburger for mobile */}
              <button
                onClick={() => setMobileSidebarOpen(true)}
                className="md:hidden w-10 h-10 rounded-full glass-panel flex items-center justify-center text-slate-400 hover:text-white transition-all"
                aria-label="Открыть меню"
              >
                <Menu size={18} />
              </button>
              <div className="relative w-80 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-400 transition-colors" size={16} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Поиск лидов по имени, id, источнику..."
              className="w-full bg-black/20 border border-white/10 rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all text-white backdrop-blur-sm shadow-inner"
            />
          </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-right hidden md:block">
              <p className="text-white font-bold text-lg leading-none">
                {formatTime(currentTime)}
              </p>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-1">
                {currentTime.toLocaleDateString("ru-RU", { weekday: "long", day: "numeric", month: "short" })}
              </p>
            </div>
            <div className="flex gap-4">
              {isAuthenticated && (
                <GlobalSearch leads={leads} onNavigate={(tab) => setActiveTab(tab as any)} />
              )}
              {isAuthenticated && (
                <Notifications onNavigate={(tab) => setActiveTab(tab as any)} />
              )}
              {isAuthenticated && (
                <button 
                  onClick={() => setShowUserProfile(true)}
                  className="w-10 h-10 rounded-full glass-panel flex items-center justify-center text-white bg-white/10 border border-white/15 shadow-sm hover:border-indigo-500/50 transition-all overflow-hidden p-0"
                  title="Мой профиль"
                >
                  <img src={getAvatarByName(currentUser || "")} alt="Profile" className="w-full h-full object-cover" />
                </button>
               )}
               <ThemeToggle theme={theme} onToggle={() => setTheme(theme === 'dark' ? 'light' : 'dark')} />
               <button
                 onClick={() => setActiveGuide(activeTab)}
                 className="w-10 h-10 rounded-full glass-panel flex items-center justify-center text-white bg-white/10 border border-white/15 shadow-sm hover:text-white hover:bg-white/20 transition-all font-bold text-lg"
                 title="Гид по разделу"
               >
                 ?
               </button>
              {isAuthenticated && (
                <button
                  onClick={handleLogout}
                  className="w-10 h-10 rounded-full glass-panel flex items-center justify-center text-white bg-white/10 border border-white/15 shadow-sm hover:text-white hover:bg-white/20 transition-all"
                  title="Выйти"
                >
                  <LogOut size={18} />
                </button>
              )}

              <button
                onClick={() => setActiveTab("calculator")}
                className="bg-indigo-600 hover:bg-indigo-500 text-white force-white px-5 py-2 rounded-full text-sm font-medium transition-all shadow-[0_0_15px_rgba(79,70,229,0.4)] hover:shadow-[0_0_25px_rgba(79,70,229,0.6)] flex items-center gap-2"
              >
                <Plus size={16} /> <span className="text-white force-white">Рассчитать Л-ку</span>
              </button>
            </div>
          </div>
        </header>

         <div className="flex-1 overflow-y-auto overflow-x-auto p-8 pt-4 z-10 scroll-smooth relative">
          {activeTab === "dashboard" && (
            <Dashboard currentUser={currentUser} leads={leads} projectTimeline={projectTimeline} onNavigate={setActiveTab} />
          )}

          {activeTab === "ai-navigator" && (
            <AiNavigator
              geminiKey={geminiKey}
              tempKey={tempKey}
              setTempKey={setTempKey}
              saveApiKey={saveApiKey}
              removeApiKey={removeApiKey}
              aiMessages={aiMessages}
              isAiLoading={isAiLoading}
              aiMessageInput={aiMessageInput}
              setAiMessageInput={setAiMessageInput}
              sendAiMessage={sendAiMessage}
              aiChatEndRef={aiChatEndRef}
              borisAvatarStyle={borisAvatarStyle}
              currentUser={currentUser}
            />
          )}

          {activeTab === "chat" && (
            <TeamChat 
              currentUser={currentUser}
              teamMembers={team}
              formatTime={formatTime}
              isAdmin={isAdmin}
            />
          )}

          {activeTab === "community" && (
            <Community team={team} ideas={ideas} setIdeas={setIdeas} />
          )}

          {activeTab === "wiki" && (
            <Wiki
              wikiSection={wikiSection}
              setWikiSection={setWikiSection}
              borisAvatarStyle={borisAvatarStyle}
              bugsList={bugsList}
              setBugsList={setBugsList}
              suggestionsList={suggestionsList}
              setSuggestionsList={setSuggestionsList}
              currentUserName={currentUser}
            />
          )}

          {activeTab === "sklad" && (
            <SkladEnhanced />
          )}
          {activeTab === "materials" && <MaterialsPage />}

          {activeTab === "security" && (
            <Security 
              sessions={sessions}
              getAvatarByName={getAvatarByName}
              handleKillSession={handleKillSession}
            />
          )}

          {activeTab === "calculator" && <CalculatorV2 onNavigateOrders={() => setActiveTab("orders")} currentUserName={currentUser || ""} />}
          {activeTab === "orders" && <OrdersPage onNavigateCalculator={() => setActiveTab("calculator")} currentUserName={currentUser} />}
          {activeTab === "reports" && <ReportsPage />}
          {activeTab === "cash" && <CashPage currentUserName={currentUser} />}
          {activeTab === "cleaning" && <CleaningSchedule />}
          {renderLeadDrawer()}
          {renderTimelineDrawer()}
        </div>

        {/* Settings Modal */}
        {showSettings && (
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[110] flex items-center justify-center p-4"
            onClick={() => setShowSettings(false)}
          >
            <div
              className="relative w-full max-w-md glass-panel rounded-3xl shadow-2xl border border-indigo-500/20 fade-in flex flex-col max-h-[85vh]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-8 pt-8 pb-4 flex-shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center shadow-[0_0_15px_rgba(99,102,241,0.5)]">
                    <Settings size={20} className="text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white tracking-tight">Настройки</h2>
                    <p className="text-[10px] text-indigo-400 uppercase tracking-widest">Персонализация интерфейса</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowSettings(false)}
                  className="w-9 h-9 rounded-full hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-all"
                >
                  <X size={20} />
                </button>
              </div>

               {/* Settings Content */}
               <div className="overflow-y-auto flex-1 px-8 pb-8 space-y-8">
                 {/* Brightness Control */}
                 <div>
                   <label className="block text-sm font-semibold text-white mb-4 flex items-center gap-2">
                     <span className="w-2 h-2 rounded-full bg-amber-400" />
                     Яркость экрана
                   </label>
                   <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <input
                        type="range"
                        min="50"
                        max="150"
                        value={brightness}
                        onChange={(e) => setBrightness(parseInt(e.target.value))}
                        className="flex-1 h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                        style={{
                          background: `linear-gradient(to right, rgba(255,255,255,0.1) 0%, rgba(99,102,241,0.3) ${((brightness - 50) / 100) * 100}%, rgba(255,255,255,0.1) 100%)`
                        }}
                    />
                    <p className="text-xs text-slate-300">{brightness}%</p>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-[10px]">
                    <button
                      onClick={() => setBrightness(75)}
                      className={`py-2 rounded-lg border transition-all ${brightness === 75 ? "bg-indigo-500/30 border-indigo-500 text-indigo-300" : "bg-white/5 border-white/10 text-slate-400 hover:text-white"}`}
                    >
                      Низкая
                    </button>
                    <button
                      onClick={() => setBrightness(100)}
                      className={`py-2 rounded-lg border transition-all ${brightness === 100 ? "bg-indigo-500/30 border-indigo-500 text-indigo-300" : "bg-white/5 border-white/10 text-slate-400 hover:text-white"}`}
                    >
                      Норма
                    </button>
                    <button
                      onClick={() => setBrightness(125)}
                      className={`py-2 rounded-lg border transition-all ${brightness === 125 ? "bg-indigo-500/30 border-indigo-500 text-indigo-300" : "bg-white/5 border-white/10 text-slate-400 hover:text-white"}`}
                    >
                      Высокая
                    </button>
                  </div>
                  </div>
                </div>

                {/* Start Tab */}
                <div>
                  <label className="block text-sm font-semibold text-white mb-3 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    Стартовая вкладка
                  </label>
                  <select
                    value={startTab}
                    onChange={(e) => setStartTab(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500/50 appearance-none"
                  >
                    {[
                      { key: "dashboard", label: "Дашборд" },
                      { key: "wiki", label: "База Знаний" },
                      { key: "ai-navigator", label: "ИИ-Штурман" },
                      { key: "chat", label: "Командный чат" },
                    ].map((t) => (
                      <option key={t.key} value={t.key} className="bg-slate-900">{t.label}</option>
                    ))}
                  </select>
                </div>

                {/* Accent Color */}
                <div>
                  <label className="block text-sm font-semibold text-white mb-3 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: accentColor }} />
                    Акцентный цвет
                  </label>
                  <div className="grid grid-cols-7 gap-2">
                    {ACCENT_PRESETS.map((color) => (
                      <button
                        key={color}
                        onClick={() => setAccentColor(color)}
                        className={`w-full aspect-square rounded-xl border-2 transition-all ${
                          accentColor === color
                            ? "border-white scale-110 shadow-[0_0_12px_var(--nova-light-accent)]"
                            : "border-white/10 hover:border-white/30"
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>

                {/* Pinned Sections */}
                <div>
                  <label className="block text-sm font-semibold text-white mb-3 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-purple-400" />
                    Закреплённые разделы
                  </label>
                  <div className="space-y-1.5 max-h-40 overflow-y-auto">
                  {[
                      { key: "wiki", label: "База Знаний" },
                      { key: "community", label: "Наши герои" },
                      { key: "ai-navigator", label: "ИИ-Штурман" },
                      { key: "chat", label: "Командный чат" },
                      { key: "sklad", label: "Склад" },
                      { key: "security", label: "Security" },
                    ].map((section) => {
                      const isPinned = pinnedSections.includes(section.key);
                      return (
                        <button
                          key={section.key}
                          onClick={() => togglePin(section.key)}
                          className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl border transition-all text-left ${
                            isPinned
                              ? "bg-indigo-500/10 border-indigo-500/30 text-indigo-300"
                              : "bg-white/5 border-white/10 text-slate-400 hover:text-white"
                          }`}
                        >
                          <span className={`text-[10px] font-bold uppercase ${isPinned ? "text-indigo-300" : "text-slate-500"}`}>
                            {isPinned ? "📌" : "○"}
                          </span>
                          <span className="text-sm">{section.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Info */}
                <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-2xl p-4">
                  <p className="text-xs text-white force-white leading-relaxed">
                    ✓ Ваши предпочтения автоматически сохраняются в браузере и восстанавливаются при следующем входе.
                  </p>
                </div>

                {/* Report Issue */}
                <div>
                  <label className="block text-sm font-semibold text-white mb-3 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-400" />
                    Сообщить о баге
                  </label>
                  {!showReportIssue ? (
                    <button
                      onClick={() => setShowReportIssue(true)}
                      className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-semibold border border-red-500/30 bg-red-500/10 text-red-300 hover:bg-red-500/20 transition-all"
                    >
                      <span className="text-base">🐛</span> Сообщить об ошибке разработчикам
                    </button>
                  ) : (
                    <form onSubmit={submitReport} className="space-y-3">
                      <input
                        type="text"
                        value={reportForm.title}
                        onChange={(e) => setReportForm((f) => ({ ...f, title: e.target.value }))}
                        placeholder="Кратко опиши проблему..."
                        className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-red-500/50"
                        required
                      />
                      <textarea
                        value={reportForm.description}
                        onChange={(e) => setReportForm((f) => ({ ...f, description: e.target.value }))}
                        placeholder="Шаги для воспроизведения..."
                        rows={2}
                        className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-red-500/50 resize-none"
                      />
                      <div className="flex gap-2">
                        {[
                          { value: "low", label: "Низкий", color: "bg-slate-500/20 border-slate-500/30 text-slate-300" },
                          { value: "medium", label: "Средний", color: "bg-amber-500/20 border-amber-500/30 text-amber-300" },
                          { value: "high", label: "Высокий", color: "bg-red-500/20 border-red-500/30 text-red-300" },
                        ].map((s) => (
                          <button
                            key={s.value}
                            type="button"
                            onClick={() => setReportForm((f) => ({ ...f, severity: s.value }))}
                            className={`flex-1 py-1.5 rounded-xl text-xs font-bold border transition-all ${s.color} ${
                              reportForm.severity === s.value ? "ring-2 ring-white/20 scale-105" : "opacity-60 hover:opacity-100"
                            }`}
                          >
                            {s.label}
                          </button>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setShowReportIssue(false)}
                          className="flex-1 py-2.5 rounded-xl text-sm text-slate-400 hover:text-white border border-white/10 hover:bg-white/5 transition-all"
                        >
                          Отмена
                        </button>
                        <button
                          type="submit"
                          disabled={reportSending}
                          className="flex-1 bg-red-600 hover:bg-red-500 disabled:bg-slate-700 text-white font-bold py-2.5 rounded-xl transition-all text-sm flex items-center justify-center gap-2"
                        >
                          {reportSending ? (
                            <><Loader2 size={14} className="animate-spin" /> Отправка...</>
                          ) : reportStatus === "success" ? (
                            <><Check size={14} /> Отправлено!</>
                          ) : "Отправить"}
                        </button>
                      </div>
                    </form>
                  )}
                  {reportIssues.length > 0 && (
                    <div className="mt-3 space-y-2 max-h-32 overflow-y-auto chat-scroll">
                      {reportIssues.map((issue) => (
                        <div key={issue.id} className="flex items-center gap-2 bg-black/20 rounded-xl px-3 py-2">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${
                            issue.severity === "high" ? "bg-red-500/20 text-red-400" :
                            issue.severity === "medium" ? "bg-amber-500/20 text-amber-400" :
                            "bg-slate-500/20 text-slate-400"
                          }`}>{issue.severity}</span>
                          <p className="text-xs text-slate-300 truncate">{issue.title}</p>
                          <span className="text-[10px] text-slate-500 flex-shrink-0">{issue.time}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Simulate Failure link */}
                <div className="text-center">
                  <button
                    onClick={() => { setShowSettings(false); setShowGlitch(true); }}
                    className="text-[11px] text-slate-500 hover:text-red-400 transition-all underline underline-offset-2 opacity-50 hover:opacity-100"
                  >
                    Симуляция сбоя
                  </button>
                </div>

                {/* Close Button */}
                <button
                  onClick={() => setShowSettings(false)}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white force-white py-3 rounded-2xl text-sm font-bold transition-all shadow-[0_0_20px_rgba(79,70,229,0.4)]"
                >
                  Готово
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Shortcuts Modal */}
        {showShortcuts && (
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[110] flex items-center justify-center p-4"
            onClick={() => setShowShortcuts(false)}
          >
            <div
              className="relative w-full max-w-lg glass-panel rounded-3xl shadow-2xl border border-indigo-500/20 fade-in p-8"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">⌨️ Горячие клавиши</h2>
                <button onClick={() => setShowShortcuts(false)} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/20 transition-all">
                  <X size={16} />
                </button>
              </div>
              <div className="space-y-3">
                {[
                  { keys: "/", action: "Открыть чат с Борисом" },
                  { keys: "N", action: "Создать новый лид" },
                  { keys: "?", action: "Показать эту справку" },
                  { keys: "Esc", action: "Закрыть все окна" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between bg-black/30 border border-white/5 rounded-2xl px-5 py-4">
                    <span className="text-sm text-slate-300">{item.action}</span>
                    <kbd className="text-[11px] font-bold px-3 py-1.5 rounded-lg bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 tracking-wider uppercase">
                      {item.keys}
                    </kbd>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-[10px] text-slate-500 text-center">
                Горячие клавиши работают, когда фокус не на полях ввода
              </p>
            </div>
          </div>
        )}

      </main>

      {/* Floating assistant button + mini chat */}
      <div className="fixed bottom-8 right-8 z-50 flex flex-col items-end">
        {showBorisChat && (
          <div className="w-80 glass-panel rounded-3xl shadow-2xl overflow-hidden mb-4 flex flex-col border border-amber-500/30">
            <div className="bg-amber-500/20 backdrop-blur-md p-4 flex justify-between items-center border-b border-amber-500/20">
              <div className="flex items-center gap-2">
                <div style={borisAvatarStyle} className="w-8 h-8 rounded-full border border-amber-500/50" />
                <span className="text-amber-100 font-bold text-xs uppercase tracking-wider">
                  Штурман Борис
                </span>
              </div>
              <button
                onClick={() => setShowBorisChat(false)}
                className="text-amber-200 hover:text-white transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-4 bg-black/60 h-[250px] overflow-y-auto chat-scroll flex flex-col space-y-3">
              {aiMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}
                >
                  <div
                    className={`p-2.5 rounded-xl text-[11px] max-w-[85%] leading-relaxed ${
                      msg.sender === "user"
                        ? "bg-indigo-600 text-white rounded-br-sm"
                        : "bg-white/10 text-slate-200 rounded-bl-sm ai-response"
                    }`}
                    dangerouslySetInnerHTML={{
                      __html: msg.text
                        .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
                        .replace(/\n/g, "<br/>"),
                    }}
                  />
                </div>
              ))}
              {isAiLoading && <Loader2 size={14} className="text-amber-400 animate-spin mt-2" />}
              <div ref={floatingAiChatEndRef} />
            </div>
            <div className="p-3 border-t border-white/5 bg-black/40 flex gap-2">
              <form onSubmit={sendAiMessage} className="flex-1 flex gap-2">
                <input
                  type="text"
                  value={aiMessageInput}
                  onChange={(e) => setAiMessageInput(e.target.value)}
                  placeholder="Задайте вопрос..."
                  disabled={isAiLoading}
                  className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-amber-500/50 text-white transition-colors"
                />
                <button
                  type="submit"
                  disabled={isAiLoading || !aiMessageInput.trim()}
                  className="bg-white text-slate-900 hover:bg-slate-100 disabled:bg-slate-200 disabled:text-slate-500 p-1.5 rounded-lg transition-colors shadow-sm border border-slate-200"
                >
                  <Send size={14} />
                </button>
              </form>
            </div>
          </div>
        )}

        <button
          onClick={() => setShowBorisChat((v) => !v)}
          className="w-16 h-16 rounded-full glass-panel flex items-center justify-center shadow-[0_0_20px_rgba(251,191,36,0.2)] hover:scale-105 transition-all active:scale-95 group relative border-2 border-amber-500/50 overflow-hidden"
        >
          <div style={borisAvatarStyle} className="w-full h-full" />
          <div className="absolute top-0 right-0 w-4 h-4 bg-red-500 rounded-full border-2 border-[#13151f] flex items-center justify-center text-[9px] font-bold text-white z-10">
            1
          </div>
        </button>
      </div>

      {/* ───── NEW ORDER MODAL ───── */}
      {showNewOrderModal && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[110] flex items-center justify-center p-4"
          onClick={() => setShowNewOrderModal(false)}
        >
          <div
            className="w-full max-w-2xl bg-slate-900 border border-white/10 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-white/10 bg-black/20 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-white">Новый заказ</h2>
                <p className="text-xs text-slate-400 mt-1">Заполните данные для создания карточки клиента</p>
              </div>
              <button
                onClick={() => setShowNewOrderModal(false)}
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            
            <div className="p-6 grid grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto">
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Имя клиента *</label>
                <input
                  type="text"
                  value={newOrderForm.name}
                  onChange={(e) => setNewOrderForm({ ...newOrderForm, name: e.target.value })}
                  placeholder="Иван Иванов"
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500/50"
                />
              </div>
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Телефон *</label>
                <input
                  type="text"
                  value={newOrderForm.phone}
                  onChange={(e) => setNewOrderForm({ ...newOrderForm, phone: formatPhone(e.target.value) })}
                  placeholder="+7 (999) 000-00-00"
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500/50"
                />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Тип изделия</label>
                <select
                  value={newOrderForm.type}
                  onChange={(e) => setNewOrderForm({ ...newOrderForm, type: e.target.value })}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500/50 appearance-none"
                >
                  {["Кухня", "Шкаф-купе", "Гардеробная", "Прихожая", "Офис", "Другое"].map((t) => (
                    <option key={t} value={t} className="bg-slate-900">{t}</option>
                  ))}
                </select>
                {newOrderForm.type === "Другое" && (
                  <input type="text" value={newOrderForm.customType} onChange={(e) => setNewOrderForm({ ...newOrderForm, customType: e.target.value })} placeholder="Укажите тип изделия" className="mt-2 w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500/50" />
                )}
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Бюджет</label>
                <input
                  type="text"
                  value={newOrderForm.budget}
                  onChange={(e) => setNewOrderForm({ ...newOrderForm, budget: e.target.value })}
                  placeholder="Например: 150 000"
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500/50"
                />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Материал</label>
                <select
                  value={newOrderForm.material}
                  onChange={(e) => setNewOrderForm({ ...newOrderForm, material: e.target.value })}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500/50 appearance-none"
                >
                  {["ЛДСП EGGER", "ЛДСП Kronospan", "МДФ эмаль", "HPL Пластик", "Шпон Дуба", "Другое"].map((m) => (
                    <option key={m} value={m} className="bg-slate-900">{m}</option>
                  ))}
                </select>
                {newOrderForm.material === "Другое" && (
                  <input type="text" value={newOrderForm.customMaterial} onChange={(e) => setNewOrderForm({ ...newOrderForm, customMaterial: e.target.value })} placeholder="Укажите материал" className="mt-2 w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500/50" />
                )}
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Источник</label>
                <select
                  value={newOrderForm.source}
                  onChange={(e) => setNewOrderForm({ ...newOrderForm, source: e.target.value })}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500/50 appearance-none"
                >
                  {["Сайт", "VK", "Telegram", "Instagram", "Сарафан", "2GIS", "Другое"].map((s) => (
                    <option key={s} value={s} className="bg-slate-900">{s}</option>
                  ))}
                </select>
                {newOrderForm.source === "Другое" && (
                  <input type="text" value={newOrderForm.customSource} onChange={(e) => setNewOrderForm({ ...newOrderForm, customSource: e.target.value })} placeholder="Укажите источник" className="mt-2 w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500/50" />
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Способ связи</label>
                <select
                  value={newOrderForm.contactMethod}
                  onChange={(e) => setNewOrderForm({ ...newOrderForm, contactMethod: e.target.value })}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500/50 appearance-none"
                >
                  {["WhatsApp", "Telegram", "Звонок", "VK"].map((s) => (
                    <option key={s} value={s} className="bg-slate-900">{s}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Ответственный</label>
                <select
                  value={newOrderForm.assigneeKey}
                  onChange={(e) => setNewOrderForm({ ...newOrderForm, assigneeKey: e.target.value })}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500/50 appearance-none"
                >
                  {Object.entries(team).map(([k, v]) => (
                    <option key={k} value={k} className="bg-slate-900">{v.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="p-6 border-t border-white/10 bg-black/20 flex justify-end gap-3">
              <button
                onClick={() => setShowNewOrderModal(false)}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
              >
                Отмена
              </button>
              <button
                onClick={handleCreateLead}
                disabled={!newOrderForm.name.trim() || !newOrderForm.phone.trim()}
                className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 disabled:text-slate-500 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-lg flex items-center gap-2"
              >
                <Plus size={16} /> Создать заказ
              </button>
            </div>
          </div>
        </div>
      )}

      {showUserProfile && (
        <UserProfileModal
          isOpen={showUserProfile}
          onClose={() => setShowUserProfile(false)}
          currentUserKey={Object.keys(team).find((key) => team[key].name === currentUser) || null}
          teamMembers={team}
          setTeamMembers={setTeamMembers}
          setCurrentUser={setCurrentUser}
        />
      )}

      {isAuthenticated && !onboardingCompleted && (
        <BorisOnboarding
          onComplete={handleOnboardingComplete}
          onSkip={handleOnboardingComplete}
        />
      )}

      {showGlitch && (
        <GlitchSimulation onReturn={() => setShowGlitch(false)} />
      )}

      {activeGuide && SECTION_GUIDES[activeGuide] && (
        <BorisGuide
          section={activeGuide}
          title={SECTION_GUIDES[activeGuide].title}
          text={SECTION_GUIDES[activeGuide].text}
          onDismiss={() => setActiveGuide(null)}
        />
      )}

      <ConfettiCanvas trigger={confettiTrigger} />
    </div>
  );
};



