"use client"

import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts"
import { TrendingUp, Target, Trophy, XCircle, Plus } from "lucide-react"

interface DashboardMetrics {
  receitaFechada: number
  valorPipeline: number
  taxaConversao: number
  ticketMedio: number
  cicloVendas: number
  dealsWon: number
  receitaPorMes: { mes: string; receita: number; projetado: number }[]
  dealsPorEtapa: { stageName: string; valor: number; count: number; color: string }[]
}

interface EtapaStats {
  name: string
  color: string
  count: number
  value: number
}

interface Props {
  metrics: DashboardMetrics
  dealsPorEtapa: EtapaStats[]
  wonThisMonth: number
  lostThisMonth: number
  newThisMonth: number
  userGoal: number
}

function formatBRL(v: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(v)
}

export function InsightsClient({ metrics, dealsPorEtapa, wonThisMonth, lostThisMonth, newThisMonth, userGoal }: Props) {
  const goalProgress = userGoal > 0 ? Math.min((metrics.receitaFechada / userGoal) * 100, 100) : 0

  const pieData = dealsPorEtapa.filter(e => e.count > 0).map(e => ({
    name: e.name,
    value: e.count,
    color: e.color,
  }))

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div>
        <h1 className="brutal-heading text-2xl sm:text-3xl">Insights</h1>
        <p className="text-[#6B7280] text-sm font-medium mt-1">Relatório mensal de performance de vendas</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[
          { label: "Entradas no mês", value: newThisMonth, icon: Plus, color: "#3B82F6" },
          { label: "Fechamentos", value: wonThisMonth, icon: Trophy, color: "#84CC16" },
          { label: "Perdidos", value: lostThisMonth, icon: XCircle, color: "#EF4444" },
          { label: "Taxa de conversão", value: `${metrics.taxaConversao.toFixed(1)}%`, icon: TrendingUp, color: "#F59E0B" },
        ].map(card => (
          <div key={card.label} className="brutal-card p-4">
            <div
              className="w-9 h-9 flex items-center justify-center mb-3"
              style={{ background: card.color, border: "2px solid #0F2044" }}
            >
              <card.icon className="w-4 h-4 text-white" />
            </div>
            <p className="text-xl sm:text-2xl font-black text-[#0F2044]">{card.value}</p>
            <p className="text-[10px] font-black uppercase tracking-widest text-[#6B7280] mt-1">{card.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Bar chart */}
        <div className="brutal-card col-span-2 overflow-hidden">
          <div
            className="px-5 py-3"
            style={{ borderBottom: "2px solid #0F2044", background: "#0F2044" }}
          >
            <h2 className="font-black text-white uppercase tracking-wide text-sm">Receita por Mês</h2>
          </div>
          <div className="p-4">
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={metrics.receitaPorMes} barCategoryGap="25%">
                <XAxis dataKey="mes" tick={{ fontSize: 10, fontWeight: 700, fill: "#0F2044" }} />
                <YAxis tick={{ fontSize: 10, fontWeight: 700, fill: "#6B7280" }} tickFormatter={(v: number) => `R$${(v/1000).toFixed(0)}k`} />
                <Tooltip
                  formatter={(v: unknown) => formatBRL(Number(v))}
                  contentStyle={{ border: "2px solid #0F2044", borderRadius: "2px", background: "#FFFFFF", boxShadow: "3px 3px 0 #0F2044" }}
                />
                <Bar dataKey="receita" fill="#0F2044" name="Receita" radius={[0,0,0,0]} />
                <Bar dataKey="projetado" fill="#84CC16" name="Projetado" radius={[0,0,0,0]} />
              </BarChart>
            </ResponsiveContainer>
            <div className="flex items-center gap-4 mt-2 justify-center">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3" style={{ background: "#0F2044", border: "1px solid #0F2044" }} />
                <span className="text-[10px] font-black text-[#0F2044]">RECEITA</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3" style={{ background: "#84CC16", border: "1px solid #0F2044" }} />
                <span className="text-[10px] font-black text-[#0F2044]">PROJETADO</span>
              </div>
            </div>
          </div>
        </div>

        {/* Pie chart */}
        <div className="brutal-card overflow-hidden">
          <div
            className="px-5 py-3"
            style={{ borderBottom: "2px solid #0F2044", background: "#0F2044" }}
          >
            <h2 className="font-black text-white uppercase tracking-wide text-sm">Distribuição por Etapa</h2>
          </div>
          <div className="p-4">
            {pieData.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <p className="text-sm text-[#6B7280] font-medium">Nenhum deal ativo</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    dataKey="value"
                    stroke="#0F2044"
                    strokeWidth={2}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ border: "2px solid #0F2044", borderRadius: "2px", background: "#FFFFFF", boxShadow: "3px 3px 0 #0F2044" }}
                  />
                  <Legend iconType="square" iconSize={10} formatter={(v) => <span style={{ fontSize: 10, fontWeight: 700 }}>{v}</span>} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Goal tracker */}
      <div className="brutal-card overflow-hidden">
        <div
          className="px-5 py-3 flex items-center gap-2"
          style={{ borderBottom: "2px solid #0F2044", background: "#0F2044" }}
        >
          <Target className="w-4 h-4 text-[#84CC16]" />
          <h2 className="font-black text-white uppercase tracking-wide text-sm">Meta do Mês</h2>
        </div>
        <div className="p-5">
          {userGoal === 0 ? (
            <div className="text-center py-4">
              <p className="text-sm text-[#6B7280] font-medium mb-3">Você ainda não definiu uma meta mensal.</p>
              <a
                href="/configuracoes"
                className="brutal-btn-lime inline-flex items-center gap-2 px-4 py-2 text-sm font-black"
              >
                Definir meta →
              </a>
            </div>
          ) : (
            <div>
              <div className="flex items-end justify-between mb-3">
                <div>
                  <p className="text-3xl font-black text-[#0F2044]">{formatBRL(metrics.receitaFechada)}</p>
                  <p className="text-xs font-bold text-[#6B7280] uppercase tracking-wide">de {formatBRL(userGoal)} de meta</p>
                </div>
                <div
                  className="px-3 py-1.5 text-lg font-black"
                  style={{
                    background: goalProgress >= 100 ? "#84CC16" : goalProgress >= 70 ? "#F59E0B" : "#F4F4F4",
                    border: "2px solid #0F2044",
                    color: "#0F2044",
                    borderRadius: "2px",
                  }}
                >
                  {goalProgress.toFixed(0)}%
                </div>
              </div>
              <div className="brutal-progress">
                <div
                  className="brutal-progress-bar"
                  style={{ width: `${goalProgress}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Pipeline value stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Valor Total no Pipeline", value: formatBRL(metrics.valorPipeline), desc: "Deals em aberto" },
          { label: "Ticket Médio", value: formatBRL(metrics.ticketMedio), desc: "Por deal ganho" },
          { label: "Ciclo Médio de Venda", value: `${metrics.cicloVendas.toFixed(0)} dias`, desc: "Do lead ao fechamento" },
        ].map(stat => (
          <div key={stat.label} className="brutal-card p-4">
            <p className="text-xl font-black text-[#0F2044] mb-1">{stat.value}</p>
            <p className="text-[10px] font-black uppercase tracking-widest text-[#6B7280]">{stat.label}</p>
            <p className="text-xs text-[#6B7280] mt-0.5">{stat.desc}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
