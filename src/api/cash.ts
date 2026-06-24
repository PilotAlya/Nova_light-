import { api } from "./client";

export interface CashShift {
  id: number;
  date: string;
  start_amount: number;
  cash_total: number;
  cashless_total: number;
  expense_total: number;
  expected_balance: number;
  actual_balance: number;
  status: string;
  opened_by: string;
  closed_by: string;
  opened_at: string;
  closed_at: string;
  entries?: CashEntry[];
}

export interface CashEntry {
  id: number;
  shift_id: number;
  type: "sale" | "expense";
  amount: number;
  method: "cash" | "cashless";
  category: string;
  notes: string;
  created_at: string;
}

export async function fetchTodayShift(): Promise<CashShift> {
  return api.get<CashShift>("/cash/today");
}

export async function openShift(id: number, start_amount: number, opened_by: string): Promise<CashShift> {
  return api.put<CashShift>(`/cash/shifts/${id}/open`, { start_amount, opened_by });
}

export async function closeShift(id: number, actual_balance: number, closed_by: string): Promise<CashShift> {
  return api.put<CashShift>(`/cash/shifts/${id}/close`, { actual_balance, closed_by });
}

export async function addEntry(entry: { shift_id: number; type: string; amount: number; method: string; category?: string; notes?: string }): Promise<CashEntry> {
  return api.post<CashEntry>("/cash/entries", entry);
}

export async function deleteEntry(id: number): Promise<void> {
  await api.del(`/cash/entries/${id}`);
}

// Cleaning schedule
export interface CleaningItem {
  id: number;
  task_name: string;
  day_of_week: number;
  assignee: string;
  notes: string;
}

export async function fetchCleaning(): Promise<CleaningItem[]> {
  return api.get<CleaningItem[]>("/cleaning");
}

export async function createCleaning(item: Partial<CleaningItem>): Promise<CleaningItem> {
  return api.post<CleaningItem>("/cleaning", item);
}

export async function updateCleaning(id: number, item: Partial<CleaningItem>): Promise<CleaningItem> {
  return api.put<CleaningItem>(`/cleaning/${id}`, item);
}

export async function deleteCleaning(id: number): Promise<void> {
  await api.del(`/cleaning/${id}`);
}
