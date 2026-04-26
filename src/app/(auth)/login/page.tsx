"use client"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import {
  Loader2, Mail, Lock, ArrowRight, Zap,
  Kanban, MessageCircle, BarChart3, Calendar, CheckCircle2,
} from "lucide-react"
import Link from "next/link"

const schema = z.object({
  email: z.string().email("E-mail inválido"),
  password: z.string().min(1, "Informe a senha"),
})
type FormData = z.infer<typeof schema>

const FEATURES = [
  { icon: Kanban,        text: "Funil Kanban visual com drag & drop" },
  { icon: MessageCircle, text: "WhatsApp Business integrado nativamente" },
  { icon: BarChart3,     text: "Relatórios e insights em tempo real" },
  { icon: Calendar,      text: "Calendário, agenda e alertas automáticos" },
]

const STATS = [
  { value: "+2.400", label: "vendedores ativos" },
  { value: "R$ 180M", label: "em deals gerenciados" },
  { value: "38%",     label: "mais conversões" },
]

export default function LoginPage() {
  const router = useRouter()
  const [error, setError] = useState("")

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  async function onSubmit(data: FormData) {
    setError("")
    const res = await signIn("credentials", {
      email: data.email,
      password: data.password,
      redirect: false,
    })
    if (res?.error) {
      setError("E-mail ou senha incorretos")
    } else {
      router.push("/inicio")
      router.refresh()
    }
  }

  return (
    <div className="min-h-screen flex" style={{ overscrollBehavior: "none" }}>

      {/* ══ LEFT PANEL — Hero (Navy) ══ */}
      <div
        className="hidden lg:flex flex-col justify-between flex-1 p-12 relative overflow-hidden"
        style={{ background: "#0F2044" }}
      >
        {/* Grid texture */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(#84CC16 1px, transparent 1px), linear-gradient(90deg, #84CC16 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />

        {/* Decorative shapes */}
        <div className="absolute top-16 right-16 w-24 h-24 opacity-10 pointer-events-none"
          style={{ background: "#84CC16" }} />
        <div className="absolute bottom-32 right-10 w-10 h-10 opacity-[0.07] pointer-events-none"
          style={{ background: "#84CC16" }} />
        <div className="absolute top-1/2 right-36 w-5 h-5 opacity-20 pointer-events-none"
          style={{ background: "#84CC16", border: "2px solid #84CC16" }} />

        {/* Logo */}
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 flex items-center justify-center"
              style={{ background: "#84CC16" }}>
              <Zap className="w-5 h-5 text-[#0F2044]" fill="#0F2044" />
            </div>
            <span className="text-3xl font-black text-white select-none"
              style={{ letterSpacing: "-0.05em" }}>
              CLOSR
            </span>
          </div>
        </div>

        {/* Hero copy */}
        <div className="relative z-10 max-w-xl">
          {/* Tag */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 mb-7 text-[10px] font-black uppercase tracking-widest"
            style={{ background: "#84CC16", color: "#0F2044", borderRadius: "2px" }}>
            <CheckCircle2 className="w-3 h-3" />
            CRM para times de alta performance
          </div>

          {/* H1 */}
          <h1 className="text-5xl xl:text-[3.5rem] font-black text-white leading-[1.05] mb-5"
            style={{ letterSpacing: "-0.03em" }}>
            Feche mais negócios.
            <br />
            <span style={{ color: "#84CC16" }}>Com menos esforço.</span>
          </h1>

          {/* H2 */}
          <h2 className="text-base xl:text-lg text-white/55 font-medium leading-relaxed mb-10 max-w-md">
            Do primeiro contato ao fechamento — o CLOSR organiza seu pipeline,
            automatiza follow-ups e entrega os dados que seu time precisa para vender mais.
          </h2>

          {/* Feature list */}
          <div className="space-y-3.5 mb-12">
            {FEATURES.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3.5">
                <div className="w-8 h-8 shrink-0 flex items-center justify-center"
                  style={{
                    background: "rgba(132,204,22,0.10)",
                    border: "1.5px solid rgba(132,204,22,0.25)",
                    borderRadius: "2px",
                  }}>
                  <Icon className="w-4 h-4 text-[#84CC16]" />
                </div>
                <span className="text-sm text-white/75 font-medium">{text}</span>
              </div>
            ))}
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-6 pt-8"
            style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
            {STATS.map(s => (
              <div key={s.label}>
                <p className="text-2xl xl:text-3xl font-black text-white"
                  style={{ letterSpacing: "-0.03em" }}>
                  {s.value}
                </p>
                <p className="text-[11px] text-white/35 font-medium mt-1 uppercase tracking-wide">
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom lime bar */}
        <div className="absolute bottom-0 left-0 right-0 h-[4px]"
          style={{ background: "#84CC16" }} />
      </div>

      {/* ══ RIGHT PANEL — Login Form (White) ══ */}
      <div
        className="flex flex-col justify-center w-full lg:w-[460px] xl:w-[500px] shrink-0 px-8 sm:px-12 py-14 relative bg-white"
        style={{ borderLeft: "3px solid #0F2044" }}
      >
        {/* Mobile logo */}
        <div className="flex items-center gap-2 mb-10 lg:hidden">
          <div className="w-8 h-8 flex items-center justify-center" style={{ background: "#0F2044" }}>
            <Zap className="w-4 h-4 text-[#84CC16]" fill="#84CC16" />
          </div>
          <span className="text-2xl font-black text-[#0F2044]"
            style={{ letterSpacing: "-0.05em" }}>CLOSR</span>
        </div>

        {/* Heading */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 mb-4 text-[10px] font-black uppercase tracking-widest"
            style={{ background: "#F4F4F4", border: "2px solid #0F2044", color: "#6B7280", borderRadius: "2px" }}>
            Acesso seguro
          </div>
          <h1 className="text-3xl font-black text-[#0F2044]" style={{ letterSpacing: "-0.03em" }}>
            Bem-vindo de volta
          </h1>
          <p className="text-sm text-[#6B7280] mt-2 font-medium">
            Entre com sua conta para acessar seu painel de vendas
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Email */}
          <div>
            <label className="block text-[11px] font-black uppercase tracking-[0.12em] text-[#6B7280] mb-2">
              E-mail
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280] pointer-events-none" />
              <input
                type="email"
                placeholder="seu@email.com"
                autoComplete="email"
                className="login-input w-full pl-10 pr-4 py-3 text-sm"
                {...register("email")}
              />
            </div>
            {errors.email && <p className="text-red-600 text-xs mt-1.5 font-bold">{errors.email.message}</p>}
          </div>

          {/* Password */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-[11px] font-black uppercase tracking-[0.12em] text-[#6B7280]">
                Senha
              </label>
              <button type="button"
                className="text-[11px] font-bold text-[#6B7280] hover:text-[#84CC16] transition-colors">
                Esqueceu a senha?
              </button>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280] pointer-events-none" />
              <input
                type="password"
                placeholder="Sua senha"
                autoComplete="current-password"
                className="login-input w-full pl-10 pr-4 py-3 text-sm"
                {...register("password")}
              />
            </div>
            {errors.password && <p className="text-red-600 text-xs mt-1.5 font-bold">{errors.password.message}</p>}
          </div>

          {/* Error */}
          {error && (
            <div className="p-3 text-sm text-red-700 font-bold"
              style={{
                background: "rgba(239,68,68,0.06)",
                border: "2px solid #DC2626",
                boxShadow: "2px 2px 0px #DC2626",
                borderRadius: "2px",
              }}>
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 py-3.5 text-sm font-black tracking-wide disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: "#0F2044",
              border: "2px solid #0F2044",
              boxShadow: "4px 4px 0px #84CC16",
              borderRadius: "2px",
              color: "#FFFFFF",
              transition: "box-shadow 0.08s ease, transform 0.08s ease",
            }}
            onMouseEnter={e => {
              if (!isSubmitting) {
                e.currentTarget.style.boxShadow = "6px 6px 0px #84CC16"
                e.currentTarget.style.transform = "translate(-2px,-2px)"
              }
            }}
            onMouseLeave={e => {
              e.currentTarget.style.boxShadow = "4px 4px 0px #84CC16"
              e.currentTarget.style.transform = "translate(0,0)"
            }}
            onMouseDown={e => {
              if (!isSubmitting) {
                e.currentTarget.style.boxShadow = "1px 1px 0px #84CC16"
                e.currentTarget.style.transform = "translate(3px,3px)"
              }
            }}
            onMouseUp={e => {
              if (!isSubmitting) {
                e.currentTarget.style.boxShadow = "6px 6px 0px #84CC16"
                e.currentTarget.style.transform = "translate(-2px,-2px)"
              }
            }}
          >
            {isSubmitting
              ? <Loader2 className="w-4 h-4 animate-spin" />
              : <ArrowRight className="w-4 h-4" />}
            Entrar na conta
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full h-[2px]" style={{ background: "#E5E7EB" }} />
          </div>
          <div className="relative flex justify-center">
            <span className="px-3 text-[11px] font-black uppercase tracking-widest text-[#6B7280] bg-white">
              ou continue com
            </span>
          </div>
        </div>

        {/* Google */}
        <button
          type="button"
          onClick={() => signIn("google", { callbackUrl: "/inicio" })}
          className="w-full flex items-center justify-center gap-3 py-3 text-sm font-bold text-[#0F2044]"
          style={{
            background: "#FFFFFF",
            border: "2px solid #0F2044",
            boxShadow: "3px 3px 0px #0F2044",
            borderRadius: "2px",
            transition: "box-shadow 0.08s ease, transform 0.08s ease",
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = "#F9F9F9"
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
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Entrar com Google
        </button>

        {/* Register link */}
        <p className="text-center text-sm text-[#6B7280] mt-8 font-medium">
          Não tem uma conta?{" "}
          <Link href="/register"
            className="font-black text-[#0F2044] underline underline-offset-2 hover:text-[#84CC16] transition-colors">
            Criar conta grátis →
          </Link>
        </p>

        <p className="text-center text-[10px] text-[#6B7280] mt-3 leading-relaxed">
          Ao entrar você concorda com os{" "}
          <span className="font-bold">Termos de Uso</span> e a{" "}
          <span className="font-bold">Política de Privacidade</span>.
        </p>
      </div>
    </div>
  )
}
