import { cn } from "@/lib/utils"

type ProposalStatus = "DRAFT" | "SENT" | "VIEWED" | "ACCEPTED" | "DECLINED" | "EXPIRED"

const statusConfig: Record<
  ProposalStatus,
  { label: string; className: string }
> = {
  DRAFT: {
    label: "Rascunho",
    className: "bg-gray-500/15 text-gray-400 border-gray-500/20",
  },
  SENT: {
    label: "Enviada",
    className: "bg-blue-500/15 text-blue-400 border-blue-500/20",
  },
  VIEWED: {
    label: "Visualizada",
    className: "bg-yellow-500/15 text-yellow-400 border-yellow-500/20",
  },
  ACCEPTED: {
    label: "Aceita",
    className: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
  },
  DECLINED: {
    label: "Recusada",
    className: "bg-red-500/15 text-red-400 border-red-500/20",
  },
  EXPIRED: {
    label: "Expirada",
    className: "bg-orange-500/15 text-orange-400 border-orange-500/20",
  },
}

interface PropostaStatusBadgeProps {
  status: ProposalStatus
  className?: string
}

export function PropostaStatusBadge({ status, className }: PropostaStatusBadgeProps) {
  const config = statusConfig[status] ?? statusConfig.DRAFT
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold",
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  )
}
