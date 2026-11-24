"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Download, RefreshCw, Trash2 } from "lucide-react";
import {
  deleteDocument,
  getDownloadUrl,
  processDocument,
} from "@/lib/documents/actions";

export default function DocumentActions({
  id,
  status,
  canDelete,
  canProcess,
}: {
  id: string;
  status: string;
  canDelete: boolean;
  canProcess: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onDownload() {
    setBusy(true);
    setError(null);
    const result = await getDownloadUrl(id);
    setBusy(false);
    if (result.url) {
      window.location.assign(result.url);
    } else {
      setError(result.error ?? "Erro ao baixar.");
    }
  }

  async function onProcess() {
    setBusy(true);
    setError(null);
    const result = await processDocument(id);
    setBusy(false);
    if (result.error) setError(result.error);
    router.refresh();
  }

  async function onDelete() {
    if (!window.confirm("Excluir este documento? Não dá para desfazer.")) {
      return;
    }
    setBusy(true);
    setError(null);
    const result = await deleteDocument(id);
    setBusy(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    router.refresh();
  }

  const showProcess = canProcess && status !== "ready";

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex items-center gap-1">
        {showProcess && (
          <button
            onClick={onProcess}
            disabled={busy}
            aria-label="Ler texto"
            title="Ler texto"
            className="rounded-md p-2 text-electric-soft hover:bg-navy-800 disabled:opacity-50"
          >
            <RefreshCw size={18} />
          </button>
        )}
        <button
          onClick={onDownload}
          disabled={busy}
          aria-label="Baixar"
          className="rounded-md p-2 text-slate-300 hover:bg-navy-800 disabled:opacity-50"
        >
          <Download size={18} />
        </button>
        {canDelete && (
          <button
            onClick={onDelete}
            disabled={busy}
            aria-label="Excluir"
            className="rounded-md p-2 text-red-400 hover:bg-navy-800 disabled:opacity-50"
          >
            <Trash2 size={18} />
          </button>
        )}
      </div>
      {error && (
        <p className="max-w-[14rem] text-right text-xs text-red-400">{error}</p>
      )}
    </div>
  );
}
