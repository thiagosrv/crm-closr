import { type LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface Props {
  title: string
  value: string
  icon: LucideIcon
  trend?: number
  description?: string
}

export function MetricCard({ title, value, icon: Icon, trend, description }: Props) {
  return (
    <div className="glass brutal-card rounded-xl p-5 flex flex-col gap-3 animate-fade-in">
      <div className="flex items-start justify-between">
        <p className="text-sm text-muted-foreground font-medium">{title}</p>
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-cyan-500/10">
          <Icon className="h-4 w-4 text-cyan-400" />
        </div>
      </div>

      <div className="flex items-end justify-between gap-2">
        <p className="text-2xl font-black tracking-tighter text-white">{value}</p>

        {trend !== undefined && (
          <span
            className={cn(
              "text-xs font-medium px-1.5 py-0.5 rounded",
              trend >= 0
                ? "text-emerald-400 bg-emerald-400/10"
                : "text-red-400 bg-red-400/10"
            )}
          >
            {trend >= 0 ? "+" : ""}
            {trend.toFixed(1)}%
          </span>
        )}
      </div>

      {description && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}
    </div>
  )
}
