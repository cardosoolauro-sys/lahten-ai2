import Link from "next/link";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const ACTIVITY_LABELS: Record<string, string> = {
  note: "Nota",
  call: "Ligação",
  visit: "Visita",
  email: "E-mail",
  task: "Tarefa",
};

async function criarOrganizacao(formData: FormData) {
  "use server";
  const nome = String(formData.get("nome") ?? "").trim();
  if (!nome) return;
  const supabase = await createClient();
  await supabase.rpc("create_organization", { p_name: nome });
  revalidatePath("/dashboard");
}

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <main style={{ padding: "2rem", maxWidth: 560 }}>
        <h1>Dashboard</h1>
        <p>Entre na sua conta para ver os números da operação.</p>
        <p>
          <Link href="/login">Entrar</Link>
        </p>
      </main>
    );
  }

  const { count: orgCount } = await supabase
    .from("memberships")
    .select("org_id", { count: "exact", head: true });

  if (!orgCount) {
    return (
      <main style={{ padding: "2rem", maxWidth: 560 }}>
        <h1>Dashboard</h1>
        <p>Você ainda não pertence a nenhuma imobiliária. Crie a primeira para começar.</p>
        <form action={criarOrganizacao} style={{ display: "flex", gap: 8 }}>
          <input
            name="nome"
            placeholder="Nome da imobiliária"
            required
            style={{ flex: 1, padding: "0.5rem" }}
          />
          <button type="submit" style={{ padding: "0.5rem 1rem" }}>
            Criar imobiliária
          </button>
        </form>
      </main>
    );
  }

  const [imoveis, leads, negociacoes, locacoes, atividades] = await Promise.all([
    supabase
      .from("properties")
      .select("id", { count: "exact", head: true })
      .in("status", ["available", "reserved"]),
    supabase
      .from("contacts")
      .select("id", { count: "exact", head: true })
      .eq("kind", "lead")
      .eq("status", "new"),
    supabase
      .from("deals")
      .select("id", { count: "exact", head: true })
      .in("stage", ["proposal", "visit", "negotiation"]),
    supabase
      .from("rentals")
      .select("id", { count: "exact", head: true })
      .eq("status", "active"),
    supabase
      .from("activities")
      .select("id, kind, description, created_at")
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  const cards = [
    { label: "Imóveis ativos", value: imoveis.count ?? 0 },
    { label: "Leads novos", value: leads.count ?? 0 },
    { label: "Negociações em andamento", value: negociacoes.count ?? 0 },
    { label: "Locações ativas", value: locacoes.count ?? 0 },
  ];

  const recentes = atividades.data ?? [];

  return (
    <main style={{ padding: "2rem", maxWidth: 960 }}>
      <h1>Dashboard</h1>
      <p>Visão geral da operação da imobiliária.</p>

      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
          gap: "1rem",
          margin: "1.5rem 0",
        }}
      >
        {cards.map((c) => (
          <div
            key={c.label}
            style={{
              border: "1px solid color-mix(in srgb, currentColor 20%, transparent)",
              borderRadius: 8,
              padding: "1rem",
            }}
          >
            <div style={{ fontSize: "2rem", fontWeight: 600 }}>{c.value}</div>
            <div style={{ opacity: 0.7 }}>{c.label}</div>
          </div>
        ))}
      </section>

      <section>
        <h2>Atividade recente</h2>
        {recentes.length === 0 ? (
          <p>
            Nenhuma atividade registrada ainda. Cadastre um imóvel ou um lead para começar.
          </p>
        ) : (
          <ul style={{ paddingLeft: "1.2rem" }}>
            {recentes.map((a) => (
              <li key={a.id} style={{ marginBottom: 6 }}>
                <strong>{ACTIVITY_LABELS[a.kind] ?? a.kind}:</strong> {a.description}{" "}
                <span style={{ opacity: 0.6 }}>
                  ({new Date(a.created_at).toLocaleDateString("pt-BR")})
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
