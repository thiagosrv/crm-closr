"use client"

import { cn } from "@/lib/utils"

interface Message {
  id: string
  direction: string
  type: string
  content: string
  sentAt: string
}

interface MessageBubbleProps {
  message: Message
}

function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  })
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isOutbound = message.direction === "OUTBOUND"

  return (
    <div
      className={cn(
        "flex flex-col gap-1 max-w-[75%]",
        isOutbound ? "self-end items-end" : "self-start items-start"
      )}
    >
      <div
        className={cn(
          "px-3 py-2 text-sm leading-relaxed rounded-lg",
          isOutbound
            ? "bg-cyan-500/20 border border-cyan-500/30 text-white/90 rounded-br-sm"
            : "bg-white/[0.06] border border-white/10 text-white/80 rounded-bl-sm"
        )}
      >
        {message.content}
      </div>
      <span className="text-[10px] text-white/30 px-1">{formatTime(message.sentAt)}</span>
    </div>
  )
}
