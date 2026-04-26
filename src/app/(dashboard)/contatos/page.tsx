import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { ContatosUnificados } from "@/components/contatos/ContatosUnificados"

export default async function ContatosPage() {
  const session = await auth()

  const dbUser = await prisma.user.findFirst({
    where: {
      OR: [
        { id: session?.user?.id ?? "" },
        ...(session?.user?.email ? [{ email: session.user.email }] : []),
      ],
    },
    select: { id: true },
  })

  const userId = dbUser?.id ?? session?.user?.id ?? ""

  const contacts = await prisma.contact.findMany({
    where: { isActive: true, userId },
    include: {
      leads: {
        select: { id: true, title: true, status: true },
        take: 1,
        orderBy: { createdAt: "desc" },
      },
      deals: {
        select: { id: true, title: true, status: true, stage: { select: { name: true, color: true } } },
        take: 1,
        orderBy: { createdAt: "desc" },
      },
    },
    orderBy: { createdAt: "desc" },
  })

  const stages = await prisma.pipelineStage.findMany({ where: { userId }, orderBy: { order: "asc" } })

  return <ContatosUnificados contacts={contacts} stages={stages} />
}
