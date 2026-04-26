"use client"

import { useEffect, useState, useRef } from "react"
import { Zap, Search, ExternalLink } from "lucide-react"
import { cn } from "@/lib/utils"

interface QuickReply {
  id: string
  title: string
  type: string
  content: string
}

interface QuickRepliesMenuProps {
  onSelect: (content: string) => void
}

export function QuickRepliesMenu({ onSelect }: QuickRepliesMenuProps) {
  const [open, setOpen] = useState(false)
  const [replies, setReplies] = useState<QuickReply[]>([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(false)
  const popoverRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    setLoading(true)
    fetch("/api/quick-replies")
      .then((r) => r.json())
      .then((data) => setReplies(Array.isArray(data) ? data : []))
      .catch(() => setReplies([]))
      .finally(() => setLoading(false))
  }, [])

  // Close on outside click
  useEffect(() => {
    if (!open) return
    function handleClick(e: MouseEvent) {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node)
      ) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [open])

  const filtered = replies.filter(
    (r) =>
      r.title.toLowerCase().includes(search.toLowerCase()) ||
      r.content.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex items-center justify-center w-8 h-8 rounded-lg transition-colors",
          open
            ? "bg-cyan-500/20 text-cyan-400"
            : "text-white/40 hover:text-white/70 hover:bg-white/[0.06]"
        )}
        title="Respostas rápidas"
      >
        <Zap className="w-4 h-4" />
      </button>

      {open && (
        <div
          ref={popoverRef}
          className="absolute bottom-full left-0 mb-2 w-72 rounded-xl border border-white/[0.10] bg-[#111827] shadow-2xl z-50"
        >
          <div className="p-2 border-b border-white/[0.07]">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30" />
              <input
                autoFocus
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar resposta..."
                className="w-full pl-8 pr-3 py-1.5 text-sm bg-white/[0.04] border border-white/[0.07] rounded-lg text-white/90 placeholder:text-white/30 outline-none focus:border-cyan-500/40"
              />
            </div>
          </div>

          <div className="max-h-56 overflow-y-auto">
            {loading && (
              <div className="p-4 text-center text-white/40 text-sm">Carregando...</div>
            )}
            {!loading && filtered.length === 0 && (
              <div className="p-4 text-center text-white/40 text-sm">
                Nenhuma resposta encontrada
              </div>
            )}
            {filtered.map((reply) => (
              <button
                key={reply.id}
                type="button"
                onClick={() => {
                  onSelect(reply.content)
                  setOpen(false)
                  setSearch("")
                }}
                className="w-full px-3 py-2.5 text-left hover:bg-white/[0.05] transition-colors"
              >
                <p className="text-sm font-medium text-white/90 truncate">{reply.title}</p>
                <p className="text-xs text-white/40 truncate mt-0.5">{reply.content}</p>
              </button>
            ))}
          </div>

          <div className="p-2 border-t border-white/[0.07]">
            <a
              href="/configuracoes/integracoes"
              className="flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 px-1 py-1 transition-colors"
            >
              <ExternalLink className="w-3 h-3" />
              Gerenciar respostas rápidas
            </a>
          </div>
        </div>
      )}
    </div>
  )
}
