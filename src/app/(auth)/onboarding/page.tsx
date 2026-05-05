"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { completeOnboarding } from "@/server/actions/users"
import { Loader2, ArrowRight, ArrowLeft, Check } from "lucide-react"

const TEAM_SIZES = ["Solo", "2–5", "6–20", "+20"]
const NICHES = ["Vendas B2B", "Imobiliário", "Educação", "Saúde", "Tecnologia", "Outro"]
const INTERESTS = ["Funil Kanban", "WhatsApp CRM", "Calendário & Agenda", "Relatórios e Insights"]
const TOTAL_STEPS = 7

export default function OnboardingPage() {
  const router = useRouter()
  const { update } = useSession()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)

  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [teamSize, setTeamSize] = useState("")
  const [company, setCompany] = useState("")
  const [niche, setNiche] = useState("")
  const [interests, setInterests] = useState<string[]>([])
  const [plan, setPlan] = useState("FREE")

  function toggleInterest(i: string) {
    setInterests(prev => prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i])
  }

  async function handleFinish(selectedPlan: string) {
    setPlan(selectedPlan)
    setLoading(true)
    try {
      const result = await completeOnboarding({ firstName, lastName, teamSize, company, niche, interests, plan: selectedPlan })
      if (!result?.success) throw new Error("Falha ao salvar")
      // Atualiza o token JWT com onboardingCompleted
      await update({ onboardingCompleted: true })
      // Força reload completo para o layout reler o DB
      window.location.href = "/inicio"
    } catch (err) {
      console.error("Onboarding error:", err)
      setLoading(false)
      alert("Erro ao salvar. Tente novamente.")
    }
  }

  const progress = Math.round((step / TOTAL_STEPS) * 100)

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 auth-bg"
      style={{ overscrollBehavior: "none" }}
    >
    <div
      className="relative rounded-none overflow-hidden animate-fade-in w-full max-w-lg"
      style={{
        background: "#FFFFFF",
        border: "3px solid #0F2044",
        boxShadow: "8px 8px 0px #0F2044",
      }}
    >
      {/* Progress bar */}
      <div className="h-2 w-full" style={{ background: "#F4F4F4", borderBottom: "2px solid #0F2044" }}>
        <div
          className="h-full transition-all duration-300"
          style={{ width: `${progress}%`, background: "#84CC16", borderRight: step < TOTAL_STEPS ? "2px solid #0F2044" : "none" }}
        />
      </div>

      <div className="p-8">
        {/* Step dots */}
        <div className="flex items-center gap-2 mb-8">
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
            <div
              key={i}
              className="step-dot"
              style={{
                background: i + 1 < step ? "#0F2044" : i + 1 === step ? "#84CC16" : "#D1D5DB",
              }}
            />
          ))}
          <span className="ml-2 text-xs font-bold text-gray-400 uppercase tracking-widest">{step}/{TOTAL_STEPS}</span>
        </div>

        {/* Step 1: Welcome */}
        {step === 1 && (
          <div className="animate-fade-in">
            <div className="mb-6">
              <span className="text-5xl font-black tracking-tighter text-[#0F2044]">CLOSR</span>
              <div
                className="inline-block ml-3 px-2 py-0.5 text-xs font-black uppercase"
                style={{ background: "#84CC16", border: "2px solid #0F2044" }}
              >
                CRM
              </div>
            </div>
            <h1 className="brutal-heading text-3xl text-[#0F2044] mb-3">
              Bem-vindo ao CLOSR!
            </h1>
            <p className="text-[#6B7280] text-base mb-8 leading-relaxed">
              Vamos configurar sua conta em menos de 2 minutos.<br />
              Responda algumas perguntas rápidas para personalizar sua experiência.
            </p>
            <button
              onClick={() => setStep(2)}
              className="brutal-btn-lime w-full py-3 text-sm font-black tracking-wide flex items-center justify-center gap-2"
            >
              Começar configuração <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Step 2: Name */}
        {step === 2 && (
          <div className="animate-fade-in">
            <h2 className="brutal-heading text-2xl text-[#0F2044] mb-2">Como você se chama?</h2>
            <p className="text-[#6B7280] text-sm mb-6">Usaremos seu nome para personalizar o CLOSR.</p>
            <div className="space-y-4">
              <div>
                <label className="block text-[11px] font-black uppercase tracking-[0.12em] text-[#6B7280] mb-2">Nome</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={e => setFirstName(e.target.value)}
                  placeholder="João"
                  className="brutal-input w-full px-4 py-2.5 text-sm"
                />
              </div>
              <div>
                <label className="block text-[11px] font-black uppercase tracking-[0.12em] text-[#6B7280] mb-2">Sobrenome</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={e => setLastName(e.target.value)}
                  placeholder="Silva"
                  className="brutal-input w-full px-4 py-2.5 text-sm"
                />
              </div>
            </div>
            <StepNav step={step} setStep={setStep} canContinue={!!firstName} />
          </div>
        )}

        {/* Step 3: Team size */}
        {step === 3 && (
          <div className="animate-fade-in">
            <h2 className="brutal-heading text-2xl text-[#0F2044] mb-2">Tamanho do seu time?</h2>
            <p className="text-[#6B7280] text-sm mb-6">Isso nos ajuda a calibrar os recursos.</p>
            <div className="grid grid-cols-2 gap-3">
              {TEAM_SIZES.map(size => (
                <button
                  key={size}
                  onClick={() => setTeamSize(size)}
                  className="py-4 text-sm font-bold transition-all"
                  style={{
                    background: teamSize === size ? "#84CC16" : "#FFFFFF",
                    border: "2px solid #0F2044",
                    boxShadow: teamSize === size ? "4px 4px 0 #0F2044" : "2px 2px 0 #0F2044",
                    borderRadius: "2px",
                    color: "#0F2044",
                    transform: teamSize === size ? "translate(-2px,-2px)" : "none",
                  }}
                >
                  {size} {teamSize === size && <Check className="w-3 h-3 inline ml-1" />}
                </button>
              ))}
            </div>
            <StepNav step={step} setStep={setStep} canContinue={!!teamSize} />
          </div>
        )}

        {/* Step 4: Company */}
        {step === 4 && (
          <div className="animate-fade-in">
            <h2 className="brutal-heading text-2xl text-[#0F2044] mb-2">Nome da sua empresa?</h2>
            <p className="text-[#6B7280] text-sm mb-6">Para identificar sua conta no CLOSR.</p>
            <div>
              <label className="block text-[11px] font-black uppercase tracking-[0.12em] text-[#6B7280] mb-2">Empresa</label>
              <input
                type="text"
                value={company}
                onChange={e => setCompany(e.target.value)}
                placeholder="Minha Empresa Ltda."
                className="brutal-input w-full px-4 py-2.5 text-sm"
              />
            </div>
            <StepNav step={step} setStep={setStep} canContinue={true} />
          </div>
        )}

        {/* Step 5: Niche */}
        {step === 5 && (
          <div className="animate-fade-in">
            <h2 className="brutal-heading text-2xl text-[#0F2044] mb-2">Seu nicho de atuação?</h2>
            <p className="text-[#6B7280] text-sm mb-6">Para exibir modelos de funil mais relevantes.</p>
            <div className="grid grid-cols-2 gap-3">
              {NICHES.map(n => (
                <button
                  key={n}
                  onClick={() => setNiche(n)}
                  className="py-3 px-3 text-sm font-bold text-left transition-all"
                  style={{
                    background: niche === n ? "#84CC16" : "#FFFFFF",
                    border: "2px solid #0F2044",
                    boxShadow: niche === n ? "4px 4px 0 #0F2044" : "2px 2px 0 #0F2044",
                    borderRadius: "2px",
                    color: "#0F2044",
                    transform: niche === n ? "translate(-2px,-2px)" : "none",
                  }}
                >
                  {n} {niche === n && <Check className="w-3 h-3 inline ml-1" />}
                </button>
              ))}
            </div>
            <StepNav step={step} setStep={setStep} canContinue={!!niche} />
          </div>
        )}

        {/* Step 6: Interests */}
        {step === 6 && (
          <div className="animate-fade-in">
            <h2 className="brutal-heading text-2xl text-[#0F2044] mb-2">O que você quer usar?</h2>
            <p className="text-[#6B7280] text-sm mb-6">Selecione tudo que for relevante para você.</p>
            <div className="space-y-3">
              {INTERESTS.map(i => (
                <button
                  key={i}
                  onClick={() => toggleInterest(i)}
                  className="w-full py-3 px-4 text-sm font-bold text-left flex items-center gap-3 transition-all"
                  style={{
                    background: interests.includes(i) ? "#84CC16" : "#FFFFFF",
                    border: "2px solid #0F2044",
                    boxShadow: interests.includes(i) ? "4px 4px 0 #0F2044" : "2px 2px 0 #0F2044",
                    borderRadius: "2px",
                    color: "#0F2044",
                    transform: interests.includes(i) ? "translate(-2px,-2px)" : "none",
                  }}
                >
                  <div
                    className="w-5 h-5 shrink-0 flex items-center justify-center"
                    style={{
                      border: "2px solid #0F2044",
                      background: interests.includes(i) ? "#0F2044" : "#FFFFFF",
                      borderRadius: "2px",
                    }}
                  >
                    {interests.includes(i) && <Check className="w-3 h-3 text-white" />}
                  </div>
                  {i}
                </button>
              ))}
            </div>
            <StepNav step={step} setStep={setStep} canContinue={interests.length > 0} />
          </div>
        )}

        {/* Step 7: Plan */}
        {step === 7 && (
          <div className="animate-fade-in">
            <h2 className="brutal-heading text-2xl text-[#0F2044] mb-2">Escolha seu plano</h2>
            <p className="text-[#6B7280] text-sm mb-6">Comece grátis. Faça upgrade quando precisar.</p>
            <div className="space-y-4">
              {/* FREE */}
              <div style={{ border: "2px solid #0F2044", boxShadow: "4px 4px 0 #0F2044", borderRadius: "2px", padding: "20px" }}>
                <div className="flex items-center justify-between mb-3">
                  <span className="font-black text-lg text-[#0F2044]">FREE</span>
                  <span className="font-black text-2xl text-[#0F2044]">R$0<span className="text-sm font-normal text-gray-400">/mês</span></span>
                </div>
                <ul className="text-sm text-[#6B7280] space-y-1 mb-5">
                  {["Funil Kanban", "Até 50 contatos", "Calendário", "1 funil de vendas"].map(f => (
                    <li key={f} className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-[#84CC16] shrink-0" style={{ border: "1px solid #0F2044" }} />
                      {f}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => handleFinish("FREE")}
                  disabled={loading}
                  className="brutal-btn-outline w-full py-2.5 text-sm font-black flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  Começar gratuitamente
                </button>
              </div>
              {/* DIAMOND */}
              <div style={{ border: "3px solid #0F2044", boxShadow: "5px 5px 0 #84CC16", borderRadius: "2px", padding: "20px", background: "#0F2044" }}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="font-black text-lg text-white">DIAMOND</span>
                    <span className="text-[10px] font-black uppercase px-2 py-0.5" style={{ background: "#84CC16", color: "#0F2044", border: "1px solid #84CC16" }}>Popular</span>
                  </div>
                  <span className="font-black text-2xl text-white">R$97<span className="text-sm font-normal text-gray-400">/mês</span></span>
                </div>
                <ul className="text-sm text-gray-300 space-y-1 mb-5 mt-3">
                  {["Tudo do FREE", "Contatos ilimitados", "WhatsApp Business", "Insights & PDF", "Múltiplos funis"].map(f => (
                    <li key={f} className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 shrink-0" style={{ color: "#84CC16" }} />
                      {f}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => handleFinish("DIAMOND")}
                  disabled={loading}
                  className="w-full py-2.5 text-sm font-black flex items-center justify-center gap-2"
                  style={{ background: "#84CC16", border: "2px solid #84CC16", color: "#0F2044", borderRadius: "2px", boxShadow: "3px 3px 0 #84CC16" }}
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                  Assinar DIAMOND
                </button>
              </div>
            </div>
            <button
              onClick={() => setStep(s => s - 1)}
              className="mt-4 w-full flex items-center justify-center gap-2 text-sm text-[#6B7280] font-semibold hover:text-[#0F2044] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Voltar
            </button>
          </div>
        )}
      </div>
    </div>
    </div>
  )
}

function StepNav({ step, setStep, canContinue }: { step: number; setStep: (fn: (s: number) => number) => void; canContinue: boolean }) {
  return (
    <div className="flex gap-3 mt-8">
      {step > 1 && (
        <button
          onClick={() => setStep(s => s - 1)}
          className="brutal-btn-outline flex items-center gap-2 px-5 py-2.5 text-sm font-bold"
        >
          <ArrowLeft className="w-4 h-4" /> Voltar
        </button>
      )}
      <button
        onClick={() => setStep(s => s + 1)}
        disabled={!canContinue}
        className="brutal-btn-lime flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-black disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Continuar <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  )
}
