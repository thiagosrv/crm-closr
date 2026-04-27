import makeWASocket, {
  AuthenticationState,
  DisconnectReason,
  fetchLatestBaileysVersion,
  WASocket,
} from "@whiskeysockets/baileys"
import { prisma } from "@/lib/prisma"
import { Boom } from "@hapi/boom"

// ─── In-memory state ─────────────────────────────────────────────────────────
const clients = new Map<string, WASocket>()
const qrCallbacks = new Map<string, ((qr: string) => void)[]>()
const statusCallbacks = new Map<string, ((status: string) => void)[]>()

// ─── Event emitters ───────────────────────────────────────────────────────────
function emitQR(userId: string, qr: string) {
  ;(qrCallbacks.get(userId) ?? []).forEach((cb) => cb(qr))
}
function emitStatus(userId: string, status: string) {
  ;(statusCallbacks.get(userId) ?? []).forEach((cb) => cb(status))
}

export function onQR(userId: string, cb: (qr: string) => void): () => void {
  const arr = qrCallbacks.get(userId) ?? []
  arr.push(cb)
  qrCallbacks.set(userId, arr)
  return () => qrCallbacks.set(userId, (qrCallbacks.get(userId) ?? []).filter((c) => c !== cb))
}
export function onStatus(userId: string, cb: (status: string) => void): () => void {
  const arr = statusCallbacks.get(userId) ?? []
  arr.push(cb)
  statusCallbacks.set(userId, arr)
  return () => statusCallbacks.set(userId, (statusCallbacks.get(userId) ?? []).filter((c) => c !== cb))
}

// ─── Auth state persistence ───────────────────────────────────────────────────
async function getSessionId(userId: string): Promise<string | null> {
  const s = await prisma.channelSession.findFirst({
    where: { userId, channel: "WHATSAPP" },
    select: { id: true },
  })
  return s?.id ?? null
}

