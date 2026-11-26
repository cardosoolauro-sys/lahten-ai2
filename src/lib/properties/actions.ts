"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PURPOSES, STATUSES, TYPES } from "./constants";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export type PropertyFormState = { error?: string } | undefined;
export type DeleteResult = { ok?: boolean; error?: string };

// Aceita "350000", "350.000", "350.000,50" ou "350000.50".
// Retorna null (vazio), um número, ou undefined (inválido).
function parseMoney(raw: string): number | null | undefined {
  const s = raw.replace(/[R$\s]/g, "");
  if (!s) return null;

  let normalized: string;
  if (s.includes(",")) normalized = s.replace(/\./g, "").replace(",", ".");
  else if (/^\d+\.\d{1,2}$/.test(s)) normalized = s;
  else normalized = s.replace(/\./g, "");

  if (!/^\d+(\.\d+)?$/.test(normalized)) return undefined;
  const n = Number(normalized);
  if (!Number.isFinite(n) || n >= 1e12) return undefined;
  return Math.round(n * 100) / 100;
}

function parseInteger(raw: string): number | null | undefined {
  if (!raw) return null;
  if (!/^\d{1,3}$/.test(raw)) return undefined;
  return Number(raw);
}

function parse(formData: FormData) {
  const get = (k: string) => String(formData.get(k) ?? "").trim();

  const title = get("title").replace(/\s+/g, " ");
  const property_type = get("property_type");
  const purpose = get("purpose");
  const status = get("status");
  const address = get("address");
  const city = get("city");
  const state = get("state").toUpperCase();
  const description = get("description");

  const sale_price = parseMoney(get("sale_price"));
  const rent_price = parseMoney(get("rent_price"));
  const area_m2 = parseMoney(get("area_m2"));
  const bedrooms = parseInteger(get("bedrooms"));
  const bathrooms = parseInteger(get("bathrooms"));

  if (title.length < 2 || title.length > 150) {
    return { error: "O título deve ter de 2 a 150 caracteres." };
  }
  if (!Object.hasOwn(TYPES, property_type)) return { error: "Tipo inválido." };
  if (!Object.hasOwn(PURPOSES, purpose)) {
    return { error: "Finalidade inválida." };
  }
  if (!Object.hasOwn(STATUSES, status)) return { error: "Status inválido." };
  if (sale_price === undefined) return { error: "Preço de venda inválido." };
  if (rent_price === undefined) return { error: "Valor de locação inválido." };
  if (area_m2 === undefined || area_m2 === 0) {
    return { error: "Área inválida." };
  }
  if (bedrooms === undefined) return { error: "Número de quartos inválido." };
  if (bathrooms === undefined) {
    return { error: "Número de banheiros inválido." };
  }
  if (state && !/^[A-Z]{2}$/.test(state)) {
    return { error: "Use a sigla do estado com 2 letras (ex.: SC)." };
  }
  if (address.length > 200 || city.length > 100 || description.length > 5000) {
    return { error: "Algum campo passou do tamanho máximo." };
  }

  return {
    values: {
      title,
      property_type,
      purpose,
      status,
      sale_price,
      rent_price,
      area_m2,
      bedrooms,
      bathrooms,
      address: address || null,
      city: city || null,
      state: state || null,
      description: description || null,
    },
  };
}

export async function createProperty(
  _prev: PropertyFormState,
  formData: FormData
): Promise<PropertyFormState> {
  const parsed = parse(formData);
  if ("error" in parsed) return { error: parsed.error };

  const supabase = await createClient();
  const { data: memberships } = await supabase
    .from("memberships")
    .select("org_id")
    .limit(1);
  const orgId = memberships?.[0]?.org_id;
  if (!orgId) redirect("/onboarding");

  const { error } = await supabase
    .from("properties")
    .insert({ org_id: orgId, ...parsed.values });
  if (error) {
    return {
      error:
        "Não foi possível salvar o imóvel. Seu papel pode não permitir cadastrar imóveis.",
    };
  }

  revalidatePath("/properties");
  redirect("/properties");
}

export async function updateProperty(
  _prev: PropertyFormState,
  formData: FormData
): Promise<PropertyFormState> {
  const id = String(formData.get("id") ?? "");
  if (!UUID_RE.test(id)) return { error: "Imóvel inválido." };

  const parsed = parse(formData);
  if ("error" in parsed) return { error: parsed.error };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("properties")
    .update(parsed.values)
    .eq("id", id)
    .select("id");

  if (error || !data || data.length === 0) {
    return {
      error:
        "Não foi possível salvar. Seu papel pode não permitir editar imóveis.",
    };
  }

  revalidatePath("/properties");
  redirect("/properties");
}

export async function deleteProperty(id: string): Promise<DeleteResult> {
  if (!UUID_RE.test(id)) return { error: "Imóvel inválido." };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("properties")
    .delete()
    .eq("id", id)
    .select("id");

  if (error || !data || data.length === 0) {
    return { error: "Somente owner e admin podem apagar imóveis." };
  }

  revalidatePath("/properties");
  return { ok: true };
  }
