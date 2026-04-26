import { prisma } from "@/lib/prisma"

export interface ContactsFilters {
  userId: string
  search?: string
  page?: number
  pageSize?: number
}

export async function getContacts(filters: ContactsFilters) {
  const { userId, search, page = 1, pageSize = 20 } = filters

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: Record<string, any> = { isActive: true, userId }

  if (search) {
    where.AND = [
      { userId },
      {
        OR: [
          { firstName: { contains: search } },
          { lastName: { contains: search } },
          { email: { contains: search } },
          { company: { contains: search } },
          { phone: { contains: search } },
        ],
      },
    ]
    delete where.userId
  }

  const [contacts, total] = await Promise.all([
    prisma.contact.findMany({
      where,
      include: { _count: { select: { deals: true, leads: true } } },
      orderBy: { updatedAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.contact.count({ where }),
  ])

  return { contacts, total, page, pageSize, totalPages: Math.ceil(total / pageSize) }
}

export async function getContactById(id: string) {
  return prisma.contact.findUnique({
    where: { id },
    include: {
      deals: { include: { stage: true }, orderBy: { updatedAt: "desc" } },
      leads: { orderBy: { createdAt: "desc" } },
      activities: {
        include: { user: { select: { id: true, name: true, image: true } } },
        orderBy: { createdAt: "desc" },
      },
      proposals: {
        include: { author: { select: { id: true, name: true, image: true } } },
        orderBy: { createdAt: "desc" },
      },
    },
  })
}
