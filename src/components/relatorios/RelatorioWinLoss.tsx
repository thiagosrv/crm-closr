"use client"
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts"

interface Props {
  won: number
  lost: number
}

export function RelatorioWinLoss({ won, lost }: Props) {
  const data = [
    { name: "Ganhos", value: won, color: "#10B981" },
    { name: "Perdidos", value: lost, color: "#EF4444" },
  ].filter((d) => d.value > 0)

  if (data.length === 0) {
    return (
      <div className="glass rounded-xl p-5 flex items-center justify-center h-48">
        <p className="text-sm text-muted-foreground">Sem dados de fechamento ainda</p>
      </div>
    )
  }

  return (
    <div className="glass rounded-xl p-5">
      <h3 className="text-sm font-semibold text-white mb-4">Win / Loss</h3>
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={4} dataKey="value">
            {data.map((entry, index) => (
              <Cell key={index} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{ background: "oklch(0.19 0.04 240)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }}
            labelStyle={{ color: "#e2e8f0" }}
          />
          <Legend wrapperStyle={{ color: "#94a3b8", fontSize: 12 }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
