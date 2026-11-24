"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  ALLOWED_TYPES,
  MAX_FILE_BYTES,
  fileExtension,
  safeFileName,
} from "./constants";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export type ActionResult = { ok?: boolean; error?: string };

export async function registerDocument(input: {
  orgId: string;
  docId: string;
  fileName: string;
  originalName: string;
}): Promise<ActionResult> {
  const { orgId, docId, fileName } = input;
  const originalName = String(input.originalName ?? "").trim().slice(0, 255);
  const ext = fileExtension(String(fileName ?? ""));

  if (
    !UUID_RE.test(orgId) ||
    !UUID_RE.test(docId) ||
    !Object.hasOwn(ALLOWED_TYPES, ext) ||
    fileName !== safeFileName(fileName) ||
    originalName.length < 1
  ) {
    return { error: "Dados do arquivo inválidos." };
  }

  const supabase = await createClient();
  const folder = `${orgId}/${docId}`;
  const path = `${folder}/${fileName}`;

  // Confere no Storage que o arquivo existe e usa o tamanho real dele.
  const { data: objects } = await supabase.storage
    .from("documents")
    .list(folder, { limit: 5 });
  const object = objects?.find((o) => o.name === fileName);
  if (!object) return { error: "Arquivo não encontrado no armazenamento." };

  const size = Number(object.metadata?.size ?? 0);
  if (!size || size > MAX_FILE_BYTES) {
    await supabase.storage.from("documents").remove([path]);
    return { error: "Tamanho de arquivo inválido (máximo de 10 MB)." };
  }

  const { error } = await supabase.from("documents").insert({
    id: docId,
    org_id: orgId,
    name: originalName,
    mime_type: ALLOWED_TYPES[ext],
    size_bytes: size,
    storage_path: path,
  });

  if (error) {
    await supabase.storage.from("documents").remove([path]);
    return { error: "Não foi possível registrar o documento." };
  }

  revalidatePath("/knowledge");
  return { ok: true };
}

export async function getDownloadUrl(
  documentId: string
): Promise<{ url?: string; error?: string }> {
  if (!UUID_RE.test(documentId)) return { error: "Documento inválido." };

  const supabase = await createClient();
  const { data: doc } = await supabase
    .from("documents")
    .select("storage_path, name")
    .eq("id", documentId)
    .maybeSingle();
  if (!doc) return { error: "Documento não encontrado." };

  const { data, error } = await supabase.storage
    .from("documents")
    .createSignedUrl(doc.storage_path, 60, { download: doc.name });
  if (error || !data?.signedUrl) {
    return { error: "Não foi possível gerar o link de download." };
  }

  return { url: data.signedUrl };
}

export async function deleteDocument(
  documentId: string
): Promise<ActionResult> {
  if (!UUID_RE.test(documentId)) return { error: "Documento inválido." };

  const supabase = await createClient();
  const { data: doc } = await supabase
    .from("documents")
    .select("storage_path")
    .eq("id", documentId)
    .maybeSingle();
  if (!doc) return { error: "Documento não encontrado." };

  const { data: deleted, error } = await supabase
    .from("documents")
    .delete()
    .eq("id", documentId)
    .select("id");
  if (error || !deleted || deleted.length === 0) {
    return { error: "Você não tem permissão para excluir este documento." };
  }

  const { error: removeError } = await supabase.storage
    .from("documents")
    .remove([doc.storage_path]);
  if (removeError) {
    console.error("Arquivo ficou órfão no Storage após excluir documento.");
  }

  revalidatePath("/knowledge");
  return { ok: true };
}
