import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import MyDayWidget from "../components/MyDayWidget";
import { Lead, TimelineEntry } from "../types";

const getLocalDateString = (d: Date) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const mockLeads: Lead[] = [
  {
    id: "1",
    name: "Кухня для Ивана",
    phone: "+7 999 123-45-67",
    status: "new",
    budget: "150 000 ₽",
    deadline: getLocalDateString(new Date()), // Today
    material: "MDF",
    type: "Кухня",
    contactMethod: "WhatsApp",
    source: "Instagram",
    messages: [],
    assignee: {
      name: "Администратор",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e",
    },
  },
  {
    id: "2",
    name: "Шкаф для Марии",
    phone: "+7 999 765-43-21",
    status: "project",
    budget: "80 000 ₽",
    deadline: "2026-01-01", // Overdue
    material: "LDSP",
    type: "Шкаф",
    contactMethod: "Telegram",
    source: "Recomm",
    messages: [],
    assignee: {
      name: "Администратор",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e",
    },
  },
  {
    id: "3",
    name: "Гардеробная для Ольги",
    phone: "+7 999 555-55-55",
    status: "measure",
    budget: "120 000 ₽",
    deadline: "2026-12-31", // Future
    material: "MDF",
    type: "Гардеробная",
    contactMethod: "Call",
    source: "Website",
    messages: [],
    assignee: {
      name: "Дизайнер",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb",
    },
  },
];

const mockTimeline: TimelineEntry[] = [
  {
    id: "t1",
    task: "Замер помещения",
    project: "Кухня для Ивана",
    member: "Администратор",
    start: "2026-05-19",
    end: "2026-05-20",
    color: "#6366f1",
    status: "active",
  },
  {
    id: "t2",
    task: "Создание эскиза",
    project: "Шкаф для Марии",
    member: "Администратор",
    start: "2026-05-21",
    end: "2026-05-22",
    color: "#a855f7",
    status: "planned",
  },
  {
    id: "t3",
    task: "Заказ фасадов",
    project: "Гардеробная для Ольги",
    member: "Дизайнер",
    start: "2026-05-23",
    end: "2026-05-24",
    color: "#ec4899",
    status: "active",
  },
];

describe("MyDayWidget", () => {
  it("renders nothing when there is no currentUser", () => {
    const { container } = render(
      <MyDayWidget currentUser={null} leads={mockLeads} projectTimeline={mockTimeline} />
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders greeting and stats correctly for logged-in user", () => {
    render(<MyDayWidget currentUser="Администратор" leads={mockLeads} projectTimeline={mockTimeline} />);

    // Greeting should include username
    expect(screen.getByText(/Администратор/)).toBeDefined();

    // "Мои лиды" statistic - Administrator has 2 assigned leads
    expect(screen.getByText("Мои лиды")).toBeDefined();
    expect(screen.getAllByText("2")).toHaveLength(2);

    // "Активных задач" statistic - Administrator has 2 tasks (active & planned)
    expect(screen.getByText("Активных задач")).toBeDefined();

    // "Дедлайнов" statistic - 1 lead has today's deadline
    expect(screen.getByText("Дедлайнов")).toBeDefined();
  });

  it("identifies overdue leads and shows them in the focus area", () => {
    render(<MyDayWidget currentUser="Администратор" leads={mockLeads} projectTimeline={mockTimeline} />);

    // Check overdue leads count text
    expect(screen.getByText(/просроченный лид/i)).toBeDefined();
    // Overdue lead details
    expect(screen.getByText("Шкаф для Марии")).toBeDefined();
  });

  it("pluralizes overdue leads correctly for different counts", () => {
    const mockLeads2: Lead[] = [
      {
        id: "1",
        name: "Lead 1",
        phone: "",
        status: "new",
        budget: "",
        deadline: "2026-01-01",
        material: "",
        type: "",
        contactMethod: "",
        source: "",
        messages: [],
        assignee: { name: "Администратор", avatar: "" },
      },
      {
        id: "2",
        name: "Lead 2",
        phone: "",
        status: "new",
        budget: "",
        deadline: "2026-01-01",
        material: "",
        type: "",
        contactMethod: "",
        source: "",
        messages: [],
        assignee: { name: "Администратор", avatar: "" },
      },
    ];

    const { rerender } = render(
      <MyDayWidget currentUser="Администратор" leads={mockLeads2} projectTimeline={[]} />
    );
    expect(screen.getByText("2 просроченных лида")).toBeDefined();

    const mockLeads5: Lead[] = Array.from({ length: 5 }, (_, idx) => ({
      id: String(idx),
      name: `Lead ${idx}`,
      phone: "",
      status: "new",
      budget: "",
      deadline: "2026-01-01",
      material: "",
      type: "",
      contactMethod: "",
      source: "",
      messages: [],
      assignee: { name: "Администратор", avatar: "" },
    }));

    rerender(<MyDayWidget currentUser="Администратор" leads={mockLeads5} projectTimeline={[]} />);
    expect(screen.getByText("5 просроченных лидов")).toBeDefined();
  });
});

