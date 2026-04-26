"use client"

import { useTransition, useEffect } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Dialog } from "@base-ui/react/dialog"
import { Select } from "@base-ui/react/select"
import { X, ChevronDown, Check, Phone, Mail } from "lucide-react"
import { toast } from "sonner"

import { createDeal, updateDeal } from "@/server/actions/deals"
import type { CreateDealData } from "@/server/actions/deals"

const dealSchema = z.object({
  title: z.string().min(1, "Título é obrigatório"),
  value: z.number().min(0).optional(),
  stageId: z.string().min(1, "Etapa é obrigatória"),
  contactId: z.string().optional(),
  contactWhatsapp: z.string().optional(),
  contactEmail: z.string().email("E-mail inválido").optional().or(z.literal("")),
  probability: z.number().min(0).max(100).optional(),
  expectedClose: z.string().optional(),
  notes: z.string().optional(),
})

type DealFormValues = z.infer<typeof dealSchema>

interface Stage {
  id: string
  name: string
}

interface Contact {
  id: string
  firstName: string
  lastName: string
  whatsapp?: string | null
  email?: string | null
}

interface DealFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  stages: Stage[]
  contacts?: Contact[]
  defaultStageId?: string
  dealId?: string
  defaultValues?: Partial<DealFormValues>
}

