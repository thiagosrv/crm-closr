export const runtime = "nodejs"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) return Response.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params

  const conv = await prisma.conversation.findUnique({
    where: { id },
    include: {
      channelSession: { select: { userId: true } },
      messages: { orderBy: { sentAt: "asc" }, take: 15 },
      contact: true,
      lead: true,
    },
  })
  if (!conv || conv.channelSession.userId !== session.user.id) {
    return Response.json({ error: "Not found" }, { status: 404 })
  }

  if (conv.lead) {
    return Response.json({ lead: conv.lead, contact: conv.contact, alreadyExists: true })
  }

  const nameParts = (conv.displayName ?? "Contato WhatsApp").trim().split(" ")
  const firstName = nameParts[0] ?? "Contato"
  const lastName = nameParts.slice(1).join(" ") || "WhatsApp"
  const whatsapp = conv.externalId.split("@")[0] ?? ""

  const notesLines = conv.messages.slice(0, 10).map(
    (m) => `[${m.direction === "INBOUND" ? "Cliente" : "Vendedor"}] ${m.content}`
  )
  const notes = `Conversa WhatsApp:\n${notesLines.join("\n")}`

  let contact = conv.contact
  if (!contact) {
    contact = await prisma.contact.create({
      data: { firstName, lastName, whatsapp, source: "WHATSAPP" },
    })
    await prisma.conversation.update({ where: { id }, data: { contactId: contact.id } })
  }

  const dbUser = await prisma.user.findUnique({ where: { id: session.user.id }, select: { id: true } })

  const lead = await prisma.lead.create({
    data: {
      title: `Lead via WhatsApp — ${conv.displayName ?? whatsapp}`,
      source: "WHATSAPP",
      status: "NEW",
      contactId: contact.id,
      assignedToId: dbUser?.id ?? null,
      notes,
    },
  })

  await prisma.conversation.update({ where: { id }, data: { leadId: lead.id } })

  revalidatePath("/leads")
  revalidatePath("/centro-ops")

  return Response.json({ lead, contact })
}
