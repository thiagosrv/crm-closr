export const runtime = "nodejs"

import { type NextRequest } from "next/server"
import QRCode from "qrcode"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { connectWhatsApp, onQR, onStatus } from "@/lib/channels/whatsapp"

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return new Response("Unauthorized", { status: 401 })

  // Resolve the real DB user (handles stale JWT after DB reset)
  const dbUser = await prisma.user.findFirst({
    where: { OR: [{ id: session.user.id }, { email: session.user.email! }] },
    select: { id: true },
  })
  if (!dbUser) return new Response("User not found — please log out and log back in", { status: 401 })

  const userId = dbUser.id

  const stream = new ReadableStream({
    start(controller) {
      const enc = new TextEncoder()

      function send(event: string, data: unknown) {
        try {
          controller.enqueue(enc.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`))
        } catch { /* stream already closed */ }
      }

      const unsubQR = onQR(userId, async (qrString) => {
        try {
          const dataUrl = await QRCode.toDataURL(qrString, {
            width: 260,
            margin: 2,
            color: { dark: "#000000", light: "#ffffff" },
          })
          send("qr", { dataUrl })
        } catch (err) {
          send("error", { message: "Falha ao gerar QR Code" })
          console.error("[QR route] QRCode generation failed:", err)
        }
      })

      const unsubStatus = onStatus(userId, (status) => {
        send("status", { status })
        if (status === "CONNECTED" || status === "DISCONNECTED") {
          unsubQR()
          unsubStatus()
          try { controller.close() } catch { /* ignore */ }
        }
      })

      // Always force a fresh connection so the QR is generated immediately
      connectWhatsApp(userId, true).catch((err) => {
        console.error("[QR route] connectWhatsApp failed:", err)
        send("error", { message: String(err) })
        unsubQR()
        unsubStatus()
        try { controller.close() } catch { /* ignore */ }
      })

      req.signal.addEventListener("abort", () => {
        unsubQR()
        unsubStatus()
        try { controller.close() } catch { /* ignore */ }
      })
    },
  })

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-store",
      "Connection": "keep-alive",
      "X-Accel-Buffering": "no",
    },
  })
}
