"use client"

import { useEffect, useState, useRef } from "react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { Loader2, Wifi, WifiOff, RefreshCw } from "lucide-react"

interface WhatsAppConnectCardProps {
  initialStatus: string
  initialPhoneNumber: string | null
}

type Status = "CONNECTED" | "CONNECTING" | "DISCONNECTED" | "LOADING_QR"

export function WhatsAppConnectCard({
  initialStatus,
  initialPhoneNumber,
}: WhatsAppConnectCardProps) {
  const [status, setStatus] = useState<Status>(initialStatus as Status)
  const [phoneNumber, setPhoneNumber] = useState<string | null>(initialPhoneNumber)
  const [qrUrl, setQrUrl] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [disconnecting, setDisconnecting] = useState(false)
  const eventSourceRef = useRef<EventSource | null>(null)

  useEffect(() => {
    return () => {
      eventSourceRef.current?.close()
    }
  }, [])

  function startConnection() {
    setStatus("LOADING_QR")
    setQrUrl(null)
    setErrorMsg(null)

    eventSourceRef.current?.close()
    const es = new EventSource("/api/channels/whatsapp/qr")
    eventSourceRef.current = es

    es.addEventListener("qr", (e) => {
      try {
        const { dataUrl } = JSON.parse((e as MessageEvent).data) as { dataUrl: string }
        setQrUrl(dataUrl)
        setStatus("CONNECTING")
        setErrorMsg(null)
      } catch {
        // ignore malformed event
      }
    })

    es.addEventListener("status", (e) => {
      try {
        const data = JSON.parse((e as MessageEvent).data) as { status: string; phoneNumber?: string }
        if (data.status === "CONNECTED") {
          setStatus("CONNECTED")
          setPhoneNumber(data.phoneNumber ?? null)
          setQrUrl(null)
          es.close()
          toast.success("WhatsApp conectado com sucesso!")
        } else if (data.status === "DISCONNECTED") {
          setStatus("DISCONNECTED")
          setQrUrl(null)
          es.close()
        }
      } catch {
        // ignore
      }
    })

    // Custom error event sent by the server before closing the stream
    es.addEventListener("error", (e) => {
      try {
        const data = JSON.parse((e as MessageEvent).data) as { message: string }
        const msg = data.message?.includes("log out")
          ? "Sessão expirada — faça logout e login novamente."
          : `Erro ao conectar: ${data.message}`
        setErrorMsg(msg)
        setStatus("DISCONNECTED")
        setQrUrl(null)
        es.close()
      } catch {
        // This fires on network-level SSE errors (not our custom event)
        setStatus("DISCONNECTED")
        setQrUrl(null)
        es.close()
        toast.error("Erro de conexão. Tente novamente.")
      }
    })
  }

  async function handleDisconnect() {
    setDisconnecting(true)
    try {
      const res = await fetch("/api/channels/whatsapp/disconnect", { method: "POST" })
      if (!res.ok) throw new Error()
      setStatus("DISCONNECTED")
      setPhoneNumber(null)
      toast.success("WhatsApp desconectado.")
    } catch {
      toast.error("Falha ao desconectar.")
    } finally {
      setDisconnecting(false)
    }
  }

  const isConnected = status === "CONNECTED"
  const isConnecting = status === "CONNECTING" || status === "LOADING_QR"

  return (
    <div
      className="glass rounded-xl p-5"
      style={{
        border: "1.5px solid rgba(255,255,255,0.20)",
        boxShadow: "3px 4px 0px rgba(0,0,0,0.80)",
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-5">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center",
              isConnected
                ? "bg-green-500/15 border border-green-500/30"
                : "bg-white/[0.04] border border-white/[0.12]"
            )}
            style={{ boxShadow: "2px 2px 0px rgba(0,0,0,0.50)" }}
          >
            <svg
              viewBox="0 0 24 24"
              className={cn("w-5 h-5", isConnected ? "text-green-400" : "text-white/40")}
              fill="currentColor"
            >
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-black tracking-tight text-white">WhatsApp</h3>
            <p className="text-xs text-white/40 mt-0.5">
              {isConnected ? phoneNumber ?? "Conectado" : "Não conectado"}
            </p>
          </div>
        </div>

        <span
          className={cn(
            "text-[11px] font-black tracking-wide px-2.5 py-1 rounded-md border uppercase",
            isConnected
              ? "bg-green-500/15 text-green-400 border-green-500/35"
              : isConnecting
              ? "bg-yellow-500/15 text-yellow-400 border-yellow-500/35"
              : "bg-white/[0.04] text-white/40 border-white/[0.12]"
          )}
          style={{ boxShadow: "1px 1px 0px rgba(0,0,0,0.50)" }}
        >
          {isConnected ? "Conectado" : isConnecting ? "Aguardando…" : "Desconectado"}
        </span>
      </div>

      {/* Error message */}
      {errorMsg && (
        <div
          className="mb-4 rounded-lg p-3 text-xs text-red-400 font-semibold"
          style={{
            background: "rgba(239,68,68,0.08)",
            border: "1.5px solid rgba(239,68,68,0.30)",
            boxShadow: "2px 2px 0px rgba(0,0,0,0.50)",
          }}
        >
          {errorMsg}
        </div>
      )}

      {/* QR code area */}
      {isConnecting && (
        <div
          className="flex flex-col items-center gap-3 mb-5 p-4 rounded-xl"
          style={{
            background: "rgba(255,255,255,0.02)",
            border: "1.5px solid rgba(255,255,255,0.10)",
            boxShadow: "2px 2px 0px rgba(0,0,0,0.50)",
          }}
        >
          {qrUrl ? (
            <>
              <div
                className="p-3 rounded-lg"
                style={{
                  background: "#ffffff",
                  border: "2px solid rgba(255,255,255,0.30)",
                  boxShadow: "3px 3px 0px rgba(0,0,0,0.70)",
                }}
              >
                <img src={qrUrl} alt="QR Code WhatsApp" width={200} height={200} className="block" />
              </div>
              <p className="text-xs text-white/50 text-center">
                Abra o WhatsApp → <strong className="text-white/70">Dispositivos conectados</strong> → escaneie o código
              </p>
            </>
          ) : (
            <>
              <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
              <p className="text-xs text-white/50">Iniciando conexão…</p>
            </>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2">
        {isConnected ? (
          <button
            type="button"
            onClick={handleDisconnect}
            disabled={disconnecting}
            className="flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-lg border transition-all disabled:opacity-50"
            style={{
              color: "#f87171",
              background: "rgba(239,68,68,0.08)",
              border: "1.5px solid rgba(239,68,68,0.35)",
              boxShadow: "2px 2px 0px rgba(0,0,0,0.60)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = "3px 3px 0px rgba(0,0,0,0.70)"
              e.currentTarget.style.transform = "translate(-1px,-1px)"
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = "2px 2px 0px rgba(0,0,0,0.60)"
              e.currentTarget.style.transform = "translate(0,0)"
            }}
          >
            {disconnecting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <WifiOff className="w-3.5 h-3.5" />}
            Desconectar
          </button>
        ) : isConnecting ? (
          <button
            type="button"
            onClick={() => {
              eventSourceRef.current?.close()
              setStatus("DISCONNECTED")
              setQrUrl(null)
            }}
            className="flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-lg transition-all"
            style={{
              color: "rgba(255,255,255,0.60)",
              background: "rgba(255,255,255,0.04)",
              border: "1.5px solid rgba(255,255,255,0.14)",
              boxShadow: "2px 2px 0px rgba(0,0,0,0.60)",
            }}
          >
            Cancelar
          </button>
        ) : (
          <button
            type="button"
            onClick={startConnection}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-black rounded-lg text-white transition-all"
            style={{
              background: "linear-gradient(135deg, #22c55e, #16a34a)",
              border: "1.5px solid rgba(255,255,255,0.25)",
              boxShadow: "3px 3px 0px rgba(0,0,0,0.70)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = "4px 4px 0px rgba(0,0,0,0.80)"
              e.currentTarget.style.transform = "translate(-1px,-1px)"
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = "3px 3px 0px rgba(0,0,0,0.70)"
              e.currentTarget.style.transform = "translate(0,0)"
            }}
            onMouseDown={(e) => {
              e.currentTarget.style.boxShadow = "1px 1px 0px rgba(0,0,0,0.80)"
              e.currentTarget.style.transform = "translate(2px,2px)"
            }}
            onMouseUp={(e) => {
              e.currentTarget.style.boxShadow = "4px 4px 0px rgba(0,0,0,0.80)"
              e.currentTarget.style.transform = "translate(-1px,-1px)"
            }}
          >
            <Wifi className="w-3.5 h-3.5" />
            Conectar WhatsApp
          </button>
        )}

        {!isConnected && !isConnecting && (
          <button
            type="button"
            onClick={startConnection}
            className="p-2 rounded-lg text-white/30 hover:text-white/60 transition-colors"
            title="Tentar novamente"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  )
}
