export const runtime = "nodejs"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) return Response.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  await prisma.followUpSchedule.updateMany({
    where: { id, userId: session.user.id, status: "PENDING" },
    data: { status: "CANCELLED", cancelReason: "Cancelado pelo usuário" },
  })
  return Response.json({ ok: true })
}
