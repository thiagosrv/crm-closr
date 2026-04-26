"use client"

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from "recharts"

interface DataPoint {
  stageName: string
  valor: number
  count: number
  color: string
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
  payload?: Array<{ value: number; payload: DataPoint }>
  label?: string
}) {
  if (!active || !payload?.length) return null
  const item = payload[0].payload
  return (
    <div className="glass rounded-lg p-3 text-sm shadow-xl">
      <p className="font-semibold text-white mb-1">{label}</p>
      <p className="text-muted-foreground">
        Deals: <span className="text-white font-medium">{item.count}</span>
      </p>
      <p className="text-muted-foreground">
        Valor:{" "}
        <span className="text-white font-medium">
          {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
            item.valor
          )}
        </span>
      </p>
    </div>
  )
}

export function FunilConversaoChart({ data }: Props) {
  return (
    <div className="glass brutal-card rounded-xl p-5">
      <h3 className="text-sm font-semibold text-white mb-4">Funil por Etapa</h3>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 0, right: 16, left: 0, bottom: 0 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            horizontal={false}
            stroke="rgba(255,255,255,0.05)"
          />
          <XAxis
            type="number"
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
          />
          <YAxis
            type="category"
            dataKey="stageName"
            tick={{ fill: "rgba(255,255,255,0.6)", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            width={100}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="valor" radius={[0, 4, 4, 0]} maxBarSize={20}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color || "#06B6D4"} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
