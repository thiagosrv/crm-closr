"use client"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Loader2, Mail, Lock, User, ArrowRight, Zap, Check } from "lucide-react"
import Link from "next/link"
import { registerUser } from "@/server/actions/auth"

const schema = z.object({
  name: z.string().min(2, "Nome deve ter ao menos 2 caracteres"),
  email: z.string().email("E-mail inválido"),
  password: z.string().min(6, "Senha deve ter ao menos 6 caracteres"),
  confirmPassword: z.string().min(1, "Confirme sua senha"),
}).refine(d => d.password === d.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
})
type FormData = z.infer<typeof schema>

const BENEFITS = [
  "Funil de vendas Kanban",
  "Listas de contatos ilimitadas",
  "Calendário e agenda",
  "Relatórios de performance",
]

export default function RegisterPage() {
  const router = useRouter()
  const [error, setError] = useState("")
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  async function onSubmit(data: FormData) {
    setError("")
    const result = await registerUser({
      name: data.name,
      email: data.email,
      password: data.password,
    })
    if (result?.error) {
      setError(result.error)
      return
    }
    // Auto sign-in after registration
    const res = await signIn("credentials", {
      email: data.email,
      password: data.password,
      redirect: false,
    })
    if (res?.error) {
      setError("Conta criada! Faça login para continuar.")
      router.push("/login")
    } else {
      router.push("/onboarding")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 auth-bg">
    <div
      className="relative overflow-hidden animate-fade-in w-full max-w-[440px]"
      style={{
        background: "#FFFFFF",
        border: "3px solid #0F2044",
        boxShadow: "8px 8px 0px #0F2044",
        borderRadius: "2px",
      }}
    >
      {/* Top accent bar */}
      <div className="h-[5px] w-full" style={{ background: "#84CC16" }} />

      <div className="p-8">
        {/* Logo */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div
              className="w-10 h-10 flex items-center justify-center shrink-0"
              style={{
                background: "#0F2044",
                border: "2px solid #0F2044",
                boxShadow: "3px 3px 0px #0F2044",
                borderRadius: "2px",
              }}
            >
              <Zap className="w-5 h-5 text-[#84CC16]" fill="#84CC16" />
            </div>
            <span
              className="text-3xl font-black tracking-tighter select-none"
              style={{ color: "#0F2044", letterSpacing: "-0.05em" }}
            >
              CLOSR
            </span>
          </div>
          <p className="text-sm text-[#6B7280] font-medium ml-1">
            Crie sua conta gratuita em segundos
          </p>
        </div>

        {/* Benefits strip */}
        <div
          className="mb-6 px-4 py-3 flex flex-wrap gap-x-4 gap-y-1"
          style={{ background: "#F4F4F4", border: "2px solid #0F2044", borderRadius: "2px" }}
        >
          {BENEFITS.map(b => (
            <div key={b} className="flex items-center gap-1.5">
              <div
                className="w-3.5 h-3.5 shrink-0 flex items-center justify-center"
                style={{ background: "#84CC16", border: "1.5px solid #0F2044", borderRadius: "2px" }}
              >
                <Check className="w-2 h-2 text-[#0F2044]" />
              </div>
              <span className="text-[10px] font-black text-[#0F2044] uppercase tracking-wide">{b}</span>
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Name */}
          <div>
            <label
              htmlFor="name"
              className="block text-[11px] font-black uppercase tracking-[0.12em] text-[#6B7280] mb-2"
            >
              Nome Completo
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280] pointer-events-none" />
              <input
                id="name"
                type="text"
                placeholder="João Silva"
                className="login-input w-full pl-10 pr-4 py-2.5 text-sm"
                {...register("name")}
              />
            </div>
            {errors.name && (
              <p className="text-red-600 text-xs mt-1.5 font-bold">{errors.name.message}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="block text-[11px] font-black uppercase tracking-[0.12em] text-[#6B7280] mb-2"
            >
              E-mail
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280] pointer-events-none" />
              <input
                id="email"
                type="email"
                placeholder="seu@email.com"
                className="login-input w-full pl-10 pr-4 py-2.5 text-sm"
                {...register("email")}
              />
            </div>
            {errors.email && (
              <p className="text-red-600 text-xs mt-1.5 font-bold">{errors.email.message}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="password"
              className="block text-[11px] font-black uppercase tracking-[0.12em] text-[#6B7280] mb-2"
            >
              Senha
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280] pointer-events-none" />
              <input
                id="password"
                type="password"
                placeholder="Mínimo 6 caracteres"
                className="login-input w-full pl-10 pr-4 py-2.5 text-sm"
                {...register("password")}
              />
            </div>
            {errors.password && (
              <p className="text-red-600 text-xs mt-1.5 font-bold">{errors.password.message}</p>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-[11px] font-black uppercase tracking-[0.12em] text-[#6B7280] mb-2"
            >
              Confirmar Senha
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280] pointer-events-none" />
              <input
                id="confirmPassword"
                type="password"
                placeholder="Repita a senha"
                className="login-input w-full pl-10 pr-4 py-2.5 text-sm"
                {...register("confirmPassword")}
              />
            </div>
            {errors.confirmPassword && (
              <p className="text-red-600 text-xs mt-1.5 font-bold">{errors.confirmPassword.message}</p>
            )}
          </div>

          {error && (
            <div
              className="p-3 text-sm text-red-700 font-bold"
              style={{
                background: "rgba(239,68,68,0.08)",
                border: "2px solid #DC2626",
                boxShadow: "2px 2px 0px #DC2626",
                borderRadius: "2px",
              }}
            >
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 py-3 text-sm font-black tracking-wide disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: "#84CC16",
              border: "2px solid #0F2044",
              boxShadow: "4px 4px 0px #0F2044",
              borderRadius: "2px",
              color: "#0F2044",
              transition: "box-shadow 0.08s ease, transform 0.08s ease",
            }}
            onMouseEnter={e => {
              if (!isSubmitting) {
                e.currentTarget.style.boxShadow = "6px 6px 0px #0F2044"
                e.currentTarget.style.transform = "translate(-2px,-2px)"
              }
            }}
            onMouseLeave={e => {
              e.currentTarget.style.boxShadow = "4px 4px 0px #0F2044"
              e.currentTarget.style.transform = "translate(0,0)"
            }}
            onMouseDown={e => {
              if (!isSubmitting) {
                e.currentTarget.style.boxShadow = "1px 1px 0px #0F2044"
                e.currentTarget.style.transform = "translate(3px,3px)"
              }
            }}
            onMouseUp={e => {
              if (!isSubmitting) {
                e.currentTarget.style.boxShadow = "6px 6px 0px #0F2044"
                e.currentTarget.style.transform = "translate(-2px,-2px)"
              }
            }}
          >
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
            Criar conta gratuita
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-5">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full" style={{ height: "2px", background: "#0F2044" }} />
          </div>
          <div className="relative flex justify-center">
            <span
              className="px-3 text-[11px] font-black uppercase tracking-widest text-[#6B7280]"
              style={{ background: "#FFFFFF" }}
            >
              ou cadastre com
            </span>
          </div>
        </div>

        {/* Google */}
        <button
          type="button"
          onClick={() => signIn("google", { callbackUrl: "/onboarding" })}
          className="w-full flex items-center justify-center gap-3 py-2.5 text-sm font-bold text-[#0F2044]"
          style={{
            background: "#FFFFFF",
            border: "2px solid #0F2044",
            boxShadow: "3px 3px 0px #0F2044",
            borderRadius: "2px",
            transition: "box-shadow 0.08s ease, transform 0.08s ease",
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = "#F4F4F4"
            e.currentTarget.style.boxShadow = "4px 4px 0px #0F2044"
            e.currentTarget.style.transform = "translate(-1px,-1px)"
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = "#FFFFFF"
            e.currentTarget.style.boxShadow = "3px 3px 0px #0F2044"
            e.currentTarget.style.transform = "translate(0,0)"
          }}
          onMouseDown={e => {
            e.currentTarget.style.boxShadow = "1px 1px 0px #0F2044"
            e.currentTarget.style.transform = "translate(2px,2px)"
          }}
          onMouseUp={e => {
            e.currentTarget.style.boxShadow = "4px 4px 0px #0F2044"
            e.currentTarget.style.transform = "translate(-1px,-1px)"
          }}
        >
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
          Cadastrar com Google
        </button>

        {/* Terms note */}
        <p className="text-center text-[10px] text-[#6B7280] mt-4 leading-relaxed">
          Ao criar uma conta você concorda com os{" "}
          <span className="font-bold text-[#0F2044]">Termos de Uso</span>
          {" "}e a{" "}
          <span className="font-bold text-[#0F2044]">Política de Privacidade</span>.
        </p>

        <p className="text-center text-xs text-[#6B7280] mt-4">
          Já tem conta?{" "}
          <Link
            href="/login"
            className="font-black transition-colors"
            style={{ color: "#84CC16" }}
          >
            Fazer login →
          </Link>
        </p>
      </div>
    </div>
    </div>
  )
}
