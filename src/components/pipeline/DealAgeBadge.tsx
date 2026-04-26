"use client"

import { Clock } from "lucide-react"
import { cn } from "@/lib/utils"

interface DealAgeBadgeProps {
  daysInStage: number
  rottingDays: number
}

export function DealAgeBadge({ daysInStage, rottingDays }: DealAgeBadgeProps) {
  const isRotting = daysInStage > rottingDays
  const isWarning = !isRotting && daysInStage > Math.floor(rottingDays / 2)

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold border transition-all",
        isRotting && "bg-red-500/20 text-red-400 border-red-500/40 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.4)]",
        isWarning && "bg-yellow-500/20 text-yellow-400 border-yellow-500/40",
        !isRotting && !isWarning && "bg-white/8 text-white/40 border-white/10"
      )}
      title={`${daysInStage} dias nesta etapa${isRotting ? " — Apodrecendo!" : ""}`}
    >
      <Clock className={cn("size-2.5", isRotting && "text-red-400", isWarning && "text-yellow-400")} />
      {daysInStage}d
    </span>
  )
}
