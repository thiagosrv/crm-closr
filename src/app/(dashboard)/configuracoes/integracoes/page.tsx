import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { WhatsAppConnectCard } from "@/components/configuracoes/WhatsAppConnectCard"
import { QuickRepliesManager } from "@/components/configuracoes/QuickRepliesManager"

export default async function IntegracoesPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const cs = await prisma.channelSession.findFirst({
    where: { userId: session.user.id, channel: "WHATSAPP" },
    select: { status: true, phoneNumber: true },
  })

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-black tracking-tighter text-white">Integrações</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Conecte seus canais de comunicação</p>
      </div>

      <div className="grid gap-6">
        <WhatsAppConnectCard
          initialStatus={cs?.status ?? "DISCONNECTED"}
          initialPhoneNumber={cs?.phoneNumber ?? null}
        />
        <div className="glass rounded-xl p-5">
          <h3 className="text-sm font-bold text-white mb-4 uppercase tracking-widest">Respostas Rápidas</h3>
          <QuickRepliesManager />
        </div>
      </div>
    </div>
  )
}
