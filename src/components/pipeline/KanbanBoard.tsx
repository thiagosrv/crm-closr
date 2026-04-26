"use client"

import { useState, useTransition, useEffect } from "react"
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core"
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable"
import { Plus } from "lucide-react"
import { toast } from "sonner"

import { moveDeal } from "@/server/actions/deals"
import { Button } from "@/components/ui/button"
import { KanbanColumn } from "./KanbanColumn"
import { KanbanCardOverlay } from "./KanbanCard"
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

interface KanbanBoardProps {
  stages: Stage[]
  dealsByStage: Record<string, Deal[]>
  contacts?: ContactSimple[]
}

export function KanbanBoard({ stages, dealsByStage, contacts = [] }: KanbanBoardProps) {
  const [localDealsByStage, setLocalDealsByStage] = useState(dealsByStage)
  const [activeDeal, setActiveDeal] = useState<Deal | null>(null)
  const [newDealOpen, setNewDealOpen] = useState(false)
  const [, startTransition] = useTransition()

  // Sync local state when server re-renders with fresh data (after create/update)
  useEffect(() => {
    setLocalDealsByStage(dealsByStage)
  }, [dealsByStage])

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const findDealById = (id: string): Deal | null => {
    for (const deals of Object.values(localDealsByStage)) {
      const found = deals.find((d) => d.id === id)
      if (found) return found
    }
    return null
  }

  const findStageForDeal = (dealId: string): string | null => {
    for (const [stageId, deals] of Object.entries(localDealsByStage)) {
      if (deals.some((d) => d.id === dealId)) return stageId
    }
    return null
  }

  const handleDragStart = (event: DragStartEvent) => {
    const deal = findDealById(String(event.active.id))
    setActiveDeal(deal)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveDeal(null)

    const { active, over } = event
    if (!over) return

    const dealId = String(active.id)
    const overId = String(over.id)

    const currentStageId = findStageForDeal(dealId)
    if (!currentStageId) return

    // Determine target stage: over can be a stage id or another deal id
    let targetStageId: string
    if (stages.some((s) => s.id === overId)) {
      targetStageId = overId
    } else {
      // Over is a deal — find its stage
      const stageId = findStageForDeal(overId)
      if (!stageId) return
      targetStageId = stageId
    }

    if (targetStageId === currentStageId) return

    // Optimistic update
    setLocalDealsByStage((prev) => {
      const next = { ...prev }
      const sourceCopy = [...(next[currentStageId] ?? [])]
      const dealIndex = sourceCopy.findIndex((d) => d.id === dealId)
      if (dealIndex === -1) return prev
      const [movedDeal] = sourceCopy.splice(dealIndex, 1)
      const updatedDeal = { ...movedDeal, stageId: targetStageId }
      next[currentStageId] = sourceCopy
      next[targetStageId] = [updatedDeal, ...(next[targetStageId] ?? [])]
      return next
    })

    startTransition(async () => {
      try {
        await moveDeal(dealId, targetStageId)
      } catch {
        toast.error("Erro ao mover negociação")
        // Revert optimistic update
        setLocalDealsByStage(dealsByStage)
      }
    })
  }

  return (
    <>
      <div className="flex items-center justify-end mb-4">
        <button
          onClick={() => setNewDealOpen(true)}
          className="brutal-btn-lime flex items-center gap-2 px-4 py-2 text-sm font-black"
        >
          <Plus className="w-4 h-4" />
          Nova Negociação
        </button>
      </div>

      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-3 overflow-x-auto pb-4 h-full">
          {stages.map((stage) => (
            <KanbanColumn
              key={stage.id}
              stage={stage}
              deals={localDealsByStage[stage.id] ?? []}
              stages={stages}
              contacts={contacts}
            />
          ))}
        </div>

        <DragOverlay dropAnimation={null}>
          {activeDeal && (
            <KanbanCardOverlay
              deal={activeDeal}
              stageColor={stages.find((s) => s.id === activeDeal.stageId)?.color ?? "#06B6D4"}
            />
          )}
        </DragOverlay>
      </DndContext>

      <DealFormDialog
        open={newDealOpen}
        onOpenChange={setNewDealOpen}
        stages={stages}
        contacts={contacts}
        defaultStageId={stages[0]?.id}
      />
    </>
  )
}
