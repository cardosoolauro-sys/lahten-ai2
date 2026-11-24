export const MAX_FILE_BYTES = 10 * 1024 * 1024; // 10 MB

export const ALLOWED_TYPES: Record<string, string> = {
  pdf: "application/pdf",
  txt: "text/plain",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
};

export function fileExtension(name: string): string {
  const i = name.lastIndexOf(".");
  return i < 0 ? "" : name.slice(i + 1).toLowerCase();
}

// Nome seguro para o caminho no Storage (sem acentos, espaços ou símbolos).
export function safeFileName(name: string): string {
  const ext = fileExtension(name);
  const base =
    name
      .slice(0, name.length - (ext ? ext.length + 1 : 0))
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9._-]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 80) || "documento";
  return `${base}.${ext}`;
}
