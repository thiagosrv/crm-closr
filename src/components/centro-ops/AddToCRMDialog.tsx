"use client"

import { useState } from "react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { Loader2, UserPlus } from "lucide-react"

interface AddToCRMDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  conversationId: string
  onSuccess: () => void
}

export function AddToCRMDialog({
  open,
  onOpenChange,
  conversationId,
  onSuccess,
}: AddToCRMDialogProps) {
  const [loading, setLoading] = useState(false)

  if (!open) return null

  async function handleConfirm() {
    setLoading(true)
    try {
      const res = await fetch(
        `/api/channels/whatsapp/conversations/${conversationId}/add-to-crm`,
        { method: "POST" }
      )
      if (!res.ok) throw new Error("Erro ao criar lead")
      toast.success("Lead criado! Acesse em /leads")
      onSuccess()
      onOpenChange(false)
    } catch {
      toast.error("Não foi possível criar o lead. Tente novamente.")
    } finally {
      setLoading(false)
    }
  }

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onOpenChange(false)
      }}
    >
      <div className="glass brutal-card rounded-xl w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center gap-3 p-5 border-b border-white/[0.07]">
          <div className="w-9 h-9 rounded-lg bg-cyan-500/15 border border-cyan-500/20 flex items-center justify-center">
            <UserPlus className="w-4 h-4 text-cyan-400" />
          </div>
          <div>
            <h2 className="text-base font-black tracking-tighter text-white">Adicionar ao CRM</h2>
            <p className="text-xs text-white/50">Criar lead a partir da conversa</p>
          </div>
        </div>

        {/* Body */}
        <div className="p-5">
          <p className="text-sm text-white/70 leading-relaxed">
            Será criado um <span className="text-white font-semibold">Lead</span> com os dados desta
            conversa. Os dados do contato serão extraídos automaticamente do WhatsApp.
          </p>
          <div className="mt-4 p-3 rounded-lg bg-white/[0.03] border border-white/[0.06] text-xs text-white/50">
            O lead será criado na primeira etapa do seu pipeline e ficará disponível em{" "}
            <span className="text-cyan-400">/leads</span>.
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 p-5 pt-0">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            disabled={loading}
            className="px-4 py-2 text-sm text-white/60 hover:text-white/90 transition-colors rounded-lg hover:bg-white/[0.04] disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={loading}
            className={cn(
              "flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-all",
              "bg-cyan-500 hover:bg-cyan-400 text-white disabled:opacity-60 disabled:cursor-not-allowed"
            )}
          >
            {loading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Criando...
              </>
            ) : (
              "Confirmar"
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
