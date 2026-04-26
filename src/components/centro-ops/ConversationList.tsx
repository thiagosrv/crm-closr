"use client"

import { useState } from "react"
import { MessageCircle, Search } from "lucide-react"
import { cn, iniciais } from "@/lib/utils"
import { Input } from "@/components/ui/input"

interface ConvLabel {
  id: string
  label: string
  color: string
}

interface ConvContact {
  id: string
  firstName: string
  lastName: string
}

interface ConvLead {
  id: string
  title: string
}

interface ConvMessage {
  content: string
  direction: string
  sentAt: string
}

interface Conversation {
  id: string
  externalId: string
  displayName: string | null
  lastMessageAt: string | null
  unreadCount: number
  contact: ConvContact | null
  lead: ConvLead | null
  labels: ConvLabel[]
  messages: ConvMessage[]
}

interface ConversationListProps {
  conversations: Conversation[]
  selectedId: string | null
  onSelect: (id: string) => void
}

function formatTime(dateStr: string | null): string {
  if (!dateStr) return ""
  const date = new Date(dateStr)
  const now = new Date()
  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear()
  if (isToday) {
    return date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
  }
  return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })
}

export function ConversationList({ conversations, selectedId, onSelect }: ConversationListProps) {
  const [search, setSearch] = useState("")

  const filtered = conversations.filter((conv) => {
    const query = search.toLowerCase()
    const name = (conv.displayName ?? conv.externalId).toLowerCase()
    return name.includes(query) || conv.externalId.toLowerCase().includes(query)
  })

  return (
    <div className="flex flex-col h-full">
      {/* Search */}
      <div className="p-3 border-b border-white/[0.07]">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar conversa..."
            className="pl-9 bg-white/[0.04] border-white/[0.07] text-white/90 placeholder:text-white/30 text-sm h-9"
          />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center h-32 text-white/40 text-sm">
            Nenhuma conversa encontrada
          </div>
        )}
        {filtered.map((conv) => {
          const name = conv.displayName ?? conv.externalId
          const lastMsg = conv.messages[conv.messages.length - 1]
          const isSelected = conv.id === selectedId

          return (
            <button
              key={conv.id}
              onClick={() => onSelect(conv.id)}
              className={cn(
                "w-full flex items-start gap-3 px-4 py-3 text-left transition-all border-l-2",
                isSelected
                  ? "bg-white/[0.08] border-cyan-400"
                  : "border-transparent hover:bg-white/[0.04]"
              )}
            >
              {/* Avatar */}
              <div className="relative shrink-0">
                <div className="w-10 h-10 rounded-full bg-green-600/80 flex items-center justify-center text-white text-xs font-bold uppercase">
                  {iniciais(name)}
                </div>
                <MessageCircle className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 text-green-400 fill-green-400" />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1 mb-0.5">
                  <span className="text-sm font-semibold text-white/90 truncate">{name}</span>
                  <span className="text-[10px] text-white/40 shrink-0">
                    {formatTime(conv.lastMessageAt)}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-1">
                  <p className="text-xs text-white/50 truncate flex-1">
                    {lastMsg
                      ? (lastMsg.direction === "OUTBOUND" ? "Você: " : "") + lastMsg.content
                      : "Sem mensagens"}
                  </p>
                  {conv.unreadCount > 0 && (
                    <span className="shrink-0 bg-cyan-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center leading-none">
                      {conv.unreadCount > 9 ? "9+" : conv.unreadCount}
                    </span>
                  )}
                </div>

                {/* Labels */}
                {conv.labels.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {conv.labels.map((lbl) => (
                      <span
                        key={lbl.id}
                        className="text-[10px] px-1.5 py-0.5 rounded-sm font-medium"
                        style={{
                          backgroundColor: lbl.color + "33",
                          color: lbl.color,
                          border: `1px solid ${lbl.color}55`,
                        }}
                      >
                        {lbl.label}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
