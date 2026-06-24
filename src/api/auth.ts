import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "./client";

export interface User {
  id: number;
  email: string;
  name: string;
  avatar: string;
  role: string;
  phone: string;
  telegram: string;
  created_at: string;
}

export function useAuth() {
  const qc = useQueryClient();
  return {
    login: useMutation({
      mutationFn: (data: { email: string; password: string }) =>
        api.post<{ user: User; token: string }>("/auth/login", data),
      onSuccess: (res) => {
        localStorage.setItem("nova_token", res.token);
        qc.setQueryData(["me"], res.user);
      },
    }),
    me: useQuery({
      queryKey: ["me"],
      queryFn: () => api.get<User>("/auth/me"),
      enabled: !!localStorage.getItem("nova_token"),
      staleTime: 5 * 60 * 1000,
    }),
    logout: () => {
      localStorage.removeItem("nova_token");
      qc.clear();
    },
  };
}

export function useUsers() {
  return useQuery({
    queryKey: ["users"],
    queryFn: () => api.get<User[]>("/users"),
  });
}
