"use client"

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts"
import { formatarMoeda } from "@/lib/utils"

interface RepData {
  name: string
  receita: number
  deals: number
}

interface Props {
  data: RepData[]
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: Array<{ value: number; payload: RepData }>
  label?: string
}) {
  if (!active || !payload?.length) return null
  const item = payload[0].payload
  return (
    <div className="glass rounded-lg p-3 text-sm shadow-xl">
      <p className="font-semibold text-white mb-1">{label}</p>
      <p className="text-muted-foreground">
        Receita:{" "}
        <span className="text-cyan-400 font-medium">{formatarMoeda(item.receita)}</span>
      </p>
      <p className="text-muted-foreground">
        Deals: <span className="text-white font-medium">{item.deals}</span>
      </p>
    </div>
  )
}

export function RepRankingChart({ data }: Props) {
  return (
    <div className="glass brutal-card rounded-xl p-5">
      <h3 className="text-sm font-semibold text-white mb-4">Ranking de Vendedores</h3>
      {data.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-10">
          Nenhuma venda no período.
        </p>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="gradRep" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.9} />
                <stop offset="95%" stopColor="#06B6D4" stopOpacity={0.5} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis
              dataKey="name"
              tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 11 }}
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
            <Bar
              dataKey="receita"
              fill="url(#gradRep)"
              radius={[4, 4, 0, 0]}
              maxBarSize={40}
            />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
