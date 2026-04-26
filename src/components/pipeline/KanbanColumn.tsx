"use client"

import { useState } from "react"
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { useDroppable } from "@dnd-kit/core"
import { Plus } from "lucide-react"

import { formatarMoeda } from "@/lib/utils"
import { KanbanCard } from "./KanbanCard"
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

interface KanbanColumnProps {
  stage: Stage
  deals: Deal[]
  stages: Stage[]
  contacts?: ContactSimple[]
}

export function KanbanColumn({ stage, deals, stages, contacts = [] }: KanbanColumnProps) {
  const [addOpen, setAddOpen] = useState(false)
  const { setNodeRef, isOver } = useDroppable({ id: stage.id })

  const totalValue = deals.reduce((sum, d) => sum + d.value, 0)
  const dealIds = deals.map((d) => d.id)

  return (
    <>
      <div
        className="relative flex flex-col min-w-[280px] max-w-[280px] overflow-hidden"
        style={{
          background: isOver ? "#F0F0F0" : "#FFFFFF",
          border: `2px solid #0F2044`,
          boxShadow: isOver ? `6px 6px 0px ${stage.color}` : "4px 4px 0px #0F2044",
          borderRadius: "2px",
          transition: "box-shadow 0.1s ease",
        }}
      >
        {/* Colored top bar */}
        <div
          className="h-[4px] w-full shrink-0"
          style={{ background: stage.color }}
        />

        {/* Column header */}
        <div
          className="flex items-center gap-2 px-3 pt-3 pb-2"
          style={{ borderBottom: "2px solid #0F2044" }}
        >
          <div
            className="w-3 h-3 shrink-0"
            style={{ background: stage.color, border: "1.5px solid #0F2044" }}
          />
          <span className="flex-1 text-sm font-black text-[#0F2044] truncate uppercase tracking-wide">
            {stage.name}
          </span>
          {/* Count badge */}
          <span
            className="text-[10px] font-black px-1.5 py-0.5"
            style={{
              background: stage.color,
              border: "2px solid #0F2044",
              color: "#0F2044",
              borderRadius: "2px",
            }}
          >
            {deals.length}
          </span>
          <button
            onClick={() => setAddOpen(true)}
            className="transition-all"
            style={{
              padding: "2px",
              color: "#0F2044",
            }}
            onMouseEnter={e => (e.currentTarget.style.color = stage.color)}
            onMouseLeave={e => (e.currentTarget.style.color = "#0F2044")}
            title="Adicionar negociação"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Total value */}
        <div className="px-3 py-1.5" style={{ borderBottom: "1px solid rgba(15,32,68,0.12)" }}>
          <span className="text-xs font-black" style={{ color: stage.color }}>
            {formatarMoeda(totalValue)}
          </span>
        </div>

        {/* Drop zone + cards */}
        <div
          ref={setNodeRef}
          className="flex-1 overflow-y-auto px-2 py-2 space-y-2 kanban-col"
        >
          <SortableContext items={dealIds} strategy={verticalListSortingStrategy}>
            {deals.map((deal) => (
              <KanbanCard
                key={deal.id}
                deal={deal}
                stage={stage}
                stages={stages}
                contacts={contacts}
              />
            ))}
          </SortableContext>

          {deals.length === 0 && (
            <div
              className="flex flex-col items-center justify-center py-8 text-center mx-1 my-1"
              style={{
                border: `2px dashed ${stage.color}`,
                borderRadius: "2px",
                background: isOver ? `${stage.color}10` : "transparent",
              }}
            >
              <p className="text-xs font-bold text-[#6B7280] mb-2">Nenhuma negociação</p>
              <button
                onClick={() => setAddOpen(true)}
                className="text-xs font-black uppercase tracking-wide"
                style={{ color: stage.color }}
              >
                + Adicionar
              </button>
            </div>
          )}
        </div>
      </div>

      <DealFormDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        stages={stages}
        contacts={contacts}
        defaultStageId={stage.id}
      />
    </>
  )
}
