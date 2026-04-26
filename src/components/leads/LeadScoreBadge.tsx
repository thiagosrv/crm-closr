import { cn } from "@/lib/utils"

interface LeadScoreBadgeProps {
  score: number
  className?: string
}

export function LeadScoreBadge({ score, className }: LeadScoreBadgeProps) {
  const { label, classes } = getScoreStyle(score)

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold border",
        classes,
        className
      )}
    >
      {score} — {label}
    </span>
  )
}

function getScoreStyle(score: number): { label: string; classes: string } {
  if (score <= 30) {
    return {
      label: "Frio",
      classes: "bg-white/5 text-muted-foreground border-white/10",
    }
  }
  if (score <= 60) {
    return {
      label: "Morno",
      classes: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    }
  }
  if (score <= 80) {
    return {
      label: "Quente",
      classes: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
    }
  }
  return {
    label: "Hot",
    classes: "bg-green-500/10 text-green-400 border-green-500/20",
  }
}
