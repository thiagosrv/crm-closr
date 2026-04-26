"use client"

import { useState } from "react"
import { PropostaStatusBadge } from "./PropostaStatusBadge"
import { ConfirmDialog } from "@/components/shared/ConfirmDialog"
import { Button } from "@/components/ui/button"
import { formatarMoeda, formatarData } from "@/lib/utils"
import { sendProposal, deleteProposal, duplicateProposal } from "@/server/actions/proposals"
import { toast } from "sonner"
import { Send, Eye, Copy, Trash2, FileText } from "lucide-react"
import Link from "next/link"

interface Proposal {
  id: string
  title: string
  status: "DRAFT" | "SENT" | "VIEWED" | "ACCEPTED" | "DECLINED" | "EXPIRED"
  totalValue: number
  sentAt: Date | null
  validUntil: Date | null
  deal: { id: string; title: string } | null
  contact: { id: string; firstName: string; lastName: string; email: string | null } | null
}

interface PropostaCardProps {
  proposta: Proposal
}

export function PropostaCard({ proposta }: PropostaCardProps) {
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [loading, setLoading] = useState(false)

  const contactName = proposta.contact
    ? `${proposta.contact.firstName} ${proposta.contact.lastName}`
    : null

  async function handleSend() {
    try {
      setLoading(true)
      await sendProposal(proposta.id)
      toast.success("Proposta enviada com sucesso!")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao enviar proposta")
    } finally {
      setLoading(false)
    }
  }

  async function handleDuplicate() {
    try {
      setLoading(true)
      await duplicateProposal(proposta.id)
      toast.success("Proposta duplicada!")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao duplicar proposta")
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete() {
    try {
      setLoading(true)
      await deleteProposal(proposta.id)
      toast.success("Proposta excluída.")
      setConfirmDelete(false)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao excluir proposta")
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="glass rounded-xl p-5 flex flex-col gap-4 hover:border-white/15 transition-colors border border-white/8">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-cyan-500/10">
              <FileText className="h-4 w-4 text-cyan-400" />
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-foreground truncate">{proposta.title}</h3>
              {contactName && (
                <p className="text-xs text-muted-foreground truncate">{contactName}</p>
              )}
            </div>
          </div>
          <PropostaStatusBadge status={proposta.status} />
        </div>

        {/* Details */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-xs text-muted-foreground mb-0.5">Valor Total</p>
            <p className="font-semibold text-foreground">{formatarMoeda(proposta.totalValue)}</p>
          </div>
          {proposta.deal && (
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">Negociação</p>
              <p className="text-foreground truncate">{proposta.deal.title}</p>
            </div>
          )}
          {proposta.sentAt && (
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">Enviada em</p>
              <p className="text-foreground">{formatarData(proposta.sentAt)}</p>
            </div>
          )}
          {proposta.validUntil && (
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">Válida até</p>
              <p className="text-foreground">{formatarData(proposta.validUntil)}</p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 pt-1 border-t border-white/6">
          {proposta.status === "DRAFT" && (
            <Button
              size="sm"
              onClick={handleSend}
              disabled={loading}
              className="flex-1"
            >
              <Send className="h-3.5 w-3.5" />
              Enviar
            </Button>
          )}
          <Link
            href={`/propostas/${proposta.id}`}
            className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium border border-white/20 bg-white/5 hover:bg-white/10 transition-colors"
          >
            <Eye className="h-3.5 w-3.5" />
            Ver
          </Link>
          <Button
            size="sm"
            variant="outline"
            onClick={handleDuplicate}
            disabled={loading}
          >
            <Copy className="h-3.5 w-3.5" />
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={() => setConfirmDelete(true)}
            disabled={loading}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={handleDelete}
        title="Excluir proposta"
        description={`Tem certeza que deseja excluir a proposta "${proposta.title}"? Esta ação não pode ser desfeita.`}
        confirmLabel="Excluir"
        loading={loading}
      />
    </>
  )
}
