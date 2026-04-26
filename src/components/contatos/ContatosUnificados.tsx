"use client"

import { useState } from "react"
import { Search, Plus, Phone, Mail, Building2, ExternalLink, Kanban, User } from "lucide-react"
import Link from "next/link"
import { ContatoFormDialog } from "./ContatoFormDialog"

interface Stage {
  id: string
  name: string
  color: string
}

interface ContactWithRelations {
  id: string
  firstName: string
  lastName: string
  email: string | null
  phone: string | null
  company: string | null
  source: string
  createdAt: Date
  leads: { id: string; title: string; status: string }[]
  deals: { id: string; title: string; status: string; stage: { name: string; color: string } }[]
}

interface Props {
  contacts: ContactWithRelations[]
  stages: Stage[]
}

const STATUS_COLORS: Record<string, string> = {
  NEW: "#3B82F6", CONTACTED: "#F59E0B", QUALIFIED: "#84CC16",
  DISQUALIFIED: "#6B7280", CONVERTED: "#10B981",
  OPEN: "#3B82F6", WON: "#10B981", LOST: "#EF4444",
}
const STATUS_LABELS: Record<string, string> = {
  NEW: "Novo", CONTACTED: "Contatado", QUALIFIED: "Qualificado",
  DISQUALIFIED: "Desqualificado", CONVERTED: "Convertido",
  OPEN: "Aberto", WON: "Ganho", LOST: "Perdido",
}

