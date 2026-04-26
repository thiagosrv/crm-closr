"use client"

import React, { useState, useTransition } from "react"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Menu } from "@base-ui/react/menu"
import {
  MessageCircle,
  MoreVertical,
  Trophy,
  XCircle,
  Pencil,
  Trash2,
  Calendar,
  RefreshCw,
  Target,
  CalendarClock,
  Mail,
  Phone,
} from "lucide-react"
import { toast } from "sonner"

import { cn, formatarMoeda, diasDesde, iniciais } from "@/lib/utils"
import { buildWhatsAppUrl } from "@/lib/whatsapp"
import { markWon, markLost, deleteDeal } from "@/server/actions/deals"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DealAgeBadge } from "./DealAgeBadge"
import { DealFormDialog } from "./DealFormDialog"

interface Stage {
  id: string
  name: string
  color: string
  rottingDays: number
}

interface Contact {
  id: string
  firstName: string
  lastName: string
  whatsapp: string | null
  email?: string | null
  company?: string | null
}

interface AssignedTo {
  id: string
  name: string
  image: string | null
}

interface Deal {
  id: string
  title: string
  value: number
  stageId: string
  createdAt: Date
  updatedAt: Date
  expectedClose?: Date | null
  probability?: number | null
  contact: Contact | null
  assignedTo: AssignedTo | null
  _count?: { activities: number }
}

interface ContactSimple {
  id: string
  firstName: string
  lastName: string
  whatsapp?: string | null
  email?: string | null
  company?: string | null
}

interface KanbanCardProps {
  deal: Deal
  stage: Stage
  stages: Stage[]
  contacts?: ContactSimple[]
  isDragging?: boolean
}

function formatDate(date: Date | string | null | undefined): string {
  if (!date) return ""
  return new Date(date).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })
}

