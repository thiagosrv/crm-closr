import Link from "next/link"
import {
  Zap, Gem, Check, ArrowRight, MessageCircle, Kanban,
  Calendar, BarChart3, Users, Bell, RefreshCw, Shield,
  TrendingUp, Clock, XCircle, AlertTriangle, ChevronRight,
} from "lucide-react"

const FEATURES = [
  {
    icon: Kanban,
    title: "Pipeline Kanban Visual",
    desc: "Visualize cada negociação em tempo real. Arraste cards entre etapas, defina probabilidades e saiba exatamente onde seu dinheiro está parado.",
    color: "#3B82F6",
  },
  {
    icon: MessageCircle,
    title: "WhatsApp Business Integrado",
    desc: "Receba e responda mensagens direto no CRM, sem alternar abas. Histórico completo de conversa vinculado a cada lead automaticamente.",
    color: "#25D366",
  },
  {
    icon: Calendar,
    title: "Calendário & Agenda de Compromissos",
    desc: "Agende reuniões, ligações e visitas. Receba alertas automáticos 1 hora antes de cada compromisso para nunca mais perder uma reunião.",
    color: "#8B5CF6",
  },
  {
    icon: RefreshCw,
    title: "Follow-ups Automáticos",
    desc: "Defina réguas de contato e o CLOSR lembra (ou envia automaticamente) a mensagem certa, para o lead certo, na hora certa.",
    color: "#F59E0B",
  },
  {
    icon: Users,
    title: "Listas de Contatos Ilimitadas",
    desc: "Centralize leads, clientes e prospects em um único lugar. Segmente por estágio, origem, empresa ou qualquer campo customizado.",
    color: "#84CC16",
  },
  {
    icon: BarChart3,
    title: "Dashboard & Insights",
    desc: "Taxa de conversão, ticket médio, ciclo de venda, receita por mês. Tome decisões com dados reais, não com chute.",
    color: "#EF4444",
  },
  {
    icon: Bell,
    title: "Alertas e Notificações",
    desc: "Negociação parada há muito tempo? Lead sem contato há 5 dias? O CLOSR alerta antes que o cliente vá embora.",
    color: "#0F2044",
  },
  {
    icon: MessageCircle,
    title: "Mensagens Automatizadas",
    desc: "Templates prontos de WhatsApp para follow-up, confirmação de reunião, envio de proposta e pós-venda. Um clique, enviado.",
    color: "#06B6D4",
  },
]

const PAIN_POINTS = [
  "Perder um lead porque esqueceu de fazer follow-up",
  "Não saber em que etapa cada negociação está",
  "Cliente sumiu e você não sabe quando foi o último contato",
  "Proposta enviada há 2 semanas sem retorno",
  "Time de vendas sem visibilidade do pipeline",
  "Reunião marcada que você só lembrou quando o cliente ligou",
]

const FREE_FEATURES = [
  "Pipeline básico (até 3 etapas)",
  "50 contatos",
  "WhatsApp manual",
  "Relatórios básicos",
]

const DIAMOND_FEATURES = [
  "Pipeline ilimitado com etapas customizadas",
  "Contatos ilimitados + campos customizados",
  "WhatsApp Business API integrado",
  "Follow-ups automáticos com régua de contato",
  "Calendário com alertas automáticos",
  "Dashboard completo + exportação PDF",
  "Mensagens automatizadas (templates)",
  "Alertas de negociação parada",
  "Suporte prioritário",
  "Onboarding assistido",
]

const STATS = [
  { value: "38%", label: "mais conversões em média" },
  { value: "3x", label: "mais follow-ups realizados" },
  { value: "12h", label: "economizadas por vendedor/semana" },
  { value: "R$ 0", label: "perdido por esquecimento" },
]

