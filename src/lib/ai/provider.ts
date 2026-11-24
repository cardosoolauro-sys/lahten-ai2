import { geminiReply } from "./gemini";
import { AiError, type ChatMessage } from "./types";

// Camada que isola o provedor de IA: para trocar de provedor, adicione um
// novo arquivo e um novo caso aqui, sem mexer no resto do app.
export async function generateReply(messages: ChatMessage[]): Promise<string> {
  const provider = process.env.AI_PROVIDER ?? "gemini";

  switch (provider) {
    case "gemini":
      return geminiReply(messages);
    default:
      throw new AiError("not_configured", "Provedor de IA desconhecido.");
  }
}
