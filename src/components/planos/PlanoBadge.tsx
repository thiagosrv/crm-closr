import { Diamond } from "lucide-react"
import { cn } from "@/lib/utils"

interface Props {
  plano: string
  className?: string
}

export function PlanoBadge({ plano, className }: Props) {
  if (plano === "DIAMOND") {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold",
          "bg-gradient-to-r from-cyan-500/20 to-violet-600/20",
          "border border-cyan-500/30 text-cyan-300",
          className
        )}
      >
        <Diamond className="h-3 w-3" />
        Diamond
      </span>
    )
  }

  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
        "bg-muted text-muted-foreground border border-white/10",
        className
      )}
    >
      Free
    </span>
  )
}
