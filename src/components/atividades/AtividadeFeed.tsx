"use client"

import { useState } from "react"
import {
  Phone,
  Mail,
  MessageCircle,
  CalendarDays,
  CheckSquare,
  StickyNote,
  Plus,
  CalendarCheck,
  CheckCircle2,
  AlertCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/shared/EmptyState"
import { LogAtividadeDialog } from "./LogAtividadeDialog"
import { completeActivity } from "@/server/actions/activities"
import { formatarDataHora, formatarDataRelativa, cn } from "@/lib/utils"
import { toast } from "sonner"

type ActivityType = "NOTE" | "CALL" | "EMAIL" | "WHATSAPP" | "MEETING" | "TASK" | "INACTIVITY_ALERT"

interface Activity {
  id: string
  type: ActivityType
  subject: string
  body?: string | null
  dueAt?: Date | null
  completedAt?: Date | null
  createdAt: Date
  contact?: {
    id: string
    firstName: string
    lastName: string
    company?: string | null
  } | null
  deal?: {
    id: string
    title: string
  } | null
  lead?: {
    id: string
    title: string
  } | null
  user: {
    id: string
    name: string
    image?: string | null
  }
}

interface AtividadeFeedProps {
  pending: Activity[]
  completed: Activity[]
}

const ACTIVITY_ICONS: Record<ActivityType, React.ElementType> = {
  CALL: Phone,
  EMAIL: Mail,
  WHATSAPP: MessageCircle,
  MEETING: CalendarDays,
  TASK: CheckSquare,
  NOTE: StickyNote,
  INACTIVITY_ALERT: AlertCircle,
}

const ACTIVITY_COLORS: Record<ActivityType, string> = {
  CALL: "text-blue-400 bg-blue-500/10",
  EMAIL: "text-purple-400 bg-purple-500/10",
  WHATSAPP: "text-green-400 bg-green-500/10",
  MEETING: "text-cyan-400 bg-cyan-500/10",
  TASK: "text-yellow-400 bg-yellow-500/10",
  NOTE: "text-muted-foreground bg-white/5",
  INACTIVITY_ALERT: "text-red-400 bg-red-500/10",
}

const ACTIVITY_LABEL: Record<ActivityType, string> = {
  CALL: "Ligação",
  EMAIL: "Email",
  WHATSAPP: "WhatsApp",
  MEETING: "Reunião",
  TASK: "Tarefa",
  NOTE: "Nota",
  INACTIVITY_ALERT: "Alerta",
}

function ActivityItem({
  activity,
  onComplete,
}: {
  activity: Activity
  onComplete: (id: string) => void
}) {
  const Icon = ACTIVITY_ICONS[activity.type]
  const colorClass = ACTIVITY_COLORS[activity.type]
  const isCompleted = !!activity.completedAt

  const linkedName =
    activity.contact
      ? `${activity.contact.firstName} ${activity.contact.lastName}`
      : activity.deal?.title ?? activity.lead?.title ?? null

  return (
    <div className="flex gap-3 group">
      {/* Icon */}
      <div
        className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-full mt-0.5",
          colorClass
        )}
      >
        <Icon className="h-4 w-4" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 pb-4 border-b border-white/5 last:border-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                {ACTIVITY_LABEL[activity.type]}
              </span>
              {linkedName && (
                <>
                  <span className="text-muted-foreground/40">·</span>
                  <span className="text-xs text-muted-foreground truncate">{linkedName}</span>
                </>
              )}
            </div>
            <p className="text-sm font-medium text-foreground mt-0.5 truncate">{activity.subject}</p>
            {activity.body && (
              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2 leading-relaxed">
                {activity.body}
              </p>
            )}
            <div className="flex items-center gap-3 mt-1.5">
              {activity.dueAt && !isCompleted && (
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <CalendarDays className="h-3 w-3 shrink-0" />
                  Prazo: {formatarDataHora(activity.dueAt)}
                </span>
              )}
              {activity.completedAt && (
                <span className="text-xs text-green-400 flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3 shrink-0" />
                  Concluída {formatarDataRelativa(activity.completedAt)}
                </span>
              )}
              {!activity.dueAt && !activity.completedAt && (
                <span className="text-xs text-muted-foreground">
                  {formatarDataRelativa(activity.createdAt)}
                </span>
              )}
            </div>
          </div>

          {!isCompleted && (
            <Button
              variant="ghost"
              size="sm"
              className="shrink-0 text-xs text-cyan-400 hover:text-cyan-300 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => onComplete(activity.id)}
            >
              <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
              Concluir
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

export function AtividadeFeed({ pending, completed }: AtividadeFeedProps) {
  const [tab, setTab] = useState<"pending" | "completed">("pending")
  const [logOpen, setLogOpen] = useState(false)

  async function handleComplete(id: string) {
    try {
      await completeActivity(id)
      toast.success("Atividade concluída!")
    } catch {
      toast.error("Erro ao concluir atividade.")
    }
  }

  const current = tab === "pending" ? pending : completed

  return (
    <>
      {/* Header + tabs */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-1 glass rounded-lg p-1">
          <button
            onClick={() => setTab("pending")}
            className={cn(
              "px-4 py-1.5 text-sm font-medium rounded-md transition-all",
              tab === "pending"
                ? "bg-cyan-500/15 text-cyan-400"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Pendentes
            {pending.length > 0 && (
              <span className="ml-1.5 inline-flex h-4 w-4 items-center justify-center rounded-full bg-cyan-500/20 text-xs">
                {pending.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setTab("completed")}
            className={cn(
              "px-4 py-1.5 text-sm font-medium rounded-md transition-all",
              tab === "completed"
                ? "bg-cyan-500/15 text-cyan-400"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Concluídas
          </button>
        </div>
        <Button onClick={() => setLogOpen(true)}>
          <Plus className="h-4 w-4 mr-1" />
          Registrar
        </Button>
      </div>

      {/* Feed */}
      {current.length === 0 ? (
        <EmptyState
          icon={CalendarCheck}
          title={tab === "pending" ? "Nenhuma atividade pendente" : "Nenhuma atividade concluída"}
          description={
            tab === "pending"
              ? "Registre ligações, emails, reuniões e tarefas."
              : "Atividades concluídas aparecerão aqui."
          }
          action={
            tab === "pending"
              ? { label: "Registrar Atividade", onClick: () => setLogOpen(true) }
              : undefined
          }
        />
      ) : (
        <div className="glass rounded-xl p-4 space-y-0">
          {current.map((activity) => (
            <ActivityItem
              key={activity.id}
              activity={activity}
              onComplete={handleComplete}
            />
          ))}
        </div>
      )}

      <LogAtividadeDialog open={logOpen} onOpenChange={setLogOpen} />
    </>
  )
}
