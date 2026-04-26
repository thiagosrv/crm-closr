"use client"

import { useState } from "react"
import { MessageSquare, ExternalLink, CheckCircle, AlertCircle, Copy } from "lucide-react"
import { toast } from "sonner"

interface ConvLabel { id: string; label: string; color: string }
interface ConvMessage { content: string; direction: string; sentAt: Date | string }
interface Contact { id: string; firstName: string; lastName: string }

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
  isConfigured: boolean
  conversations: Conversation[]
}

export function ComunicacoesClient({ isConfigured, conversations }: Props) {
  const [selected, setSelected] = useState<string | null>(null)
  const [messages, setMessages] = useState<ConvMessage[]>([])
  const [newMsg, setNewMsg] = useState("")

  async function loadMessages(id: string) {
    setSelected(id)
    const res = await fetch(`/api/channels/whatsapp/conversations/${id}/messages`)
    if (res.ok) setMessages(await res.json())
  }

  async function sendMessage() {
    if (!newMsg.trim() || !selected) return
    const res = await fetch("/api/channels/whatsapp/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ conversationId: selected, message: newMsg }),
    })
    if (res.ok) {
      setMessages(prev => [...prev, { content: newMsg, direction: "OUTBOUND", sentAt: new Date().toISOString() }])
      setNewMsg("")
    } else {
      toast.error("Erro ao enviar mensagem")
    }
  }

  const selectedConv = conversations.find(c => c.id === selected)

  if (!isConfigured) {
    return (
      <div className="p-4 sm:p-6 max-w-[900px] mx-auto">
        <div className="mb-4 sm:mb-6">
          <h1 className="brutal-heading text-2xl sm:text-3xl">Comunicações</h1>
          <p className="text-[#6B7280] text-sm font-medium mt-1">WhatsApp Business — Central de Mensagens</p>
        </div>

        {/* Setup card */}
        <div className="brutal-card max-w-2xl overflow-hidden">
          <div
            className="px-5 py-4"
            style={{ background: "#0F2044", borderBottom: "2px solid #0F2044" }}
          >
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-[#84CC16]" />
              <h2 className="font-black text-white text-lg">Configure o WhatsApp Business API</h2>
            </div>
          </div>

          <div className="p-6 space-y-5">
            <p className="text-[#0F2044] text-sm font-medium leading-relaxed">
              Para usar o módulo de Comunicações, você precisa de uma conta{" "}
              <strong>WhatsApp Business API</strong> (Meta Cloud API oficial).
            </p>

            <div className="space-y-3">
              {[
                { step: "1", text: "Acesse o Meta Business Manager e crie um App de Negócios" },
                { step: "2", text: "Adicione o produto 'WhatsApp' ao seu app e configure um número dedicado" },
                { step: "3", text: "Gere um token de acesso permanente no painel da Meta" },
                { step: "4", text: "Configure as variáveis de ambiente abaixo no seu servidor" },
              ].map(s => (
                <div key={s.step} className="flex items-start gap-3">
                  <div
                    className="w-7 h-7 shrink-0 flex items-center justify-center text-xs font-black"
                    style={{ background: "#84CC16", border: "2px solid #0F2044", borderRadius: "2px" }}
                  >
                    {s.step}
                  </div>
                  <p className="text-sm text-[#0F2044] pt-0.5 font-medium">{s.text}</p>
                </div>
              ))}
            </div>

            <div style={{ border: "2px solid #0F2044", borderRadius: "2px" }}>
              <div
                className="px-4 py-2 flex items-center justify-between"
                style={{ background: "#0F2044", borderBottom: "2px solid #0F2044" }}
              >
                <span className="text-[10px] font-black text-white uppercase tracking-widest">.env.local</span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText("WHATSAPP_ACCESS_TOKEN=\nWHATSAPP_PHONE_NUMBER_ID=\nWHATSAPP_WEBHOOK_SECRET=")
                    toast.success("Copiado!")
                  }}
                  className="text-white/60 hover:text-[#84CC16]"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
              <pre className="p-4 text-xs text-[#0F2044] bg-[#F4F4F4] font-mono leading-relaxed">
{`WHATSAPP_ACCESS_TOKEN=seu_token_aqui
WHATSAPP_PHONE_NUMBER_ID=seu_phone_id_aqui
WHATSAPP_WEBHOOK_SECRET=seu_webhook_secret`}
              </pre>
            </div>

            <a
              href="https://developers.facebook.com/docs/whatsapp/cloud-api/get-started"
              target="_blank"
              rel="noopener noreferrer"
              className="brutal-btn inline-flex items-center gap-2 px-5 py-2.5 text-sm font-black"
            >
              <ExternalLink className="w-4 h-4" />
              Ver documentação da Meta
            </a>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 bg-white shrink-0"
        style={{ borderBottom: "2px solid #0F2044" }}
      >
        <div className="flex items-center gap-3">
          {selected && (
            <button
              onClick={() => setSelected(null)}
              className="sm:hidden mr-1 text-[#0F2044] font-black text-sm"
            >
              ← Voltar
            </button>
          )}
          <h1 className="brutal-heading text-xl sm:text-2xl">Comunicações</h1>
          <div
            className="flex items-center gap-1.5 px-2 py-1 text-[10px] font-black uppercase"
            style={{ background: "#84CC16", border: "2px solid #0F2044", borderRadius: "2px" }}
          >
            <CheckCircle className="w-3 h-3" />
            Conectado
          </div>
        </div>
      </div>

      {/* Split pane */}
      <div className="flex flex-1 overflow-hidden">
        {/* Conversation list — full on mobile when no conv selected */}
        <div
          className={`shrink-0 flex flex-col overflow-hidden bg-white ${selected ? "hidden sm:flex" : "flex w-full sm:w-80"}`}
          style={{ borderRight: "2px solid #0F2044" }}
        >
          <div
            className="px-4 py-3"
            style={{ background: "#0F2044", borderBottom: "2px solid #0F2044" }}
          >
            <span className="text-[10px] font-black text-white uppercase tracking-widest">
              Conversas ({conversations.length})
            </span>
          </div>
          <div className="flex-1 overflow-y-auto">
            {conversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center px-4">
                <MessageSquare className="w-8 h-8 text-[#6B7280] mb-3" />
                <p className="text-sm font-bold text-[#0F2044]">Nenhuma conversa ainda</p>
                <p className="text-xs text-[#6B7280] mt-1">As mensagens recebidas aparecerão aqui</p>
              </div>
            ) : (
              conversations.map((conv) => {
                const name = conv.contact
                  ? `${conv.contact.firstName} ${conv.contact.lastName}`
                  : conv.displayName ?? conv.externalId
                const lastMsg = conv.messages[0]
                const isActive = selected === conv.id
                return (
                  <button
                    key={conv.id}
                    onClick={() => loadMessages(conv.id)}
                    className="w-full text-left px-4 py-3 flex items-start gap-3 transition-colors"
                    style={{
                      background: isActive ? "#84CC16" : "transparent",
                      borderBottom: "1px solid rgba(15,32,68,0.12)",
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
                      {name[0]?.toUpperCase()}
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <div className="flex items-center justify-between">
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

        {/* Conversation view — hidden on mobile until conv selected */}
        <div className={`flex-col overflow-hidden bg-[#F4F4F4] ${selected ? "flex flex-1" : "hidden sm:flex sm:flex-1"}`}>
          {!selected ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div
                className="w-16 h-16 flex items-center justify-center mb-4"
                style={{ background: "#0F2044", border: "3px solid #0F2044", borderRadius: "2px" }}
              >
                <MessageSquare className="w-8 h-8 text-[#84CC16]" />
              </div>
              <h3 className="font-black text-[#0F2044] text-lg mb-2">Selecione uma conversa</h3>
              <p className="text-[#6B7280] text-sm">Escolha uma conversa na lista à esquerda</p>
            </div>
          ) : (
            <>
              {/* Conv header */}
              <div
                className="px-5 py-3 bg-white flex items-center gap-3 shrink-0"
                style={{ borderBottom: "2px solid #0F2044" }}
              >
                <div
                  className="w-9 h-9 flex items-center justify-center text-xs font-black"
                  style={{ background: "#84CC16", border: "2px solid #0F2044", borderRadius: "2px", color: "#0F2044" }}
                >
                  {(selectedConv?.contact
                    ? `${selectedConv.contact.firstName} ${selectedConv.contact.lastName}`
                    : selectedConv?.displayName ?? "?"
                  )[0]?.toUpperCase()}
                </div>
                <div>
                  <p className="font-black text-[#0F2044]">
                    {selectedConv?.contact
                      ? `${selectedConv.contact.firstName} ${selectedConv.contact.lastName}`
                      : selectedConv?.displayName ?? selectedConv?.externalId}
                  </p>
                  <p className="text-xs text-[#6B7280]">{selectedConv?.externalId}</p>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex ${msg.direction === "OUTBOUND" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className="max-w-[70%] px-4 py-2.5 text-sm"
                      style={{
                        background: msg.direction === "OUTBOUND" ? "#0F2044" : "#FFFFFF",
                        color: msg.direction === "OUTBOUND" ? "#FFFFFF" : "#0F2044",
                        border: "2px solid #0F2044",
                        boxShadow: "2px 2px 0 #0F2044",
                        borderRadius: "2px",
                      }}
                    >
                      <p className="font-medium leading-snug">{msg.content}</p>
                      <p className="text-[10px] mt-1 opacity-60">
                        {new Date(msg.sentAt as string).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </div>
                ))}
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
                  onKeyDown={e => e.key === "Enter" && sendMessage()}
                  placeholder="Escreva uma mensagem..."
                  className="brutal-input flex-1 px-4 py-2.5 text-sm"
                />
                <button
                  onClick={sendMessage}
                  disabled={!newMsg.trim()}
                  className="brutal-btn-lime px-5 py-2.5 text-sm font-black disabled:opacity-40"
                >
                  Enviar
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
