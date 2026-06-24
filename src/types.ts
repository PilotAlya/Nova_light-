import { ReactNode } from "react";

export type LeadStatus = "new" | "project" | "measure" | "production" | "mounting";

export interface Message {
  text: string;
  from: "client" | "manager";
  time: string;
  user?: TeamMember;
}

export interface ActivityEntry {
  timestamp: string;
  action: string;
  user: string;
}

export interface Lead {
  id: string;
  name: string;
  phone: string;
  status: LeadStatus;
  budget: string;
  deadline: string;
  material: string;
  materialCustom?: string;
  type: string;
  typeCustom?: string;
  contactMethod: string;
  source: string;
  sourceCustom?: string;
  messages: Message[];
  activityLog?: ActivityEntry[];
  assignee: {
    name: string;
    avatar: string;
  };
}

export interface TeamMember {
  name: string;
  role: string;
  avatar: string;
  status?: string;
  superpower?: string;
  achievements?: string[];
  efficiencyScore?: number;
  activeTasksLimit?: number;
  currentTaskId?: string | null;
}

export interface NavItem {
  key: string;
  label: string;
  icon: ReactNode;
}

export interface TimelineEntry {
  id: string;
  task: string;
  project: string;
  member: string;
  start: string;
  end: string;
  color: string;
  status: "planned" | "active" | "done";
  leadId?: string;
}

export interface InternQuestTask {
  id: number;
  text: string;
  hint: string;
  done: boolean;
}

export interface Idea {
  id: string;
  text: string;
  votes: number;
}
