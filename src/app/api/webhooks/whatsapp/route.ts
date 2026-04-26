export const runtime = "nodejs"

import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyWebhook, parseWebhookPayload } from "@/lib/channels/whatsapp-cloud"

// GET: webhook verification (Meta hub.challenge)
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const mode = searchParams.get("hub.mode") ?? ""
  const token = searchParams.get("hub.verify_token") ?? ""
  const challenge = searchParams.get("hub.challenge") ?? ""

  const result = verifyWebhook(mode, token, challenge)
  if (result) {
    return new NextResponse(result, { status: 200 })
  }
  return NextResponse.json({ error: "Forbidden" }, { status: 403 })
}

// POST: receive inbound messages
export async function POST(req: NextRequest) {
  const body = await req.json()
  const messages = parseWebhookPayload(body)

  for (const msg of messages) {
    const jid = msg.from

    // Find a ChannelSession to attribute this message to
    // In a multi-user setup, we'd need to match by phone number
    // For now, use the first matching ChannelSession
    const session = await prisma.channelSession.findFirst({
      where: { channel: "WHATSAPP" },
      select: { id: true },
    })
    if (!session) continue

    // Upsert conversation
    const conversation = await prisma.conversation.upsert({
      where: {
        channelSessionId_externalId: {
          channelSessionId: session.id,
          externalId: jid,
        },
      },
      create: {
        channelSessionId: session.id,
        externalId: jid,
        displayName: msg.displayName ?? jid,
        lastMessageAt: new Date(),
        unreadCount: 1,
      },
      update: {
        lastMessageAt: new Date(),
        displayName: msg.displayName ?? undefined,
        unreadCount: { increment: 1 },
      },
    })

    // Create message
    if (msg.text?.body) {
      await prisma.message.create({
        data: {
          conversationId: conversation.id,
          externalId: msg.id,
          direction: "INBOUND",
          type: "TEXT",
          content: msg.text.body,
          sentAt: new Date(parseInt(msg.timestamp) * 1000),
        },
      })
    }
  }

  return NextResponse.json({ status: "ok" })
}
