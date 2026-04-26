"use client"

import { useState } from "react"
import { Search, Handshake } from "lucide-react"
import { Input } from "@/components/ui/input"
import { EmptyState } from "@/components/shared/EmptyState"
import { formatarMoeda, formatarData, formatarDataRelativa, cn } from "@/lib/utils"

type DealStatus = "OPEN" | "WON" | "LOST"

interface Deal {
  id: string
  title: string
  value: number
  status: DealStatus
  probability?: number | null
  expectedClose?: Date | null
  createdAt: Date
  updatedAt: Date
  stage: {
    id: string
    name: string
    color: string
    order: number
  }
  contact?: {
    id: string
    firstName: string
    lastName: string
    company?: string | null
  } | null
  assignedTo?: {
    id: string
    name: string
    email: string
  } | null
}

interface NegociacaoTableProps {
  deals: Deal[]
  total: number
}

const STATUS_LABEL: Record<DealStatus, string> = {
  OPEN: "Aberto",
  WON: "Ganho",
  LOST: "Perdido",
}

const STATUS_CLASSES: Record<DealStatus, string> = {
  OPEN: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  WON: "bg-green-500/10 text-green-400 border-green-500/20",
  LOST: "bg-red-500/10 text-red-400 border-red-500/20",
}

export function NegociacaoTable({ deals, total }: NegociacaoTableProps) {
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<DealStatus | "ALL">("ALL")
  const [stageFilter, setStageFilter] = useState<string>("ALL")

  // Gather unique stages
  const stages = Array.from(
    new Map(deals.map((d) => [d.stage.id, d.stage])).values()
  ).sort((a, b) => a.order - b.order)

  const filtered = deals.filter((d) => {
    if (statusFilter !== "ALL" && d.status !== statusFilter) return false
    if (stageFilter !== "ALL" && d.stage.id !== stageFilter) return false
    if (search) {
      const q = search.toLowerCase()
      if (
        !d.title.toLowerCase().includes(q) &&
        !(d.contact?.firstName ?? "").toLowerCase().includes(q) &&
        !(d.contact?.lastName ?? "").toLowerCase().includes(q) &&
        !(d.contact?.company ?? "").toLowerCase().includes(q)
      ) {
        return false
      }
    }
    return true
  })

  return (
    <>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar negociações..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Status filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as DealStatus | "ALL")}
          className={cn(
            "h-9 rounded-lg border border-input bg-transparent px-3 text-sm",
            "text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          )}
        >
          <option value="ALL" className="bg-background">Todos os status</option>
          <option value="OPEN" className="bg-background">Aberto</option>
          <option value="WON" className="bg-background">Ganho</option>
          <option value="LOST" className="bg-background">Perdido</option>
        </select>

        {/* Stage filter */}
        {stages.length > 0 && (
          <select
            value={stageFilter}
            onChange={(e) => setStageFilter(e.target.value)}
            className={cn(
              "h-9 rounded-lg border border-input bg-transparent px-3 text-sm",
              "text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            )}
          >
            <option value="ALL" className="bg-background">Todas as etapas</option>
            {stages.map((s) => (
              <option key={s.id} value={s.id} className="bg-background">
                {s.name}
              </option>
            ))}
          </select>
        )}

        <span className="ml-auto text-sm text-muted-foreground hidden sm:block">
          {total} negociação{total !== 1 ? "ões" : ""}
        </span>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={Handshake}
          title={search || statusFilter !== "ALL" || stageFilter !== "ALL"
            ? "Nenhuma negociação encontrada"
            : "Nenhuma negociação ainda"}
          description={
            search || statusFilter !== "ALL" || stageFilter !== "ALL"
              ? "Tente ajustar os filtros de busca."
              : "Negociações aparecem aqui quando convertidas de leads ou criadas no pipeline."
          }
        />
      ) : (
        <div className="glass rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/8 text-left">
                  <th className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Título
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Valor
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Etapa
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Contato
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Prob.
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Fechar em
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filtered.map((deal) => (
                  <tr key={deal.id} className="hover:bg-white/2 transition-colors">
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-foreground">{deal.title}</p>
                        {deal.assignedTo && (
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {deal.assignedTo.name}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 font-semibold">
                      {formatarMoeda(deal.value)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold border"
                        style={{
                          background: `${deal.stage.color}15`,
                          color: deal.stage.color,
                          borderColor: `${deal.stage.color}30`,
                        }}
                      >
                        {deal.stage.name}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {deal.contact ? (
                        <div>
                          <p className="text-sm">
                            {deal.contact.firstName} {deal.contact.lastName}
                          </p>
                          {deal.contact.company && (
                            <p className="text-xs text-muted-foreground">{deal.contact.company}</p>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {deal.probability != null ? (
                        <div className="space-y-1">
                          <span className="text-xs font-semibold">{deal.probability}%</span>
                          <div className="w-16 h-1.5 rounded-full bg-white/10">
                            <div
                              className="h-full rounded-full transition-all"
                              style={{
                                width: `${deal.probability}%`,
                                background: deal.status === "WON"
                                  ? "#22c55e"
                                  : deal.status === "LOST"
                                  ? "#ef4444"
                                  : "#06b6d4",
                              }}
                            />
                          </div>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {deal.expectedClose
                        ? formatarData(deal.expectedClose)
                        : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold border",
                          STATUS_CLASSES[deal.status]
                        )}
                      >
                        {STATUS_LABEL[deal.status]}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  )
}
