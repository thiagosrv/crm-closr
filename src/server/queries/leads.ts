import { prisma } from "@/lib/prisma"

export interface LeadsFilters {
  search?: string
  status?: "NEW" | "CONTACTED" | "QUALIFIED" | "DISQUALIFIED" | "CONVERTED"
  source?: string
  assignedToId?: string
  page?: number
  pageSize?: number
}

export async function getLeads(filters: LeadsFilters = {}) {
  const { search, status, source, assignedToId, page = 1, pageSize = 20 } = filters

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: Record<string, any> = {}

  if (status) where.status = status
  if (assignedToId) where.assignedToId = assignedToId
  if (source) where.source = source
  if (search) {
    where.OR = [
      { title: { contains: search } },
      { contact: { firstName: { contains: search } } },
      { contact: { lastName: { contains: search } } },
      { contact: { company: { contains: search } } },
      { campaign: { contains: search } },
    ]
  }

  const [leads, total] = await Promise.all([
    prisma.lead.findMany({
      where,
      include: {
        contact: true,
        assignedTo: {
          select: { id: true, name: true, email: true, image: true },
        },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.lead.count({ where }),
  ])

  return { leads, total, page, pageSize, totalPages: Math.ceil(total / pageSize) }
}

export async function getLeadById(id: string) {
  return prisma.lead.findUnique({
    where: { id },
    include: {
      contact: true,
      assignedTo: {
        select: { id: true, name: true, email: true, image: true },
      },
      activities: {
        include: {
          user: { select: { id: true, name: true, image: true } },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  })
}
