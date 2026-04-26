"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"
import { verificarLimiteProposta } from "@/lib/planos"

export interface CreateProposalData {
  title: string
  dealId?: string
  contactId?: string
  content: string
  totalValue: number
  validUntil?: Date
}

export async function createProposal(data: CreateProposalData) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Não autenticado")

  const limite = await verificarLimiteProposta(session.user.id)
  if (!limite.podeAdicionar) {
    throw new Error(
      `Limite de ${limite.limite} propostas atingido no plano gratuito. Faça upgrade para o plano Diamond.`
    )
  }

  const trackingToken = crypto.randomUUID()

  const proposal = await prisma.proposal.create({
    data: {
      title: data.title,
      dealId: data.dealId,
      contactId: data.contactId,
      content: data.content,
      totalValue: data.totalValue,
      validUntil: data.validUntil,
      authorId: session.user.id,
      status: "DRAFT",
      trackingToken,
    },
    include: {
      deal: true,
      contact: true,
      author: { select: { id: true, name: true, email: true } },
    },
  })

  revalidatePath("/propostas")
  return proposal
}

export async function updateProposal(
  id: string,
  data: Partial<CreateProposalData>
) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Não autenticado")

  const proposal = await prisma.proposal.update({
    where: { id },
    data: {
      ...(data.title !== undefined && { title: data.title }),
      ...(data.dealId !== undefined && { dealId: data.dealId }),
      ...(data.contactId !== undefined && { contactId: data.contactId }),
      ...(data.content !== undefined && { content: data.content }),
      ...(data.totalValue !== undefined && { totalValue: data.totalValue }),
      ...(data.validUntil !== undefined && { validUntil: data.validUntil }),
    },
    include: {
      deal: true,
      contact: true,
      author: { select: { id: true, name: true, email: true } },
    },
  })

  revalidatePath("/propostas")
  revalidatePath(`/propostas/${id}`)
  return proposal
}

export async function sendProposal(id: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Não autenticado")

  const proposal = await prisma.proposal.update({
    where: { id },
    data: {
      sentAt: new Date(),
      status: "SENT",
    },
  })

  revalidatePath("/propostas")
  revalidatePath(`/propostas/${id}`)
  return proposal
}

export async function acceptProposal(id: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Não autenticado")

  const proposal = await prisma.proposal.update({
    where: { id },
    data: {
      acceptedAt: new Date(),
      status: "ACCEPTED",
    },
  })

  revalidatePath("/propostas")
  revalidatePath(`/propostas/${id}`)
  return proposal
}

export async function declineProposal(id: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Não autenticado")

  const proposal = await prisma.proposal.update({
    where: { id },
    data: {
      declinedAt: new Date(),
      status: "DECLINED",
    },
  })

  revalidatePath("/propostas")
  revalidatePath(`/propostas/${id}`)
  return proposal
}

export async function deleteProposal(id: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Não autenticado")

  await prisma.proposal.delete({ where: { id } })

  revalidatePath("/propostas")
}

export async function duplicateProposal(id: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Não autenticado")

  const limite = await verificarLimiteProposta(session.user.id)
  if (!limite.podeAdicionar) {
    throw new Error(
      `Limite de ${limite.limite} propostas atingido no plano gratuito. Faça upgrade para o plano Diamond.`
    )
  }

  const original = await prisma.proposal.findUniqueOrThrow({ where: { id } })

  const proposal = await prisma.proposal.create({
    data: {
      title: `${original.title} (cópia)`,
      dealId: original.dealId,
      contactId: original.contactId,
      content: original.content,
      totalValue: original.totalValue,
      validUntil: original.validUntil,
      authorId: session.user.id,
      status: "DRAFT",
      trackingToken: crypto.randomUUID(),
    },
  })

  revalidatePath("/propostas")
  return proposal
}