export function KanbanCard({ deal, stage, stages, contacts = [], isDragging = false }: KanbanCardProps) {
  const [editOpen, setEditOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: deal.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const daysInStage = diasDesde(deal.updatedAt)
  const contactName = deal.contact
    ? `${deal.contact.firstName} ${deal.contact.lastName}`
    : null
  const followUps = deal._count?.activities ?? 0
  const isRotting = daysInStage > stage.rottingDays

  const handleMarkWon = () => {
    startTransition(async () => {
      try {
        await markWon(deal.id)
        toast.success("Negociação marcada como ganha!")
      } catch {
        toast.error("Erro ao marcar como ganha")
      }
    })
  }

  const handleMarkLost = () => {
    startTransition(async () => {
      try {
        await markLost(deal.id, "Motivo não especificado")
        toast.success("Negociação marcada como perdida")
      } catch {
        toast.error("Erro ao marcar como perdida")
      }
    })
  }

  const handleDelete = () => {
    startTransition(async () => {
      try {
        await deleteDeal(deal.id)
        toast.success("Negociação excluída")
      } catch {
        toast.error("Erro ao excluir negociação")
      }
    })
  }

  return (
    <>
      <div
        ref={setNodeRef}
        style={{
          ...style,
          borderLeft: `4px solid ${stage.color}`,
          boxShadow: (isSortableDragging || isDragging) ? "none" : "3px 3px 0px #0F2044",
        }}
        {...attributes}
        {...listeners}
        suppressHydrationWarning
        className={cn(
          "relative bg-white border-2 border-[#0F2044] overflow-hidden cursor-grab select-none",
          "transition-all duration-100",
          (isSortableDragging || isDragging) && "opacity-30 cursor-grabbing"
        )}
        onMouseEnter={e => {
          if (!isSortableDragging && !isDragging) {
            e.currentTarget.style.boxShadow = `5px 5px 0px #0F2044`
            e.currentTarget.style.transform = `translate(-1px,-1px)`
          }
        }}
        onMouseLeave={e => {
          e.currentTarget.style.boxShadow = `3px 3px 0px #0F2044`
          e.currentTarget.style.transform = ``
        }}
      >
        {/* Rotting triangle indicator */}
        {isRotting && (
          <div
            className="absolute top-0 right-0 w-0 h-0"
            style={{
              borderStyle: "solid",
              borderWidth: "0 18px 18px 0",
              borderColor: `transparent #EF4444 transparent transparent`,
            }}
            title="Negociação parada há muito tempo"
          />
        )}

        <div className="p-3 space-y-2.5">

          {/* ── Row 1: Title + menu ── */}
          <div className="flex items-start gap-2">
            <p className="flex-1 text-sm font-black text-[#0F2044] leading-snug line-clamp-2">
              {deal.title}
            </p>
            <div
              onClick={(e) => e.stopPropagation()}
              onPointerDown={(e) => e.stopPropagation()}
            >
              <Menu.Root>
                <Menu.Trigger className="p-0.5 text-[#6B7280] hover:text-[#0F2044] transition-colors shrink-0">
                  <MoreVertical className="w-3.5 h-3.5" />
                </Menu.Trigger>
                <Menu.Portal>
                  <Menu.Positioner sideOffset={4} align="end">
                    <Menu.Popup
                      className="z-[200] min-w-[180px] p-1"
                      style={{
                        background: "#FFFFFF",
                        border: "2px solid #0F2044",
                        boxShadow: "4px 4px 0px #0F2044",
                        borderRadius: "2px",
                      }}
                    >
                      <Menu.Item
                        onClick={handleMarkWon}
                        disabled={isPending}
                        className="flex cursor-pointer items-center gap-2 px-3 py-2 text-sm font-bold text-green-700 hover:bg-green-50 focus:bg-green-50 focus:outline-none"
                      >
                        <Trophy className="w-3.5 h-3.5" />
                        Marcar como Ganho
                      </Menu.Item>
                      <Menu.Item
                        onClick={handleMarkLost}
                        disabled={isPending}
                        className="flex cursor-pointer items-center gap-2 px-3 py-2 text-sm font-bold text-red-600 hover:bg-red-50 focus:bg-red-50 focus:outline-none"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        Marcar como Perdido
                      </Menu.Item>
                      <div style={{ borderTop: "2px solid #0F2044", margin: "2px 0" }} />
                      <Menu.Item
                        onClick={() => setEditOpen(true)}
                        className="flex cursor-pointer items-center gap-2 px-3 py-2 text-sm font-bold text-[#0F2044] hover:bg-gray-50 focus:bg-gray-50 focus:outline-none"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                        Editar
                      </Menu.Item>
                      <Menu.Item
                        onClick={handleDelete}
                        disabled={isPending}
                        className="flex cursor-pointer items-center gap-2 px-3 py-2 text-sm font-bold text-red-600 hover:bg-red-50 focus:bg-red-50 focus:outline-none"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Excluir
                      </Menu.Item>
                    </Menu.Popup>
                  </Menu.Positioner>
                </Menu.Portal>
              </Menu.Root>
            </div>
          </div>

          {/* ── Row 2: Value + probability ── */}
          <div className="flex items-center justify-between">
            <p className="text-base font-black text-[#0F2044]">
              {formatarMoeda(deal.value)}
            </p>
            {deal.probability != null && (
              <div
                className="flex items-center gap-1 px-1.5 py-0.5 text-[9px] font-black uppercase"
                style={{
                  background: deal.probability >= 70 ? "#84CC16" : deal.probability >= 40 ? "#F59E0B22" : "#EF444422",
                  border: `1.5px solid ${deal.probability >= 70 ? "#0F2044" : deal.probability >= 40 ? "#F59E0B" : "#EF4444"}`,
                  color: deal.probability >= 70 ? "#0F2044" : deal.probability >= 40 ? "#92400E" : "#B91C1C",
                  borderRadius: "2px",
                }}
              >
                <Target className="w-2.5 h-2.5" />
                {deal.probability}%
              </div>
            )}
          </div>

          {/* ── Row 3: Contact name + company ── */}
          {contactName && (
            <div className="flex items-center gap-1.5">
              <span
                className="w-2 h-2 shrink-0 inline-block"
                style={{ background: stage.color, border: "1.5px solid #0F2044" }}
              />
              <span className="text-[11px] text-[#0F2044] font-bold truncate">
                {contactName}
              </span>
              {deal.contact?.company && (
                <span className="text-[10px] text-[#6B7280] truncate">· {deal.contact.company}</span>
              )}
            </div>
          )}

          {/* ── Row 4: Info chips ── */}
          <div
            className="flex flex-wrap gap-1.5 pt-1 pb-1"
            style={{ borderTop: "1.5px solid #F0F0F0" }}
          >
            {/* Primeiro contato */}
            <div
              className="flex items-center gap-1 px-2 py-1 text-[10px] font-bold"
              style={{ background: "#F4F4F4", border: "1.5px solid #0F2044", borderRadius: "2px" }}
              title="Data do primeiro contato"
            >
              <Calendar className="w-2.5 h-2.5 text-[#6B7280]" />
              <span className="text-[#0F2044]">{formatDate(deal.createdAt)}</span>
            </div>

            {/* Follow-ups */}
            <div
              className="flex items-center gap-1 px-2 py-1 text-[10px] font-bold"
              style={{
                background: followUps > 0 ? "#84CC1620" : "#F4F4F4",
                border: `1.5px solid ${followUps > 0 ? "#84CC16" : "#0F2044"}`,
                borderRadius: "2px",
              }}
              title="Número de atividades registradas"
            >
              <RefreshCw className="w-2.5 h-2.5" style={{ color: followUps > 0 ? "#5A9A0A" : "#6B7280" }} />
              <span style={{ color: followUps > 0 ? "#3D6B07" : "#0F2044" }}>
                {followUps} follow-up{followUps !== 1 ? "s" : ""}
              </span>
            </div>

            {/* Previsão de fechamento */}
            {deal.expectedClose && (
              <div
                className="flex items-center gap-1 px-2 py-1 text-[10px] font-bold"
                style={{
                  background: new Date(deal.expectedClose) < new Date() ? "#FEE2E2" : "#EFF6FF",
                  border: `1.5px solid ${new Date(deal.expectedClose) < new Date() ? "#EF4444" : "#3B82F6"}`,
                  borderRadius: "2px",
                }}
                title="Previsão de fechamento"
              >
                <CalendarClock className="w-2.5 h-2.5" style={{ color: new Date(deal.expectedClose) < new Date() ? "#EF4444" : "#3B82F6" }} />
                <span style={{ color: new Date(deal.expectedClose) < new Date() ? "#B91C1C" : "#1D4ED8" }}>
                  {formatDate(deal.expectedClose)}
                </span>
              </div>
            )}
          </div>

          {/* ── Row 5: Footer ── */}
          <div className="flex items-center justify-between">
            <DealAgeBadge daysInStage={daysInStage} rottingDays={stage.rottingDays} />

            <div className="flex items-center gap-1.5 flex-wrap">
              {/* No contact info: quick-add button */}
              {!deal.contact?.whatsapp && !deal.contact?.email && (
                <button
                  onClick={(e) => { e.stopPropagation(); setEditOpen(true) }}
                  onPointerDown={(e) => e.stopPropagation()}
                  className="inline-flex items-center gap-1 px-2 py-1 text-[10px] font-black transition-all"
                  style={{
                    background: "#F4F4F4",
                    border: "1.5px dashed #6B7280",
                    borderRadius: "2px",
                    color: "#6B7280",
                  }}
                  title="Adicionar WhatsApp e E-mail"
                >
                  <Phone className="w-2.5 h-2.5" />
                  + Contato
                </button>
              )}

              {/* WhatsApp pill button */}
              {deal.contact?.whatsapp && (
                <a
                  href={buildWhatsAppUrl(deal.contact.whatsapp)}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  onPointerDown={(e) => e.stopPropagation()}
                  className="inline-flex items-center gap-1 px-2 py-1 text-[10px] font-black transition-all"
                  style={{
                    background: "#25D366",
                    border: "2px solid #0F2044",
                    boxShadow: "2px 2px 0px #0F2044",
                    borderRadius: "2px",
                    color: "#FFFFFF",
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.boxShadow = "3px 3px 0px #0F2044"
                    e.currentTarget.style.transform = "translate(-1px,-1px)"
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.boxShadow = "2px 2px 0px #0F2044"
                    e.currentTarget.style.transform = ""
                  }}
                  title={`WhatsApp: ${deal.contact.whatsapp}`}
                >
                  <MessageCircle className="w-2.5 h-2.5" />
                  WA
                </a>
              )}

              {/* Email pill button */}
              {deal.contact?.email && (
                <a
                  href={`mailto:${deal.contact.email}`}
                  onClick={(e) => e.stopPropagation()}
                  onPointerDown={(e) => e.stopPropagation()}
                  className="inline-flex items-center gap-1 px-2 py-1 text-[10px] font-black transition-all"
                  style={{
                    background: "#3B82F6",
                    border: "2px solid #0F2044",
                    boxShadow: "2px 2px 0px #0F2044",
                    borderRadius: "2px",
                    color: "#FFFFFF",
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.boxShadow = "3px 3px 0px #0F2044"
                    e.currentTarget.style.transform = "translate(-1px,-1px)"
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.boxShadow = "2px 2px 0px #0F2044"
                    e.currentTarget.style.transform = ""
                  }}
                  title={`E-mail: ${deal.contact.email}`}
                >
                  <Mail className="w-2.5 h-2.5" />
                  Email
                </a>
              )}

              {/* Avatar */}
              {deal.assignedTo && (
                <Avatar className="w-6 h-6" style={{ border: "2px solid #0F2044", borderRadius: "2px" }}>
                  {deal.assignedTo.image ? (
                    <AvatarImage src={deal.assignedTo.image} alt={deal.assignedTo.name} />
                  ) : null}
                  <AvatarFallback
                    className="text-[9px] font-black"
                    style={{ background: stage.color, color: "#0F2044", borderRadius: "0" }}
                  >
                    {iniciais(deal.assignedTo.name)}
                  </AvatarFallback>
                </Avatar>
              )}
            </div>
          </div>
        </div>
      </div>

      <DealFormDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        stages={stages}
        contacts={contacts}
        dealId={deal.id}
        defaultStageId={deal.stageId}
        defaultValues={{
          title: deal.title,
          value: deal.value,
          stageId: deal.stageId,
          contactId: deal.contact?.id,
          contactWhatsapp: deal.contact?.whatsapp ?? undefined,
          contactEmail: deal.contact?.email ?? undefined,
          probability: deal.probability ?? undefined,
          expectedClose: deal.expectedClose
            ? new Date(deal.expectedClose).toISOString().split("T")[0]
            : undefined,
        }}
      />
    </>
  )
}

/** Overlay card shown during drag */
export function KanbanCardOverlay({ deal, stageColor = "#84CC16" }: { deal: Deal; stageColor?: string }) {
  return (
    <div
      className="p-3 bg-white opacity-90 rotate-1 cursor-grabbing"
      style={{
        borderLeft: `4px solid ${stageColor}`,
        border: "2px solid #0F2044",
        boxShadow: "5px 5px 0px #0F2044",
        borderRadius: "2px",
      }}
    >
      <p className="text-sm font-black text-[#0F2044] mb-1.5 line-clamp-2">{deal.title}</p>
      <p className="text-base font-black text-[#0F2044]">{formatarMoeda(deal.value)}</p>
    </div>
  )
}
