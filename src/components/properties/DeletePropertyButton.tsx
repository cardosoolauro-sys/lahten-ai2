"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { deleteProperty } from "@/lib/properties/actions";

export default function DeletePropertyButton({ id }: { id: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onDelete() {
    if (!window.confirm("Apagar este imóvel? Não dá para desfazer.")) return;
    setBusy(true);
    setError(null);
    const result = await deleteProperty(id);
    setBusy(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    router.push("/properties");
    router.refresh();
  }

  return (
    <div>
      <button
        onClick={onDelete}
        disabled={busy}
        className="flex items-center gap-2 rounded-lg border border-red-400/40 px-3 py-2 text-sm text-red-400 hover:bg-red-400/10 disabled:opacity-50"
      >
        <Trash2 size={16} />
        {busy ? "Apagando..." : "Apagar imóvel"}
      </button>
      {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
    </div>
  );
}
