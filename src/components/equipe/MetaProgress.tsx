import { cn, formatarMoeda } from "@/lib/utils"

interface Props {
  atual: number
  meta: number
}

export function MetaProgress({ atual, meta }: Props) {
  const pct = meta > 0 ? Math.min((atual / meta) * 100, 100) : 0
  const color = pct >= 100 ? "bg-green-500" : pct >= 50 ? "bg-yellow-500" : "bg-red-500"

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{formatarMoeda(atual)}</span>
        <span className={cn("font-semibold", pct >= 100 ? "text-green-400" : pct >= 50 ? "text-yellow-400" : "text-red-400")}>
          {pct.toFixed(0)}%
        </span>
        <span>{formatarMoeda(meta)}</span>
      </div>
      <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
        <div className={cn("h-full rounded-full transition-all", color)} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}
