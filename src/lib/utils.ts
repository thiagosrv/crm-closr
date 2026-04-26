import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { format, formatDistanceToNow, differenceInDays } from "date-fns"
import { ptBR } from "date-fns/locale"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatarMoeda(valor: number, moeda = "BRL"): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: moeda,
  }).format(valor)
}

export function formatarData(data: Date | string): string {
  return format(new Date(data), "dd/MM/yyyy", { locale: ptBR })
}

export function formatarDataHora(data: Date | string): string {
  return format(new Date(data), "dd/MM/yyyy HH:mm", { locale: ptBR })
}

export function formatarDataRelativa(data: Date | string): string {
  return formatDistanceToNow(new Date(data), { addSuffix: true, locale: ptBR })
}

export function diasDesde(data: Date | string): number {
  return differenceInDays(new Date(), new Date(data))
}

export function iniciais(nome: string): string {
  return nome
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase()
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
}
