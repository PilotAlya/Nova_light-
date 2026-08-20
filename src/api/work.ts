import { api } from "./client";

export const SUPPLIERS = [
  { id: "rondo", label: "Рондо / Ладья" },
  { id: "partner", label: "Партнер" },
  { id: "vasilyevo", label: "Васильево / Ортус" },
] as const;

export interface WorkTask {
  id: number;
  date: string;
  title: string;
  sort_order: number;
  done: number | boolean;
  comment: string;
}

export interface WorkLoader {
  id: number;
  date: string;
  order_title: string;
  amount: number;
  loader_name: string;
  signed: number | boolean;
  money_from: string;
  comment: string;
}

export interface WorkFitting {
  id: number;
  code: string;
  name: string;
  supplier: string;
  stock_fact: number;
  stock_program: number;
  last_delivery_qty: number;
  order_qty: number;
  comment: string;
  updated_at: string;
}

export interface WorkDay {
  date: string;
  tasks: WorkTask[];
  loaders: WorkLoader[];
}

export const workApi = {
  day: (date: string) => api.get<WorkDay>(`/work/day?date=${encodeURIComponent(date)}`),
  patchTask: (id: number, patch: { done?: boolean; comment?: string }) =>
    api.patch<WorkTask>(`/work/tasks/${id}`, patch),
  addLoader: (data: Partial<WorkLoader> & { date: string }) => api.post<WorkLoader>("/work/loaders", data),
  deleteLoader: (id: number) => api.del<{ ok: boolean }>(`/work/loaders/${id}`),
  fittings: () => api.get<WorkFitting[]>("/work/fittings"),
  addFitting: (data: Partial<WorkFitting>) => api.post<WorkFitting>("/work/fittings", data),
  saveFitting: (id: number, data: Partial<WorkFitting>) => api.put<WorkFitting>(`/work/fittings/${id}`, data),
  deleteFitting: (id: number) => api.del<{ ok: boolean }>(`/work/fittings/${id}`),
};
