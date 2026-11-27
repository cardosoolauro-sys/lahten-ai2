
export const STAGES = {
  proposal: "Proposta",
  visit: "Visita",
  negotiation: "Negociação",
  won: "Fechado",
  lost: "Perdido",
} as const;

export type DealStage = keyof typeof STAGES;

// Aceita qualquer texto vindo do banco; se a etapa for desconhecida, devolve o próprio texto.
export function stageLabel(stage: string): string {
  return Object.prototype.hasOwnProperty.call(STAGES, stage)
    ? STAGES[stage as DealStage]
    : stage;
}
