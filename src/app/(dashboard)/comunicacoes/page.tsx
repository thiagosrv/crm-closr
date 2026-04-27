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

  // Check WhatsApp session in DB (Baileys-based, no env vars needed)
  const channelSession = dbUser
    ? await prisma.channelSession.findFirst({
        where: { userId: dbUser.id, channel: "WHATSAPP" },
        select: { status: true, phoneNumber: true },
      })
    : null

  const isConnected = channelSession?.status === "CONNECTED"

  const conversations = dbUser && isConnected
    ? await prisma.conversation.findMany({
        where: { channelSession: { userId: dbUser.id, channel: "WHATSAPP" } },
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

  return (
    <ComunicacoesClient
      isConnected={isConnected}
      phoneNumber={channelSession?.phoneNumber ?? null}
      conversations={conversations}
    />
  )
}