export default function PlanoDiamondPage() {
  return (
    <div style={{ background: "#FFFFFF", color: "#0F2044" }}>

      {/* ── NAV ── */}
      <nav
        className="sticky top-0 z-50 flex items-center justify-between px-6 py-4"
        style={{ background: "#0F2044", borderBottom: "3px solid #0F2044" }}
      >
        <Link href="/inicio" className="flex items-center gap-2.5">
          <div className="w-8 h-8 flex items-center justify-center" style={{ background: "#84CC16" }}>
            <Zap className="w-4 h-4 text-[#0F2044]" fill="#0F2044" />
          </div>
          <span className="text-xl font-black text-white" style={{ letterSpacing: "-0.05em" }}>CLOSR</span>
        </Link>

        <div className="flex items-center gap-3">
          <Link
            href="/inicio"
            className="text-white/60 hover:text-white text-sm font-bold transition-colors"
          >
            ← Voltar ao painel
          </Link>
          <a
            href="#upgrade"
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-black"
            style={{
              background: "#84CC16",
              border: "2px solid #84CC16",
              boxShadow: "3px 3px 0 rgba(132,204,22,0.4)",
              borderRadius: "2px",
              color: "#0F2044",
            }}
          >
            <Gem className="w-3.5 h-3.5" />
            Assinar Diamond
          </a>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section
        className="relative overflow-hidden px-6 py-24 text-center"
        style={{ background: "#0F2044" }}
      >
        {/* Grid texture */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.05]"
          style={{
            backgroundImage: "linear-gradient(#84CC16 1px, transparent 1px), linear-gradient(90deg, #84CC16 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
        {/* Decorative squares */}
        <div className="absolute top-12 left-12 w-20 h-20 opacity-10" style={{ background: "#84CC16" }} />
        <div className="absolute bottom-12 right-12 w-12 h-12 opacity-[0.08]" style={{ background: "#84CC16" }} />
        <div className="absolute top-1/3 right-24 w-8 h-8 opacity-15 border-2 border-[#84CC16]" />

        <div className="relative z-10 max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 mb-8 text-[11px] font-black uppercase tracking-widest"
            style={{ background: "#84CC16", color: "#0F2044", borderRadius: "2px" }}>
            <Gem className="w-3.5 h-3.5" />
            Plano Diamond — A versão completa do CLOSR
          </div>

          <h1
            className="text-4xl md:text-5xl lg:text-6xl font-black text-white leading-[1.05] mb-6"
            style={{ letterSpacing: "-0.03em" }}
          >
            A maioria das vendas não é perdida
            <br />
            <span style={{ color: "#84CC16" }}>para a concorrência.</span>
            <br />
            É perdida para o esquecimento.
          </h1>

          <p className="text-lg md:text-xl text-white/55 font-medium leading-relaxed mb-10 max-w-2xl mx-auto">
            Follow-up atrasado. Lead sem contato. Proposta esquecida. Reunião perdida.
            O CLOSR Diamond elimina tudo isso com automações, alertas e o pipeline
            mais visual do mercado.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="#upgrade"
              className="flex items-center gap-2 px-8 py-4 text-base font-black"
              style={{
                background: "#84CC16",
                border: "3px solid #84CC16",
                boxShadow: "5px 5px 0 rgba(132,204,22,0.35)",
                borderRadius: "2px",
                color: "#0F2044",
              }}
            >
              <Gem className="w-5 h-5" />
              Quero o Diamond agora
              <ArrowRight className="w-4 h-4" />
            </a>
            <a
              href="#features"
              className="text-white/60 hover:text-white text-sm font-bold transition-colors flex items-center gap-1"
            >
              Ver todas as funcionalidades
              <ChevronRight className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Bottom lime bar */}
        <div className="absolute bottom-0 left-0 right-0 h-[4px]" style={{ background: "#84CC16" }} />
      </section>

      {/* ── STATS ── */}
      <section style={{ background: "#F4F4F4", borderBottom: "3px solid #0F2044" }}>
        <div className="max-w-5xl mx-auto px-6 py-12 grid grid-cols-2 md:grid-cols-4 gap-6">
          {STATS.map(s => (
            <div key={s.label} className="text-center">
              <p className="text-3xl md:text-4xl font-black text-[#0F2044]"
                style={{ letterSpacing: "-0.03em" }}>{s.value}</p>
              <p className="text-xs font-black uppercase tracking-widest text-[#6B7280] mt-2">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── PAIN POINTS ── */}
      <section className="px-6 py-20 max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 mb-4 text-[10px] font-black uppercase tracking-widest"
            style={{ background: "#FEE2E2", border: "2px solid #EF4444", color: "#B91C1C", borderRadius: "2px" }}>
            <AlertTriangle className="w-3 h-3" />
            Você se identifica com algum destes cenários?
          </div>
          <h2 className="text-3xl md:text-4xl font-black text-[#0F2044]" style={{ letterSpacing: "-0.03em" }}>
            Cada um desses cenários é
            <br />
            <span className="underline decoration-[#EF4444] decoration-4">dinheiro jogado fora</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {PAIN_POINTS.map((point, i) => (
            <div
              key={i}
              className="flex items-start gap-3 p-4"
              style={{
                background: "#FFFFFF",
                border: "2px solid #0F2044",
                boxShadow: "3px 3px 0 #0F2044",
                borderRadius: "2px",
              }}
            >
              <div className="w-7 h-7 shrink-0 flex items-center justify-center mt-0.5"
                style={{ background: "#FEE2E2", border: "2px solid #EF4444", borderRadius: "2px" }}>
                <XCircle className="w-3.5 h-3.5 text-red-600" />
              </div>
              <p className="text-sm font-bold text-[#0F2044] leading-snug">{point}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 p-6 text-center"
          style={{
            background: "#0F2044",
            border: "3px solid #0F2044",
            boxShadow: "5px 5px 0 #84CC16",
            borderRadius: "2px",
          }}
        >
          <p className="text-white font-black text-lg">
            Com o <span style={{ color: "#84CC16" }}>CLOSR Diamond</span>, nenhum desses cenários existe.
          </p>
          <p className="text-white/60 text-sm mt-1 font-medium">
            O sistema trabalha enquanto você vende.
          </p>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" style={{ background: "#F4F4F4", borderTop: "3px solid #0F2044", borderBottom: "3px solid #0F2044" }}>
        <div className="max-w-6xl mx-auto px-6 py-20">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 mb-4 text-[10px] font-black uppercase tracking-widest"
              style={{ background: "#84CC16", border: "2px solid #0F2044", color: "#0F2044", borderRadius: "2px" }}>
              <Zap className="w-3 h-3" />
              Tudo que você precisa para vender mais
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-[#0F2044]" style={{ letterSpacing: "-0.03em" }}>
              8 ferramentas. 1 plataforma.
              <br />
              <span style={{ color: "#84CC16" }}>Zero desculpa para não fechar.</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="flex flex-col p-5 bg-white"
                style={{
                  border: "2px solid #0F2044",
                  boxShadow: "4px 4px 0 #0F2044",
                  borderRadius: "2px",
                  borderTop: `4px solid ${f.color}`,
                }}
              >
                <div
                  className="w-10 h-10 flex items-center justify-center mb-4"
                  style={{ background: `${f.color}18`, border: `2px solid ${f.color}`, borderRadius: "2px" }}
                >
                  <f.icon className="w-5 h-5" style={{ color: f.color }} />
                </div>
                <h3 className="text-sm font-black text-[#0F2044] mb-2 leading-snug">{f.title}</h3>
                <p className="text-xs text-[#6B7280] font-medium leading-relaxed flex-1">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="px-6 py-20 max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-black text-[#0F2044]" style={{ letterSpacing: "-0.03em" }}>
            Como o Diamond funciona
            <br />
            <span style={{ color: "#84CC16" }}>no dia a dia do seu time</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              step: "01",
              title: "Lead entra no funil",
              desc: "Via WhatsApp, formulário ou cadastro manual. O CLOSR cria automaticamente o card no Kanban na etapa correta.",
              icon: Users,
              color: "#3B82F6",
            },
            {
              step: "02",
              title: "Sistema faz o acompanhamento",
              desc: "Alertas de follow-up, lembretes de reunião, mensagens automáticas no momento certo. Você só age quando necessário.",
              icon: RefreshCw,
              color: "#84CC16",
            },
            {
              step: "03",
              title: "Você fecha, o dashboard registra",
              desc: "Receita, conversão, ticket médio, ciclo de venda. Dados em tempo real para você vender mais no próximo mês.",
              icon: TrendingUp,
              color: "#F59E0B",
            },
          ].map(s => (
            <div key={s.step} className="relative">
              <div
                className="p-6"
                style={{
                  background: "#FFFFFF",
                  border: "2px solid #0F2044",
                  boxShadow: "5px 5px 0 #0F2044",
                  borderRadius: "2px",
                }}
              >
                <div className="flex items-start gap-4 mb-4">
                  <span
                    className="text-4xl font-black leading-none"
                    style={{ color: s.color, letterSpacing: "-0.05em" }}
                  >
                    {s.step}
                  </span>
                  <div
                    className="w-10 h-10 flex items-center justify-center shrink-0"
                    style={{ background: `${s.color}15`, border: `2px solid ${s.color}`, borderRadius: "2px" }}
                  >
                    <s.icon className="w-5 h-5" style={{ color: s.color }} />
                  </div>
                </div>
                <h3 className="text-base font-black text-[#0F2044] mb-2">{s.title}</h3>
                <p className="text-sm text-[#6B7280] font-medium leading-relaxed">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── PRICING ── */}
      <section
        id="upgrade"
        style={{ background: "#0F2044", borderTop: "3px solid #0F2044" }}
      >
        {/* Grid texture */}
        <div
          className="relative overflow-hidden"
          style={{
            backgroundImage: "linear-gradient(rgba(132,204,22,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(132,204,22,0.04) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        >
          <div className="max-w-5xl mx-auto px-6 py-20">
            <div className="text-center mb-14">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 mb-4 text-[10px] font-black uppercase tracking-widest"
                style={{ background: "#84CC16", color: "#0F2044", borderRadius: "2px" }}>
                <Gem className="w-3 h-3" />
                Escolha seu plano
              </div>
              <h2 className="text-3xl md:text-4xl font-black text-white" style={{ letterSpacing: "-0.03em" }}>
                Simples assim.
                <br />
                <span style={{ color: "#84CC16" }}>Sem pegadinhas.</span>
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">

              {/* FREE card */}
              <div
                className="p-6"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "2px solid rgba(255,255,255,0.15)",
                  borderRadius: "2px",
                }}
              >
                <div className="mb-6">
                  <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-2">Plano Atual</p>
                  <h3 className="text-2xl font-black text-white">Free</h3>
                  <p className="text-4xl font-black text-white mt-3" style={{ letterSpacing: "-0.03em" }}>
                    R$ 0<span className="text-lg text-white/40">/mês</span>
                  </p>
                </div>
                <div className="space-y-2.5 mb-8">
                  {FREE_FEATURES.map(f => (
                    <div key={f} className="flex items-center gap-2.5">
                      <div className="w-4 h-4 shrink-0 flex items-center justify-center"
                        style={{ border: "1.5px solid rgba(255,255,255,0.2)", borderRadius: "2px" }}>
                        <Check className="w-2.5 h-2.5 text-white/40" />
                      </div>
                      <span className="text-sm text-white/50 font-medium">{f}</span>
                    </div>
                  ))}
                </div>
                <div
                  className="w-full py-3 text-center text-sm font-black text-white/40"
                  style={{ border: "2px solid rgba(255,255,255,0.15)", borderRadius: "2px" }}
                >
                  Plano atual
                </div>
              </div>

              {/* DIAMOND card */}
              <div
                className="p-6 relative"
                style={{
                  background: "#FFFFFF",
                  border: "3px solid #84CC16",
                  boxShadow: "6px 6px 0 #84CC16",
                  borderRadius: "2px",
                }}
              >
                {/* Popular badge */}
                <div
                  className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 text-[10px] font-black uppercase tracking-widest whitespace-nowrap"
                  style={{ background: "#84CC16", border: "2px solid #0F2044", color: "#0F2044", borderRadius: "2px" }}
                >
                  ✦ Mais Popular
                </div>

                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Gem className="w-4 h-4 text-[#84CC16]" />
                    <p className="text-[10px] font-black uppercase tracking-widest text-[#84CC16]">Diamond</p>
                  </div>
                  <h3 className="text-2xl font-black text-[#0F2044]">Tudo incluso</h3>
                  <div className="mt-3">
                    <p className="text-4xl font-black text-[#0F2044]" style={{ letterSpacing: "-0.03em" }}>
                      R$ 97<span className="text-lg text-[#6B7280]">/mês</span>
                    </p>
                    <p className="text-xs text-[#6B7280] mt-1 font-medium">ou R$ 970/ano — 2 meses grátis</p>
                  </div>
                </div>

                <div className="space-y-2.5 mb-8">
                  {DIAMOND_FEATURES.map(f => (
                    <div key={f} className="flex items-center gap-2.5">
                      <div
                        className="w-4 h-4 shrink-0 flex items-center justify-center"
                        style={{ background: "#84CC16", border: "2px solid #0F2044", borderRadius: "2px" }}
                      >
                        <Check className="w-2.5 h-2.5 text-[#0F2044]" />
                      </div>
                      <span className="text-sm text-[#0F2044] font-bold">{f}</span>
                    </div>
                  ))}
                </div>

                <button
                  className="w-full flex items-center justify-center gap-2 py-3.5 text-sm font-black"
                  style={{
                    background: "#0F2044",
                    border: "2px solid #0F2044",
                    boxShadow: "4px 4px 0 #84CC16",
                    borderRadius: "2px",
                    color: "#FFFFFF",
                  }}
                >
                  <Gem className="w-4 h-4" />
                  Assinar Diamond agora
                  <ArrowRight className="w-4 h-4" />
                </button>

                <p className="text-center text-[10px] text-[#6B7280] mt-3 font-medium">
                  ✓ 7 dias grátis &nbsp;·&nbsp; ✓ Cancele quando quiser &nbsp;·&nbsp; ✓ Sem taxa de setup
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── GUARANTEE ── */}
      <section
        className="px-6 py-16"
        style={{ background: "#F4F4F4", borderTop: "3px solid #0F2044" }}
      >
        <div className="max-w-2xl mx-auto text-center">
          <div
            className="inline-flex items-center justify-center w-16 h-16 mb-6"
            style={{ background: "#0F2044", border: "3px solid #0F2044", boxShadow: "4px 4px 0 #84CC16", borderRadius: "2px" }}
          >
            <Shield className="w-8 h-8 text-[#84CC16]" />
          </div>
          <h2 className="text-2xl md:text-3xl font-black text-[#0F2044] mb-4" style={{ letterSpacing: "-0.03em" }}>
            Garantia de 7 dias
          </h2>
          <p className="text-[#6B7280] font-medium leading-relaxed mb-8">
            Teste o CLOSR Diamond por 7 dias sem compromisso. Se não fechar mais negócios,
            se não organizar melhor seu pipeline, se não economizar pelo menos 3 horas por semana —
            <strong className="text-[#0F2044]"> devolvemos 100% do valor</strong>, sem perguntas.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href="#upgrade"
              className="flex items-center gap-2 px-8 py-4 text-base font-black"
              style={{
                background: "#84CC16",
                border: "2px solid #0F2044",
                boxShadow: "4px 4px 0 #0F2044",
                borderRadius: "2px",
                color: "#0F2044",
              }}
            >
              <Gem className="w-5 h-5" />
              Quero fechar mais negócios
            </a>
            <Link
              href="/inicio"
              className="text-sm font-bold text-[#6B7280] hover:text-[#0F2044] transition-colors flex items-center gap-1"
            >
              Continuar no plano free
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer
        className="px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4"
        style={{ background: "#0F2044", borderTop: "3px solid #0F2044" }}
      >
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 flex items-center justify-center" style={{ background: "#84CC16" }}>
            <Zap className="w-3.5 h-3.5 text-[#0F2044]" fill="#0F2044" />
          </div>
          <span className="text-lg font-black text-white" style={{ letterSpacing: "-0.05em" }}>CLOSR</span>
        </div>
        <p className="text-white/30 text-xs font-medium">
          © {new Date().getFullYear()} CLOSR. Todos os direitos reservados.
        </p>
        <div className="flex items-center gap-4">
          <span className="text-white/30 text-xs font-medium cursor-pointer hover:text-white/60 transition-colors">Termos de Uso</span>
          <span className="text-white/30 text-xs font-medium cursor-pointer hover:text-white/60 transition-colors">Privacidade</span>
        </div>
      </footer>
    </div>
  )
}
