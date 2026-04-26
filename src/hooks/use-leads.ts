"use client"
import { useQuery } from "@tanstack/react-query"

export function useLeads(filters?: Record<string, string>) {
  return useQuery({
    queryKey: ["leads", filters],
    queryFn: async () => {
      const params = new URLSearchParams(filters)
      const res = await fetch(`/api/leads?${params}`)
      if (!res.ok) throw new Error("Erro ao buscar leads")
      return res.json()
    },
  })
}