export function ContatosUnificados({ contacts, stages }: Props) {
  const [search, setSearch]           = useState("")
  const [filter, setFilter]           = useState<"all" | "leads" | "contacts">("all")
  const [addContactOpen, setAddContactOpen] = useState(false)

  const filtered = contacts.filter(c => {
    const fullName = `${c.firstName} ${c.lastName}`.toLowerCase()
    const q = search.toLowerCase()
    if (q && !fullName.includes(q) && !(c.email?.toLowerCase().includes(q)) && !(c.company?.toLowerCase().includes(q))) return false
    if (filter === "leads"    && c.deals.length === 0 && c.leads.length === 0) return false
    if (filter === "contacts" && (c.deals.length > 0 || c.leads.length > 0))   return false
    return true
  })

  return (
    <div className="p-4 sm:p-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5 sm:mb-6 pb-4"
        style={{ borderBottom: "2px solid #0F2044" }}
      >
        <div>
          <h1 className="brutal-heading text-2xl sm:text-3xl">Listas de Contatos</h1>
          <p className="text-[#6B7280] text-sm font-medium mt-1">{contacts.length} contatos no total</p>
        </div>
        <button
          onClick={() => setAddContactOpen(true)}
          className="brutal-btn-lime flex items-center gap-2 px-4 py-2.5 text-sm font-black self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Novo Contato
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-5">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280]" />
          <input
            type="text"
            placeholder="Buscar por nome, e-mail ou empresa..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="brutal-input w-full pl-10 pr-4 py-2 text-sm"
          />
        </div>
        {/* Filter tabs */}
        <div className="flex shrink-0" style={{ border: "2px solid #0F2044", borderRadius: "2px" }}>
          {(["all", "leads", "contacts"] as const).map((f, i) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className="flex-1 sm:flex-none px-3 sm:px-4 py-2 text-xs font-black uppercase tracking-wide transition-all"
              style={{
                background: filter === f ? "#0F2044" : "#FFFFFF",
                color:      filter === f ? "#FFFFFF"  : "#0F2044",
                borderRight: i < 2 ? "2px solid #0F2044" : "none",
              }}
            >
              {f === "all" ? "Todos" : f === "leads" ? "No Funil" : "Contatos"}
            </button>
          ))}
        </div>
      </div>

      {/* Desktop table */}
      <div className="brutal-card overflow-hidden hidden sm:block">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px]">
            <thead>
              <tr style={{ background: "#0F2044" }}>
                <th className="px-4 py-3 text-left text-[10px] font-black uppercase tracking-widest text-white">Nome</th>
                <th className="px-4 py-3 text-left text-[10px] font-black uppercase tracking-widest text-white">Empresa</th>
                <th className="px-4 py-3 text-left text-[10px] font-black uppercase tracking-widest text-white hidden md:table-cell">Contato</th>
                <th className="px-4 py-3 text-left text-[10px] font-black uppercase tracking-widest text-white">Status</th>
                <th className="px-4 py-3 text-left text-[10px] font-black uppercase tracking-widest text-white">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-[#6B7280] font-medium text-sm">
                    Nenhum contato encontrado.{" "}
                    <button onClick={() => setAddContactOpen(true)} className="font-black" style={{ color: "#84CC16" }}>
                      Adicionar agora →
                    </button>
                  </td>
                </tr>
              ) : (
                filtered.map((c, idx) => {
                  const activeDeal = c.deals.find(d => d.status === "OPEN") ?? c.deals[0]
                  return (
                    <tr
                      key={c.id}
                      style={{
                        borderBottom: "1px solid rgba(15,32,68,0.15)",
                        background: idx % 2 === 0 ? "#FFFFFF" : "#FAFAFA",
                      }}
                      onMouseEnter={e => (e.currentTarget.style.background = "#F4F4F4")}
                      onMouseLeave={e => (e.currentTarget.style.background = idx % 2 === 0 ? "#FFFFFF" : "#FAFAFA")}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-8 h-8 shrink-0 flex items-center justify-center text-[10px] font-black"
                            style={{ background: "#84CC16", border: "2px solid #0F2044", borderRadius: "2px" }}
                          >
                            {c.firstName[0]}{c.lastName[0]}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-black text-[#0F2044] truncate">{c.firstName} {c.lastName}</p>
                            {c.email && <p className="text-xs text-[#6B7280] truncate">{c.email}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {c.company ? (
                          <div className="flex items-center gap-1.5">
                            <Building2 className="w-3.5 h-3.5 text-[#6B7280] shrink-0" />
                            <span className="text-sm text-[#0F2044] font-medium truncate">{c.company}</span>
                          </div>
                        ) : <span className="text-xs text-[#6B7280]">—</span>}
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <div className="flex flex-col gap-1">
                          {c.phone && <div className="flex items-center gap-1.5 text-xs text-[#0F2044]"><Phone className="w-3 h-3" />{c.phone}</div>}
                          {c.email && <div className="flex items-center gap-1.5 text-xs text-[#6B7280]"><Mail className="w-3 h-3" />{c.email}</div>}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {activeDeal ? (
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 shrink-0" style={{ background: activeDeal.stage.color, border: "1.5px solid #0F2044", borderRadius: "2px" }} />
                            <span className="text-xs font-black text-[#0F2044] truncate">{activeDeal.stage.name}</span>
                          </div>
                        ) : c.leads[0] ? (
                          <span className="text-[10px] font-black px-2 py-0.5 uppercase" style={{ background: STATUS_COLORS[c.leads[0].status] ?? "#6B7280", color: "#FFFFFF", border: "1.5px solid #0F2044", borderRadius: "2px" }}>
                            {STATUS_LABELS[c.leads[0].status] ?? c.leads[0].status}
                          </span>
                        ) : (
                          <span className="text-xs text-[#6B7280]"><User className="w-3 h-3 inline mr-1" />Contato</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {activeDeal && (
                            <Link href="/funis" className="flex items-center gap-1 text-[10px] font-black px-2 py-1 uppercase" style={{ background: "#84CC16", border: "2px solid #0F2044", borderRadius: "2px", color: "#0F2044" }}>
                              <Kanban className="w-3 h-3" /> Funil
                            </Link>
                          )}
                          <Link href={`/contatos/${c.id}`} className="flex items-center gap-1 text-[10px] font-black px-2 py-1 uppercase" style={{ background: "#FFFFFF", border: "2px solid #0F2044", borderRadius: "2px", color: "#0F2044" }}>
                            <ExternalLink className="w-3 h-3" /> Ver
                          </Link>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile card list */}
      <div className="sm:hidden space-y-3">
        {filtered.length === 0 ? (
          <div className="brutal-card p-8 text-center text-[#6B7280] font-medium text-sm">
            Nenhum contato encontrado.{" "}
            <button onClick={() => setAddContactOpen(true)} className="font-black" style={{ color: "#84CC16" }}>
              Adicionar →
            </button>
          </div>
        ) : (
          filtered.map(c => {
            const activeDeal = c.deals.find(d => d.status === "OPEN") ?? c.deals[0]
            return (
              <div key={c.id} className="brutal-card p-4">
                <div className="flex items-start gap-3 mb-3">
                  <div
                    className="w-9 h-9 shrink-0 flex items-center justify-center text-[10px] font-black"
                    style={{ background: "#84CC16", border: "2px solid #0F2044", borderRadius: "2px" }}
                  >
                    {c.firstName[0]}{c.lastName[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-black text-[#0F2044] truncate">{c.firstName} {c.lastName}</p>
                    {c.company && <p className="text-xs text-[#6B7280] truncate">{c.company}</p>}
                    {c.email && <p className="text-xs text-[#6B7280] truncate">{c.email}</p>}
                  </div>
                  {activeDeal && (
                    <div className="flex items-center gap-1.5 shrink-0">
                      <div className="w-2 h-2" style={{ background: activeDeal.stage.color, border: "1.5px solid #0F2044", borderRadius: "2px" }} />
                      <span className="text-[10px] font-black text-[#0F2044]">{activeDeal.stage.name}</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {activeDeal && (
                    <Link href="/funis" className="flex items-center gap-1 text-[10px] font-black px-2.5 py-1.5 uppercase" style={{ background: "#84CC16", border: "2px solid #0F2044", borderRadius: "2px", color: "#0F2044" }}>
                      <Kanban className="w-3 h-3" /> Funil
                    </Link>
                  )}
                  <Link href={`/contatos/${c.id}`} className="flex items-center gap-1 text-[10px] font-black px-2.5 py-1.5 uppercase" style={{ background: "#FFFFFF", border: "2px solid #0F2044", borderRadius: "2px", color: "#0F2044" }}>
                    <ExternalLink className="w-3 h-3" /> Ver detalhes
                  </Link>
                </div>
              </div>
            )
          })
        )}
      </div>

      <ContatoFormDialog open={addContactOpen} onOpenChange={setAddContactOpen} />
    </div>
  )
}
