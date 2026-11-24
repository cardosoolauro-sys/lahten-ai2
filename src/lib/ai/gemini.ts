import { AiError, type ChatMessage } from "./types";

const SYSTEM_PROMPT = [
  "Você é o assistente da LAHTEN AI, uma plataforma de inteligência artificial para imobiliárias no Brasil.",
  "Responda sempre em português do Brasil, de forma clara, profissional e objetiva.",
  "Ajude com rotinas do mercado imobiliário: atendimento a clientes, anúncios, contratos, locação, vendas e organização do trabalho.",
  "Não invente dados, valores, leis ou números. Se não tiver certeza, diga isso.",
  "Você não é advogado nem consultor financeiro: em temas jurídicos e financeiros, recomende validar com um profissional.",
].join(" ");

export async function geminiReply(messages: ChatMessage[]): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  const model = process.env.GEMINI_MODEL;

  if (!apiKey || !model || !/^[a-z0-9.\-]+$/i.test(model)) {
    throw new AiError("not_configured", "Gemini não configurado.");
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents: messages.map((m) => ({
          role: m.role === "assistant" ? "model" : "user",
          parts: [{ text: m.content }],
        })),
        generationConfig: { maxOutputTokens: 2048 },
      }),
      signal: AbortSignal.timeout(50_000),
      cache: "no-store",
    }
  );

  if (response.status === 429) {
    throw new AiError("rate_limited", "Limite do Gemini atingido.");
  }
  if (!response.ok) {
    throw new AiError("failed", `Gemini respondeu com status ${response.status}.`);
  }

  const data = await response.json();
  const parts = data?.candidates?.[0]?.content?.parts;
  const text = Array.isArray(parts)
    ? parts
        .map((p: { text?: string }) => p.text ?? "")
        .join("")
        .trim()
    : "";

  if (!text) throw new AiError("failed", "Resposta vazia do Gemini.");
  return text;
}
