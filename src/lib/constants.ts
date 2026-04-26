export const CORES_ETAPAS = {
  Lead: "#64748B",
  Qualificado: "#06B6D4",
  Proposta: "#8B5CF6",
  "Negociação": "#F59E0B",
  Fechamento: "#10B981",
}

export const LABELS_LEAD_SOURCE: Record<string, string> = {
  MANUAL: "Manual",
  WEBSITE: "Site",
  WHATSAPP: "WhatsApp",
  EMAIL: "E-mail",
  REFERRAL: "Indicação",
  LINKEDIN: "LinkedIn",
  COLD_CALL: "Cold Call",
  EVENT: "Evento",
  INSTAGRAM: "Instagram",
  FACEBOOK: "Facebook",
  ADS: "Anúncios",
  OTHER: "Outros",
}

export const LABELS_LEAD_STATUS: Record<string, string> = {
  NEW: "Novo",
  CONTACTED: "Contatado",
  QUALIFIED: "Qualificado",
  DISQUALIFIED: "Desqualificado",
  CONVERTED: "Convertido",
}

export const LABELS_DEAL_STATUS: Record<string, string> = {
  OPEN: "Aberto",
  WON: "Ganho",
  LOST: "Perdido",
}

export const LABELS_ACTIVITY_TYPE: Record<string, string> = {
  NOTE: "Nota",
  CALL: "Ligação",
  EMAIL: "E-mail",
  WHATSAPP: "WhatsApp",
  MEETING: "Reunião",
  TASK: "Tarefa",
  INACTIVITY_ALERT: "Alerta de inatividade",
}

export const LABELS_PROPOSAL_STATUS: Record<string, string> = {
  DRAFT: "Rascunho",
  SENT: "Enviada",
  VIEWED: "Visualizada",
  ACCEPTED: "Aceita",
  DECLINED: "Recusada",
  EXPIRED: "Expirada",
}

export const LABELS_ROLE: Record<string, string> = {
  ADMIN: "Administrador",
  MANAGER: "Gestor",
  REP: "Vendedor",
  VIEWER: "Visualizador",
}

export const ROTTING_THRESHOLD_DEFAULT = 14
