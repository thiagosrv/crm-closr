import Link from "next/link"
import { Diamond, Lock, Zap, BarChart3, Users, Infinity } from "lucide-react"
import { Button } from "@/components/ui/button"

const benefits = [
  { icon: BarChart3, label: "Visão Geral completa do negócio" },
  { icon: Infinity, label: "Contatos ilimitados" },
  { icon: Zap, label: "Relatórios avançados e exportação" },
  { icon: Users, label: "Gestão de equipe e metas" },
]

interface Props {
  children?: React.ReactNode
}

export function FeatureLock({ children }: Props) {
  return (
    <div className="relative w-full min-h-[calc(100vh-10rem)]">
      {/* Blurred background content */}
      {children && (
        <div className="pointer-events-none select-none blur-sm opacity-40 absolute inset-0 overflow-hidden">
          {children}
        </div>
      )}

      {/* Overlay */}
      <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm rounded-xl z-10">
        <div className="glass rounded-2xl p-8 max-w-md w-full mx-4 text-center flex flex-col items-center gap-5 animate-fade-in glow-cyan">
          {/* Icon */}
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-cyan-500/10 border border-cyan-500/20">
            <Diamond className="h-8 w-8 text-cyan-400" />
          </div>

          {/* Title */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-center gap-2">
              <Lock className="h-4 w-4 text-muted-foreground" />
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
                Recurso Exclusivo
              </p>
            </div>
            <h2 className="text-2xl font-bold gradient-text">Diamond</h2>
          </div>

          <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
            A Visão Geral do Negócio está disponível apenas para usuários Diamond. Tenha
            acesso a métricas avançadas, funil de conversão e ranking de vendedores.
          </p>

          {/* Benefits */}
          <ul className="w-full flex flex-col gap-2">
            {benefits.map(({ icon: Icon, label }) => (
              <li
                key={label}
                className="flex items-center gap-3 text-sm text-muted-foreground"
              >
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-cyan-500/10">
                  <Icon className="h-3.5 w-3.5 text-cyan-400" />
                </div>
                {label}
              </li>
            ))}
          </ul>

          {/* CTA */}
          <Link
            href="/precos"
            className="w-full inline-flex items-center justify-center gap-2 rounded-md px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-cyan-500 to-violet-600 hover:from-cyan-400 hover:to-violet-500 transition-all"
          >
            <Diamond className="h-4 w-4" />
            Assinar Diamond — R$49,90/mês
          </Link>
        </div>
      </div>
    </div>
  )
}
