import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { ConfigPerfilNovo } from "@/components/configuracoes/ConfigPerfilNovo"
import { ConfigPipeline } from "@/components/configuracoes/ConfigPipeline"

export default async function ConfiguracoesPage() {
  const session = await auth()

  const user = await prisma.user.findFirst({
    where: {
      OR: [
        { id: session?.user?.id ?? "" },
        ...(session?.user?.email ? [{ email: session.user.email }] : []),
      ],
    },
    select: { id: true, name: true, email: true, goal: true, goalPeriod: true, image: true, plano: true },
  })

  const stages = await prisma.pipelineStage.findMany({
    where: { userId: user?.id },
    orderBy: { order: "asc" },
  })

  const isWaConfigured = !!(
    process.env.WHATSAPP_ACCESS_TOKEN &&
    process.env.WHATSAPP_PHONE_NUMBER_ID
  )

  return (
    <div className="p-4 sm:p-6 max-w-3xl mx-auto space-y-6 sm:space-y-8">
      <div>
        <h1 className="brutal-heading text-2xl sm:text-3xl">Configurações</h1>
        <p className="text-[#6B7280] text-sm font-medium mt-1">Gerencie seu perfil e preferências</p>
      </div>

      {/* Perfil */}
      <section>
        <h2 className="text-[11px] font-black uppercase tracking-[0.12em] text-[#6B7280] mb-3">Perfil</h2>
        {user && <ConfigPerfilNovo user={user} />}
      </section>

      {/* Plano */}
      <section>
        <h2 className="text-[11px] font-black uppercase tracking-[0.12em] text-[#6B7280] mb-3">Plano</h2>
        <div className="brutal-card p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-black text-[#0F2044] text-lg">
                Plano {user?.plano ?? "FREE"}
              </p>
              <p className="text-sm text-[#6B7280] mt-1">
                {user?.plano === "DIAMOND"
                  ? "Acesso ilimitado a todos os recursos do CLOSR."
                  : "Faça upgrade para desbloquear recursos ilimitados."}
              </p>
            </div>
            {user?.plano !== "DIAMOND" && (
              <div
                className="px-4 py-2 text-sm font-black uppercase"
                style={{ background: "#84CC16", border: "2px solid #0F2044", boxShadow: "3px 3px 0 #0F2044", borderRadius: "2px", cursor: "pointer" }}
              >
                Fazer Upgrade
              </div>
            )}
          </div>
        </div>
      </section>

      {/* WhatsApp Business */}
      <section>
        <h2 className="text-[11px] font-black uppercase tracking-[0.12em] text-[#6B7280] mb-3">WhatsApp Business</h2>
        <div className="brutal-card p-5">
          <div className="flex items-center gap-3 mb-4">
            <div
              className="w-4 h-4 shrink-0"
              style={{ background: isWaConfigured ? "#84CC16" : "#EF4444", border: "2px solid #0F2044", borderRadius: "2px" }}
            />
            <span className="font-black text-[#0F2044]">
              {isWaConfigured ? "WhatsApp configurado e ativo" : "WhatsApp não configurado"}
            </span>
          </div>
          {!isWaConfigured && (
            <p className="text-sm text-[#6B7280] leading-relaxed">
              Configure as variáveis de ambiente{" "}
              <code className="font-mono text-xs bg-[#F4F4F4] px-1 py-0.5" style={{ border: "1px solid #0F2044" }}>WHATSAPP_ACCESS_TOKEN</code>,{" "}
              <code className="font-mono text-xs bg-[#F4F4F4] px-1 py-0.5" style={{ border: "1px solid #0F2044" }}>WHATSAPP_PHONE_NUMBER_ID</code> e{" "}
              <code className="font-mono text-xs bg-[#F4F4F4] px-1 py-0.5" style={{ border: "1px solid #0F2044" }}>WHATSAPP_WEBHOOK_SECRET</code> no servidor
              para ativar o módulo de Comunicações.{" "}
              <a href="/comunicacoes" className="font-black" style={{ color: "#84CC16" }}>Ver instruções →</a>
            </p>
          )}
        </div>
      </section>

      {/* Pipeline stages */}
      <section>
        <h2 className="text-[11px] font-black uppercase tracking-[0.12em] text-[#6B7280] mb-3">Etapas do Funil</h2>
        <ConfigPipeline stages={stages} />
      </section>
    </div>
  )
}
