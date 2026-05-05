"use client"
import { useState, useRef } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Loader2, Mail, Lock, User, ArrowRight, Zap, Check, RefreshCw } from "lucide-react"
import Link from "next/link"

type Step = "email" | "code" | "password"

export default function RegisterPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>("email")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [resendCooldown, setResendCooldown] = useState(0)

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [code, setCode] = useState(["", "", "", "", "", ""])
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  const codeRefs = useRef<(HTMLInputElement | null)[]>([])

  // ─── Step 1: Enviar código ────────────────────────────────────────────────
  async function handleSendCode(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || name.length < 2) { setError("Nome deve ter ao menos 2 caracteres"); return }
    if (!email.trim()) { setError("Informe seu e-mail"); return }
    setError("")
    setLoading(true)
    try {
      const res = await fetch("/api/auth/send-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? "Erro ao enviar código"); return }
      setStep("code")
      startResendCooldown()
    } catch {
      setError("Erro de conexão. Tente novamente.")
    } finally {
      setLoading(false)
    }
  }

  function startResendCooldown() {
    setResendCooldown(60)
    const interval = setInterval(() => {
      setResendCooldown(prev => {
        if (prev <= 1) { clearInterval(interval); return 0 }
        return prev - 1
      })
    }, 1000)
  }

  async function handleResend() {
    if (resendCooldown > 0) return
    setError("")
    setLoading(true)
    try {
      const res = await fetch("/api/auth/send-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? "Erro ao reenviar"); return }
      setCode(["", "", "", "", "", ""])
      codeRefs.current[0]?.focus()
      startResendCooldown()
    } catch {
      setError("Erro de conexão.")
    } finally {
      setLoading(false)
    }
  }

  // ─── Step 2: Código OTP ───────────────────────────────────────────────────
  function handleCodeInput(index: number, value: string) {
    const digit = value.replace(/\D/g, "").slice(-1)
    const newCode = [...code]
    newCode[index] = digit
    setCode(newCode)
    if (digit && index < 5) codeRefs.current[index + 1]?.focus()
  }

  function handleCodeKeyDown(index: number, e: React.KeyboardEvent) {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      codeRefs.current[index - 1]?.focus()
    }
  }

  function handleCodePaste(e: React.ClipboardEvent) {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6)
    if (pasted.length === 6) {
      setCode(pasted.split(""))
      codeRefs.current[5]?.focus()
    }
  }

  async function handleVerifyCode(e: React.FormEvent) {
    e.preventDefault()
    const fullCode = code.join("")
    if (fullCode.length !== 6) { setError("Informe os 6 dígitos do código"); return }
    setError("")
    setStep("password")
  }

  // ─── Step 3: Senha + criar conta ─────────────────────────────────────────
  async function handleCreateAccount(e: React.FormEvent) {
    e.preventDefault()
    if (password.length < 6) { setError("Senha deve ter ao menos 6 caracteres"); return }
    if (password !== confirmPassword) { setError("As senhas não coincidem"); return }
    setError("")
    setLoading(true)
    try {
      const res = await fetch("/api/auth/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code: code.join(""), password, name }),
      })
      const data = await res.json()
      if (!res.ok) {
        // Código expirado → volta ao step de código
        if (res.status === 400) {
          setError(data.error ?? "Código inválido")
          setStep("code")
          setCode(["", "", "", "", "", ""])
        } else {
          setError(data.error ?? "Erro ao criar conta")
        }
        return
      }
      // Conta criada → faz login automático
      const signInRes = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })
      if (signInRes?.error) {
        router.push("/login")
      } else {
        router.push("/onboarding")
      }
    } catch {
      setError("Erro de conexão. Tente novamente.")
    } finally {
      setLoading(false)
    }
  }

  // ─── Google OAuth ─────────────────────────────────────────────────────────
  function handleGoogle() {
    signIn("google", { callbackUrl: "/onboarding" })
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 auth-bg">
      <div
        className="w-full max-w-[440px] relative overflow-hidden"
        style={{
          background: "#FFFFFF",
          border: "3px solid #0F2044",
          boxShadow: "8px 8px 0px #0F2044",
          borderRadius: "2px",
        }}
      >
        {/* Top lime bar */}
        <div className="h-[5px] w-full" style={{ background: "#84CC16" }} />

        <div className="p-8">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 flex items-center justify-center shrink-0"
              style={{ background: "#0F2044", borderRadius: "2px" }}>
              <Zap className="w-5 h-5 text-[#84CC16]" fill="#84CC16" />
            </div>
            <span className="text-3xl font-black text-[#0F2044]" style={{ letterSpacing: "-0.05em" }}>
              CLOSR
            </span>
          </div>

          {/* Step indicator */}
          <div className="flex items-center gap-2 mb-6">
            {(["email", "code", "password"] as Step[]).map((s, i) => (
              <div key={s} className="flex items-center gap-2">
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-black"
                  style={{
                    background: step === s ? "#84CC16" : (["email","code","password"].indexOf(step) > i ? "#0F2044" : "#E5E7EB"),
                    color: step === s ? "#0F2044" : (["email","code","password"].indexOf(step) > i ? "#fff" : "#9CA3AF"),
                    border: "2px solid #0F2044",
                  }}
                >
                  {["email","code","password"].indexOf(step) > i ? <Check className="w-3 h-3" /> : i + 1}
                </div>
                {i < 2 && (
                  <div className="w-8 h-0.5" style={{ background: ["email","code","password"].indexOf(step) > i ? "#0F2044" : "#E5E7EB" }} />
                )}
              </div>
            ))}
            <span className="ml-2 text-xs text-[#6B7280] font-bold">
              {step === "email" ? "Seus dados" : step === "code" ? "Verificação" : "Senha"}
            </span>
          </div>

          {/* ── STEP 1: Nome + E-mail ── */}
          {step === "email" && (
            <form onSubmit={handleSendCode} className="space-y-4">
              <div>
                <h1 className="text-2xl font-black text-[#0F2044] mb-1" style={{ letterSpacing: "-0.03em" }}>
                  Criar conta grátis
                </h1>
                <p className="text-sm text-[#6B7280]">Vamos criar sua conta em menos de 2 minutos.</p>
              </div>

              <div>
                <label className="block text-[11px] font-black uppercase tracking-[0.12em] text-[#6B7280] mb-1.5">Nome completo</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280]" />
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="João Silva"
                    className="login-input w-full pl-10 pr-4 py-3 text-sm"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-black uppercase tracking-[0.12em] text-[#6B7280] mb-1.5">E-mail</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280]" />
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    className="login-input w-full pl-10 pr-4 py-3 text-sm"
                    required
                  />
                </div>
              </div>

              {error && <ErrorBox message={error} />}

              <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 py-3.5 text-sm font-black disabled:opacity-50"
                style={{ background: "#84CC16", border: "2px solid #0F2044", boxShadow: "4px 4px 0 #0F2044", borderRadius: "2px", color: "#0F2044" }}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
                Enviar código de verificação
              </button>

              <div className="relative my-1">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full h-[2px]" style={{ background: "#E5E7EB" }} />
                </div>
                <div className="relative flex justify-center">
                  <span className="px-3 text-[11px] font-black uppercase tracking-widest text-[#6B7280] bg-white">ou</span>
                </div>
              </div>

              <GoogleButton onClick={handleGoogle} label="Cadastrar com Google" />

              <p className="text-center text-xs text-[#6B7280]">
                Já tem conta?{" "}
                <Link href="/login" className="font-black text-[#84CC16] hover:underline">Fazer login →</Link>
              </p>
            </form>
          )}

          {/* ── STEP 2: Código OTP ── */}
          {step === "code" && (
            <form onSubmit={handleVerifyCode} className="space-y-5">
              <div>
                <h2 className="text-2xl font-black text-[#0F2044] mb-1" style={{ letterSpacing: "-0.03em" }}>
                  Verifique seu e-mail
                </h2>
                <p className="text-sm text-[#6B7280]">
                  Enviamos um código de 6 dígitos para{" "}
                  <span className="font-black text-[#0F2044]">{email}</span>
                </p>
              </div>

              {/* Boxes de código */}
              <div className="flex gap-2 justify-center" onPaste={handleCodePaste}>
                {code.map((digit, i) => (
                  <input
                    key={i}
                    ref={el => { codeRefs.current[i] = el }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={e => handleCodeInput(i, e.target.value)}
                    onKeyDown={e => handleCodeKeyDown(i, e)}
                    className="w-12 h-14 text-center text-2xl font-black text-[#0F2044] focus:outline-none"
                    style={{
                      border: digit ? "2px solid #0F2044" : "2px solid #D1D5DB",
                      boxShadow: digit ? "3px 3px 0 #84CC16" : "2px 2px 0 #E5E7EB",
                      borderRadius: "2px",
                      background: "#fff",
                    }}
                  />
                ))}
              </div>

              {error && <ErrorBox message={error} />}

              <button type="submit" className="w-full flex items-center justify-center gap-2 py-3.5 text-sm font-black"
                style={{ background: "#0F2044", border: "2px solid #0F2044", boxShadow: "4px 4px 0 #84CC16", borderRadius: "2px", color: "#fff" }}>
                <ArrowRight className="w-4 h-4" />
                Confirmar código
              </button>

              <div className="flex items-center justify-between text-xs">
                <button type="button" onClick={() => { setStep("email"); setError(""); setCode(["","","","","",""]) }}
                  className="text-[#6B7280] hover:text-[#0F2044] font-bold transition-colors">
                  ← Trocar e-mail
                </button>
                <button type="button" onClick={handleResend} disabled={resendCooldown > 0 || loading}
                  className="flex items-center gap-1 font-bold disabled:opacity-40 transition-colors"
                  style={{ color: resendCooldown > 0 ? "#9CA3AF" : "#84CC16" }}>
                  <RefreshCw className="w-3 h-3" />
                  {resendCooldown > 0 ? `Reenviar em ${resendCooldown}s` : "Reenviar código"}
                </button>
              </div>
            </form>
          )}

          {/* ── STEP 3: Senha ── */}
          {step === "password" && (
            <form onSubmit={handleCreateAccount} className="space-y-4">
              <div>
                <h2 className="text-2xl font-black text-[#0F2044] mb-1" style={{ letterSpacing: "-0.03em" }}>
                  Crie sua senha
                </h2>
                <p className="text-sm text-[#6B7280]">
                  E-mail verificado! Agora escolha uma senha para sua conta.
                </p>
              </div>

              {/* Resumo */}
              <div className="flex items-center gap-3 p-3"
                style={{ background: "#F4F4F4", border: "2px solid #0F2044", borderRadius: "2px" }}>
                <div className="w-7 h-7 flex items-center justify-center shrink-0"
                  style={{ background: "#84CC16", border: "2px solid #0F2044", borderRadius: "2px" }}>
                  <Check className="w-3.5 h-3.5 text-[#0F2044]" />
                </div>
                <div>
                  <p className="text-xs font-black text-[#0F2044]">{name}</p>
                  <p className="text-xs text-[#6B7280]">{email}</p>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-black uppercase tracking-[0.12em] text-[#6B7280] mb-1.5">Senha</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280]" />
                  <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    className="login-input w-full pl-10 pr-4 py-3 text-sm"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-black uppercase tracking-[0.12em] text-[#6B7280] mb-1.5">Confirmar senha</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280]" />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="Repita a senha"
                    className="login-input w-full pl-10 pr-4 py-3 text-sm"
                    required
                  />
                </div>
              </div>

              {error && <ErrorBox message={error} />}

              <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 py-3.5 text-sm font-black disabled:opacity-50"
                style={{ background: "#84CC16", border: "2px solid #0F2044", boxShadow: "4px 4px 0 #0F2044", borderRadius: "2px", color: "#0F2044" }}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                Criar minha conta
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

function ErrorBox({ message }: { message: string }) {
  return (
    <div className="p-3 text-sm text-red-700 font-bold"
      style={{ background: "rgba(239,68,68,0.06)", border: "2px solid #DC2626", boxShadow: "2px 2px 0 #DC2626", borderRadius: "2px" }}>
      {message}
    </div>
  )
}

function GoogleButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button type="button" onClick={onClick}
      className="w-full flex items-center justify-center gap-3 py-3 text-sm font-bold text-[#0F2044]"
      style={{ background: "#fff", border: "2px solid #0F2044", boxShadow: "3px 3px 0 #0F2044", borderRadius: "2px" }}>
      <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
      </svg>
      {label}
    </button>
  )
}
