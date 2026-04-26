"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"

export interface CreateActivityData {
  type: "NOTE" | "CALL" | "EMAIL" | "WHATSAPP" | "MEETING" | "TASK" | "INACTIVITY_ALERT"
  subject: string
  body?: string
  dueAt?: Date
  duration?: number
  contactId?: string
  dealId?: string
  leadId?: string
  isAutomatic?: boolean
}

export async function createActivity(data: CreateActivityData) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Não autenticado")

  const activity = await prisma.activity.create({
    data: {
      type: data.type,
      subject: data.subject,
      body: data.body,
      dueAt: data.dueAt,
      duration: data.duration,
      userId: session.user.id,
      contactId: data.contactId,
      dealId: data.dealId,
      leadId: data.leadId,
      isAutomatic: data.isAutomatic ?? false,
    },
    include: {
      user: { select: { id: true, name: true, image: true } },
      contact: { select: { id: true, firstName: true, lastName: true } },
      deal: { select: { id: true, title: true } },
      lead: { select: { id: true, title: true } },
    },
  })

  revalidatePath("/atividades")
  if (data.dealId) revalidatePath(`/negociacoes/${data.dealId}`)
  if (data.leadId) revalidatePath(`/leads/${data.leadId}`)
  if (data.contactId) revalidatePath(`/contatos/${data.contactId}`)

  return activity
}

export async function completeActivity(id: string, outcome?: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Não autenticado")

  const activity = await prisma.activity.update({
    where: { id },
    data: {
      completedAt: new Date(),
      outcome: outcome,
    },
    include: {
      user: { select: { id: true, name: true, image: true } },
    },
  })

  revalidatePath("/atividades")
  if (activity.dealId) revalidatePath(`/negociacoes/${activity.dealId}`)
  if (activity.leadId) revalidatePath(`/leads/${activity.leadId}`)
  if (activity.contactId) revalidatePath(`/contatos/${activity.contactId}`)

  return activity
}

export async function deleteActivity(id: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Não autenticado")

  const activity = await prisma.activity.findUniqueOrThrow({
    where: { id },
    select: { dealId: true, leadId: true, contactId: true },
  })

  await prisma.activity.delete({ where: { id } })

  revalidatePath("/atividades")
  if (activity.dealId) revalidatePath(`/negociacoes/${activity.dealId}`)
  if (activity.leadId) revalidatePath(`/leads/${activity.leadId}`)
  if (activity.contactId) revalidatePath(`/contatos/${activity.contactId}`)
}
