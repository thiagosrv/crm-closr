"use server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"

export async function updateUser(id: string, data: { name?: string; goal?: number; goalPeriod?: string }) {
  const session = await auth()
  if (!session?.user?.id || session.user.id !== id) throw new Error("Não autorizado")
  await prisma.user.update({ where: { id }, data })
  revalidatePath("/configuracoes")
}

export async function completeOnboarding(onboardingData: {
  firstName?: string
  lastName?: string
  teamSize?: string
  company?: string
  niche?: string
  interests?: string[]
  plan?: string
}) {
  const session = await auth()
  if (!session?.user) throw new Error("Não autorizado")

  const dbUser = await prisma.user.findFirst({
    where: {
      OR: [
        { id: session.user.id ?? "" },
        ...(session.user.email ? [{ email: session.user.email }] : []),
      ],
    },
    select: { id: true },
  })
  if (!dbUser) throw new Error("Usuário não encontrado")

  const nameUpdate: { name?: string } = {}
  if (onboardingData.firstName) {
    nameUpdate.name = [onboardingData.firstName, onboardingData.lastName].filter(Boolean).join(" ")
  }

  await prisma.user.update({
    where: { id: dbUser.id },
    data: {
      ...nameUpdate,
      onboardingCompleted: true,
      onboardingData: JSON.stringify(onboardingData),
    },
  })

  await seedDefaultStages(dbUser.id)

  revalidatePath("/inicio")
  return { success: true }
}

export async function seedDefaultStages(userId: string) {
  // Check per-user — each workspace gets its own stages
  const existing = await prisma.pipelineStage.count({ where: { userId } })
  if (existing > 0) return

  const stages = [
    { name: "Contato",               order: 1, color: "#6B7280", probability: 10 },
    { name: "Orçamento Enviado",     order: 2, color: "#3B82F6", probability: 30 },
    { name: "Ajustes e Discussões",  order: 3, color: "#F59E0B", probability: 50 },
    { name: "Tomada de Decisões",    order: 4, color: "#8B5CF6", probability: 70 },
    { name: "Fechamento",            order: 5, color: "#10B981", probability: 90, isClosedWon: true },
    { name: "Perdido",               order: 6, color: "#EF4444", probability: 0,  isClosedLost: true },
  ]

  await prisma.pipelineStage.createMany({
    data: stages.map(s => ({ ...s, userId })),
  })
}
