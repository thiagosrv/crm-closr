export const runtime = "nodejs"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return Response.json({ error: "Unauthorized" }, { status: 401 })

  const dbUser = await prisma.user.findFirst({
    where: { OR: [{ id: session.user.id }, ...(session.user.email ? [{ email: session.user.email }] : [])] },
    select: { id: true },
  })
  if (!dbUser) return Response.json({ status: "DISCONNECTED", phoneNumber: null })

  const cs = await prisma.channelSession.findFirst({
    where: { userId: dbUser.id, channel: "WHATSAPP" },
    select: { status: true, phoneNumber: true },
  })

  return Response.json({
    status: cs?.status ?? "DISCONNECTED",
    phoneNumber: cs?.phoneNumber ?? null,
  })
}
