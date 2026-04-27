export const runtime = "nodejs"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { disconnectWhatsApp } from "@/lib/channels/whatsapp"

export async function POST() {
  const session = await auth()
  if (!session?.user) return Response.json({ error: "Unauthorized" }, { status: 401 })

  const dbUser = await prisma.user.findFirst({
    where: {
      OR: [
        { id: session.user.id ?? "" },
        ...(session.user.email ? [{ email: session.user.email }] : []),
      ],
    },
    select: { id: true },
  })
  if (!dbUser) return Response.json({ error: "User not found" }, { status: 401 })

  await disconnectWhatsApp(dbUser.id)
  return Response.json({ ok: true })
}
