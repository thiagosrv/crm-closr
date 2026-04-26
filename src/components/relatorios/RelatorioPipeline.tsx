"use client"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts"
import { formatarMoeda } from "@/lib/utils"

interface StageData {
  stageName: string
  valor: number
  count: number
  color: string
}

export function RelatorioPipeline({ data }: { data: StageData[] }) {
  return (
    <div className="glass rounded-xl p-5">
      <h3 className="text-sm font-semibold text-white mb-4">Valor por Etapa</h3>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
          <XAxis dataKey="stageName" tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`} tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} />
          <Tooltip
            contentStyle={{ background: "oklch(0.19 0.04 240)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }}
            formatter={(value: unknown) => [formatarMoeda(Number(value)), "Valor"]}
          />
          <Bar dataKey="valor" radius={[4, 4, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={index} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
