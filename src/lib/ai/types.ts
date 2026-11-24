export type ChatMessage = { role: "user" | "assistant"; content: string };

export type AiErrorCode = "not_configured" | "rate_limited" | "failed";

export class AiError extends Error {
  code: AiErrorCode;

  constructor(code: AiErrorCode, message: string) {
    super(message);
    this.name = "AiError";
    this.code = code;
  }
}