async function loadAuthState(userId: string): Promise<AuthenticationState | null> {
  const s = await prisma.channelSession.findFirst({
    where: { userId, channel: "WHATSAPP" },
    select: { sessionData: true },
  })
  if (!s?.sessionData) return null
  try {
    const parsed = JSON.parse(s.sessionData) as { creds: AuthenticationState["creds"]; keys: Record<string, Record<string, unknown>> }
    const keysStore: Record<string, Record<string, unknown>> = parsed.keys ?? {}

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const keys: AuthenticationState["keys"] = {
      get: async (type: string, ids: string[]) => {
        const bucket = keysStore[type] ?? {}
        const result: Record<string, unknown> = {}
        ids.forEach((id) => { result[id] = bucket[id] })
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return result as any
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      set: async (data: any) => {
        for (const [type, typeData] of Object.entries(data as Record<string, Record<string, unknown>>)) {
          keysStore[type] = { ...(keysStore[type] ?? {}), ...typeData }
        }
        await prisma.channelSession.updateMany({
          where: { userId, channel: "WHATSAPP" },
          data: { sessionData: JSON.stringify({ creds: parsed.creds, keys: keysStore }) },
        })
      },
    } as AuthenticationState["keys"]

    return { creds: parsed.creds, keys }
  } catch {
    return null
  }
}

// ─── Connect ─────────────────────────────────────────────────────────────────
export async function connectWhatsApp(userId: string, force = false): Promise<void> {
  if (clients.has(userId)) {
    if (!force) return
    // Force: close existing socket cleanly before re-creating
    try { clients.get(userId)!.end(undefined) } catch { /* ignore */ }
    clients.delete(userId)
  }

  // Ensure channel session row exists
  const existingId = await getSessionId(userId)
  if (!existingId) {
    await prisma.channelSession.create({
      data: { userId, channel: "WHATSAPP", status: "CONNECTING" },
    })
  } else {
    await prisma.channelSession.update({
      where: { id: existingId },
      data: { status: "CONNECTING" },
    })
  }

  const { version } = await fetchLatestBaileysVersion()

  // Build fresh in-memory auth state (Baileys manages internally)
  const credsStore: { creds: AuthenticationState["creds"] | null } = { creds: null }
  const keysStore: Record<string, Record<string, unknown>> = {}

  const savedState = await loadAuthState(userId)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const authState: AuthenticationState = savedState ?? ({
    creds: {} as AuthenticationState["creds"],
    keys: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      get: async (_type: string, _ids: string[]) => ({} as any),
      set: async () => {},
    },
  } as AuthenticationState)

  const sock = makeWASocket({
    version,
    auth: authState,
    printQRInTerminal: false,
    browser: ["Closr CRM", "Chrome", "1.0"],
    connectTimeoutMs: 30000,
    keepAliveIntervalMs: 15000,
    generateHighQualityLinkPreview: false,
  })

  clients.set(userId, sock)

  sock.ev.on("creds.update", async () => {
    // Re-serialize current creds
    const sid = await getSessionId(userId)
    if (!sid) return
    const current = await prisma.channelSession.findUnique({ where: { id: sid }, select: { sessionData: true } })
    const parsed = current?.sessionData ? JSON.parse(current.sessionData) as { creds: unknown; keys: unknown } : { creds: {}, keys: {} }
    // creds are updated internally by baileys on the authState object
    await prisma.channelSession.update({
      where: { id: sid },
      data: { sessionData: JSON.stringify({ creds: authState.creds, keys: parsed.keys }) },
    })
    void credsStore // suppress unused warning
    void keysStore
  })

  sock.ev.on("connection.update", async (update) => {
    const { connection, lastDisconnect, qr } = update

    if (qr) {
      emitQR(userId, qr)
    }

    if (connection === "close") {
      clients.delete(userId)
      const shouldReconnect =
        (lastDisconnect?.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut

      await prisma.channelSession.updateMany({
        where: { userId, channel: "WHATSAPP" },
        data: { status: "DISCONNECTED", phoneNumber: null },
      })
      emitStatus(userId, "DISCONNECTED")

      if (shouldReconnect) {
        setTimeout(() => connectWhatsApp(userId).catch(console.error), 3000)
      }
    }

    if (connection === "open") {
      const phoneNumber = sock.user?.id?.split(":")[0] ?? null
      await prisma.channelSession.updateMany({
        where: { userId, channel: "WHATSAPP" },
        data: { status: "CONNECTED", phoneNumber },
      })
      emitStatus(userId, "CONNECTED")
    }
  })

  sock.ev.on("messages.upsert", async ({ messages: msgs, type }) => {
    if (type !== "notify") return

    for (const msg of msgs) {
      if (!msg.message) continue
      const jid = msg.key.remoteJid
      if (!jid || jid.endsWith("@g.us")) continue

      const session = await prisma.channelSession.findFirst({
        where: { userId, channel: "WHATSAPP" },
        select: { id: true },
      })
      if (!session) continue

      const displayName = msg.pushName ?? jid.split("@")[0]
      const content =
        msg.message.conversation ??
        msg.message.extendedTextMessage?.text ??
        "[mídia]"

      const conversation = await prisma.conversation.upsert({
        where: { channelSessionId_externalId: { channelSessionId: session.id, externalId: jid } },
        create: {
          channelSessionId: session.id,
          externalId: jid,
          displayName,
          lastMessageAt: new Date(),
          unreadCount: msg.key.fromMe ? 0 : 1,
        },
        update: {
          displayName: msg.key.fromMe ? undefined : displayName,
          lastMessageAt: new Date(),
          unreadCount: msg.key.fromMe ? undefined : { increment: 1 },
        },
      })

      await prisma.message.create({
        data: {
          conversationId: conversation.id,
          externalId: msg.key.id,
          direction: msg.key.fromMe ? "OUTBOUND" : "INBOUND",
          type: "TEXT",
          content,
          sentAt: new Date((msg.messageTimestamp as number) * 1000),
        },
      })
    }
  })
}

// ─── Disconnect ───────────────────────────────────────────────────────────────
export async function disconnectWhatsApp(userId: string): Promise<void> {
  const sock = clients.get(userId)
  if (sock) {
    try { await sock.logout() } catch { /* ignore */ }
    clients.delete(userId)
  }
  await prisma.channelSession.updateMany({
    where: { userId, channel: "WHATSAPP" },
    data: { status: "DISCONNECTED", phoneNumber: null, sessionData: null },
  })
}

// ─── Send ─────────────────────────────────────────────────────────────────────
export async function sendTextMessage(userId: string, jid: string, text: string): Promise<void> {
  let sock = clients.get(userId)
  if (!sock) {
    await connectWhatsApp(userId)
    sock = clients.get(userId)
  }
  if (!sock) throw new Error("WhatsApp não conectado")
  await sock.sendMessage(jid, { text })
}

export function getClientStatus(userId: string): "CONNECTED" | "DISCONNECTED" {
  return clients.has(userId) ? "CONNECTED" : "DISCONNECTED"
}

// ─── Follow-up Scheduler ──────────────────────────────────────────────────────
let schedulerStarted = false

export function startFollowUpScheduler(): void {
  if (schedulerStarted) return
  schedulerStarted = true

  setInterval(async () => {
    try {
      const now = new Date()
      const due = await prisma.followUpSchedule.findMany({
        where: { status: "PENDING", scheduledAt: { lte: now } },
        include: {
          conversation: { select: { externalId: true, channelSession: { select: { userId: true, status: true } } } },
        },
      })

      for (const fu of due) {
        try {
          if (!fu.conversation) {
            await prisma.followUpSchedule.update({ where: { id: fu.id }, data: { status: "CANCELLED", cancelReason: "Conversa não encontrada" } })
            continue
          }
          const { externalId, channelSession } = fu.conversation
          if (channelSession.status !== "CONNECTED") {
            // retry next tick
            continue
          }
          await sendTextMessage(channelSession.userId, externalId, fu.message)
          await prisma.followUpSchedule.update({
            where: { id: fu.id },
            data: { status: "SENT", sentAt: new Date() },
          })
        } catch (err) {
          console.error("[FollowUp] Error sending:", err)
          await prisma.followUpSchedule.update({
            where: { id: fu.id },
            data: { status: "CANCELLED", cancelReason: "Erro ao enviar" },
          })
        }
      }
    } catch (err) {
      console.error("[FollowUp] Scheduler error:", err)
    }
  }, 30_000) // check every 30 seconds
}

// Scheduler is started explicitly from instrumentation.ts — NOT auto-started here
