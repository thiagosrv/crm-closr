export const runtime = "nodejs"

import { auth } from "@/auth"
import { disconnectWhatsApp } from "@/lib/channels/whatsapp"

export async function POST() {
  const session = await auth()
  if (!session?.user?.id) return Response.json({ error: "Unauthorized" }, { status: 401 })

  await disconnectWhatsApp(session.user.id)
  return Response.json({ ok: true })
}
