
export const STAGES = {
  proposal: "Proposta",
  visit: "Visita",
  negotiation: "Negociação",
  won: "Fechado",
  lost: "Perdido",
} as const;

export type DealStage = keyof typeof STAGES;
