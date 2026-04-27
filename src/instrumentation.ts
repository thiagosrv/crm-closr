/**
 * Next.js Instrumentation — roda uma vez quando o servidor Node.js inicia.
 * Usado para reconectar automaticamente sessões WhatsApp (Baileys)
 * após reinicialização do servidor (deploy, crash, etc.).
 */
export async function register() {
  // Executa apenas no runtime Node.js (não no Edge runtime)
  if (process.env.NEXT_RUNTIME !== "nodejs") return

  try {
    const { prisma } = await import("@/lib/prisma")
    const { connectWhatsApp } = await import("@/lib/channels/whatsapp")

    // Busca todas as sessões que tinham credenciais salvas
    const sessions = await prisma.channelSession.findMany({
      where: {
        channel: "WHATSAPP",
        sessionData: { not: null },
      },
      select: { userId: true },
    })

    if (sessions.length === 0) return

    console.log(`[Startup] Reconectando ${sessions.length} sessão(ões) WhatsApp...`)

    for (const session of sessions) {
      // Não aguarda — conecta em background para não atrasar o startup
      connectWhatsApp(session.userId).catch((err) => {
        console.error(`[Startup] Falha ao reconectar WhatsApp (userId: ${session.userId}):`, err)
      })
    }
  } catch (err) {
    // Nunca deve travar o startup do servidor
    console.error("[Startup] Erro na reconexão automática do WhatsApp:", err)
  }
}
