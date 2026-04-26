import { prisma } from "@/lib/prisma"

const proposalIncludeBase = {
  deal: { select: { id: true, title: true } },
  contact: { select: { id: true, firstName: true, lastName: true, email: true } },
  author: { select: { id: true, name: true, email: true, image: true } },
} as const

export async function getProposals(filters?: { status?: string; dealId?: string }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: Record<string, any> = {}

  if (filters?.status) where.status = filters.status
  if (filters?.dealId) where.dealId = filters.dealId

  return prisma.proposal.findMany({
    where,
    include: proposalIncludeBase,
    orderBy: { updatedAt: "desc" },
  })
}

export async function getProposalById(id: string) {
  return prisma.proposal.findUnique({
    where: { id },
    include: proposalIncludeBase,
  })
}

export async function getProposalByToken(token: string) {
  return prisma.proposal.findUnique({
    where: { trackingToken: token },
    include: proposalIncludeBase,
  })
}
