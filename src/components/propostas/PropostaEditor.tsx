"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createProposal, sendProposal } from "@/server/actions/proposals"
import { formatarMoeda, formatarData } from "@/lib/utils"
import { toast } from "sonner"
import { Save, Send, FileText } from "lucide-react"

interface Deal {
  id: string
  title: string
}

interface Contact {
  id: string
  firstName: string
  lastName: string
}

interface PropostaEditorProps {
  deals?: Deal[]
  contacts?: Contact[]
}

export function PropostaEditor({ deals = [], contacts = [] }: PropostaEditorProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    title: "",
    dealId: "",
    contactId: "",
    totalValue: "",
    validUntil: "",
    content: "",
  })

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSaveDraft() {
    if (!form.title.trim()) {
      toast.error("O título é obrigatório.")
      return
    }
    try {
      setLoading(true)
      await createProposal({
        title: form.title,
        dealId: form.dealId || undefined,
        contactId: form.contactId || undefined,
        content: form.content,
        totalValue: parseFloat(form.totalValue) || 0,
        validUntil: form.validUntil ? new Date(form.validUntil) : undefined,
      })
      toast.success("Rascunho salvo!")
      router.push("/propostas")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao salvar proposta")
    } finally {
      setLoading(false)
    }
  }

  async function handleSendProposal() {
    if (!form.title.trim()) {
      toast.error("O título é obrigatório.")
      return
    }
    try {
      setLoading(true)
      const proposal = await createProposal({
        title: form.title,
        dealId: form.dealId || undefined,
        contactId: form.contactId || undefined,
        content: form.content,
        totalValue: parseFloat(form.totalValue) || 0,
        validUntil: form.validUntil ? new Date(form.validUntil) : undefined,
      })
      await sendProposal(proposal.id)
      toast.success("Proposta enviada com sucesso!")
      router.push("/propostas")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao enviar proposta")
    } finally {
      setLoading(false)
    }
  }

  const selectedContact = contacts.find((c) => c.id === form.contactId)
  const selectedDeal = deals.find((d) => d.id === form.dealId)

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
      {/* Editor */}
      <div className="glass rounded-xl p-6 flex flex-col gap-5">
        <div className="flex items-center gap-2 mb-1">
          <FileText className="h-5 w-5 text-cyan-400" />
          <h2 className="font-semibold text-foreground">Detalhes da Proposta</h2>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="title">Título *</Label>
          <Input
            id="title"
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="Ex: Proposta Comercial - Empresa ABC"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="dealId">Negociação</Label>
            <select
              id="dealId"
              name="dealId"
              value={form.dealId}
              onChange={handleChange}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
            >
              <option value="">Selecionar...</option>
              {deals.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.title}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="contactId">Contato</Label>
            <select
              id="contactId"
              name="contactId"
              value={form.contactId}
              onChange={handleChange}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
            >
              <option value="">Selecionar...</option>
              {contacts.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.firstName} {c.lastName}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="totalValue">Valor Total (R$)</Label>
            <Input
              id="totalValue"
              name="totalValue"
              type="number"
              min="0"
              step="0.01"
              value={form.totalValue}
              onChange={handleChange}
              placeholder="0,00"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="validUntil">Válida até</Label>
            <Input
              id="validUntil"
              name="validUntil"
              type="date"
              value={form.validUntil}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="space-y-1.5 flex-1">
          <Label htmlFor="content">Conteúdo da Proposta</Label>
          <textarea
            id="content"
            name="content"
            value={form.content}
            onChange={handleChange}
            rows={10}
            placeholder="Descreva os serviços, produtos, condições e termos da proposta..."
            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-cyan-500/50 resize-none"
          />
        </div>

        <div className="flex items-center gap-3 pt-2">
          <Button
            variant="outline"
            onClick={handleSaveDraft}
            disabled={loading}
            className="flex-1"
          >
            <Save className="h-4 w-4" />
            Salvar Rascunho
          </Button>
          <Button
            onClick={handleSendProposal}
            disabled={loading}
            className="flex-1"
            style={{ background: "linear-gradient(135deg, #06b6d4, #8b5cf6)" }}
          >
            <Send className="h-4 w-4" />
            Enviar Proposta
          </Button>
        </div>
      </div>

      {/* Preview */}
      <div className="glass rounded-xl p-6 flex flex-col gap-4">
        <h2 className="font-semibold text-foreground">Pré-visualização</h2>

        <div className="flex-1 rounded-lg border border-white/8 bg-white/2 p-6 space-y-6 text-sm">
          {/* Header */}
          <div className="border-b border-white/10 pb-4">
            <h1 className="text-xl font-bold text-foreground">
              {form.title || "Título da Proposta"}
            </h1>
            <div className="flex items-center gap-4 mt-2 text-muted-foreground text-xs">
              {selectedContact && (
                <span>
                  Para: {selectedContact.firstName} {selectedContact.lastName}
                </span>
              )}
              {selectedDeal && <span>Ref: {selectedDeal.title}</span>}
              {form.validUntil && (
                <span>Válida até: {formatarData(form.validUntil)}</span>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="text-foreground whitespace-pre-wrap leading-relaxed min-h-24">
            {form.content || (
              <span className="text-muted-foreground italic">
                O conteúdo da proposta será exibido aqui...
              </span>
            )}
          </div>

          {/* Footer */}
          {form.totalValue && (
            <div className="border-t border-white/10 pt-4">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Valor Total</span>
                <span className="text-xl font-bold text-cyan-400">
                  {formatarMoeda(parseFloat(form.totalValue) || 0)}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
