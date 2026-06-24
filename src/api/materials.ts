import { api } from "./client";

export interface Material {
  id: number;
  name: string;
  total_qty: number;
  used_qty: number;
  unit: string;
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface MaterialConsumption {
  id: number;
  material_id: number;
  order_id: number | null;
  qty: number;
  notes: string;
  created_at: string;
}

export async function fetchMaterials(): Promise<Material[]> {
  return api.get<Material[]>("/materials");
}

export async function createMaterial(data: Partial<Material>): Promise<Material> {
  return api.post<Material>("/materials", data);
}

export async function updateMaterial(id: number, data: Partial<Material>): Promise<Material> {
  return api.put<Material>(`/materials/${id}`, data);
}

export async function deleteMaterial(id: number): Promise<void> {
  await api.del(`/materials/${id}`);
}

export async function consumeMaterial(id: number, qty: number, order_id?: number, notes?: string): Promise<Material> {
  return api.post<Material>(`/materials/${id}/consume`, { qty, order_id, notes });
}

export async function fetchConsumption(id: number): Promise<MaterialConsumption[]> {
  return api.get<MaterialConsumption[]>(`/materials/${id}/consumption`);
}
