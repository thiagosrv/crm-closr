import Link from "next/link"
import { Check, X, Diamond, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DiamondCTA } from "@/components/planos/DiamondCTA"
import { cn } from "@/lib/utils"

const freeFeatures: { label: string; included: boolean }[] = [
  { label: "Até 10 contatos", included: true },
  { label: "Pipeline Kanban", included: true },
  { label: "Gestão de leads", included: true },
  { label: "Histórico de atividades", included: true },
  { label: "Propostas (até 3)", included: true },
  { label: "Botão WhatsApp", included: true },
  { label: "Visão Geral do Negócio", included: false },
  { label: "Relatórios avançados", included: false },
  { label: "Equipe e metas", included: false },
  { label: "Contatos ilimitados", included: false },
]

const diamondFeatures: string[] = [
  "Contatos ilimitados",
  "Visão Geral do Negócio",
  "Relatórios completos + exportação",
  "Gestão de equipe e metas",
  "Campos customizados",
  "Automação de follow-up",
  "Propostas ilimitadas + tracking",
  "Suporte prioritário",
  "Pipeline Kanban",
  "Gestão de leads",
  "Histórico de atividades",
  "Botão WhatsApp",
]

function FeatureRow({ label, included }: { label: string; included: boolean }) {
  return (
    <li className="flex items-center gap-3 text-sm">
      {included ? (
        <Check className="h-4 w-4 text-emerald-400 shrink-0" />
      ) : (
        <X className="h-4 w-4 text-muted-foreground/50 shrink-0" />
      )}
      <span className={cn(!included && "text-muted-foreground/60")}>{label}</span>
    </li>
  )
}

export default function PrecosPage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-8 py-5 border-b border-white/[0.06]">
        <Link
          href="/"
          className="flex items-center gap-2 text-xl font-bold gradient-text"
        >
          <Diamond className="h-5 w-5 text-cyan-400" />
          Closr
        </Link>
        <nav className="flex items-center gap-4">
          <Link
            href="/login"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Entrar
          </Link>
          <Link
            href="/register"
            className="inline-flex items-center rounded-md px-4 py-2 text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Começar grátis
          </Link>
        </nav>
      </header>

      {/* Hero */}
      <section className="text-center px-4 pt-16 pb-12">
        <p className="text-xs uppercase tracking-widest text-cyan-400 font-medium mb-3">
          Planos &amp; Preços
        </p>
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
          Simples, transparente,{" "}
          <span className="gradient-text">sem surpresas</span>
        </h1>
        <p className="text-muted-foreground max-w-lg mx-auto text-lg">
          Comece grátis e faça upgrade quando precisar de mais poder para o seu
          time de vendas.
        </p>
      </section>

      {/* Cards */}
      <section className="flex-1 flex items-start justify-center px-4 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl w-full">
          {/* FREE Card */}
          <div className="glass rounded-2xl p-8 flex flex-col gap-6 animate-fade-in">
            <div className="flex flex-col gap-1">
              <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider">
                Free
              </p>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold text-white">R$0</span>
                <span className="text-muted-foreground text-sm">/mês</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Para começar sua operação de vendas.
              </p>
            </div>

            <div className="h-px bg-white/[0.06]" />

            <ul className="flex flex-col gap-3">
              {freeFeatures.map((f) => (
                <FeatureRow key={f.label} {...f} />
              ))}
            </ul>

            <div className="mt-auto pt-2">
              <Link
                href="/register"
                className="w-full inline-flex items-center justify-center rounded-md px-6 py-3 text-sm font-medium border border-white/20 bg-white/5 hover:bg-white/10 transition-colors"
              >
                Começar grátis
              </Link>
            </div>
          </div>

          {/* DIAMOND Card */}
          <div
            className={cn(
              "glass rounded-2xl p-8 flex flex-col gap-6 animate-fade-in",
              "border-cyan-500/40 glow-cyan relative overflow-hidden"
            )}
          >
            {/* Top gradient line */}
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-500 to-transparent" />

            {/* "Mais popular" badge */}
            <div className="absolute top-5 right-5">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-cyan-500/30 to-violet-600/30 border border-cyan-500/40 text-cyan-300">
                <Zap className="h-3 w-3" />
                Mais popular
              </span>
            </div>

            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <Diamond className="h-4 w-4 text-cyan-400" />
                <p className="text-sm font-semibold gradient-text uppercase tracking-wider">
                  Diamond
                </p>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold text-white">R$49,90</span>
                <span className="text-muted-foreground text-sm">/mês</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Tudo que seu time de vendas precisa para crescer.
              </p>
            </div>

            <div className="h-px bg-white/[0.06]" />

            <ul className="flex flex-col gap-3">
              {diamondFeatures.map((label) => (
                <li key={label} className="flex items-center gap-3 text-sm">
                  <Check className="h-4 w-4 text-cyan-400 shrink-0" />
                  <span>{label}</span>
                </li>
              ))}
            </ul>

            <div className="mt-auto pt-2">
              <DiamondCTA />
            </div>
          </div>
        </div>
      </section>

      {/* Trust line */}
      <section className="text-center pb-16 px-4">
        <p className="text-sm text-muted-foreground">
          Sem contrato. Cancele quando quiser.{" "}
          <span className="text-cyan-400">Garantia de 7 dias.</span>
        </p>
      </section>
    </div>
  )
}
