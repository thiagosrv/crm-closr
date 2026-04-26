"use client"

import { useState, useRef, useEffect } from "react"
import { toast } from "sonner"
import {
  X,
  Plus,
  Send,
  ArrowRight,
  UserPlus,
  CalendarClock,
} from "lucide-react"
import { cn, iniciais } from "@/lib/utils"
import { MessageBubble } from "./MessageBubble"
import { QuickRepliesMenu } from "./QuickRepliesMenu"
import { AddToCRMDialog } from "./AddToCRMDialog"
import { ScheduleFollowUpDialog } from "./ScheduleFollowUpDialog"

interface Message {
  id: string
  direction: string
  type: string
  content: string
  sentAt: string
  isRead: boolean
}

interface ConvLabel {
  id: string
  label: string
  color: string
}

interface Conversation {
  id: string
  externalId: string
  displayName: string | null
  labels: ConvLabel[]
  lead: { id: string; title: string } | null
  contact: { id: string; firstName: string; lastName: string } | null
  unreadCount: number
}

interface ConversationViewProps {
  conversation: Conversation
  messages: Message[]
  onMessageSent: () => void
  onAddLabel: (label: string, color: string) => void
  onRemoveLabel: (labelId: string) => void
  onAddToCRM: () => void
  onLabelAdded: () => void
}

const PRESET_LABELS = [
  { label: "Qualificado", color: "#22c55e" },
  { label: "Orçamento", color: "#f59e0b" },
  { label: "Follow-up", color: "#3b82f6" },
  { label: "Inativo", color: "#6b7280" },
  { label: "Fechado", color: "#ef4444" },
]

