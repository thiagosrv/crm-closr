"use client"

import { useState, useEffect } from "react"
import { Clock, X, CalendarClock, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface FollowUp {
  id: string
  message: string
  scheduledAt: string
  status: string
}

interface ScheduleFollowUpDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  conversationId: string
  leadId?: string | null
}

const QUICK_OPTIONS = [
  { label: "Em 1h", minutes: 60 },
  { label: "Amanhã", minutes: 60 * 24 },
  { label: "Em 3 dias", minutes: 60 * 24 * 3 },
  { label: "Em 1 semana", minutes: 60 * 24 * 7 },
]

function addMinutes(minutes: number): string {
  const d = new Date(Date.now() + minutes * 60_000)
  // Format as datetime-local value: YYYY-MM-DDTHH:mm
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export function ScheduleFollowUpDialog({
  open,
  onOpenChange,
  conversationId,
  leadId,
}: ScheduleFollowUpDialogProps) {
  const [message, setMessage] = useState("")
  const [scheduledAt, setScheduledAt] = useState("")
  const [saving, setSaving] = useState(false)
  const [followUps, setFollowUps] = useState<FollowUp[]>([])
  const [loadingList, setLoadingList] = useState(false)

  useEffect(() => {
    if (!open) return
    setScheduledAt(addMinutes(60 * 24)) // default: tomorrow
    loadFollowUps()
  }, [open])

  async function loadFollowUps() {
    setLoadingList(true)
    try {
      const res = await fetch(`/api/follow-ups?conversationId=${conversationId}`)
      if (res.ok) setFollowUps(await res.json() as FollowUp[])
    } finally {
      setLoadingList(false)
    }
  }

  async function handleSave() {
    if (!message.trim() || !scheduledAt) return
    setSaving(true)
    try {
      const res = await fetch("/api/follow-ups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId, leadId, message: message.trim(), scheduledAt }),
      })
      if (!res.ok) throw new Error()
      toast.success("Follow-up agendado!")
      setMessage("")
      setScheduledAt(addMinutes(60 * 24))
      loadFollowUps()
    } catch {
      toast.error("Erro ao agendar follow-up")
    } finally {
      setSaving(false)
    }
  }

  async function handleCancel(id: string) {
    try {
      const res = await fetch(`/api/follow-ups/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error()
      setFollowUps((prev) => prev.filter((f) => f.id !== id))
      toast.success("Follow-up cancelado")
    } catch {
      toast.error("Erro ao cancelar")
    }
  }

  if (!open) return null

  const pendingFollowUps = followUps.filter((f) => f.status === "PENDING")

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={() => onOpenChange(false)}
      />

      {/* Dialog */}
      <div className="relative z-10 w-full max-w-md mx-4 glass-purple brutal-card rounded-2xl shadow-[4px_6px_0px_rgba(0,0,0,0.9)]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-white/[0.08]">
          <div className="flex items-center gap-2">
            <CalendarClock className="w-4 h-4 text-purple-400" />
            <h2 className="text-sm font-black tracking-tighter text-white">Agendar Follow-up</h2>
          </div>
          <button
            onClick={() => onOpenChange(false)}
            className="text-white/40 hover:text-white/80 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-5 py-4 flex flex-col gap-4">
          {/* Message */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold text-white/50 uppercase tracking-widest">
              Mensagem
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ex: Oi! Passando para saber se ainda tem interesse…"
              rows={3}
              className="w-full resize-none bg-white/[0.04] border border-white/[0.12] rounded-xl px-3.5 py-2.5 text-sm text-white/90 placeholder:text-white/30 outline-none focus:border-purple-500/50 transition-colors leading-relaxed"
            />
          </div>

          {/* Date/time + quick buttons */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold text-white/50 uppercase tracking-widest">
              Data e Horário
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {QUICK_OPTIONS.map((opt) => (
                <button
                  key={opt.label}
                  type="button"
                  onClick={() => setScheduledAt(addMinutes(opt.minutes))}
                  className="text-[11px] font-semibold px-2.5 py-1 rounded-md border border-purple-500/30 bg-purple-500/10 text-purple-300 hover:bg-purple-500/20 transition-colors"
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <input
              type="datetime-local"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
              className="w-full bg-white/[0.04] border border-white/[0.12] rounded-xl px-3.5 py-2.5 text-sm text-white/90 outline-none focus:border-purple-500/50 transition-colors"
              style={{ colorScheme: "dark" }}
            />
          </div>

          {/* Notice about auto-cancel */}
          <p className="text-[11px] text-white/30 flex items-start gap-1.5 leading-relaxed">
            <Clock className="w-3 h-3 mt-0.5 shrink-0 text-white/20" />
            O follow-up é cancelado automaticamente se o lead for movido para &ldquo;Ganho&rdquo; ou &ldquo;Perdido&rdquo;.
          </p>

          {/* Save button */}
          <button
            onClick={handleSave}
            disabled={!message.trim() || !scheduledAt || saving}
            className={cn(
              "w-full py-2.5 rounded-xl text-sm font-bold transition-all brutal-btn",
              message.trim() && scheduledAt && !saving
                ? "bg-purple-500 text-white border-purple-400 hover:bg-purple-400"
                : "bg-white/[0.04] text-white/30 border-white/10 cursor-not-allowed"
            )}
          >
            {saving ? "Agendando…" : "Agendar Follow-up"}
          </button>

          {/* Pending follow-ups list */}
          {pendingFollowUps.length > 0 && (
            <div className="flex flex-col gap-2">
              <p className="text-[11px] font-bold text-white/50 uppercase tracking-widest">
                Agendados ({pendingFollowUps.length})
              </p>
              {pendingFollowUps.map((fu) => (
                <div
                  key={fu.id}
                  className="flex items-start justify-between gap-3 bg-white/[0.03] rounded-lg px-3 py-2.5 border border-white/[0.06]"
                >
                  <div className="flex flex-col gap-0.5 min-w-0">
                    <p className="text-xs text-white/80 truncate">{fu.message}</p>
                    <p className="text-[11px] text-purple-400 font-medium">
                      {new Date(fu.scheduledAt).toLocaleString("pt-BR", {
                        day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit",
                      })}
                    </p>
                  </div>
                  <button
                    onClick={() => handleCancel(fu.id)}
                    className="text-white/30 hover:text-red-400 transition-colors shrink-0 mt-0.5"
                    title="Cancelar"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {loadingList && (
            <p className="text-xs text-white/30 text-center">Carregando…</p>
          )}
        </div>
      </div>
    </div>
  )
}
