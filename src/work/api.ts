export const SUPPLIERS = [
  { id: "rondo", label: "Рондо / Ладья" },
  { id: "partner", label: "Партнер" },
  { id: "vasilyevo", label: "Васильево / Ортус" },
] as const;

export type SupplierId = (typeof SUPPLIERS)[number]["id"];

export type WorkTask = {
  id: number;
  date: string;
  title: string;
  sort_order: number;
  done: number | boolean;
  comment: string;
};

export type WorkCash = {
  id: number;
  date: string;
  cash_start: number;
  cash_in: number;
  acquiring_in: number;
  expense_other: number;
  expense_other_note: string;
  cash_end_fact: number;
  cash_in_program: number;
  receipts_to_accountant: number | boolean;
  comment: string;
};

export type WorkLoader = {
  id: number;
  date: string;
  order_title: string;
  amount: number;
  loader_name: string;
  signed: number | boolean;
  money_from: string;
  comment: string;
};

export type WorkFitting = {
  id: number;
  code: string;
  name: string;
  supplier: SupplierId | string;
  stock_fact: number;
  stock_program: number;
  last_delivery_qty: number;
  order_qty: number;
  comment: string;
  updated_at: string;
};

export type WorkDay = {
  date: string;
  tasks: WorkTask[];
  cash: WorkCash;
  loaders: WorkLoader[];
};

const API = "/api/work";

async function request<T>(path: string, opts: { method?: string; body?: string; headers?: Record<string, string> } = {}): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    ...opts,
    headers: {
      "Content-Type": "application/json",
      ...(opts.headers || {}),
    },
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error((body as { error?: string }).error || `HTTP ${res.status}`);
  }
  return body as T;
}

export const workApi = {
  day: (date: string) => request<WorkDay>(`/day?date=${encodeURIComponent(date)}`),
  patchTask: (id: number, data: { done?: boolean; comment?: string }) =>
    request<WorkTask>(`/tasks/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  saveCash: (data: Partial<WorkCash> & { date: string }) =>
    request<WorkCash>("/cash", { method: "PUT", body: JSON.stringify(data) }),
  addLoader: (data: Partial<WorkLoader> & { date: string }) =>
    request<WorkLoader>("/loaders", { method: "POST", body: JSON.stringify(data) }),
  patchLoader: (id: number, data: Partial<WorkLoader>) =>
    request<WorkLoader>(`/loaders/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  deleteLoader: (id: number) => request<{ ok: boolean }>(`/loaders/${id}`, { method: "DELETE" }),
  fittings: () => request<WorkFitting[]>("/fittings"),
  addFitting: (data: Partial<WorkFitting>) =>
    request<WorkFitting>("/fittings", { method: "POST", body: JSON.stringify(data) }),
  saveFitting: (id: number, data: Partial<WorkFitting>) =>
    request<WorkFitting>(`/fittings/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteFitting: (id: number) => request<{ ok: boolean }>(`/fittings/${id}`, { method: "DELETE" }),
  orders: () =>
    request<{
      suppliers: { id: string; label: string }[];
      grouped: Record<string, WorkFitting[]>;
    }>("/orders"),
};
