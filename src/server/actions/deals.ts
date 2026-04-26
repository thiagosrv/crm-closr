"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"

export interface CreateDealData {
  title: string
  value?: number
  stageId: string
  contactId?: string
  contactWhatsapp?: string
  contactEmail?: string
  assignedToId?: string
  probability?: number
  expectedClose?: Date
  notes?: string
  currency?: string
}

export async function createDeal(data: CreateDealData) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Não autenticado")

  // Resolve real DB user id
  const dbUser = await prisma.user.findFirst({
    where: {
      OR: [
        { id: session.user.id ?? "" },
        ...(session.user.email ? [{ email: session.user.email }] : []),
      ],
    },
    select: { id: true },
  })
  const realUserId = dbUser?.id ?? session.user.id!

  // If no contactId but whatsapp/email provided, create a minimal contact
  let resolvedContactId = data.contactId
  if (!resolvedContactId && (data.contactWhatsapp || data.contactEmail)) {
    const newContact = await prisma.contact.create({
      data: {
        firstName: data.title,
        lastName: "",
        whatsapp: data.contactWhatsapp || null,
        email: data.contactEmail || null,
        userId: realUserId,
      },
    })
    resolvedContactId = newContact.id
  } else if (resolvedContactId && (data.contactWhatsapp !== undefined || data.contactEmail !== undefined)) {
    // Update existing contact's contact info
    await prisma.contact.update({
      where: { id: resolvedContactId },
      data: {
        ...(data.contactWhatsapp !== undefined && { whatsapp: data.contactWhatsapp }),
        ...(data.contactEmail !== undefined && { email: data.contactEmail }),
      },
    })
  }

  const deal = await prisma.deal.create({
    data: {
      title: data.title,
      value: data.value ?? 0,
      stageId: data.stageId,
      contactId: resolvedContactId,
      assignedToId: data.assignedToId ?? session.user.id,
      probability: data.probability,
      expectedClose: data.expectedClose,
      notes: data.notes,
      currency: data.currency ?? "BRL",
      status: "OPEN",
      stageHistory: JSON.stringify([
        { stageId: data.stageId, enteredAt: new Date().toISOString() },
      ]),
    },
    include: { stage: true, contact: true, assignedTo: true },
  })

  revalidatePath("/funis")
  revalidatePath("/negociacoes")
  revalidatePath("/kanban")
  revalidatePath("/pipeline")
  revalidatePath("/visao-geral")
  revalidatePath("/inicio")

  return deal
}

export interface UpdateDealData {
  title?: string
  value?: number
  stageId?: string
  contactId?: string
  contactWhatsapp?: string
  contactEmail?: string
  assignedToId?: string
  probability?: number
  expectedClose?: Date | null
  notes?: string
  currency?: string
}

export async function updateDeal(id: string, data: UpdateDealData) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Não autenticado")

  const { contactWhatsapp, contactEmail, ...dealData } = data

  // Update contact info if provided
  if (contactWhatsapp !== undefined || contactEmail !== undefined) {
    const existing = await prisma.deal.findUnique({ where: { id }, select: { contactId: true } })
    if (existing?.contactId) {
      await prisma.contact.update({
        where: { id: existing.contactId },
        data: {
          ...(contactWhatsapp !== undefined && { whatsapp: contactWhatsapp || null }),
          ...(contactEmail !== undefined && { email: contactEmail || null }),
        },
      })
    }
  }

  const deal = await prisma.deal.update({
    where: { id },
    data: dealData,
    include: { stage: true, contact: true, assignedTo: true },
  })

  revalidatePath("/funis")
  revalidatePath("/negociacoes")
  revalidatePath("/kanban")
  revalidatePath("/pipeline")
  revalidatePath(`/negociacoes/${id}`)
  revalidatePath("/visao-geral")
  revalidatePath("/inicio")

  return deal
}

export async function moveDeal(dealId: string, newStageId: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Não autenticado")

  const existing = await prisma.deal.findUniqueOrThrow({
    where: { id: dealId },
    select: { stageHistory: true },
  })

  const history: { stageId: string; enteredAt: string; exitedAt?: string }[] = existing.stageHistory
    ? JSON.parse(existing.stageHistory)
    : []

  // Mark exit on last entry if present
  const now = new Date().toISOString()
  if (history.length > 0 && !history[history.length - 1].exitedAt) {
    history[history.length - 1].exitedAt = now
  }

  history.push({ stageId: newStageId, enteredAt: now })

  const deal = await prisma.deal.update({
    where: { id: dealId },
    data: {
      stageId: newStageId,
      stageHistory: JSON.stringify(history),
    },
    include: { stage: true, contact: true, assignedTo: true },
  })

  revalidatePath("/kanban")
  revalidatePath("/negociacoes")
  revalidatePath(`/negociacoes/${dealId}`)

  return deal
}

async function cancelFollowUpsForDeal(dealId: string, reason: string) {
  const deal = await prisma.deal.findUnique({
    where: { id: dealId },
    select: { contactId: true },
  })
  if (!deal) return

  // Cancel follow-ups linked to leads that share this deal's contact
  const leads = deal.contactId
    ? await prisma.lead.findMany({ where: { contactId: deal.contactId }, select: { id: true } })
    : []
  const leadIds = leads.map((l) => l.id)

  if (leadIds.length > 0) {
    await prisma.followUpSchedule.updateMany({
      where: { leadId: { in: leadIds }, status: "PENDING" },
      data: { status: "CANCELLED", cancelReason: reason },
    })
  }
}

export async function markWon(dealId: string, wonAt?: Date) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Não autenticado")

  const deal = await prisma.deal.update({
    where: { id: dealId },
    data: {
      status: "WON",
      wonAt: wonAt ?? new Date(),
      lostAt: null,
      lostReason: null,
      lostCategory: null,
    },
    include: { stage: true, contact: true, assignedTo: true },
  })

  await cancelFollowUpsForDeal(dealId, "Deal fechado como ganho")

  revalidatePath("/kanban")
  revalidatePath("/negociacoes")
  revalidatePath(`/negociacoes/${dealId}`)
  revalidatePath("/visao-geral")

  return deal
}

export async function markLost(dealId: string, reason: string, category?: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Não autenticado")

  const deal = await prisma.deal.update({
    where: { id: dealId },
    data: {
      status: "LOST",
      lostAt: new Date(),
      lostReason: reason,
      lostCategory: category,
      wonAt: null,
    },
    include: { stage: true, contact: true, assignedTo: true },
  })

  await cancelFollowUpsForDeal(dealId, `Deal marcado como perdido: ${reason}`)

  revalidatePath("/kanban")
  revalidatePath("/negociacoes")
  revalidatePath(`/negociacoes/${dealId}`)
  revalidatePath("/visao-geral")

  return deal
}

export async function deleteDeal(id: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Não autenticado")

  await prisma.deal.delete({ where: { id } })

  revalidatePath("/negociacoes")
  revalidatePath("/kanban")
  revalidatePath("/visao-geral")
}
