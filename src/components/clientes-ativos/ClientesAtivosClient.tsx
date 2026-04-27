"use client"

import { useState, useCallback } from "react"
import {
  Plus, Pencil, Trash2, X, TrendingUp, DollarSign,
  Users2, Target, Megaphone, BarChart2, ChevronDown, ChevronUp,
  Building2, CheckCircle2, AlertCircle, Clock4,
} from "lucide-react"
import { toast } from "sonner"

// ─── Types ────────────────────────────────────────────────────────────────────

interface ClienteAtivo {
  id: string
  empresa: string
  contato: string | null
  email: string | null
  telefone: string | null
  segmento: string | null
  valorNota: number
  valorLiquido: number
  impostos: number
  comissoes: number
  custosExtras: number
  custosFixos: number
  numeroPostos: number
  metaMensal: number
  metaAnual: number
  status: string
  observacoes: string | null
  createdAt: string
}

interface MetaConfig {
  metaMensal: number
  metaAnual: number
  percPublicidade: number
}

interface Props {
  initialClientes: ClienteAtivo[]
  initialMeta: MetaConfig
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const BRL = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(v)

const pct = (v: number, t: number) => (t === 0 ? 0 : Math.min(100, (v / t) * 100))

function lucroCliente(c: ClienteAtivo) {
  return c.valorLiquido - c.impostos - c.comissoes - c.custosExtras - c.custosFixos
}

const STATUS_OPTIONS = ["ATIVO", "PROSPECCAO", "INATIVO"]
const STATUS_LABEL: Record<string, string> = {
  ATIVO: "Ativo", PROSPECCAO: "Prospecção", INATIVO: "Inativo",
}
const STATUS_COLOR: Record<string, { bg: string; text: string; border: string }> = {
  ATIVO:      { bg: "#DCFCE7", text: "#166534", border: "#16A34A" },
  PROSPECCAO: { bg: "#FEF9C3", text: "#854D0E", border: "#CA8A04" },
  INATIVO:    { bg: "#F3F4F6", text: "#6B7280", border: "#9CA3AF" },
}

const SEGMENTOS = [
  "Alimentação", "Construção Civil", "Educação", "Saúde", "Tecnologia",
  "Logística", "Varejo", "Serviços", "Indústria", "Outros",
]

const EMPTY_FORM = {
  empresa: "", contato: "", email: "", telefone: "", segmento: "",
  valorNota: "", valorLiquido: "", impostos: "", comissoes: "",
  custosExtras: "", custosFixos: "", numeroPostos: "1",
  metaMensal: "", metaAnual: "", status: "ATIVO", observacoes: "",
}

// ─── Metric Card ─────────────────────────────────────────────────────────────

function MetricCard({
  label, value, sub, icon: Icon, accent, progress,
}: {
  label: string; value: string; sub?: string; icon: React.ElementType
  accent: string; progress?: number
}) {
  return (
    <div className="brutal-card p-4 sm:p-5 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <div
          className="w-9 h-9 flex items-center justify-center shrink-0"
          style={{ background: accent, border: "2px solid #0F2044" }}
        >
          <Icon className="w-4 h-4 text-white" />
        </div>
        {sub && (
          <span className="text-[9px] font-black uppercase tracking-widest text-[#6B7280] text-right leading-tight">
            {sub}
          </span>
        )}
      </div>
      <div>
        <p className="text-xl sm:text-2xl font-black text-[#0F2044] leading-tight">{value}</p>
        <p className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wide mt-0.5">{label}</p>
      </div>
      {progress !== undefined && (
        <div>
          <div className="h-2 w-full rounded-none" style={{ background: "#E5E7EB", border: "1px solid #0F2044" }}>
            <div
              className="h-full transition-all"
              style={{ width: `${progress}%`, background: progress >= 100 ? "#84CC16" : "#0F2044" }}
            />
          </div>
          <p className="text-[9px] font-bold text-[#6B7280] mt-1">{progress.toFixed(0)}% da meta</p>
        </div>
      )}
    </div>
  )
}

// ─── Form Modal ───────────────────────────────────────────────────────────────

function ClienteModal({
  open, onClose, onSaved, editing,
}: {
  open: boolean; onClose: () => void; onSaved: (c: ClienteAtivo) => void
  editing: ClienteAtivo | null
}) {
  const [form, setForm] = useState({ ...EMPTY_FORM })
  const [saving, setSaving] = useState(false)
  const [showAdv, setShowAdv] = useState(false)

  // Sync form when editing changes
  useState(() => {
    if (editing) {
      setForm({
        empresa: editing.empresa,
        contato: editing.contato ?? "",
        email: editing.email ?? "",
        telefone: editing.telefone ?? "",
        segmento: editing.segmento ?? "",
        valorNota: String(editing.valorNota || ""),
        valorLiquido: String(editing.valorLiquido || ""),
        impostos: String(editing.impostos || ""),
        comissoes: String(editing.comissoes || ""),
        custosExtras: String(editing.custosExtras || ""),
        custosFixos: String(editing.custosFixos || ""),
        numeroPostos: String(editing.numeroPostos || 1),
        metaMensal: String(editing.metaMensal || ""),
        metaAnual: String(editing.metaAnual || ""),
        status: editing.status,
        observacoes: editing.observacoes ?? "",
      })
    } else {
      setForm({ ...EMPTY_FORM })
    }
  })

  // Recalculate valorLiquido hint
  const notaNum = parseFloat(form.valorNota) || 0
  const impostosNum = parseFloat(form.impostos) || 0
  const suggestedLiquido = notaNum - impostosNum

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  async function handleSave() {
    if (!form.empresa.trim()) { toast.error("Nome da empresa é obrigatório"); return }
    setSaving(true)
    try {
      const url = editing ? `/api/clientes-ativos/${editing.id}` : "/api/clientes-ativos"
      const method = editing ? "PATCH" : "POST"
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          valorNota: parseFloat(form.valorNota) || 0,
          valorLiquido: parseFloat(form.valorLiquido) || 0,
          impostos: parseFloat(form.impostos) || 0,
          comissoes: parseFloat(form.comissoes) || 0,
          custosExtras: parseFloat(form.custosExtras) || 0,
          custosFixos: parseFloat(form.custosFixos) || 0,
          numeroPostos: parseInt(form.numeroPostos) || 1,
          metaMensal: parseFloat(form.metaMensal) || 0,
          metaAnual: parseFloat(form.metaAnual) || 0,
        }),
      })
      if (!res.ok) throw new Error("Erro ao salvar")
      const saved = await res.json()
      onSaved(saved)
      toast.success(editing ? "Cliente atualizado!" : "Cliente adicionado!")
      onClose()
    } catch {
      toast.error("Erro ao salvar cliente")
    } finally {
      setSaving(false)
    }
  }

  if (!open) return null

  const inputCls = "w-full px-3 py-2 text-sm font-medium text-[#0F2044] bg-white outline-none"
  const inputStyle = { border: "2px solid #0F2044", borderRadius: "2px", boxShadow: "2px 2px 0 #0F2044" }
  const focusStyle = { borderColor: "#84CC16", boxShadow: "2px 2px 0 #84CC16" }

  function InputField({ label, field, type = "text", placeholder = "" }: {
    label: string; field: string; type?: string; placeholder?: string
  }) {
    return (
      <div>
        <label className="block text-[10px] font-black text-[#0F2044] uppercase tracking-wider mb-1">{label}</label>
        <input
          type={type}
          value={(form as Record<string, string>)[field]}
          onChange={e => set(field, e.target.value)}
          placeholder={placeholder}
          className={inputCls}
          style={inputStyle}
          onFocus={e => Object.assign(e.currentTarget.style, focusStyle)}
          onBlur={e => Object.assign(e.currentTarget.style, inputStyle)}
        />
      </div>
    )
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(15,32,68,0.6)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl max-h-[90vh] flex flex-col"
        style={{ background: "#FFF", border: "3px solid #0F2044", boxShadow: "8px 8px 0 #0F2044", borderRadius: "2px" }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 shrink-0" style={{ borderBottom: "2px solid #0F2044" }}>
          <h2 className="font-black text-[#0F2044] text-lg uppercase tracking-tight">
            {editing ? "Editar Cliente" : "Novo Cliente Ativo"}
          </h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 transition-colors">
            <X className="w-5 h-5 text-[#0F2044]" />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 p-5 space-y-4">
          {/* Status badges */}
          <div>
            <label className="block text-[10px] font-black text-[#0F2044] uppercase tracking-wider mb-2">Status</label>
            <div className="flex gap-2 flex-wrap">
              {STATUS_OPTIONS.map(s => (
                <button
                  key={s}
                  onClick={() => set("status", s)}
                  className="px-3 py-1.5 text-xs font-black transition-all"
                  style={form.status === s ? {
                    background: STATUS_COLOR[s].bg,
                    color: STATUS_COLOR[s].text,
                    border: `2px solid ${STATUS_COLOR[s].border}`,
                    boxShadow: `2px 2px 0 ${STATUS_COLOR[s].border}`,
                    borderRadius: "2px",
                  } : {
                    background: "#F4F4F4",
                    color: "#6B7280",
                    border: "2px solid #D1D5DB",
                    borderRadius: "2px",
                  }}
                >
                  {STATUS_LABEL[s]}
                </button>
              ))}
            </div>
          </div>

          {/* Empresa + Segmento */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <InputField label="Empresa *" field="empresa" placeholder="Nome da empresa" />
            <div>
              <label className="block text-[10px] font-black text-[#0F2044] uppercase tracking-wider mb-1">Segmento</label>
              <select
                value={form.segmento}
                onChange={e => set("segmento", e.target.value)}
                className={inputCls}
                style={inputStyle}
              >
                <option value="">Selecionar…</option>
                {SEGMENTOS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          {/* Contato */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <InputField label="Contato" field="contato" placeholder="Nome do responsável" />
            <InputField label="Telefone" field="telefone" placeholder="(00) 00000-0000" />
            <InputField label="E-mail" field="email" type="email" placeholder="email@empresa.com" />
          </div>

          {/* Financeiro — principal */}
          <div style={{ borderTop: "2px dashed #E5E7EB", paddingTop: "12px" }}>
            <p className="text-[10px] font-black text-[#0F2044] uppercase tracking-widest mb-3">Financeiro Mensal</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <InputField label="Valor da Nota (R$)" field="valorNota" type="number" placeholder="0,00" />
              <InputField label="Impostos (R$)" field="impostos" type="number" placeholder="0,00" />
              <div>
                <label className="block text-[10px] font-black text-[#0F2044] uppercase tracking-wider mb-1">
                  Valor Líquido (R$)
                </label>
                <input
                  type="number"
                  value={form.valorLiquido}
                  onChange={e => set("valorLiquido", e.target.value)}
                  placeholder={suggestedLiquido > 0 ? String(suggestedLiquido.toFixed(0)) : "0,00"}
                  className={inputCls}
                  style={inputStyle}
                  onFocus={e => Object.assign(e.currentTarget.style, focusStyle)}
                  onBlur={e => Object.assign(e.currentTarget.style, inputStyle)}
                />
                {suggestedLiquido > 0 && !form.valorLiquido && (
                  <p className="text-[9px] text-[#84CC16] font-bold mt-0.5">
                    Sugerido: {BRL(suggestedLiquido)}
                  </p>
                )}
              </div>
              <InputField label="Comissões (R$)" field="comissoes" type="number" placeholder="0,00" />
              <InputField label="Custos Extras (R$)" field="custosExtras" type="number" placeholder="0,00" />
              <InputField label="Custos Fixos (R$)" field="custosFixos" type="number" placeholder="0,00" />
            </div>
          </div>

          {/* Postos + Metas */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <InputField label="Nº de Postos" field="numeroPostos" type="number" placeholder="1" />
            <InputField label="Meta Mensal (R$)" field="metaMensal" type="number" placeholder="0,00" />
            <InputField label="Meta Anual (R$)" field="metaAnual" type="number" placeholder="0,00" />
          </div>

          {/* Observações */}
          <div>
            <button
              onClick={() => setShowAdv(v => !v)}
              className="flex items-center gap-1 text-[10px] font-black text-[#6B7280] uppercase tracking-widest mb-2"
            >
              {showAdv ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              Observações
            </button>
            {showAdv && (
              <textarea
                value={form.observacoes}
                onChange={e => set("observacoes", e.target.value)}
                rows={3}
                placeholder="Notas internas sobre este cliente…"
                className="w-full px-3 py-2 text-sm font-medium text-[#0F2044] bg-white resize-none outline-none"
                style={inputStyle}
                onFocus={e => Object.assign(e.currentTarget.style, focusStyle)}
                onBlur={e => Object.assign(e.currentTarget.style, inputStyle)}
              />
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-4 flex gap-3 justify-end shrink-0" style={{ borderTop: "2px solid #0F2044" }}>
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-black text-[#6B7280] transition-all"
            style={{ border: "2px solid #D1D5DB", borderRadius: "2px" }}
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2 text-sm font-black transition-all"
            style={{
              background: "#84CC16", color: "#0F2044",
              border: "2px solid #0F2044",
              boxShadow: "3px 3px 0 #0F2044",
              borderRadius: "2px",
              opacity: saving ? 0.6 : 1,
            }}
          >
            {saving ? "Salvando…" : editing ? "Salvar Alterações" : "Adicionar Cliente"}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Meta Modal ───────────────────────────────────────────────────────────────

function MetaModal({ open, onClose, meta, onSaved }: {
  open: boolean; onClose: () => void
  meta: MetaConfig; onSaved: (m: MetaConfig) => void
}) {
  const [form, setForm] = useState({
    metaMensal: String(meta.metaMensal || ""),
    metaAnual: String(meta.metaAnual || ""),
    percPublicidade: String(meta.percPublicidade || 10),
  })
  const [saving, setSaving] = useState(false)

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))
  const inputCls = "w-full px-3 py-2 text-sm font-medium text-[#0F2044] bg-white outline-none"
  const inputStyle = { border: "2px solid #0F2044", borderRadius: "2px", boxShadow: "2px 2px 0 #0F2044" }
  const focusStyle = { borderColor: "#84CC16", boxShadow: "2px 2px 0 #84CC16" }

  async function handleSave() {
    setSaving(true)
    try {
      const res = await fetch("/api/clientes-ativos/meta", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          metaMensal: parseFloat(form.metaMensal) || 0,
          metaAnual: parseFloat(form.metaAnual) || 0,
          percPublicidade: parseFloat(form.percPublicidade) || 10,
        }),
      })
      if (!res.ok) throw new Error()
      const saved = await res.json()
      onSaved(saved)
      toast.success("Metas salvas!")
      onClose()
    } catch {
      toast.error("Erro ao salvar metas")
    } finally {
      setSaving(false)
    }
  }

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(15,32,68,0.6)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm"
        style={{ background: "#FFF", border: "3px solid #0F2044", boxShadow: "8px 8px 0 #0F2044", borderRadius: "2px" }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: "2px solid #0F2044" }}>
          <h2 className="font-black text-[#0F2044] text-base uppercase tracking-tight">Configurar Metas</h2>
          <button onClick={onClose}><X className="w-5 h-5 text-[#0F2044]" /></button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="block text-[10px] font-black text-[#0F2044] uppercase tracking-wider mb-1">Meta de Faturamento Mensal (R$)</label>
            <input type="number" value={form.metaMensal} onChange={e => set("metaMensal", e.target.value)}
              className={inputCls} style={inputStyle}
              onFocus={e => Object.assign(e.currentTarget.style, focusStyle)}
              onBlur={e => Object.assign(e.currentTarget.style, inputStyle)} />
          </div>
          <div>
            <label className="block text-[10px] font-black text-[#0F2044] uppercase tracking-wider mb-1">Meta de Faturamento Anual (R$)</label>
            <input type="number" value={form.metaAnual} onChange={e => set("metaAnual", e.target.value)}
              className={inputCls} style={inputStyle}
              onFocus={e => Object.assign(e.currentTarget.style, focusStyle)}
              onBlur={e => Object.assign(e.currentTarget.style, inputStyle)} />
          </div>
          <div>
            <label className="block text-[10px] font-black text-[#0F2044] uppercase tracking-wider mb-1">
              % Saudável em Publicidade
            </label>
            <input type="number" min={0} max={100} value={form.percPublicidade} onChange={e => set("percPublicidade", e.target.value)}
              className={inputCls} style={inputStyle}
              onFocus={e => Object.assign(e.currentTarget.style, focusStyle)}
              onBlur={e => Object.assign(e.currentTarget.style, inputStyle)} />
            <p className="text-[9px] text-[#6B7280] font-medium mt-1">Recomendado: 8–12% do faturamento líquido</p>
          </div>
        </div>
        <div className="px-5 py-4 flex gap-3 justify-end" style={{ borderTop: "2px solid #0F2044" }}>
          <button onClick={onClose} className="px-4 py-2 text-sm font-black text-[#6B7280]"
            style={{ border: "2px solid #D1D5DB", borderRadius: "2px" }}>Cancelar</button>
          <button onClick={handleSave} disabled={saving}
            className="px-5 py-2 text-sm font-black"
            style={{ background: "#84CC16", color: "#0F2044", border: "2px solid #0F2044", boxShadow: "3px 3px 0 #0F2044", borderRadius: "2px" }}>
            {saving ? "Salvando…" : "Salvar"}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Delete Confirmation ──────────────────────────────────────────────────────

function DeleteModal({ open, empresa, onConfirm, onClose }: {
  open: boolean; empresa: string; onConfirm: () => void; onClose: () => void
}) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(15,32,68,0.6)" }} onClick={onClose}>
      <div className="w-full max-w-sm" style={{ background: "#FFF", border: "3px solid #0F2044", boxShadow: "8px 8px 0 #EF4444", borderRadius: "2px" }} onClick={e => e.stopPropagation()}>
        <div className="p-6 text-center">
          <div className="w-12 h-12 flex items-center justify-center mx-auto mb-3" style={{ background: "#FEE2E2", border: "2px solid #EF4444" }}>
            <Trash2 className="w-6 h-6 text-red-600" />
          </div>
          <h3 className="font-black text-[#0F2044] text-base mb-2">Remover cliente?</h3>
          <p className="text-sm text-[#6B7280] mb-5">
            <strong className="text-[#0F2044]">{empresa}</strong> será removido permanentemente da sua lista de clientes ativos.
          </p>
          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 py-2 text-sm font-black" style={{ border: "2px solid #D1D5DB", borderRadius: "2px" }}>Cancelar</button>
            <button onClick={onConfirm} className="flex-1 py-2 text-sm font-black text-white" style={{ background: "#EF4444", border: "2px solid #0F2044", boxShadow: "3px 3px 0 #0F2044", borderRadius: "2px" }}>Remover</button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ClientesAtivosClient({ initialClientes, initialMeta }: Props) {
  const [clientes, setClientes] = useState<ClienteAtivo[]>(initialClientes)
  const [meta, setMeta] = useState<MetaConfig>(initialMeta)
  const [modalOpen, setModalOpen] = useState(false)
  const [metaModalOpen, setMetaModalOpen] = useState(false)
  const [editing, setEditing] = useState<ClienteAtivo | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<ClienteAtivo | null>(null)
  const [filterStatus, setFilterStatus] = useState<string>("TODOS")
  const [search, setSearch] = useState("")

  // ── Derived metrics ──────────────────────────────────────────────────────
  const ativos = clientes.filter(c => c.status === "ATIVO")

  const faturamentoBruto   = ativos.reduce((s, c) => s + c.valorNota, 0)
  const faturamentoLiquido = ativos.reduce((s, c) => s + c.valorLiquido, 0)
  const totalLucro         = ativos.reduce((s, c) => s + lucroCliente(c), 0)
  const totalPostos        = ativos.reduce((s, c) => s + c.numeroPostos, 0)
  const ticketMedio        = ativos.length > 0 ? faturamentoBruto / ativos.length : 0
  const lucroMedioPostos   = totalPostos > 0 ? totalLucro / totalPostos : 0
  const invPublicidade     = faturamentoLiquido * (meta.percPublicidade / 100)
  const margemLiquida      = faturamentoBruto > 0 ? (totalLucro / faturamentoBruto) * 100 : 0

  // ── Filtered list ────────────────────────────────────────────────────────
  const filtered = clientes.filter(c => {
    const matchStatus = filterStatus === "TODOS" || c.status === filterStatus
    const q = search.toLowerCase()
    const matchSearch = !q ||
      c.empresa.toLowerCase().includes(q) ||
      (c.contato ?? "").toLowerCase().includes(q) ||
      (c.segmento ?? "").toLowerCase().includes(q)
    return matchStatus && matchSearch
  })

  // ── CRUD handlers ────────────────────────────────────────────────────────
  const handleSaved = useCallback((saved: ClienteAtivo) => {
    setClientes(prev => {
      const idx = prev.findIndex(c => c.id === saved.id)
      if (idx >= 0) { const next = [...prev]; next[idx] = saved; return next }
      return [saved, ...prev]
    })
  }, [])

  async function handleDelete() {
    if (!deleteTarget) return
    try {
      await fetch(`/api/clientes-ativos/${deleteTarget.id}`, { method: "DELETE" })
      setClientes(prev => prev.filter(c => c.id !== deleteTarget.id))
      toast.success("Cliente removido")
    } catch {
      toast.error("Erro ao remover")
    } finally {
      setDeleteTarget(null)
    }
  }

  function openNew() { setEditing(null); setModalOpen(true) }
  function openEdit(c: ClienteAtivo) { setEditing(c); setModalOpen(true) }

  return (
    <div className="p-4 sm:p-6 space-y-5 max-w-[1600px] mx-auto">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
        <div>
          <h1 className="brutal-heading text-2xl sm:text-3xl text-[#0F2044]">Meus Clientes Ativos</h1>
          <p className="text-sm text-[#6B7280] mt-0.5">
            {ativos.length} cliente{ativos.length !== 1 ? "s" : ""} ativo{ativos.length !== 1 ? "s" : ""} · {totalPostos} posto{totalPostos !== 1 ? "s" : ""} gerenciados
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setMetaModalOpen(true)}
            className="px-4 py-2 text-sm font-black transition-all"
            style={{ border: "2px solid #0F2044", boxShadow: "3px 3px 0 #0F2044", borderRadius: "2px", background: "#FFF", color: "#0F2044" }}
          >
            <Target className="w-4 h-4 inline mr-1.5" />
            Configurar Metas
          </button>
          <button
            onClick={openNew}
            className="px-4 py-2 text-sm font-black transition-all"
            style={{ background: "#84CC16", color: "#0F2044", border: "2px solid #0F2044", boxShadow: "3px 3px 0 #0F2044", borderRadius: "2px" }}
          >
            <Plus className="w-4 h-4 inline mr-1.5" />
            Novo Cliente
          </button>
        </div>
      </div>

      {/* ── Metric Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
        <MetricCard
          label="Faturamento Bruto"
          value={BRL(faturamentoBruto)}
          sub="mensal (ativos)"
          icon={DollarSign}
          accent="#0F2044"
          progress={meta.metaMensal > 0 ? pct(faturamentoBruto, meta.metaMensal) : undefined}
        />
        <MetricCard
          label="Faturamento Líquido"
          value={BRL(faturamentoLiquido)}
          sub="após impostos"
          icon={TrendingUp}
          accent="#3B82F6"
        />
        <MetricCard
          label="Ticket Médio"
          value={BRL(ticketMedio)}
          sub="por cliente"
          icon={BarChart2}
          accent="#8B5CF6"
        />
        <MetricCard
          label="Lucro Médio / Posto"
          value={BRL(lucroMedioPostos)}
          sub={`${totalPostos} posto${totalPostos !== 1 ? "s" : ""}`}
          icon={Users2}
          accent="#F59E0B"
        />
        <MetricCard
          label="Invest. Publicidade"
          value={BRL(invPublicidade)}
          sub={`${meta.percPublicidade}% do líquido`}
          icon={Megaphone}
          accent="#EC4899"
        />
        <MetricCard
          label="Margem Líquida"
          value={`${margemLiquida.toFixed(1)}%`}
          sub="lucro / bruto"
          icon={CheckCircle2}
          accent={margemLiquida >= 20 ? "#16A34A" : margemLiquida >= 10 ? "#F59E0B" : "#EF4444"}
        />
      </div>

      {/* ── Meta Progress ── */}
      {(meta.metaMensal > 0 || meta.metaAnual > 0) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {meta.metaMensal > 0 && (
            <div className="brutal-card p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-black text-[#0F2044] uppercase tracking-widest">Meta Mensal</span>
                <span className="text-xs font-black text-[#84CC16]">{BRL(faturamentoBruto)} / {BRL(meta.metaMensal)}</span>
              </div>
              <div className="h-3 w-full" style={{ background: "#E5E7EB", border: "2px solid #0F2044" }}>
                <div className="h-full transition-all" style={{
                  width: `${Math.min(100, pct(faturamentoBruto, meta.metaMensal))}%`,
                  background: pct(faturamentoBruto, meta.metaMensal) >= 100 ? "#84CC16" : "#0F2044",
                }} />
              </div>
              <p className="text-xs font-bold text-[#6B7280] mt-1">
                {pct(faturamentoBruto, meta.metaMensal).toFixed(0)}% concluído
                {faturamentoBruto < meta.metaMensal && ` · Faltam ${BRL(meta.metaMensal - faturamentoBruto)}`}
              </p>
            </div>
          )}
          {meta.metaAnual > 0 && (
            <div className="brutal-card p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-black text-[#0F2044] uppercase tracking-widest">Projeção Anual</span>
                <span className="text-xs font-black text-[#84CC16]">{BRL(faturamentoBruto * 12)} / {BRL(meta.metaAnual)}</span>
              </div>
              <div className="h-3 w-full" style={{ background: "#E5E7EB", border: "2px solid #0F2044" }}>
                <div className="h-full transition-all" style={{
                  width: `${Math.min(100, pct(faturamentoBruto * 12, meta.metaAnual))}%`,
                  background: pct(faturamentoBruto * 12, meta.metaAnual) >= 100 ? "#84CC16" : "#0F2044",
                }} />
              </div>
              <p className="text-xs font-bold text-[#6B7280] mt-1">
                Projeção de {BRL(faturamentoBruto * 12)} ao ano · {pct(faturamentoBruto * 12, meta.metaAnual).toFixed(0)}% da meta
              </p>
            </div>
          )}
        </div>
      )}

      {/* ── Filter + Search ── */}
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          placeholder="Buscar empresa, contato ou segmento…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 px-3 py-2 text-sm font-medium text-[#0F2044] bg-white outline-none"
          style={{ border: "2px solid #0F2044", borderRadius: "2px", boxShadow: "2px 2px 0 #0F2044", maxWidth: 360 }}
        />
        <div className="flex gap-2 flex-wrap">
          {["TODOS", ...STATUS_OPTIONS].map(s => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className="px-3 py-2 text-xs font-black transition-all"
              style={filterStatus === s ? {
                background: "#0F2044", color: "#FFF",
                border: "2px solid #0F2044", boxShadow: "2px 2px 0 #0F2044", borderRadius: "2px",
              } : {
                background: "#FFF", color: "#6B7280",
                border: "2px solid #D1D5DB", borderRadius: "2px",
              }}
            >
              {s === "TODOS" ? "Todos" : STATUS_LABEL[s]}
            </button>
          ))}
        </div>
      </div>

      {/* ── Client Cards / Table ── */}
      {filtered.length === 0 ? (
        <div className="brutal-card p-12 text-center">
          <Building2 className="w-12 h-12 mx-auto mb-4 text-[#D1D5DB]" />
          <p className="font-black text-[#0F2044] text-lg mb-1">Nenhum cliente encontrado</p>
          <p className="text-sm text-[#6B7280] mb-5">
            {clientes.length === 0 ? "Adicione seu primeiro cliente ativo para começar a acompanhar a operação." : "Tente ajustar o filtro ou a busca."}
          </p>
          {clientes.length === 0 && (
            <button onClick={openNew} className="px-5 py-2 text-sm font-black"
              style={{ background: "#84CC16", color: "#0F2044", border: "2px solid #0F2044", boxShadow: "3px 3px 0 #0F2044", borderRadius: "2px" }}>
              <Plus className="w-4 h-4 inline mr-1.5" /> Adicionar Primeiro Cliente
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block brutal-card overflow-x-auto">
            <table className="w-full text-sm" style={{ borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#0F2044" }}>
                  {["Empresa", "Segmento", "Postos", "Valor Nota", "Valor Líquido", "Custos Totais", "Lucro", "Margem", "Status", ""].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-[10px] font-black text-white uppercase tracking-widest whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((c, i) => {
                  const custosTotais = c.impostos + c.comissoes + c.custosExtras + c.custosFixos
                  const lucro = lucroCliente(c)
                  const margem = c.valorNota > 0 ? (lucro / c.valorNota) * 100 : 0
                  const st = STATUS_COLOR[c.status] ?? STATUS_COLOR.INATIVO
                  return (
                    <tr key={c.id} style={{ borderBottom: "2px solid #E5E7EB", background: i % 2 === 0 ? "#FFF" : "#FAFAFA" }}>
                      <td className="px-4 py-3">
                        <p className="font-black text-[#0F2044]">{c.empresa}</p>
                        {c.contato && <p className="text-[11px] text-[#6B7280]">{c.contato}</p>}
                      </td>
                      <td className="px-4 py-3 text-[#6B7280] text-xs font-medium">{c.segmento ?? "—"}</td>
                      <td className="px-4 py-3 font-black text-[#0F2044] text-center">{c.numeroPostos}</td>
                      <td className="px-4 py-3 font-black text-[#0F2044]">{BRL(c.valorNota)}</td>
                      <td className="px-4 py-3 font-bold text-[#3B82F6]">{BRL(c.valorLiquido)}</td>
                      <td className="px-4 py-3 font-bold text-[#EF4444]">{BRL(custosTotais)}</td>
                      <td className="px-4 py-3 font-black" style={{ color: lucro >= 0 ? "#16A34A" : "#EF4444" }}>
                        {BRL(lucro)}
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs font-black px-2 py-1" style={{
                          background: margem >= 20 ? "#DCFCE7" : margem >= 10 ? "#FEF9C3" : "#FEE2E2",
                          color: margem >= 20 ? "#166534" : margem >= 10 ? "#854D0E" : "#991B1B",
                          border: `1px solid ${margem >= 20 ? "#16A34A" : margem >= 10 ? "#CA8A04" : "#EF4444"}`,
                          borderRadius: "2px",
                        }}>
                          {margem.toFixed(1)}%
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-[10px] font-black px-2 py-1 whitespace-nowrap"
                          style={{ background: st.bg, color: st.text, border: `1px solid ${st.border}`, borderRadius: "2px" }}>
                          {STATUS_LABEL[c.status] ?? c.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          <button onClick={() => openEdit(c)} className="w-8 h-8 flex items-center justify-center transition-all"
                            style={{ border: "2px solid #0F2044", borderRadius: "2px" }}
                            title="Editar">
                            <Pencil className="w-3.5 h-3.5 text-[#0F2044]" />
                          </button>
                          <button onClick={() => setDeleteTarget(c)} className="w-8 h-8 flex items-center justify-center transition-all"
                            style={{ border: "2px solid #EF4444", borderRadius: "2px" }}
                            title="Remover">
                            <Trash2 className="w-3.5 h-3.5 text-red-500" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
              {/* Totals row */}
              <tfoot>
                <tr style={{ background: "#F0F9FF", borderTop: "3px solid #0F2044" }}>
                  <td colSpan={3} className="px-4 py-3 font-black text-[#0F2044] text-xs uppercase tracking-wide">
                    TOTAIS ({filtered.length} clientes)
                  </td>
                  <td className="px-4 py-3 font-black text-[#0F2044]">{BRL(filtered.reduce((s, c) => s + c.valorNota, 0))}</td>
                  <td className="px-4 py-3 font-black text-[#3B82F6]">{BRL(filtered.reduce((s, c) => s + c.valorLiquido, 0))}</td>
                  <td className="px-4 py-3 font-black text-[#EF4444]">{BRL(filtered.reduce((s, c) => s + c.impostos + c.comissoes + c.custosExtras + c.custosFixos, 0))}</td>
                  <td className="px-4 py-3 font-black text-[#16A34A]">{BRL(filtered.reduce((s, c) => s + lucroCliente(c), 0))}</td>
                  <td colSpan={3} />
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-3">
            {filtered.map(c => {
              const custosTotais = c.impostos + c.comissoes + c.custosExtras + c.custosFixos
              const lucro = lucroCliente(c)
              const margem = c.valorNota > 0 ? (lucro / c.valorNota) * 100 : 0
              const st = STATUS_COLOR[c.status] ?? STATUS_COLOR.INATIVO
              return (
                <div key={c.id} className="brutal-card p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-black text-[#0F2044] text-base">{c.empresa}</p>
                      {c.contato && <p className="text-xs text-[#6B7280]">{c.contato}</p>}
                      {c.segmento && <p className="text-[10px] text-[#9CA3AF]">{c.segmento}</p>}
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-[10px] font-black px-2 py-0.5"
                        style={{ background: st.bg, color: st.text, border: `1px solid ${st.border}`, borderRadius: "2px" }}>
                        {STATUS_LABEL[c.status]}
                      </span>
                      <span className="text-[10px] font-bold text-[#6B7280]">{c.numeroPostos} posto{c.numeroPostos !== 1 ? "s" : ""}</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div style={{ border: "1px solid #E5E7EB", borderRadius: "2px", padding: "6px 4px" }}>
                      <p className="text-[9px] font-black text-[#6B7280] uppercase">Nota</p>
                      <p className="text-xs font-black text-[#0F2044]">{BRL(c.valorNota)}</p>
                    </div>
                    <div style={{ border: "1px solid #E5E7EB", borderRadius: "2px", padding: "6px 4px" }}>
                      <p className="text-[9px] font-black text-[#6B7280] uppercase">Líquido</p>
                      <p className="text-xs font-black text-[#3B82F6]">{BRL(c.valorLiquido)}</p>
                    </div>
                    <div style={{ border: "1px solid #E5E7EB", borderRadius: "2px", padding: "6px 4px" }}>
                      <p className="text-[9px] font-black text-[#6B7280] uppercase">Lucro</p>
                      <p className="text-xs font-black" style={{ color: lucro >= 0 ? "#16A34A" : "#EF4444" }}>{BRL(lucro)}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-3 h-3 text-[#6B7280]" />
                      <span className="text-[10px] text-[#6B7280]">Custos: {BRL(custosTotais)}</span>
                      <span className="text-[10px] font-black px-1.5 py-0.5" style={{
                        background: margem >= 20 ? "#DCFCE7" : margem >= 10 ? "#FEF9C3" : "#FEE2E2",
                        color: margem >= 20 ? "#166534" : margem >= 10 ? "#854D0E" : "#991B1B",
                        border: `1px solid ${margem >= 20 ? "#16A34A" : margem >= 10 ? "#CA8A04" : "#EF4444"}`,
                        borderRadius: "2px",
                      }}>{margem.toFixed(1)}%</span>
                    </div>
                    <div className="flex gap-1.5">
                      <button onClick={() => openEdit(c)} className="w-8 h-8 flex items-center justify-center"
                        style={{ border: "2px solid #0F2044", borderRadius: "2px" }}>
                        <Pencil className="w-3.5 h-3.5 text-[#0F2044]" />
                      </button>
                      <button onClick={() => setDeleteTarget(c)} className="w-8 h-8 flex items-center justify-center"
                        style={{ border: "2px solid #EF4444", borderRadius: "2px" }}>
                        <Trash2 className="w-3.5 h-3.5 text-red-500" />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}

      {/* ── Summary insight ── */}
      {ativos.length > 0 && (
        <div className="brutal-card p-4 sm:p-5" style={{ background: "#0F2044" }}>
          <div className="flex items-center gap-2 mb-3">
            <Clock4 className="w-4 h-4 text-[#84CC16]" />
            <span className="text-[10px] font-black text-[#84CC16] uppercase tracking-widest">Resumo da Operação</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: "Faturamento Anual Projetado", value: BRL(faturamentoBruto * 12) },
              { label: "Lucro Anual Projetado", value: BRL(totalLucro * 12) },
              { label: "Budget de Publicidade/Mês", value: BRL(invPublicidade) },
              { label: "Lucro por Posto/Mês", value: BRL(lucroMedioPostos) },
            ].map(item => (
              <div key={item.label}>
                <p className="text-[9px] font-black text-white/40 uppercase tracking-widest mb-0.5">{item.label}</p>
                <p className="text-lg font-black text-white">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Modals ── */}
      <ClienteModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditing(null) }}
        onSaved={handleSaved}
        editing={editing}
      />
      <MetaModal
        open={metaModalOpen}
        onClose={() => setMetaModalOpen(false)}
        meta={meta}
        onSaved={setMeta}
      />
      <DeleteModal
        open={!!deleteTarget}
        empresa={deleteTarget?.empresa ?? ""}
        onConfirm={handleDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  )
}
