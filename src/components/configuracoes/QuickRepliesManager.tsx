"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import { Plus, Trash2, Loader2, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface QuickReply {
  id: string
  title: string
  type: string
  content: string
}

export function QuickRepliesManager() {
  const [replies, setReplies] = useState<QuickReply[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const [form, setForm] = useState({ title: "", type: "TEXTO", content: "" })

  useEffect(() => {
    fetchReplies()
  }, [])

  async function fetchReplies() {
    try {
      const res = await fetch("/api/quick-replies")
      if (!res.ok) throw new Error()
      const data = await res.json()
      setReplies(Array.isArray(data) ? data : [])
    } catch {
      toast.error("Não foi possível carregar as respostas rápidas.")
    } finally {
      setLoading(false)
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title.trim() || !form.content.trim()) {
      toast.error("Preencha o título e o conteúdo.")
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch("/api/quick-replies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error()
      const newReply = await res.json()
      setReplies((prev) => [newReply, ...prev])
      setForm({ title: "", type: "TEXTO", content: "" })
      setShowForm(false)
      toast.success("Resposta rápida criada!")
    } catch {
      toast.error("Não foi possível criar a resposta rápida.")
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(id: string) {
    setDeletingId(id)
    try {
      const res = await fetch(`/api/quick-replies/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error()
      setReplies((prev) => prev.filter((r) => r.id !== id))
      toast.success("Resposta removida.")
    } catch {
      toast.error("Não foi possível remover a resposta.")
    } finally {
      setDeletingId(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-white/40 text-sm py-4">
        <Loader2 className="w-4 h-4 animate-spin" />
        Carregando…
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {/* List */}
      <div className="flex flex-col gap-2">
        {replies.length === 0 && !showForm && (
          <p className="text-sm text-white/40 py-2">
            Nenhuma resposta rápida cadastrada.
          </p>
        )}
        {replies.map((reply) => (
          <div
            key={reply.id}
            className="flex items-start gap-3 p-3 rounded-lg bg-white/[0.03] border border-white/[0.06] group"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-sm font-semibold text-white/90 truncate">{reply.title}</span>
                <span className="text-[10px] text-white/30 border border-white/[0.07] px-1.5 py-0.5 rounded uppercase tracking-wide shrink-0">
                  {reply.type}
                </span>
              </div>
              <p className="text-xs text-white/50 truncate">{reply.content}</p>
            </div>
            <button
              type="button"
              onClick={() => handleDelete(reply.id)}
              disabled={deletingId === reply.id}
              className="shrink-0 opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-white/30 hover:text-red-400 hover:bg-red-500/10 transition-all disabled:opacity-50"
            >
              {deletingId === reply.id ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Trash2 className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        ))}
      </div>

      {/* Inline form */}
      {showForm && (
        <form
          onSubmit={handleCreate}
          className="flex flex-col gap-3 p-4 rounded-xl border border-white/[0.10] bg-white/[0.03]"
        >
          <p className="text-xs font-bold text-white/60 uppercase tracking-widest">
            Nova Resposta Rápida
          </p>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-white/50">Título</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="Ex: Boas-vindas"
              className="bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white/90 placeholder:text-white/30 outline-none focus:border-cyan-500/40 transition-colors"
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-white/50">Tipo</label>
            <div className="relative">
              <select
                value={form.type}
                onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
                className="w-full appearance-none bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white/90 outline-none focus:border-cyan-500/40 transition-colors pr-8"
              >
                <option value="TEXTO">Texto</option>
                <option value="AUDIO">Áudio</option>
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-white/50">Conteúdo</label>
            <textarea
              value={form.content}
              onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
              placeholder="Digite a mensagem…"
              rows={3}
              className="bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white/90 placeholder:text-white/30 outline-none focus:border-cyan-500/40 transition-colors resize-none"
              required
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <button
              type="submit"
              disabled={submitting}
              className={cn(
                "flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-all",
                "bg-cyan-500 hover:bg-cyan-400 text-white disabled:opacity-60 disabled:cursor-not-allowed"
              )}
            >
              {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
              Salvar
            </button>
            <button
              type="button"
              onClick={() => {
                setShowForm(false)
                setForm({ title: "", type: "TEXTO", content: "" })
              }}
              className="px-4 py-2 text-sm text-white/50 hover:text-white/80 transition-colors rounded-lg hover:bg-white/[0.04]"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      {/* Add button */}
      {!showForm && (
        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 self-start px-4 py-2 text-sm font-medium rounded-lg border border-white/[0.10] bg-white/[0.04] text-white/70 hover:bg-white/[0.08] hover:text-white transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nova Resposta
        </button>
      )}
    </div>
  )
}
