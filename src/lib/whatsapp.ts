export function buildWhatsAppUrl(raw: string, message?: string): string {
  const digits = raw.replace(/\D/g, "")
  const base = `https://wa.me/${digits}`
  return message ? `${base}?text=${encodeURIComponent(message)}` : base
}

export function isValidWhatsApp(raw: string): boolean {
  const digits = raw.replace(/\D/g, "")
  return digits.length >= 10 && digits.length <= 15
}

export function formatarWhatsApp(raw: string): string {
  const digits = raw.replace(/\D/g, "")
  if (digits.length === 13) {
    // +55 11 9 9999-9999
    return `+${digits.slice(0, 2)} (${digits.slice(2, 4)}) ${digits.slice(4, 5)} ${digits.slice(5, 9)}-${digits.slice(9)}`
  }
  if (digits.length === 12) {
    // +55 11 9999-9999
    return `+${digits.slice(0, 2)} (${digits.slice(2, 4)}) ${digits.slice(4, 8)}-${digits.slice(8)}`
  }
  return raw
}
