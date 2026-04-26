"use client"

import { useState } from "react"
import { Search, Plus, Zap, Trash2, CheckCircle, ArrowRightCircle } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { EmptyState } from "@/components/shared/EmptyState"
import { LeadScoreBadge } from "./LeadScoreBadge"
import { LeadFormDialog } from "./LeadFormDialog"
import { deleteLead, updateLead } from "@/server/actions/leads"
import { formatarMoeda, formatarDataRelativa, cn } from "@/lib/utils"
import { toast } from "sonner"

type LeadStatus = "NEW" | "CONTACTED" | "QUALIFIED" | "DISQUALIFIED" | "CONVERTED"

interface Lead {
  id: string
  title: string
  source: string
  status: LeadStatus
  score: number
  estimatedValue?: number | null
  createdAt: Date
  contact?: {
    firstName: string
    lastName: string
    company?: string | null
  } | null
  assignedTo?: {
    name: string
    email: string
  } | null
}

interface LeadTableProps {
  leads: Lead[]
  total: number
}

const STATUS_LABEL: Record<LeadStatus, string> = {
  NEW: "Novo",
  CONTACTED: "Contactado",
  QUALIFIED: "Qualificado",
  DISQUALIFIED: "Desqualificado",
  CONVERTED: "Convertido",
}

const STATUS_CLASSES: Record<LeadStatus, string> = {
  NEW: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  CONTACTED: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  QUALIFIED: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  DISQUALIFIED: "bg-red-500/10 text-red-400 border-red-500/20",
  CONVERTED: "bg-green-500/10 text-green-400 border-green-500/20",
}

const SOURCE_LABEL: Record<string, string> = {
  MANUAL: "Manual",
  WEBSITE: "Website",
  LINKEDIN: "LinkedIn",
  REFERRAL: "Indicação",
  COLD_CALL: "Cold Call",
  INSTAGRAM: "Instagram",
  FACEBOOK: "Facebook",
  ADS: "Anúncios",
  EVENT: "Evento",
  WHATSAPP: "WhatsApp",
  EMAIL: "Email",
  OTHER: "Outro",
}

export function LeadTable({ leads, total }: LeadTableProps) {
  const [search, setSearch] = useState("")
  const [createOpen, setCreateOpen] = useState(false)

  const filtered = leads.filter((l) => {
    if (!search) return true
    const q = search.toLowerCase()
    return (
      l.title.toLowerCase().includes(q) ||
      (l.contact?.firstName ?? "").toLowerCase().includes(q) ||
      (l.contact?.lastName ?? "").toLowerCase().includes(q) ||
      (l.contact?.company ?? "").toLowerCase().includes(q)
    )
  })

  async function handleQualify(lead: Lead) {
    try {
      await updateLead(lead.id, { status: "QUALIFIED" })
      toast.success("Lead qualificado!")
    } catch {
      toast.error("Erro ao qualificar lead.")
    }
  }

  async function handleDelete(lead: Lead) {
    if (!confirm(`Excluir lead "${lead.title}"?`)) return
    try {
      await deleteLead(lead.id)
      toast.success("Lead excluído.")
    } catch {
      toast.error("Erro ao excluir lead.")
    }
  }

  return (
    <>
      {/* Toolbar */}
      <div className="flex items-center gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar leads..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="ml-auto flex items-center gap-2">
          <span className="text-sm text-muted-foreground hidden sm:block">
            {total} lead{total !== 1 ? "s" : ""}
          </span>
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="h-4 w-4 mr-1" />
            Novo Lead
          </Button>
        </div>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={Zap}
          title={search ? "Nenhum lead encontrado" : "Nenhum lead ainda"}
          description={
            search
              ? "Tente buscar por outro título ou contato."
              : "Comece capturando seu primeiro lead."
          }
          action={
            !search
              ? { label: "Novo Lead", onClick: () => setCreateOpen(true) }
              : undefined
          }
        />
      ) : (
        <div className="glass rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/8 text-left">
                  <th className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Título
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Origem
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Status
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Score
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Valor Est.
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Responsável
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Data
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filtered.map((lead) => (
                  <tr key={lead.id} className="hover:bg-white/2 transition-colors">
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-foreground">{lead.title}</p>
                        {lead.contact && (
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {lead.contact.firstName} {lead.contact.lastName}
                            {lead.contact.company && ` · ${lead.contact.company}`}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        variant="outline"
                        className="text-xs"
                      >
                        {SOURCE_LABEL[lead.source] ?? lead.source}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold border",
                          STATUS_CLASSES[lead.status]
                        )}
                      >
                        {STATUS_LABEL[lead.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="space-y-1">
                        <LeadScoreBadge score={lead.score} />
                        <div className="w-20 h-1.5 rounded-full bg-white/10">
                          <div
                            className="h-full rounded-full bg-cyan-500 transition-all"
                            style={{ width: `${lead.score}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {lead.estimatedValue != null
                        ? formatarMoeda(lead.estimatedValue)
                        : <span className="text-muted-foreground">—</span>}
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {lead.assignedTo?.name ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {formatarDataRelativa(lead.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        {lead.status !== "QUALIFIED" && lead.status !== "CONVERTED" && lead.status !== "DISQUALIFIED" && (
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            title="Qualificar"
                            onClick={() => handleQualify(lead)}
                          >
                            <CheckCircle className="h-3.5 w-3.5 text-cyan-400" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          title="Excluir"
                          onClick={() => handleDelete(lead)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <LeadFormDialog open={createOpen} onOpenChange={setCreateOpen} />
    </>
  )
}
