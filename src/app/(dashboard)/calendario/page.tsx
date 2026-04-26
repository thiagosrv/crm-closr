"use client"

import { useState, useEffect, useCallback } from "react"
import { ChevronLeft, ChevronRight, Plus, Clock, X } from "lucide-react"
import { toast } from "sonner"

const ACTIVITY_TYPES = ["CALL", "EMAIL", "MEETING", "TASK", "NOTE", "WHATSAPP"]
const TYPE_LABELS: Record<string, string> = {
  CALL: "Ligação", EMAIL: "E-mail", MEETING: "Reunião", TASK: "Tarefa", NOTE: "Nota", WHATSAPP: "WhatsApp",
}
const TYPE_COLORS: Record<string, string> = {
  CALL: "#3B82F6", EMAIL: "#84CC16", MEETING: "#8B5CF6", TASK: "#F59E0B", NOTE: "#6B7280", WHATSAPP: "#10B981",
}

interface ActivityEvent {
  id: string
  subject: string
  type: string
  dueAt: string | null
}

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate()
}
function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay()
}

const MONTH_NAMES = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"]
const DAY_NAMES = ["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"]

export default function CalendarioPage() {
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth())
  const [events, setEvents] = useState<ActivityEvent[]>([])
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [newSubject, setNewSubject] = useState("")
  const [newType, setNewType] = useState("TASK")
  const [newTime, setNewTime] = useState("09:00")
  const [saving, setSaving] = useState(false)
  const [alertedIds, setAlertedIds] = useState<Set<string>>(new Set())

  const fetchEvents = useCallback(async () => {
    const start = new Date(year, month, 1).toISOString()
    const end = new Date(year, month + 1, 0, 23, 59, 59).toISOString()
    const res = await fetch(`/api/activities?start=${start}&end=${end}`)
    if (res.ok) {
      const data = await res.json()
      setEvents(data)
    }
  }, [year, month])

  useEffect(() => { fetchEvents() }, [fetchEvents])

  // 1h-before alert check
  useEffect(() => {
    const interval = setInterval(() => {
      const nowTs = Date.now()
      events.forEach(ev => {
        if (!ev.dueAt) return
        const dueTs = new Date(ev.dueAt).getTime()
        const diffMin = (dueTs - nowTs) / 60000
        if (diffMin > 0 && diffMin <= 60 && !alertedIds.has(ev.id)) {
          toast(`⏰ Em ${Math.round(diffMin)}min: ${ev.subject}`, {
            duration: 10000,
            description: TYPE_LABELS[ev.type] ?? ev.type,
          })
          setAlertedIds(prev => new Set([...prev, ev.id]))
        }
      })
    }, 60000)
    return () => clearInterval(interval)
  }, [events, alertedIds])

  const daysInMonth = getDaysInMonth(year, month)
  const firstDay = getFirstDayOfMonth(year, month)

  function prevMonth() {
    if (month === 0) { setYear(y => y - 1); setMonth(11) }
    else setMonth(m => m - 1)
  }
  function nextMonth() {
    if (month === 11) { setYear(y => y + 1); setMonth(0) }
    else setMonth(m => m + 1)
  }

  function getEventsForDay(day: number) {
    return events.filter(ev => {
      if (!ev.dueAt) return false
      const d = new Date(ev.dueAt)
      return d.getFullYear() === year && d.getMonth() === month && d.getDate() === day
    })
  }

  async function handleCreateEvent() {
    if (!newSubject || !selectedDate) return
    setSaving(true)
    const dueAt = new Date(`${selectedDate}T${newTime}:00`).toISOString()
    const res = await fetch("/api/activities", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subject: newSubject, type: newType, dueAt }),
    })
    setSaving(false)
    if (res.ok) {
      toast.success("Atividade criada!")
      setModalOpen(false)
      setNewSubject("")
      setNewTime("09:00")
      fetchEvents()
    } else {
      toast.error("Erro ao criar atividade")
    }
  }

  return (
    <div className="p-4 sm:p-6 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <div>
          <h1 className="brutal-heading text-2xl sm:text-3xl">Calendário</h1>
          <p className="text-[#6B7280] text-sm font-medium mt-1 hidden sm:block">Gerencie suas atividades e reuniões</p>
        </div>
      </div>

      {/* Calendar card */}
      <div className="brutal-card overflow-hidden">
        {/* Month nav */}
        <div
          className="flex items-center justify-between px-5 py-3"
          style={{ background: "#0F2044", borderBottom: "2px solid #0F2044" }}
        >
          <button
            onClick={prevMonth}
            className="w-8 h-8 flex items-center justify-center text-white hover:text-[#84CC16] transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h2 className="font-black text-white text-lg uppercase tracking-wide">
            {MONTH_NAMES[month]} {year}
          </h2>
          <button
            onClick={nextMonth}
            className="w-8 h-8 flex items-center justify-center text-white hover:text-[#84CC16] transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Day names */}
        <div className="grid grid-cols-7" style={{ borderBottom: "2px solid #0F2044" }}>
          {DAY_NAMES.map(d => (
            <div
              key={d}
              className="py-2 text-center text-[10px] font-black uppercase tracking-widest"
              style={{
                background: "#F4F4F4",
                borderRight: "1px solid rgba(15,32,68,0.15)",
                color: "#0F2044",
              }}
            >
              {d}
            </div>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-7">
          {Array.from({ length: firstDay }).map((_, i) => (
            <div
              key={`empty-${i}`}
              className="min-h-[90px]"
              style={{ borderRight: "1px solid rgba(15,32,68,0.12)", borderBottom: "1px solid rgba(15,32,68,0.12)", background: "#FAFAFA" }}
            />
          ))}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1
            const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
            const dayEvents = getEventsForDay(day)
            const isToday = day === now.getDate() && month === now.getMonth() && year === now.getFullYear()
            return (
              <div
                key={day}
                className="min-h-[90px] p-1.5 cursor-pointer transition-colors"
                style={{
                  borderRight: "1px solid rgba(15,32,68,0.12)",
                  borderBottom: "1px solid rgba(15,32,68,0.12)",
                  background: isToday ? "#EEF8E0" : "#FFFFFF",
                }}
                onClick={() => { setSelectedDate(dateStr); setModalOpen(true) }}
                onMouseEnter={e => (e.currentTarget.style.background = isToday ? "#E4F5CC" : "#F4F4F4")}
                onMouseLeave={e => (e.currentTarget.style.background = isToday ? "#EEF8E0" : "#FFFFFF")}
              >
                <div className="flex items-center justify-between mb-1">
                  <span
                    className="text-xs font-black"
                    style={{
                      color: isToday ? "#FFFFFF" : "#0F2044",
                      background: isToday ? "#84CC16" : "transparent",
                      border: isToday ? "2px solid #0F2044" : "none",
                      padding: isToday ? "0px 5px" : "0",
                      borderRadius: "2px",
                    }}
                  >
                    {day}
                  </span>
                  {dayEvents.length > 0 && (
                    <span className="text-[9px] font-black" style={{ color: "#84CC16" }}>
                      {dayEvents.length}
                    </span>
                  )}
                </div>
                <div className="space-y-0.5">
                  {dayEvents.slice(0, 2).map(ev => (
                    <div
                      key={ev.id}
                      className="text-[9px] font-bold truncate px-1 py-0.5"
                      style={{
                        background: TYPE_COLORS[ev.type] ?? "#6B7280",
                        color: "#FFFFFF",
                        border: "1px solid #0F2044",
                        borderRadius: "2px",
                      }}
                    >
                      {ev.subject}
                    </div>
                  ))}
                  {dayEvents.length > 2 && (
                    <div className="text-[9px] font-black text-[#6B7280]">+{dayEvents.length - 2}</div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Create Event Modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(15,32,68,0.60)" }}
          onClick={() => setModalOpen(false)}
        >
          <div
            className="w-full max-w-md animate-fade-in"
            style={{
              background: "#FFFFFF",
              border: "3px solid #0F2044",
              boxShadow: "6px 6px 0px #0F2044",
              borderRadius: "2px",
            }}
            onClick={e => e.stopPropagation()}
          >
            <div
              className="flex items-center justify-between px-5 py-4"
              style={{ borderBottom: "2px solid #0F2044", background: "#0F2044" }}
            >
              <h3 className="font-black text-white uppercase tracking-wide">
                Nova Atividade — {selectedDate}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-white/60 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-[11px] font-black uppercase tracking-widest text-[#6B7280] mb-2">Assunto</label>
                <input
                  type="text"
                  value={newSubject}
                  onChange={e => setNewSubject(e.target.value)}
                  placeholder="Ex: Reunião com cliente"
                  className="brutal-input w-full px-4 py-2.5 text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-black uppercase tracking-widest text-[#6B7280] mb-2">Tipo</label>
                  <select
                    value={newType}
                    onChange={e => setNewType(e.target.value)}
                    className="brutal-input w-full px-3 py-2.5 text-sm"
                  >
                    {ACTIVITY_TYPES.map(t => (
                      <option key={t} value={t}>{TYPE_LABELS[t]}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-black uppercase tracking-widest text-[#6B7280] mb-2">
                    <Clock className="w-3 h-3 inline mr-1" />Horário
                  </label>
                  <input
                    type="time"
                    value={newTime}
                    onChange={e => setNewTime(e.target.value)}
                    className="brutal-input w-full px-3 py-2.5 text-sm"
                  />
                </div>
              </div>
              <button
                onClick={handleCreateEvent}
                disabled={!newSubject || saving}
                className="brutal-btn-lime w-full py-3 text-sm font-black uppercase tracking-wide disabled:opacity-40"
              >
                {saving ? "Salvando..." : "Criar Atividade"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
