import { extractText, getDocumentProxy } from "unpdf";

const MAX_PDF_PAGES = 300;
const MAX_TEXT_CHARS = 480_000;

export class ExtractError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ExtractError";
  }
}

function normalize(text: string): string {
  return text
    .replace(/\u0000/g, "")
    .replace(/\r\n?/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

async function fromPdf(buffer: ArrayBuffer): Promise<string> {
  const pdf = await getDocumentProxy(new Uint8Array(buffer)).catch(() => {
    throw new ExtractError(
      "Não foi possível abrir o PDF (arquivo corrompido ou protegido por senha)."
    );
  });

  if (pdf.numPages > MAX_PDF_PAGES) {
    throw new ExtractError(
      `O PDF tem páginas demais (máximo de ${MAX_PDF_PAGES}).`
    );
  }

  const { text } = await extractText(pdf, { mergePages: true });
  return Array.isArray(text) ? text.join("\n\n") : text;
}

function fromText(buffer: ArrayBuffer): string {
  try {
    return new TextDecoder("utf-8", { fatal: true }).decode(buffer);
  } catch {
    return new TextDecoder("windows-1252").decode(buffer);
  }
}

export async function extractDocumentText(
  buffer: ArrayBuffer,
  mimeType: string
): Promise<string> {
  let raw: string;

  if (mimeType === "application/pdf") {
    raw = await fromPdf(buffer);
  } else if (mimeType === "text/plain") {
    raw = fromText(buffer);
  } else {
    throw new ExtractError(
      "Este tipo de arquivo ainda não é suportado para leitura de texto."
    );
  }

  const text = normalize(raw);
  if (text.length < 20) {
    throw new ExtractError(
      "Nenhum texto encontrado. Se for um PDF escaneado (imagem), a leitura de imagens ainda não está disponível."
    );
  }

  return text.slice(0, MAX_TEXT_CHARS);
}

// Divide o texto em trechos de ~1200 caracteres, com sobreposição de 150.
export function chunkText(
  text: string,
  size = 1200,
  overlap = 150,
  maxChunks = 400
): string[] {
  const chunks: string[] = [];
  let start = 0;

  while (start < text.length && chunks.length < maxChunks) {
    let end = Math.min(start + size, text.length);

    if (end < text.length) {
      const slice = text.slice(start, end);
      const breakAt = Math.max(
        slice.lastIndexOf("\n\n"),
        slice.lastIndexOf(". "),
        slice.lastIndexOf("\n")
      );
      if (breakAt > size * 0.5) end = start + breakAt + 1;
    }

    const piece = text.slice(start, end).trim();
    if (piece) chunks.push(piece);

    if (end >= text.length) break;
    start = Math.max(end - overlap, start + 1);
  }

  return chunks;
}
