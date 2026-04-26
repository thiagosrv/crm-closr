"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"

export interface CreateStageData {
  name: string
  color?: string
  probability?: number
  rottingDays?: number
  isClosedWon?: boolean
  isClosedLost?: boolean
}

async function resolveUserId() {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Não autenticado")

  const dbUser = await prisma.user.findFirst({
    where: {
      OR: [
        { id: session.user.id ?? "" },
        ...(session.user.email ? [{ email: session.user.email }] : []),
      ],
    },
    select: { id: true },
  })
  return dbUser?.id ?? session.user.id!
}

export async function createStage(data: CreateStageData) {
  const userId = await resolveUserId()

  const lastStage = await prisma.pipelineStage.findFirst({
    where: { userId },
    orderBy: { order: "desc" },
    select: { order: true },
  })

  const stage = await prisma.pipelineStage.create({
    data: {
      name: data.name,
      color: data.color ?? "#06B6D4",
      probability: data.probability ?? 0,
      rottingDays: data.rottingDays ?? 14,
      isClosedWon: data.isClosedWon ?? false,
      isClosedLost: data.isClosedLost ?? false,
      order: (lastStage?.order ?? 0) + 1,
      userId,
    },
  })

  revalidatePath("/configuracoes")
  revalidatePath("/funis")
  return stage
}

export async function updateStage(
  id: string,
  data: Partial<CreateStageData> & { order?: number }
) {
  await resolveUserId()

  const stage = await prisma.pipelineStage.update({
    where: { id },
    data,
  })

  revalidatePath("/configuracoes")
  revalidatePath("/funis")
  return stage
}

export async function deleteStage(id: string) {
  await resolveUserId()

  const count = await prisma.deal.count({ where: { stageId: id } })
  if (count > 0) {
    throw new Error(
      `Não é possível excluir esta etapa pois ela contém ${count} negociação(ões). Mova-as primeiro.`
    )
  }

  await prisma.pipelineStage.delete({ where: { id } })

  revalidatePath("/configuracoes")
  revalidatePath("/funis")
}

export async function reorderStages(stageIds: string[]) {
  await resolveUserId()

  await Promise.all(
    stageIds.map((id, index) =>
      prisma.pipelineStage.update({
        where: { id },
        data: { order: index + 1 },
      })
    )
  )

  revalidatePath("/configuracoes")
  revalidatePath("/funis")
}
