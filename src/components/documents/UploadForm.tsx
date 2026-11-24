"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Upload } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { registerDocument } from "@/lib/documents/actions";
import {
  ALLOWED_TYPES,
  MAX_FILE_BYTES,
  fileExtension,
  safeFileName,
} from "@/lib/documents/constants";

export default function UploadForm({ orgId }: { orgId: string }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  function resetInput() {
    if (inputRef.current) inputRef.current.value = "";
  }

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setMessage(null);

    const ext = fileExtension(file.name);
    if (!Object.hasOwn(ALLOWED_TYPES, ext)) {
      setError("Tipo não permitido. Envie PDF, TXT ou DOCX.");
      resetInput();
      return;
    }
    if (file.size === 0 || file.size > MAX_FILE_BYTES) {
      setError("O arquivo deve ter entre 1 byte e 10 MB.");
      resetInput();
      return;
    }

    setUploading(true);
    try {
      const docId = crypto.randomUUID();
      const fileName = safeFileName(file.name);
      const supabase = createClient();

      const { error: uploadError } = await supabase.storage
        .from("documents")
        .upload(`${orgId}/${docId}/${fileName}`, file, {
          contentType: ALLOWED_TYPES[ext],
          upsert: false,
        });
      if (uploadError) {
        setError("Não foi possível enviar o arquivo.");
        return;
      }

      const result = await registerDocument({
        orgId,
        docId,
        fileName,
        originalName: file.name,
      });
      if (result.error) {
        setError(result.error);
        return;
      }

      setMessage("Arquivo enviado.");
      router.refresh();
    } catch {
      setError("Falha no envio. Verifique a conexão e tente de novo.");
    } finally {
      setUploading(false);
      resetInput();
    }
  }

  return (
    <div>
      <label
        className={`inline-flex cursor-pointer items-center gap-2 rounded-lg bg-electric px-4 py-2 text-sm font-medium text-white hover:opacity-90 ${
          uploading ? "pointer-events-none opacity-60" : ""
        }`}
      >
        <Upload size={16} />
        {uploading ? "Enviando..." : "Enviar arquivo"}
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.txt,.docx"
          onChange={handleChange}
          disabled={uploading}
          className="sr-only"
        />
      </label>
      <p className="mt-2 text-xs text-slate-500">
        PDF, TXT ou DOCX, até 10 MB.
      </p>
      {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
      {message && <p className="mt-2 text-sm text-emerald-400">{message}</p>}
    </div>
  );
}