export function ConversationView({
  conversation,
  messages,
  onMessageSent,
  onAddLabel,
  onRemoveLabel,
  onAddToCRM,
  onLabelAdded,
}: ConversationViewProps) {
  const [text, setText] = useState("")
  const [sending, setSending] = useState(false)
  const [labelPopoverOpen, setLabelPopoverOpen] = useState(false)
  const [addToCRMOpen, setAddToCRMOpen] = useState(false)
  const [followUpOpen, setFollowUpOpen] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const labelPopoverRef = useRef<HTMLDivElement>(null)
  const labelButtonRef = useRef<HTMLButtonElement>(null)

  const name = conversation.displayName ?? conversation.externalId

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Auto-resize textarea
  useEffect(() => {
    const ta = textareaRef.current
    if (!ta) return
    ta.style.height = "auto"
    ta.style.height = Math.min(ta.scrollHeight, 96) + "px"
  }, [text])

  // Close label popover on outside click
  useEffect(() => {
    if (!labelPopoverOpen) return
    function handleClick(e: MouseEvent) {
      if (
        labelPopoverRef.current &&
        !labelPopoverRef.current.contains(e.target as Node) &&
        labelButtonRef.current &&
        !labelButtonRef.current.contains(e.target as Node)
      ) {
        setLabelPopoverOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [labelPopoverOpen])

  async function handleSend() {
    const content = text.trim()
    if (!content || sending) return
    setSending(true)
    try {
      const res = await fetch("/api/channels/whatsapp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId: conversation.id, content }),
      })
      if (!res.ok) throw new Error("Erro ao enviar mensagem")
      setText("")
      onMessageSent()
    } catch {
      toast.error("Falha ao enviar mensagem.")
    } finally {
      setSending(false)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  async function handleAddLabel(label: string, color: string) {
    try {
      const res = await fetch(
        `/api/channels/whatsapp/conversations/${conversation.id}/labels`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ label, color }),
        }
      )
      if (!res.ok) throw new Error()
      onAddLabel(label, color)
      onLabelAdded()
      setLabelPopoverOpen(false)
    } catch {
      toast.error("Não foi possível adicionar a etiqueta.")
    }
  }

  async function handleRemoveLabel(labelId: string) {
    try {
      const res = await fetch(
        `/api/channels/whatsapp/conversations/${conversation.id}/labels/${labelId}`,
        { method: "DELETE" }
      )
      if (!res.ok) throw new Error()
      onRemoveLabel(labelId)
    } catch {
      toast.error("Não foi possível remover a etiqueta.")
    }
  }

  const existingLabelNames = new Set(conversation.labels.map((l) => l.label))

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="shrink-0 px-5 pt-4 pb-3 border-b border-white/[0.07]">
        <div className="flex items-start justify-between gap-3">
          {/* Left: avatar + name */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-full bg-green-600/80 flex items-center justify-center text-white text-xs font-bold uppercase shrink-0">
              {iniciais(name)}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-white/90 truncate">{name}</p>
              <p className="text-xs text-white/40">{conversation.externalId}</p>
            </div>
          </div>

          {/* Right: actions */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Follow-up button — always visible */}
            <button
              type="button"
              onClick={() => setFollowUpOpen(true)}
              className="flex items-center gap-1.5 text-xs text-purple-300 hover:text-purple-200 font-medium px-2.5 py-1.5 rounded-lg border border-purple-500/30 bg-purple-500/10 hover:bg-purple-500/20 transition-colors"
              title="Agendar Follow-up"
            >
              <CalendarClock className="w-3 h-3" />
              Follow-up
            </button>

            {conversation.lead ? (
              <a
                href={`/leads?id=${conversation.lead.id}`}
                className="flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 font-semibold px-2.5 py-1.5 rounded-lg border border-cyan-500/30 bg-cyan-500/10 hover:bg-cyan-500/20 transition-colors"
              >
                Ver Lead
                <ArrowRight className="w-3 h-3" />
              </a>
            ) : (
              <button
                type="button"
                onClick={() => setAddToCRMOpen(true)}
                className="flex items-center gap-1.5 text-xs text-white/70 hover:text-white font-medium px-2.5 py-1.5 rounded-lg border border-white/[0.10] bg-white/[0.04] hover:bg-white/[0.08] transition-colors"
              >
                <UserPlus className="w-3 h-3" />
                Adicionar ao CRM
              </button>
            )}
          </div>
        </div>

        {/* Labels row */}
        <div className="flex items-center flex-wrap gap-1.5 mt-3">
          {conversation.labels.map((lbl) => (
            <span
              key={lbl.id}
              className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-sm"
              style={{
                backgroundColor: lbl.color + "25",
                color: lbl.color,
                border: `1px solid ${lbl.color}44`,
              }}
            >
              {lbl.label}
              <button
                type="button"
                onClick={() => handleRemoveLabel(lbl.id)}
                className="opacity-60 hover:opacity-100 transition-opacity"
              >
                <X className="w-2.5 h-2.5" />
              </button>
            </span>
          ))}

          {/* Add label button */}
          <div className="relative">
            <button
              ref={labelButtonRef}
              type="button"
              onClick={() => setLabelPopoverOpen((v) => !v)}
              className="w-5 h-5 rounded flex items-center justify-center text-white/30 hover:text-white/70 hover:bg-white/[0.06] transition-colors border border-white/[0.08] border-dashed"
              title="Adicionar etiqueta"
            >
              <Plus className="w-3 h-3" />
            </button>

            {labelPopoverOpen && (
              <div
                ref={labelPopoverRef}
                className="absolute top-full left-0 mt-1.5 w-44 rounded-xl border border-white/[0.10] bg-[#111827] shadow-2xl z-40 py-1"
              >
                {PRESET_LABELS.filter((p) => !existingLabelNames.has(p.label)).map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => handleAddLabel(preset.label, preset.color)}
                    className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-white/[0.05] transition-colors text-left"
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: preset.color }}
                    />
                    <span className="text-sm text-white/80">{preset.label}</span>
                  </button>
                ))}
                {PRESET_LABELS.every((p) => existingLabelNames.has(p.label)) && (
                  <p className="px-3 py-2 text-xs text-white/40">Todas as etiquetas adicionadas</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-2">
        {messages.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center gap-2">
            <p className="text-white/30 text-sm">Nenhuma mensagem ainda</p>
          </div>
        ) : (
          messages.map((msg) => <MessageBubble key={msg.id} message={msg} />)
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="shrink-0 px-4 py-3 border-t border-white/[0.07]">
        <div className="flex items-end gap-2">
          <QuickRepliesMenu onSelect={(content) => setText((prev) => prev + content)} />

          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Digite uma mensagem… (Enter para enviar)"
              rows={1}
              className="w-full resize-none bg-white/[0.04] border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-sm text-white/90 placeholder:text-white/30 outline-none focus:border-cyan-500/40 transition-colors leading-relaxed"
              style={{ maxHeight: "96px" }}
            />
          </div>

          <button
            type="button"
            onClick={handleSend}
            disabled={!text.trim() || sending}
            className={cn(
              "shrink-0 w-9 h-9 rounded-xl flex items-center justify-center transition-all",
              text.trim() && !sending
                ? "bg-cyan-500 hover:bg-cyan-400 text-white"
                : "bg-white/[0.04] text-white/20 cursor-not-allowed"
            )}
          >
            <Send className="w-4 h-4" />
          </button>
        </div>

        <p className="text-[10px] text-white/20 mt-1 pl-10">
          Shift+Enter para nova linha
        </p>
      </div>

      {/* Add to CRM dialog */}
      <AddToCRMDialog
        open={addToCRMOpen}
        onOpenChange={setAddToCRMOpen}
        conversationId={conversation.id}
        onSuccess={onAddToCRM}
      />

      {/* Schedule Follow-up dialog */}
      <ScheduleFollowUpDialog
        open={followUpOpen}
        onOpenChange={setFollowUpOpen}
        conversationId={conversation.id}
        leadId={conversation.lead?.id ?? null}
      />
    </div>
  )
}
