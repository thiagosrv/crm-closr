"use client"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

export function useDealsKanban() {
  return useQuery({
    queryKey: ["deals", "kanban"],
    queryFn: async () => {
      const res = await fetch("/api/deals/kanban")
      if (!res.ok) throw new Error("Erro ao buscar deals")
      return res.json()
    },
  })
}

export function useDeals(filters?: Record<string, string>) {
  return useQuery({
    queryKey: ["deals", filters],
    queryFn: async () => {
      const params = new URLSearchParams(filters)
      const res = await fetch(`/api/deals?${params}`)
      if (!res.ok) throw new Error("Erro ao buscar negociações")
      return res.json()
    },
  })
}
