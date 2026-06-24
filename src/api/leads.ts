import { api } from "./client";
import type { Lead } from "../types";

export async function fetchLeads(): Promise<Lead[]> {
  return api.get<Lead[]>("/leads-v2");
}

export async function createLead(lead: Omit<Lead, "id">): Promise<Lead> {
  return api.post<Lead>("/leads-v2", lead);
}

export async function updateLead(id: string, data: Partial<Lead>): Promise<Lead> {
  return api.put<Lead>(`/leads-v2/${id}`, data);
}

export async function deleteLead(id: string): Promise<void> {
  await api.del(`/leads-v2/${id}`);
}
