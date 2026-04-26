"use client"

import { AlertTriangle, Clock } from "lucide-react"
import { cn } from "@/lib/utils"

interface RottingDeal {
  id: string
  title: string
  value: number
  updatedAt: Date
  stage: { id: string; name: string; color: string } | null
  contact: { id: string; firstName: string; lastName: string } | null
}

interface Props {
  deals: RottingDeal[]
  rottingDays?: number
}

function daysSince(date: Date): number {
  return Math.floor((Date.now() - new Date(date).getTime()) / (1000 * 60 * 60 * 24))
}

export function DealHealthPanel({ deals, rottingDays = 14 }: Props) {
  return (
    <div className="glass brutal-card rounded-xl p-5 flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <AlertTriangle className="h-4 w-4 text-orange-400" />
        <h3 className="text-sm font-semibold text-white">
          Deals Sem Atividade{" "}
          <span className="text-muted-foreground font-normal">({deals.length})</span>
        </h3>
      </div>

      {deals.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-6">
          Nenhum deal em risco. Bom trabalho!
        </p>
      ) : (
        <ul className="flex flex-col gap-2 max-h-64 overflow-y-auto pr-1">
          {deals.map((deal) => {
            const days = daysSince(deal.updatedAt)
            const isHigh = days >= rottingDays * 2
            return (
              <li
                key={deal.id}
                className="flex items-start justify-between gap-3 rounded-lg bg-white/[0.03] border border-white/[0.06] p-3"
              >
                <div className="flex flex-col gap-0.5 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{deal.title}</p>
                  {deal.contact && (
                    <p className="text-xs text-muted-foreground truncate">
                      {deal.contact.firstName} {deal.contact.lastName}
                    </p>
                  )}
                  {deal.stage && (
                    <p className="text-xs" style={{ color: deal.stage.color }}>
                      {deal.stage.name}
                    </p>
                  )}
                </div>
                <div
                  className={cn(
                    "flex items-center gap-1 shrink-0 text-xs font-medium px-2 py-1 rounded-full",
                    isHigh
                      ? "text-red-400 bg-red-400/10"
                      : "text-orange-400 bg-orange-400/10"
                  )}
                >
                  <Clock className="h-3 w-3" />
                  {days}d
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
