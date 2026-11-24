import { GoogleGenAI } from "@google/genai";

// Somente servidor: a chave nunca é enviada ao navegador.

export type ChatTurn = { role: "user" | "assistant"; content: string };

export class AiNotConfiguredError extends Error {
  constructor() {
    super("GEMINI_API_KEY ou GEMINI_MODEL não configurados.");
    this.name = "AiNotConfiguredError";
  }
}

export function isAiConfigured(): boolean {
  return Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_MODEL);
}

const SYSTEM_PROMPT =
  "Você é o assistente da LAHTEN AI, uma plataforma de IA para imobiliárias brasileiras. " +
  "Responda sempre em português do Brasil, de forma clara e objetiva. " +
  "Não invente dados de imóveis, contratos, valores ou clientes: se não tiver a informação, diga que não tem.";

type GeminiTurn = { role: "user" | "model"; parts: { text: string }[] };

function toGeminiContents(history: ChatTurn[]): GeminiTurn[] {
  const contents: GeminiTurn[] = [];

  for (const turn of history) {
    const role = turn.role === "assistant" ? "model" : "user";
    const last = contents[contents.length - 1];
    if (last && last.role === role) {
      // Junta turnos seguidos do mesmo papel (ex.: mensagem enviada sem resposta).
      last.parts.push({ text: turn.content });
    } else {
      contents.push({ role, parts: [{ text: turn.content }] });
    }
  }

  // O Gemini exige que a conversa comece por uma mensagem do usuário.
  while (contents.length > 0 && contents[0].role !== "user") {
    contents.shift();
  }

  return contents;
}

export async function generateReply(history: ChatTurn[]): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  const model = process.env.GEMINI_MODEL;
  if (!apiKey || !model) throw new AiNotConfiguredError();

  const contents = toGeminiContents(history);
  if (contents.length === 0) throw new Error("Conversa sem mensagem do usuário.");

  const ai = new GoogleGenAI({ apiKey });
  const response = await ai.models.generateContent({
    model,
    contents,
    config: { systemInstruction: SYSTEM_PROMPT },
  });

  const text = response.text?.trim();
  if (!text) throw new Error("A IA devolveu uma resposta vazia.");
  return text;
}
