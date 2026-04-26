"use client"
import { useQuery } from "@tanstack/react-query"

export function useContatos(search?: string) {
  return useQuery({
    queryKey: ["contatos", search],
    queryFn: async () => {
      const params = search ? `?search=${encodeURIComponent(search)}` : ""
      const res = await fetch(`/api/contacts${params}`)
      if (!res.ok) throw new Error("Erro ao buscar contatos")
      return res.json()
    },
  })
}
