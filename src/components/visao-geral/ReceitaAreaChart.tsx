"use client"

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts"
import { formatarMoeda } from "@/lib/utils"

interface DataPoint {
  mes: string
  receita: number
  projetado: number
}

interface Props {
  data: DataPoint[]
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: Array<{ name: string; value: number; color: string }>
  label?: string
}) {
  if (!active || !payload?.length) return null

  return (
    <div className="glass rounded-lg p-3 text-sm shadow-xl">
      <p className="font-semibold text-white mb-2">{label}</p>
      {payload.map((entry) => (
        <p key={entry.name} style={{ color: entry.color }} className="flex gap-2">
          <span className="text-muted-foreground capitalize">
            {entry.name === "receita" ? "Receita" : "Projetado"}:
          </span>
          <span className="font-medium">{formatarMoeda(entry.value)}</span>
        </p>
      ))}
    </div>
  )
}

export function ReceitaAreaChart({ data }: Props) {
  return (
    <div className="glass brutal-card rounded-xl p-5">
      <h3 className="text-sm font-semibold text-white mb-4">Receita por Mês</h3>
      <ResponsiveContainer width="100%" height={260}>
        <AreaChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="gradReceita" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#06B6D4" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gradProjetado" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.25} />
              <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />

          <XAxis
            dataKey="mes"
            tick={{ fill: "rgba(255,255,255,0.45)", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tickFormatter={(v) =>
              new Intl.NumberFormat("pt-BR", {
                notation: "compact",
                currency: "BRL",
                style: "currency",
              }).format(v)
            }
            tick={{ fill: "rgba(255,255,255,0.45)", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            width={70}
          />

          <Tooltip content={<CustomTooltip />} />

          <Legend
            formatter={(value) =>
              value === "receita" ? "Receita" : "Projetado"
            }
            wrapperStyle={{ fontSize: 12, color: "rgba(255,255,255,0.6)" }}
          />

          <Area
            type="monotone"
            dataKey="receita"
            stroke="#06B6D4"
            strokeWidth={2}
            fill="url(#gradReceita)"
            dot={false}
            activeDot={{ r: 4, fill: "#06B6D4" }}
          />
          <Area
            type="monotone"
            dataKey="projetado"
            stroke="#8B5CF6"
            strokeWidth={2}
            strokeDasharray="5 3"
            fill="url(#gradProjetado)"
            dot={false}
            activeDot={{ r: 4, fill: "#8B5CF6" }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
