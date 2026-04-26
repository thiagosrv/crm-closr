"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"
import { verificarLimiteContato } from "@/lib/planos"

export interface CreateContactData {
  firstName: string
  lastName: string
  email?: string
  phone?: string
  whatsapp?: string
  company?: string
  cnpj?: string
  position?: string
  linkedin?: string
  instagram?: string
  website?: string
  address?: string
  city?: string
  state?: string
  country?: string
  tags?: string
  notes?: string
  source?: string
}

export async function createContact(data: CreateContactData) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Não autenticado")

  const limite = await verificarLimiteContato(session.user.id)
  if (!limite.podeAdicionar) {
    throw new Error(
      `Limite de contatos atingido para o plano FREE (${limite.limite} contatos). Faça upgrade para DIAMOND.`
    )
  }

  // Resolve real DB user id (session.user.id may be JWT string)
  const dbUser = await prisma.user.findFirst({
    where: {
      OR: [
        { id: session.user.id ?? "" },
        ...(session.user.email ? [{ email: session.user.email }] : []),
      ],
    },
    select: { id: true },
  })

  const contact = await prisma.contact.create({
    data: {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone,
      whatsapp: data.whatsapp,
      company: data.company,
      cnpj: data.cnpj,
      position: data.position,
      linkedin: data.linkedin,
      instagram: data.instagram,
      website: data.website,
      address: data.address,
      city: data.city,
      state: data.state,
      country: data.country ?? "BR",
      tags: data.tags,
      notes: data.notes,
      source: (data.source as never) ?? "MANUAL",
      isActive: true,
      userId: dbUser?.id ?? null,
    },
  })

  revalidatePath("/contatos")
  revalidatePath("/funis")

  return contact
}

export interface UpdateContactData {
  firstName?: string
  lastName?: string
  email?: string
  phone?: string
  whatsapp?: string
  company?: string
  cnpj?: string
  position?: string
  linkedin?: string
  instagram?: string
  website?: string
  address?: string
  city?: string
  state?: string
  country?: string
  tags?: string
  notes?: string
  isActive?: boolean
}

export async function updateContact(id: string, data: UpdateContactData) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Não autenticado")

  const contact = await prisma.contact.update({
    where: { id },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: data as any,
  })

  revalidatePath("/contatos")
  revalidatePath(`/contatos/${id}`)

  return contact
}

export async function deleteContact(id: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Não autenticado")

  // Soft-delete: mark as inactive to preserve relationship integrity
  await prisma.contact.update({
    where: { id },
    data: { isActive: false },
  })

  revalidatePath("/contatos")
  revalidatePath("/visao-geral")
}
