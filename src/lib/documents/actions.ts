"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  ALLOWED_TYPES,
  MAX_FILE_BYTES,
  fileExtension,
  safeFileName,
} from "./constants";
import { ExtractError, chunkText, extractDocumentText } from "./extract";

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

export async function processDocument(
  documentId: string
): Promise<ActionResult> {
  if (!UUID_RE.test(documentId)) return { error: "Documento inválido." };

  const supabase = await createClient();

  // "Reserva" o documento: só processa se estiver pendente, com falha
  // ou preso em "lendo" há mais de 5 minutos.
  const staleBefore = new Date(Date.now() - 5 * 60 * 1000).toISOString();
  const { data: claimed, error: claimError } = await supabase
    .from("documents")
    .update({ status: "processing", error: null })
    .eq("id", documentId)
    .or(
      `status.in.(pending,failed),and(status.eq.processing,updated_at.lt.${staleBefore})`
    )
    .select("id, org_id, storage_path, mime_type");

  if (claimError) {
    return { error: "Não foi possível iniciar a leitura do documento." };
  }
  const doc = claimed?.[0];
  if (!doc) {
    return {
      error:
        "Não foi possível iniciar a leitura (já lido, em andamento ou sem permissão).",
    };
  }

  async function fail(message: string): Promise<ActionResult> {
    await supabase.from("document_chunks").delete().eq("document_id", doc.id);
    await supabase
      .from("documents")
      .update({ status: "failed", error: message })
      .eq("id", doc.id);
    revalidatePath("/knowledge");
    return { error: message };
  }

  const { data: file, error: downloadError } = await supabase.storage
    .from("documents")
    .download(doc.storage_path);
  if (downloadError || !file) {
    return fail("Não foi possível baixar o arquivo para leitura.");
  }

  let chunks: string[];
  try {
    const buffer = await file.arrayBuffer();
    const text = await extractDocumentText(buffer, doc.mime_type);
    chunks = chunkText(text);
  } catch (e) {
    if (e instanceof ExtractError) return fail(e.message);
    console.error("Falha inesperada ao ler documento.");
    return fail("Falha ao ler o texto do arquivo.");
  }
  if (chunks.length === 0) return fail("Nenhum texto encontrado no arquivo.");

  await supabase.from("document_chunks").delete().eq("document_id", doc.id);

  for (let i = 0; i < chunks.length; i += 100) {
    const rows = chunks.slice(i, i + 100).map((content, j) => ({
      document_id: doc.id,
      org_id: doc.org_id,
      chunk_index: i + j,
      content,
    }));
    const { error } = await supabase.from("document_chunks").insert(rows);
    if (error) return fail("Não foi possível salvar o texto extraído.");
  }

  await supabase
    .from("documents")
    .update({ status: "ready", error: null })
    .eq("id", doc.id);

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

  // Os trechos de texto são apagados junto (exclusão em cascata no banco).
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
