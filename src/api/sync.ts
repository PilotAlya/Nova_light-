import { api, setToken } from "./client";

export interface LoginResult {
  user: { id: number; name: string; role: string; avatar: string };
  token: string;
}

export async function keyLogin(key: string): Promise<LoginResult> {
  const res = await api.post<LoginResult>("/auth/key-login", { key });
  setToken(res.token);
  return res;
}

export async function loadData<T>(key: string): Promise<T | null> {
  try { return await api.get<T>(`/app-data/${key}`); }
  catch { return null; }
}

export async function saveData<T>(key: string, data: T): Promise<void> {
  try { await api.put(`/app-data/${key}`, data); }
  catch { /* silently fail — localStorage is fallback */ }
}
