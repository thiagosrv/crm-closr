import { prisma } from "@/lib/prisma"

export const LIMITE_FREE = 10
export const LIMITE_FREE_CONTATOS = 10
export const LIMITE_FREE_PROPOSTAS = 3

export async function verificarLimiteContato(userId: string): Promise<{
  podeAdicionar: boolean
  total: number
  limite: number
  isPremium: boolean
}> {
  const user = await prisma.user.findUnique({ where: { id: userId } })
  const isPremium = !user || user.plano === "DIAMOND"
  const total = await prisma.contact.count()
  return {
    podeAdicionar: isPremium || total < LIMITE_FREE_CONTATOS,
    total,
    limite: LIMITE_FREE_CONTATOS,
    isPremium,
  }
}

export async function verificarLimiteProposta(userId: string): Promise<{
  podeAdicionar: boolean
  total: number
  limite: number
  isPremium: boolean
}> {
  const user = await prisma.user.findUnique({ where: { id: userId } })
  const isPremium = !user || user.plano === "DIAMOND"
  const total = await prisma.proposal.count({ where: { authorId: userId } })
  return {
    podeAdicionar: isPremium || total < LIMITE_FREE_PROPOSTAS,
    total,
    limite: LIMITE_FREE_PROPOSTAS,
    isPremium,
  }
}

export function isPlanoDiamond(plano: string): boolean {
  return plano === "DIAMOND"
}

export async function getPlanoUsuario(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { plano: true },
  })
  return user?.plano ?? "FREE"
}
