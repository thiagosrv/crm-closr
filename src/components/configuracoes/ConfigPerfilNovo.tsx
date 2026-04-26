"use client"

import { useState, useRef } from "react"
import { Camera, Save, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { updateUser } from "@/server/actions/users"

interface User {
  id: string
  name: string
  email: string
  goal: number
  goalPeriod: string
  image: string | null
  plano: string
}

export function ConfigPerfilNovo({ user }: { user: User }) {
  const [name, setName] = useState(user.name)
  const [goal, setGoal] = useState(user.goal.toString())
  const [goalPeriod, setGoalPeriod] = useState(user.goalPeriod)
  const [avatar, setAvatar] = useState<string | null>(user.image)
  const [saving, setSaving] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Foto deve ter no máximo 2MB")
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      const base64 = reader.result as string
      setAvatar(base64)
    }
    reader.readAsDataURL(file)
  }

  async function handleSave() {
    setSaving(true)
    try {
      // Save avatar via API if changed
      if (avatar !== user.image) {
        const res = await fetch("/api/user/avatar", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image: avatar }),
        })
        if (!res.ok) throw new Error("Erro ao salvar foto")
      }
      await updateUser(user.id, {
        name,
        goal: parseFloat(goal) || 0,
        goalPeriod,
      })
      toast.success("Perfil atualizado!")
    } catch {
      toast.error("Erro ao salvar perfil")
    } finally {
      setSaving(false)
    }
  }

  const initials = name.split(" ").slice(0, 2).map(n => n[0]).join("").toUpperCase()

  return (
    <div className="brutal-card p-6 space-y-5">
      {/* Avatar */}
      <div className="flex items-center gap-5">
        <div className="relative shrink-0">
          <div
            className="w-20 h-20 flex items-center justify-center overflow-hidden"
            style={{
              border: "3px solid #0F2044",
              boxShadow: "4px 4px 0 #0F2044",
              borderRadius: "2px",
              background: avatar ? "transparent" : "#84CC16",
            }}
          >
            {avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <span className="text-2xl font-black text-[#0F2044]">{initials}</span>
            )}
          </div>
          <button
            onClick={() => fileRef.current?.click()}
            className="absolute -bottom-2 -right-2 w-7 h-7 flex items-center justify-center"
            style={{ background: "#0F2044", border: "2px solid #0F2044", borderRadius: "2px" }}
            title="Trocar foto"
          >
            <Camera className="w-3.5 h-3.5 text-white" />
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
        </div>
        <div>
          <p className="font-black text-[#0F2044] text-lg">{name}</p>
          <p className="text-sm text-[#6B7280]">{user.email}</p>
          <button
            onClick={() => fileRef.current?.click()}
            className="text-xs font-black mt-1"
            style={{ color: "#84CC16" }}
          >
            Trocar foto de perfil
          </button>
        </div>
      </div>

      {/* Name */}
      <div>
        <label className="block text-[11px] font-black uppercase tracking-widest text-[#6B7280] mb-2">Nome Completo</label>
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          className="brutal-input w-full px-4 py-2.5 text-sm"
        />
      </div>

      {/* Email — readonly */}
      <div>
        <label className="block text-[11px] font-black uppercase tracking-widest text-[#6B7280] mb-2">E-mail</label>
        <input
          type="email"
          value={user.email}
          readOnly
          className="w-full px-4 py-2.5 text-sm font-medium text-[#6B7280]"
          style={{
            background: "#F4F4F4",
            border: "2px solid rgba(15,32,68,0.3)",
            borderRadius: "2px",
            cursor: "not-allowed",
          }}
        />
      </div>

      {/* Goal */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-[11px] font-black uppercase tracking-widest text-[#6B7280] mb-2">Meta de Receita (R$)</label>
          <input
            type="number"
            value={goal}
            onChange={e => setGoal(e.target.value)}
            placeholder="0"
            className="brutal-input w-full px-4 py-2.5 text-sm"
          />
        </div>
        <div>
          <label className="block text-[11px] font-black uppercase tracking-widest text-[#6B7280] mb-2">Período</label>
          <select
            value={goalPeriod}
            onChange={e => setGoalPeriod(e.target.value)}
            className="brutal-input w-full px-4 py-2.5 text-sm"
          >
            <option value="MENSAL">Mensal</option>
            <option value="TRIMESTRAL">Trimestral</option>
            <option value="ANUAL">Anual</option>
          </select>
        </div>
      </div>

      {/* Save */}
      <button
        onClick={handleSave}
        disabled={saving}
        className="brutal-btn-lime flex items-center gap-2 px-6 py-2.5 text-sm font-black disabled:opacity-50"
      >
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
        Salvar Alterações
      </button>
    </div>
  )
}
