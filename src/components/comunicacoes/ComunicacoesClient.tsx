"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import {
  MessageSquare, Wifi, WifiOff, Loader2, Send,
  Smartphone, RefreshCw, LogOut, CheckCircle2, AlertTriangle,
  ChevronLeft,
} from "lucide-react"
import { toast } from "sonner"

// ─── Types ────────────────────────────────────────────────────────────────────

interface ConvLabel   { id: string; label: string; color: string }
interface ConvMessage { content: string; direction: string; sentAt: Date | string }
interface Contact     { id: string; firstName: string; lastName: string }

interface Conversation {
  id: string
  displayName: string | null
  externalId: string
  unreadCount: number
  lastMessageAt: Date | string | null
  labels: ConvLabel[]
  contact: Contact | null
  messages: ConvMessage[]
}

interface Props {
  isConnected: boolean
  phoneNumber: string | null
  conversations: Conversation[]
}

type ConnectionStatus = "DISCONNECTED" | "CONNECTING" | "WAITING_QR" | "CONNECTED"

// ─── QR Connect Panel ─────────────────────────────────────────────────────────

function QRConnectPanel({ onConnected }: { onConnected: (phone: string | null) => void }) {
  const [status, setStatus] = useState<ConnectionStatus>("DISCONNECTED")
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const esRef = useRef<EventSource | null>(null)

  function cleanup() {
    if (esRef.current) {
      esRef.current.close()
      esRef.current = null
    }
  }

  const startConnection = useCallback(() => {
    cleanup()
    setError(null)
    setQrDataUrl(null)
    setStatus("CONNECTING")

    const es = new EventSource("/api/channels/whatsapp/qr")
    esRef.current = es

    es.addEventListener("qr", (e: MessageEvent) => {
      const data = JSON.parse(e.data) as { dataUrl: string }
      setQrDataUrl(data.dataUrl)
      setStatus("WAITING_QR")
    })

    es.addEventListener("status", (e: MessageEvent) => {
      const data = JSON.parse(e.data) as { status: string }
      if (data.status === "CONNECTED") {
        setStatus("CONNECTED")
        cleanup()
        toast.success("WhatsApp conectado com sucesso! 🎉")
        // Re-fetch status for phone number then notify parent
        fetch("/api/channels/whatsapp/status")
          .then(r => r.json())
          .then((d: { phoneNumber?: string | null }) => onConnected(d.phoneNumber ?? null))
          .catch(() => onConnected(null))
      } else if (data.status === "DISCONNECTED") {
        setStatus("DISCONNECTED")
        setQrDataUrl(null)
        cleanup()
      }
    })

    es.addEventListener("error", (e: MessageEvent) => {
      try {
        const data = JSON.parse(e.data) as { message: string }
        setError(data.message)
      } catch {
        setError("Erro na conexão. Tente novamente.")
      }
      setStatus("DISCONNECTED")
      cleanup()
    })

    es.onerror = () => {
      // SSE native error (stream closed after CONNECTED is normal)
      if (status !== "CONNECTED") {
        setStatus("DISCONNECTED")
        cleanup()
      }
    }
  }, [onConnected, status])

  useEffect(() => { return cleanup }, [])

  return (
    <div className="flex-1 flex items-center justify-center p-6">
      <div
        className="w-full max-w-md"
        style={{ background: "#FFF", border: "3px solid #0F2044", boxShadow: "8px 8px 0 #0F2044", borderRadius: "2px" }}
      >
        {/* Header */}
        <div className="px-6 py-4 flex items-center gap-3" style={{ borderBottom: "2px solid #0F2044", background: "#0F2044" }}>
          <div
            className="w-9 h-9 flex items-center justify-center shrink-0"
            style={{ background: "#84CC16", border: "2px solid #84CC16", borderRadius: "2px" }}
          >
            <Smartphone className="w-5 h-5 text-[#0F2044]" />
          </div>
          <div>
            <h2 className="font-black text-white text-base">Conectar WhatsApp</h2>
            <p className="text-white/50 text-[11px] font-medium">Escaneie o QR Code com seu celular</p>
          </div>
        </div>

        <div className="p-6 space-y-5">
          {/* DISCONNECTED state */}
          {status === "DISCONNECTED" && !error && (
            <div className="text-center space-y-4">
              <div
                className="w-20 h-20 flex items-center justify-center mx-auto"
                style={{ background: "#F4F4F4", border: "3px solid #0F2044", borderRadius: "2px" }}
              >
                <WifiOff className="w-9 h-9 text-[#0F2044]" />
              </div>
              <div>
                <p className="font-black text-[#0F2044] text-lg">WhatsApp desconectado</p>
                <p className="text-sm text-[#6B7280] mt-1 font-medium">
                  Clique no botão abaixo para iniciar a conexão via QR Code
                </p>
              </div>
              <ol className="text-left space-y-2 text-sm text-[#0F2044]">
                {[
                  "Abra o WhatsApp no seu celular",
                  "Toque em Mais opções ⋮ → Aparelhos conectados",
                  "Toque em 'Conectar um aparelho'",
                  "Escaneie o QR Code que vai aparecer aqui",
                ].map((step, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <span
                      className="w-5 h-5 shrink-0 flex items-center justify-center text-[10px] font-black mt-0.5"
                      style={{ background: "#84CC16", border: "2px solid #0F2044", borderRadius: "2px", color: "#0F2044" }}
                    >
                      {i + 1}
                    </span>
                    <span className="font-medium">{step}</span>
                  </li>
                ))}
              </ol>
              <button
                onClick={startConnection}
                className="w-full py-3 font-black text-sm transition-all"
                style={{
                  background: "#84CC16", color: "#0F2044",
                  border: "2px solid #0F2044", boxShadow: "4px 4px 0 #0F2044", borderRadius: "2px",
                }}
              >
                <Wifi className="w-4 h-4 inline mr-2" />
                Gerar QR Code
              </button>
            </div>
          )}

          {/* CONNECTING state */}
          {status === "CONNECTING" && (
            <div className="text-center space-y-4 py-4">
              <div
                className="w-20 h-20 flex items-center justify-center mx-auto animate-pulse"
                style={{ background: "#F4F4F4", border: "3px solid #84CC16", borderRadius: "2px" }}
              >
                <Loader2 className="w-9 h-9 text-[#84CC16] animate-spin" />
              </div>
              <p className="font-black text-[#0F2044] text-base">Iniciando conexão…</p>
              <p className="text-sm text-[#6B7280] font-medium">Aguarde enquanto preparamos o QR Code</p>
            </div>
          )}

          {/* WAITING_QR state */}
          {status === "WAITING_QR" && qrDataUrl && (
            <div className="text-center space-y-4">
              <p className="text-[10px] font-black text-[#6B7280] uppercase tracking-widest">
                Escaneie com o WhatsApp do seu celular
              </p>
              <div className="relative mx-auto" style={{ width: "fit-content" }}>
                <div
                  className="p-3"
                  style={{ border: "3px solid #0F2044", boxShadow: "4px 4px 0 #0F2044", display: "inline-block", borderRadius: "2px" }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={qrDataUrl}
                    alt="QR Code WhatsApp"
                    width={220}
                    height={220}
                    style={{ display: "block", imageRendering: "pixelated" }}
                  />
                </div>
                {/* Corner accents */}
                <div className="absolute top-0 left-0 w-4 h-4" style={{ borderTop: "4px solid #84CC16", borderLeft: "4px solid #84CC16" }} />
                <div className="absolute top-0 right-0 w-4 h-4" style={{ borderTop: "4px solid #84CC16", borderRight: "4px solid #84CC16" }} />
                <div className="absolute bottom-0 left-0 w-4 h-4" style={{ borderBottom: "4px solid #84CC16", borderLeft: "4px solid #84CC16" }} />
                <div className="absolute bottom-0 right-0 w-4 h-4" style={{ borderBottom: "4px solid #84CC16", borderRight: "4px solid #84CC16" }} />
              </div>
              <div className="flex items-center justify-center gap-2 text-xs font-medium text-[#6B7280]">
                <Loader2 className="w-3 h-3 animate-spin" />
                Aguardando leitura do QR Code…
              </div>
              <button
                onClick={startConnection}
                className="text-xs font-black text-[#6B7280] flex items-center gap-1.5 mx-auto transition-colors hover:text-[#0F2044]"
              >
                <RefreshCw className="w-3 h-3" /> Gerar novo QR Code
              </button>
            </div>
          )}

          {/* CONNECTED state (brief flash before parent re-renders) */}
          {status === "CONNECTED" && (
            <div className="text-center space-y-3 py-6">
              <div
                className="w-20 h-20 flex items-center justify-center mx-auto"
                style={{ background: "#DCFCE7", border: "3px solid #16A34A", borderRadius: "2px" }}
              >
                <CheckCircle2 className="w-9 h-9 text-green-600" />
              </div>
              <p className="font-black text-[#0F2044] text-lg">Conectado! 🎉</p>
              <p className="text-sm text-[#6B7280] font-medium">Carregando suas conversas…</p>
            </div>
          )}

          {/* Error state */}
          {error && (
            <div
              className="p-4 space-y-3"
              style={{ background: "#FEF2F2", border: "2px solid #EF4444", borderRadius: "2px" }}
            >
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                <p className="text-sm font-black text-red-700">{error}</p>
              </div>
              <button
                onClick={() => { setError(null); startConnection() }}
                className="text-xs font-black text-red-600 flex items-center gap-1.5"
              >
                <RefreshCw className="w-3 h-3" /> Tentar novamente
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Chat Panel ───────────────────────────────────────────────────────────────

function ChatPanel({
  phoneNumber,
  conversations: initialConvs,
  onDisconnect,
}: {
  phoneNumber: string | null
  conversations: Conversation[]
  onDisconnect: () => void
}) {
  const [conversations, setConversations] = useState<Conversation[]>(initialConvs)
  const [selected, setSelected] = useState<string | null>(null)
  const [messages, setMessages] = useState<ConvMessage[]>([])
  const [newMsg, setNewMsg] = useState("")
  const [sending, setSending] = useState(false)
  const [loadingMsgs, setLoadingMsgs] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  // Poll for new conversations every 10s
  useEffect(() => {
    const id = setInterval(async () => {
      try {
        const res = await fetch("/api/channels/whatsapp/conversations")
        if (res.ok) setConversations(await res.json())
      } catch { /* ignore */ }
    }, 10_000)
    return () => clearInterval(id)
  }, [])

  // Poll for new messages in selected conversation every 5s
  useEffect(() => {
    if (!selected) return
    const id = setInterval(async () => {
      try {
        const res = await fetch(`/api/channels/whatsapp/conversations/${selected}/messages`)
        if (res.ok) setMessages(await res.json())
      } catch { /* ignore */ }
    }, 5_000)
    return () => clearInterval(id)
  }, [selected])

  // Scroll to bottom when messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  async function openConversation(id: string) {
    setSelected(id)
    setLoadingMsgs(true)
    try {
      const res = await fetch(`/api/channels/whatsapp/conversations/${id}/messages`)
      if (res.ok) setMessages(await res.json())
    } catch { /* ignore */ }
    setLoadingMsgs(false)
  }

  async function sendMessage() {
    if (!newMsg.trim() || !selected || sending) return
    const text = newMsg.trim()
    setNewMsg("")
    setSending(true)

    // Optimistic update
    const optimistic: ConvMessage = { content: text, direction: "OUTBOUND", sentAt: new Date().toISOString() }
    setMessages(prev => [...prev, optimistic])

    try {
      const res = await fetch("/api/channels/whatsapp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId: selected, message: text }),
      })
      if (!res.ok) {
        toast.error("Erro ao enviar mensagem")
        setMessages(prev => prev.filter(m => m !== optimistic))
        setNewMsg(text)
      } else {
        // Sync server state
        const res2 = await fetch(`/api/channels/whatsapp/conversations/${selected}/messages`)
        if (res2.ok) setMessages(await res2.json())
      }
    } finally {
      setSending(false)
    }
  }

  async function handleDisconnect() {
    if (!confirm("Desconectar o WhatsApp? Você precisará escanear o QR Code novamente.")) return
    try {
      await fetch("/api/channels/whatsapp/disconnect", { method: "POST" })
      onDisconnect()
    } catch {
      toast.error("Erro ao desconectar")
    }
  }

  const selectedConv = conversations.find(c => c.id === selected)
  const selectedName = selectedConv?.contact
    ? `${selectedConv.contact.firstName} ${selectedConv.contact.lastName}`
    : (selectedConv?.displayName ?? selectedConv?.externalId ?? "")

  return (
    <div className="h-full flex flex-col">
      {/* ── Top bar ── */}
      <div
        className="flex items-center justify-between px-4 sm:px-6 py-3 shrink-0 bg-white"
        style={{ borderBottom: "2px solid #0F2044" }}
      >
        <div className="flex items-center gap-3">
          {selected && (
            <button
              onClick={() => setSelected(null)}
              className="sm:hidden mr-1 font-black text-[#0F2044]"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}
          <h1 className="brutal-heading text-xl sm:text-2xl text-[#0F2044]">Comunicações</h1>
          <div
            className="hidden sm:flex items-center gap-1.5 px-2 py-1 text-[10px] font-black uppercase"
            style={{ background: "#DCFCE7", border: "2px solid #16A34A", borderRadius: "2px", color: "#166534" }}
          >
            <CheckCircle2 className="w-3 h-3" />
            Conectado
          </div>
        </div>
        <div className="flex items-center gap-3">
          {phoneNumber && (
            <span className="hidden sm:block text-xs font-bold text-[#6B7280]">
              +{phoneNumber}
            </span>
          )}
          <button
            onClick={handleDisconnect}
            title="Desconectar WhatsApp"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-black transition-all"
            style={{ border: "2px solid #EF4444", color: "#EF4444", borderRadius: "2px" }}
            onMouseEnter={e => {
              e.currentTarget.style.background = "#FEF2F2"
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = "transparent"
            }}
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Desconectar</span>
          </button>
        </div>
      </div>

      {/* ── Split pane ── */}
      <div className="flex flex-1 overflow-hidden">
        {/* Conversation list */}
        <div
          className={`shrink-0 flex flex-col overflow-hidden bg-white ${selected ? "hidden sm:flex" : "flex w-full sm:w-80"}`}
          style={{ borderRight: "2px solid #0F2044" }}
        >
          <div className="px-4 py-2.5 shrink-0" style={{ background: "#0F2044" }}>
            <span className="text-[10px] font-black text-white uppercase tracking-widest">
              Conversas ({conversations.length})
            </span>
          </div>
          <div className="flex-1 overflow-y-auto">
            {conversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center px-4">
                <MessageSquare className="w-8 h-8 text-[#D1D5DB] mb-3" />
                <p className="text-sm font-black text-[#0F2044]">Nenhuma conversa ainda</p>
                <p className="text-xs text-[#6B7280] mt-1 font-medium">
                  As mensagens recebidas aparecerão aqui
                </p>
              </div>
            ) : (
              conversations.map((conv) => {
                const name = conv.contact
                  ? `${conv.contact.firstName} ${conv.contact.lastName}`
                  : (conv.displayName ?? conv.externalId)
                const lastMsg = conv.messages[0]
                const isActive = selected === conv.id
                return (
                  <button
                    key={conv.id}
                    onClick={() => openConversation(conv.id)}
                    className="w-full text-left px-4 py-3 flex items-start gap-3 transition-colors"
                    style={{
                      background: isActive ? "#84CC16" : "transparent",
                      borderBottom: "1px solid rgba(15,32,68,0.1)",
                      borderLeft: isActive ? "4px solid #0F2044" : "4px solid transparent",
                    }}
                  >
                    <div
                      className="w-9 h-9 shrink-0 flex items-center justify-center text-xs font-black mt-0.5"
                      style={{
                        background: isActive ? "#0F2044" : "#84CC16",
                        border: "2px solid #0F2044",
                        color: isActive ? "#84CC16" : "#0F2044",
                        borderRadius: "2px",
                      }}
                    >
                      {(name[0] ?? "?").toUpperCase()}
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <div className="flex items-center justify-between gap-1">
                        <p className="text-sm font-black text-[#0F2044] truncate">{name}</p>
                        {conv.unreadCount > 0 && (
                          <span
                            className="text-[9px] font-black px-1.5 py-0.5 shrink-0"
                            style={{ background: "#0F2044", color: "#84CC16", borderRadius: "2px" }}
                          >
                            {conv.unreadCount}
                          </span>
                        )}
                      </div>
                      {lastMsg && (
                        <p className="text-xs text-[#6B7280] truncate mt-0.5 font-medium">
                          {lastMsg.direction === "OUTBOUND" ? "Você: " : ""}{lastMsg.content}
                        </p>
                      )}
                    </div>
                  </button>
                )
              })
            )}
          </div>
        </div>

        {/* Conversation view */}
        <div
          className={`flex-col overflow-hidden bg-[#F4F4F4] ${selected ? "flex flex-1" : "hidden sm:flex sm:flex-1"}`}
        >
          {!selected ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-6">
              <div
                className="w-16 h-16 flex items-center justify-center mb-4"
                style={{ background: "#0F2044", border: "3px solid #0F2044", borderRadius: "2px" }}
              >
                <MessageSquare className="w-8 h-8 text-[#84CC16]" />
              </div>
              <h3 className="font-black text-[#0F2044] text-lg mb-1">Selecione uma conversa</h3>
              <p className="text-[#6B7280] text-sm font-medium">
                {conversations.length === 0
                  ? "Suas conversas aparecerão aqui quando alguém mandar mensagem."
                  : "Escolha uma conversa na lista à esquerda para continuar."}
              </p>
            </div>
          ) : (
            <>
              {/* Conv header */}
              <div
                className="px-5 py-3 bg-white flex items-center gap-3 shrink-0"
                style={{ borderBottom: "2px solid #0F2044" }}
              >
                <div
                  className="w-9 h-9 flex items-center justify-center text-xs font-black shrink-0"
                  style={{ background: "#84CC16", border: "2px solid #0F2044", borderRadius: "2px", color: "#0F2044" }}
                >
                  {(selectedName[0] ?? "?").toUpperCase()}
                </div>
                <div className="overflow-hidden">
                  <p className="font-black text-[#0F2044] truncate">{selectedName}</p>
                  <p className="text-xs text-[#6B7280] truncate">{selectedConv?.externalId}</p>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {loadingMsgs ? (
                  <div className="flex items-center justify-center py-10">
                    <Loader2 className="w-5 h-5 animate-spin text-[#6B7280]" />
                  </div>
                ) : messages.length === 0 ? (
                  <p className="text-center text-sm text-[#6B7280] font-medium py-10">
                    Nenhuma mensagem ainda. Envie a primeira!
                  </p>
                ) : (
                  messages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`flex ${msg.direction === "OUTBOUND" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className="max-w-[75%] sm:max-w-[65%] px-4 py-2.5 text-sm"
                        style={{
                          background: msg.direction === "OUTBOUND" ? "#0F2044" : "#FFFFFF",
                          color: msg.direction === "OUTBOUND" ? "#FFFFFF" : "#0F2044",
                          border: "2px solid #0F2044",
                          boxShadow: msg.direction === "OUTBOUND" ? "2px 2px 0 #84CC16" : "2px 2px 0 #0F2044",
                          borderRadius: "2px",
                        }}
                      >
                        <p className="font-medium leading-snug break-words">{msg.content}</p>
                        <p className="text-[10px] mt-1 opacity-50 text-right">
                          {new Date(msg.sentAt as string).toLocaleTimeString("pt-BR", {
                            hour: "2-digit", minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                  ))
                )}
                <div ref={bottomRef} />
              </div>

              {/* Input */}
              <div
                className="px-4 py-3 bg-white flex items-center gap-3 shrink-0"
                style={{ borderTop: "2px solid #0F2044" }}
              >
                <input
                  type="text"
                  value={newMsg}
                  onChange={e => setNewMsg(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendMessage()}
                  placeholder="Escreva uma mensagem…"
                  className="flex-1 px-4 py-2.5 text-sm font-medium bg-white outline-none"
                  style={{ border: "2px solid #0F2044", borderRadius: "2px", boxShadow: "2px 2px 0 #0F2044" }}
                />
                <button
                  onClick={sendMessage}
                  disabled={!newMsg.trim() || sending}
                  className="w-11 h-11 flex items-center justify-center shrink-0 transition-all"
                  style={{
                    background: "#84CC16", color: "#0F2044",
                    border: "2px solid #0F2044", boxShadow: "3px 3px 0 #0F2044", borderRadius: "2px",
                    opacity: (!newMsg.trim() || sending) ? 0.4 : 1,
                  }}
                >
                  {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Root Component ───────────────────────────────────────────────────────────

export function ComunicacoesClient({ isConnected: initialConnected, phoneNumber: initialPhone, conversations }: Props) {
  const [connected, setConnected] = useState(initialConnected)
  const [phoneNumber, setPhoneNumber] = useState(initialPhone)

  function handleConnected(phone: string | null) {
    setPhoneNumber(phone)
    setConnected(true)
    // Reload page to get fresh server data (conversations)
    window.location.reload()
  }

  function handleDisconnect() {
    setConnected(false)
    setPhoneNumber(null)
  }

  if (!connected) {
    return (
      <div className="h-full flex flex-col">
        <div
          className="flex items-center gap-3 px-4 sm:px-6 py-3 bg-white shrink-0"
          style={{ borderBottom: "2px solid #0F2044" }}
        >
          <h1 className="brutal-heading text-xl sm:text-2xl text-[#0F2044]">Comunicações</h1>
          <div
            className="flex items-center gap-1.5 px-2 py-1 text-[10px] font-black uppercase"
            style={{ background: "#FEF2F2", border: "2px solid #EF4444", borderRadius: "2px", color: "#991B1B" }}
          >
            <WifiOff className="w-3 h-3" />
            Desconectado
          </div>
        </div>
        <QRConnectPanel onConnected={handleConnected} />
      </div>
    )
  }

  return (
    <ChatPanel
      phoneNumber={phoneNumber}
      conversations={conversations}
      onDisconnect={handleDisconnect}
    />
  )
}
