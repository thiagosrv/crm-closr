const BASE_URL = "https://graph.facebook.com/v18.0"

export async function sendTextMessage(to: string, text: string) {
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN

  if (!phoneNumberId || !accessToken) {
    throw new Error("WhatsApp Business API não configurado")
  }

  const res = await fetch(`${BASE_URL}/${phoneNumberId}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to,
      type: "text",
      text: { body: text },
    }),
  })

  if (!res.ok) {
    const error = await res.json()
    throw new Error(JSON.stringify(error))
  }

  return res.json()
}

export function verifyWebhook(
  mode: string,
  token: string,
  challenge: string
): string | null {
  const verifyToken = process.env.WHATSAPP_WEBHOOK_SECRET
  if (mode === "subscribe" && token === verifyToken) {
    return challenge
  }
  return null
}

export interface InboundMessage {
  from: string
  id: string
  timestamp: string
  type: string
  text?: { body: string }
  displayName?: string
}

export function parseWebhookPayload(body: unknown): InboundMessage[] {
  const messages: InboundMessage[] = []

  try {
    const payload = body as {
      entry?: {
        changes?: {
          value?: {
            messages?: {
              from: string
              id: string
              timestamp: string
              type: string
              text?: { body: string }
            }[]
            contacts?: { profile?: { name?: string }; wa_id: string }[]
          }
        }[]
      }[]
    }

    for (const entry of payload.entry ?? []) {
      for (const change of entry.changes ?? []) {
        const value = change.value
        if (!value?.messages) continue

        const contactMap = new Map<string, string>()
        for (const c of value.contacts ?? []) {
          if (c.profile?.name) contactMap.set(c.wa_id, c.profile.name)
        }

        for (const msg of value.messages) {
          messages.push({
            from: msg.from,
            id: msg.id,
            timestamp: msg.timestamp,
            type: msg.type,
            text: msg.text,
            displayName: contactMap.get(msg.from),
          })
        }
      }
    }
  } catch {
    // ignore parse errors
  }

  return messages
}
