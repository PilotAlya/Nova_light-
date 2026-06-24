import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "./client";

export interface Client {
  id: number;
  name: string;
  phone: string;
  email: string;
  telegram: string;
  vk: string;
  whatsapp: string;
  source: string;
  tags: string;
  notes: string;
  avatar_emoji: string;
  created_at: string;
  orders: Order[];
  communications: Communication[];
  lead_ids: number[];
}

export interface Order {
  id: number;
  client_id: number;
  lead_id: number;
  title: string;
  status: string;
  total: number;
  prepayment: number;
  deadline: string;
  created_at: string;
  payments: Payment[];
}

export interface Payment {
  id: number;
  order_id: number;
  type: string;
  amount: number;
  method: string;
  note: string;
  paid_at: string;
}

export interface Communication {
  id: number;
  client_id: number;
  channel: string;
  direction: string;
  message: string;
  owner: number;
  created_at: string;
}

export function useClients(filters?: { search?: string; tag?: string }) {
  const params = new URLSearchParams();
  if (filters?.search) params.set("search", filters.search);
  if (filters?.tag) params.set("tag", filters.tag);
  const qs = params.toString();

  return useQuery({
    queryKey: ["clients", filters],
    queryFn: () => api.get<Client[]>(`/clients${qs ? `?${qs}` : ""}`),
  });
}

export function useClient(id: number) {
  return useQuery({
    queryKey: ["client", id],
    queryFn: () => api.get<Client>(`/clients/${id}`),
    enabled: !!id,
  });
}

export function useCreateClient() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Client>) => api.post<Client>("/clients", data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["clients"] }),
  });
}

export function useUpdateClient() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: Partial<Client> & { id: number }) =>
      api.put<Client>(`/clients/${id}`, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["clients"] });
      qc.invalidateQueries({ queryKey: ["client"] });
    },
  });
}

export function useDeleteClient() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.del(`/clients/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["clients"] }),
  });
}

export function useCreateOrder(clientId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Order>) =>
      api.post<Order>(`/clients/${clientId}/orders`, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["clients"] });
      qc.invalidateQueries({ queryKey: ["client"] });
    },
  });
}

export function useCreatePayment(orderId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Payment>) =>
      api.post<Payment>(`/clients/orders/${orderId}/payments`, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["clients"] });
      qc.invalidateQueries({ queryKey: ["client"] });
    },
  });
}

export function useCreateCommunication(clientId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Communication>) =>
      api.post<Communication>(`/clients/${clientId}/communications`, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["clients"] });
      qc.invalidateQueries({ queryKey: ["client"] });
    },
  });
}
