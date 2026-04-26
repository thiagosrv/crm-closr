"use client"

import Link from "next/link"
import {
  Diamond,
  X,
  Infinity,
  BarChart3,
  Users,
  Zap,
  FileText,
  Headphones,
} from "lucide-react"

const diamondBenefits = [
  { icon: Infinity, label: "Contatos ilimitados" },
  { icon: BarChart3, label: "Visão Geral do Negócio" },
  { icon: FileText, label: "Propostas ilimitadas + tracking" },
  { icon: Users, label: "Gestão de equipe e metas" },
  { icon: Zap, label: "Automação de follow-up" },
  { icon: Headphones, label: "Suporte prioritário" },
]

interface Props {
  open: boolean
  onClose: () => void
}

export function UpgradeModal({ open, onClose }: Props) {
  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="glass rounded-2xl p-8 max-w-sm w-full flex flex-col gap-5 animate-fade-in glow-cyan relative">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Fechar"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Icon */}
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-cyan-500/10 border border-cyan-500/20 mx-auto">
          <Diamond className="h-7 w-7 text-cyan-400" />
        </div>

        {/* Heading */}
        <div className="text-center">
          <h2 className="text-xl font-bold text-white mb-1">Limite atingido</h2>
          <p className="text-sm text-muted-foreground">
            Você atingiu o limite de{" "}
            <span className="text-white font-medium">10 contatos</span> no plano Free.
          </p>
        </div>

        {/* Benefits */}
        <div className="flex flex-col gap-1.5">
          <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium mb-1">
            Com o Diamond você tem
          </p>
          {diamondBenefits.map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-2.5 text-sm text-foreground">
              <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-cyan-500/10">
                <Icon className="h-3 w-3 text-cyan-400" />
              </div>
              {label}
            </div>
          ))}
        </div>

        {/* CTA */}
        <Link
          href="/precos"
          className="w-full inline-flex items-center justify-center gap-2 rounded-lg px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-cyan-500 to-violet-600 hover:from-cyan-400 hover:to-violet-500 transition-all"
        >
          <Diamond className="h-4 w-4" />
          Assinar Diamond
        </Link>

        <button
          onClick={onClose}
          className="text-xs text-muted-foreground hover:text-foreground text-center transition-colors"
        >
          Continuar no plano gratuito
        </button>
      </div>
    </div>
  )
}