export function DealFormDialog({
  open,
  onOpenChange,
  stages,
  contacts = [],
  defaultStageId,
  dealId,
  defaultValues,
}: DealFormDialogProps) {
  const [isPending, startTransition] = useTransition()
  const isEditing = !!dealId

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<DealFormValues>({
    resolver: zodResolver(dealSchema),
    defaultValues: {
      stageId: defaultStageId ?? stages[0]?.id ?? "",
      ...defaultValues,
    },
  })

  const selectedStageId = watch("stageId")
  const selectedContactId = watch("contactId")

  // When contact changes, auto-fill their WhatsApp/Email
  useEffect(() => {
    if (selectedContactId) {
      const contact = contacts.find(c => c.id === selectedContactId)
      if (contact?.whatsapp) setValue("contactWhatsapp", contact.whatsapp)
      if (contact?.email) setValue("contactEmail", contact.email)
    }
  }, [selectedContactId, contacts, setValue])

  const onSubmit = (values: DealFormValues) => {
    startTransition(async () => {
      try {
        const payload: CreateDealData = {
          title: values.title,
          value: values.value,
          stageId: values.stageId,
          contactId: values.contactId || undefined,
          contactWhatsapp: values.contactWhatsapp || undefined,
          contactEmail: values.contactEmail || undefined,
          probability: values.probability,
          expectedClose: values.expectedClose ? new Date(values.expectedClose) : undefined,
          notes: values.notes,
        }

        if (isEditing) {
          await updateDeal(dealId, payload)
          toast.success("Negociação atualizada com sucesso")
        } else {
          await createDeal(payload)
          toast.success("Negociação criada com sucesso")
        }

        reset()
        onOpenChange(false)
      } catch {
        toast.error(isEditing ? "Erro ao atualizar negociação" : "Erro ao criar negociação")
      }
    })
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50" style={{ background: "rgba(15,32,68,0.65)" }} />
        <Dialog.Popup
          className="fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 overflow-hidden overflow-y-auto max-h-[90vh]"
          style={{
            background: "#FFFFFF",
            border: "3px solid #0F2044",
            boxShadow: "6px 6px 0px #0F2044",
            borderRadius: "2px",
          }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-6 py-4 sticky top-0 z-10"
            style={{ background: "#0F2044", borderBottom: "2px solid #0F2044" }}
          >
            <Dialog.Title className="text-base font-black text-white uppercase tracking-wide">
              {isEditing ? "Editar Negociação" : "Nova Negociação"}
            </Dialog.Title>
            <Dialog.Close
              className="text-white/60 hover:text-white transition-colors"
              onClick={() => onOpenChange(false)}
            >
              <X className="w-4 h-4" />
            </Dialog.Close>
          </div>

          <div className="p-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

              {/* Title */}
              <div>
                <label className="block text-[11px] font-black uppercase tracking-widest text-[#6B7280] mb-2">Título *</label>
                <input
                  type="text"
                  placeholder="Ex: Construtora MABA — Projeto X"
                  {...register("title")}
                  className="brutal-input w-full px-4 py-2.5 text-sm"
                />
                {errors.title && <p className="text-xs text-red-600 font-bold mt-1">{errors.title.message}</p>}
              </div>

              {/* Value */}
              <div>
                <label className="block text-[11px] font-black uppercase tracking-widest text-[#6B7280] mb-2">Valor (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0,00"
                  {...register("value", { valueAsNumber: true })}
                  className="brutal-input w-full px-4 py-2.5 text-sm"
                />
              </div>

              {/* Stage */}
              <div>
                <label className="block text-[11px] font-black uppercase tracking-widest text-[#6B7280] mb-2">Etapa *</label>
                <Select.Root
                  value={selectedStageId}
                  onValueChange={(val) => setValue("stageId", val as string)}
                >
                  <Select.Trigger
                    className="flex w-full items-center justify-between px-4 py-2.5 text-sm font-medium"
                    style={{ background: "#FFFFFF", border: "2px solid #0F2044", boxShadow: "2px 2px 0 #0F2044", borderRadius: "2px", color: "#0F2044" }}
                  >
                    <Select.Value placeholder="Selecionar etapa">
                      {stages.find((s) => s.id === selectedStageId)?.name ?? "Selecionar etapa"}
                    </Select.Value>
                    <Select.Icon>
                      <ChevronDown className="w-4 h-4 text-[#6B7280]" />
                    </Select.Icon>
                  </Select.Trigger>
                  <Select.Portal>
                    <Select.Positioner sideOffset={4}>
                      <Select.Popup
                        className="z-[200] min-w-[var(--anchor-width)] p-1"
                        style={{ background: "#FFFFFF", border: "2px solid #0F2044", boxShadow: "4px 4px 0 #0F2044", borderRadius: "2px" }}
                      >
                        <Select.List>
                          {stages.map((stage) => (
                            <Select.Item
                              key={stage.id}
                              value={stage.id}
                              className="flex cursor-pointer items-center gap-2 px-3 py-2 text-sm text-[#0F2044] font-medium hover:bg-[#F4F4F4] focus:bg-[#F4F4F4] focus:outline-none"
                            >
                              <Select.ItemText>{stage.name}</Select.ItemText>
                              <Select.ItemIndicator className="ml-auto">
                                <Check className="w-3.5 h-3.5 text-[#84CC16]" />
                              </Select.ItemIndicator>
                            </Select.Item>
                          ))}
                        </Select.List>
                      </Select.Popup>
                    </Select.Positioner>
                  </Select.Portal>
                </Select.Root>
                {errors.stageId && <p className="text-xs text-red-600 font-bold mt-1">{errors.stageId.message}</p>}
              </div>

              {/* Contact info row: WhatsApp + Email */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-black uppercase tracking-widest text-[#6B7280] mb-2">
                    WhatsApp
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#6B7280] pointer-events-none" />
                    <input
                      type="tel"
                      placeholder="+55 11 99999-9999"
                      {...register("contactWhatsapp")}
                      className="brutal-input w-full pl-9 pr-3 py-2.5 text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-black uppercase tracking-widest text-[#6B7280] mb-2">
                    E-mail
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#6B7280] pointer-events-none" />
                    <input
                      type="email"
                      placeholder="cliente@email.com"
                      {...register("contactEmail")}
                      className="brutal-input w-full pl-9 pr-3 py-2.5 text-sm"
                    />
                  </div>
                  {errors.contactEmail && (
                    <p className="text-xs text-red-600 font-bold mt-1">{errors.contactEmail.message}</p>
                  )}
                </div>
              </div>
              <p className="text-[10px] text-[#6B7280] -mt-2">
                Esses dados habilitam os botões de contato rápido no card do funil
              </p>

              {/* Contact selector (optional) */}
              {contacts.length > 0 && (
                <div>
                  <label className="block text-[11px] font-black uppercase tracking-widest text-[#6B7280] mb-2">
                    Vincular Contato (opcional)
                  </label>
                  <Select.Root
                    value={selectedContactId ?? ""}
                    onValueChange={(val) => setValue("contactId", val as string || undefined)}
                  >
                    <Select.Trigger
                      className="flex w-full items-center justify-between px-4 py-2.5 text-sm font-medium"
                      style={{ background: "#FFFFFF", border: "2px solid #0F2044", boxShadow: "2px 2px 0 #0F2044", borderRadius: "2px", color: "#0F2044" }}
                    >
                      <Select.Value placeholder="Selecionar contato">
                        {contacts.find((c) => c.id === selectedContactId)
                          ? `${contacts.find((c) => c.id === selectedContactId)!.firstName} ${contacts.find((c) => c.id === selectedContactId)!.lastName}`
                          : "Sem contato vinculado"}
                      </Select.Value>
                      <Select.Icon>
                        <ChevronDown className="w-4 h-4 text-[#6B7280]" />
                      </Select.Icon>
                    </Select.Trigger>
                    <Select.Portal>
                      <Select.Positioner sideOffset={4}>
                        <Select.Popup
                          className="z-[200] min-w-[var(--anchor-width)] p-1"
                          style={{ background: "#FFFFFF", border: "2px solid #0F2044", boxShadow: "4px 4px 0 #0F2044", borderRadius: "2px" }}
                        >
                          <Select.List>
                            <Select.Item
                              value=""
                              className="flex cursor-pointer items-center gap-2 px-3 py-2 text-sm text-[#6B7280] hover:bg-[#F4F4F4] focus:bg-[#F4F4F4] focus:outline-none"
                            >
                              <Select.ItemText>Nenhum contato</Select.ItemText>
                            </Select.Item>
                            {contacts.map((contact) => (
                              <Select.Item
                                key={contact.id}
                                value={contact.id}
                                className="flex cursor-pointer items-center gap-2 px-3 py-2 text-sm text-[#0F2044] font-medium hover:bg-[#F4F4F4] focus:bg-[#F4F4F4] focus:outline-none"
                              >
                                <Select.ItemText>
                                  {contact.firstName} {contact.lastName}
                                  {contact.whatsapp ? ` · ${contact.whatsapp}` : ""}
                                </Select.ItemText>
                                <Select.ItemIndicator className="ml-auto">
                                  <Check className="w-3.5 h-3.5 text-[#84CC16]" />
                                </Select.ItemIndicator>
                              </Select.Item>
                            ))}
                          </Select.List>
                        </Select.Popup>
                      </Select.Positioner>
                    </Select.Portal>
                  </Select.Root>
                </div>
              )}

              {/* Probability & Expected Close */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-black uppercase tracking-widest text-[#6B7280] mb-2">Probabilidade (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    placeholder="0–100"
                    {...register("probability", { valueAsNumber: true })}
                    className="brutal-input w-full px-4 py-2.5 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-black uppercase tracking-widest text-[#6B7280] mb-2">Prev. Fechamento</label>
                  <input
                    type="date"
                    {...register("expectedClose")}
                    className="brutal-input w-full px-4 py-2.5 text-sm"
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-[11px] font-black uppercase tracking-widest text-[#6B7280] mb-2">Observações</label>
                <textarea
                  rows={2}
                  placeholder="Notas sobre a negociação..."
                  {...register("notes")}
                  className="brutal-input w-full px-4 py-2.5 text-sm resize-none"
                />
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { reset(); onOpenChange(false) }}
                  className="brutal-btn-outline px-5 py-2 text-sm font-black"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="brutal-btn-lime px-6 py-2 text-sm font-black disabled:opacity-50"
                >
                  {isPending ? "Salvando..." : isEditing ? "Salvar" : "Criar Negociação"}
                </button>
              </div>
            </form>
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
