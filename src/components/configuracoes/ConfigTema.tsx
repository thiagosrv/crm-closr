"use client"

import { useState, useEffect } from "react"
import { Moon, Sun, Check } from "lucide-react"
import { cn } from "@/lib/utils"

type Theme = "dark" | "light"

export function ConfigTema() {
  const [theme, setTheme] = useState<Theme>("dark")

  useEffect(() => {
    const match = document.cookie.match(/(?:^|;\s*)closr-theme=([^;]+)/)
    const saved = (match?.[1] ?? "dark") as Theme
    setTheme(saved)
  }, [])

  function applyTheme(t: Theme) {
    setTheme(t)
    document.cookie = `closr-theme=${t};path=/;max-age=31536000;SameSite=Lax`
    const root = document.querySelector("[data-theme-root]") ?? document.documentElement
    root.classList.toggle("light", t === "light")
  }

  const options: { value: Theme; label: string; icon: typeof Moon; accent: string; description: string }[] = [
    {
      value: "dark",
      label: "Escuro",
      icon: Moon,
      accent: "#06b6d4",
      description: "Interface dark — padrão Closr",
    },
    {
      value: "light",
      label: "Claro",
      icon: Sun,
      accent: "#8b5cf6",
      description: "Interface clara para ambientes iluminados",
    },
  ]

  return (
    <div
      className="glass rounded-xl p-5"
      style={{
        border: "1.5px solid rgba(255,255,255,0.18)",
        boxShadow: "3px 4px 0px rgba(0,0,0,0.80)",
      }}
    >
      <div className="mb-4">
        <h3 className="text-sm font-black tracking-tighter text-white">Aparência</h3>
        <p className="text-xs text-white/50 mt-0.5">Alterne entre o modo claro e escuro</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {options.map(({ value, label, icon: Icon, accent, description }) => {
          const active = theme === value
          return (
            <button
              key={value}
              type="button"
              onClick={() => applyTheme(value)}
              className={cn(
                "relative flex flex-col items-center gap-2.5 p-4 rounded-lg transition-all text-center",
                active
                  ? "bg-white/[0.06]"
                  : "bg-white/[0.02] hover:bg-white/[0.05]"
              )}
              style={{
                border: active ? `2px solid ${accent}` : "1.5px solid rgba(255,255,255,0.12)",
                boxShadow: active
                  ? `3px 4px 0px rgba(0,0,0,0.80), 0 0 12px ${accent}25`
                  : "2px 2px 0px rgba(0,0,0,0.50)",
                transform: active ? "translate(-1px,-1px)" : undefined,
              }}
            >
              {active && (
                <span
                  className="absolute top-2 right-2 w-4 h-4 rounded-full flex items-center justify-center"
                  style={{ background: accent }}
                >
                  <Check className="w-2.5 h-2.5 text-white" />
                </span>
              )}
              <Icon
                className="w-6 h-6 transition-colors"
                style={{ color: active ? accent : "rgba(255,255,255,0.35)" }}
              />
              <div>
                <p
                  className="text-xs font-black tracking-tight"
                  style={{ color: active ? "#ffffff" : "rgba(255,255,255,0.50)" }}
                >
                  {label}
                </p>
                <p className="text-[10px] text-white/30 mt-0.5 leading-tight">{description}</p>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
