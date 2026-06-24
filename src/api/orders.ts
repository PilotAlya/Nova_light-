import { api } from "./client";

export interface OrderHistoryEntry {
  timestamp: string;
  changed_by: string;
  fields: Record<string, { from: string; to: string }>;
}

export interface Order {
  id: number;
  client_name: string;
  phone: string;
  material: string;
  payment_status: string;
  responsible: string;
  status: string;
  total_cost: number;
  positions_json: string;
  source: string;
  deadline: string;
  pickup_location: string;
  created_at: string;
  updated_at: string;
  history?: OrderHistoryEntry[];
}

export interface Prices {
  price_l_ka: number;
  price_edge: number;
  price_hinge: number;
  price_internal_operation: number;
}

export async function fetchPrices(): Promise<Prices> {
  return api.get<Prices>("/prices");
}

export async function savePrices(prices: Partial<Prices>): Promise<void> {
  await api.put("/prices", prices);
}

export async function fetchOrders(): Promise<Order[]> {
  return api.get<Order[]>("/orders");
}

export async function createOrder(order: Partial<Order>): Promise<Order> {
  return api.post<Order>("/orders", order);
}

export async function updateOrder(id: number, data: Partial<Order> & { changed_by?: string }): Promise<Order> {
  return api.put<Order>(`/orders/${id}`, data);
}

export async function deleteOrder(id: number): Promise<void> {
  await api.del(`/orders/${id}`);
}
