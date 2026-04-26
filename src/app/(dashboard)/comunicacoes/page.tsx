import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { ComunicacoesClient } from "@/components/comunicacoes/ComunicacoesClient"

export default async function ComunicacoesPage() {
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

  const isConfigured = !!(
    process.env.WHATSAPP_ACCESS_TOKEN &&
    process.env.WHATSAPP_PHONE_NUMBER_ID
  )

  const conversations = dbUser && isConfigured
    ? await prisma.conversation.findMany({
        where: { channelSession: { userId: dbUser.id } },
        include: {
          labels: true,
          contact: { select: { id: true, firstName: true, lastName: true } },
          messages: {
            orderBy: { sentAt: "desc" },
            take: 1,
            select: { content: true, direction: true, sentAt: true },
          },
        },
        orderBy: { lastMessageAt: "desc" },
        take: 50,
      })
    : []

  return <ComunicacoesClient isConfigured={isConfigured} conversations={conversations} />
}
