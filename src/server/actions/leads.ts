"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"

export interface CreateLeadData {
  title: string
  source?: string
  contactId?: string
  assignedToId?: string
  estimatedValue?: number
  notes?: string
  score?: number
  campaign?: string
  utmSource?: string
  utmMedium?: string
  utmCampaign?: string
}

export async function createLead(data: CreateLeadData) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Não autenticado")

  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true },
  })

  const lead = await prisma.lead.create({
    data: {
      title: data.title,
      source: (data.source as never) ?? "MANUAL",
      status: "NEW",
      contactId: data.contactId || null,
      assignedToId: data.assignedToId || dbUser?.id || null,
      estimatedValue: data.estimatedValue,
      notes: data.notes,
      score: data.score ?? 0,
      campaign: data.campaign,
      utmSource: data.utmSource,
      utmMedium: data.utmMedium,
      utmCampaign: data.utmCampaign,
    },
    include: { contact: true, assignedTo: true },
  })

  revalidatePath("/leads")
  revalidatePath("/visao-geral")

  return lead
}

export interface UpdateLeadData {
  title?: string
  source?: string
  status?: "NEW" | "CONTACTED" | "QUALIFIED" | "DISQUALIFIED" | "CONVERTED"
  contactId?: string
  assignedToId?: string
  estimatedValue?: number
  notes?: string
  score?: number
  campaign?: string
}

export async function updateLead(id: string, data: UpdateLeadData) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Não autenticado")

  const lead = await prisma.lead.update({
    where: { id },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: data as any,
    include: { contact: true, assignedTo: true },
  })

  revalidatePath("/leads")
  revalidatePath(`/leads/${id}`)

  return lead
}

export interface ConvertLeadDealData {
  title: string
  value?: number
  stageId: string
  assignedToId?: string
  expectedClose?: Date
  notes?: string
}

export async function convertLead(leadId: string, dealData: ConvertLeadDealData) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Não autenticado")

  const lead = await prisma.lead.findUniqueOrThrow({
    where: { id: leadId },
    include: { contact: true },
  })

  // Create the deal linked to the same contact
  const deal = await prisma.deal.create({
    data: {
      title: dealData.title,
      value: dealData.value ?? lead.estimatedValue ?? 0,
      stageId: dealData.stageId,
      contactId: lead.contactId,
      assignedToId: dealData.assignedToId ?? lead.assignedToId ?? session.user.id,
      expectedClose: dealData.expectedClose,
      notes: dealData.notes,
      status: "OPEN",
      stageHistory: JSON.stringify([
        { stageId: dealData.stageId, enteredAt: new Date().toISOString() },
      ]),
    },
    include: { stage: true, contact: true, assignedTo: true },
  })

  // Update lead status and link to deal
  await prisma.lead.update({
    where: { id: leadId },
    data: {
      status: "CONVERTED",
      convertedDealId: deal.id,
    },
  })

  revalidatePath("/leads")
  revalidatePath(`/leads/${leadId}`)
  revalidatePath("/negociacoes")
  revalidatePath("/kanban")
  revalidatePath("/visao-geral")

  return deal
}

export async function deleteLead(id: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Não autenticado")

  await prisma.lead.delete({ where: { id } })

  revalidatePath("/leads")
  revalidatePath("/visao-geral")
}
