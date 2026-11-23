import { createClient } from "@/lib/supabase/server";

interface ActivityRow {
  id: string;
  kind: string;
  description: string;
  created_at: string;
}

const kindLabels: Record<string, string> = {
  note: "Nota",
  call: "Ligação",
  visit: "Visita",
  email: "E-mail",
  task: "Tarefa",
};

const agents = [
  "Sales Agent",
  "Rental Agent",
  "Research Agent",
  "Document Agent",
  "Financial Agent",
  "Customer Agent",
  "Operations Agent",
];

function formatCount(result: { count: number | null; error: unknown }): string {
  return result.error ? "—" : String(result.count ?? 0);
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Sao_Paulo",
  });
}

export default async function DashboardPage() {
  const supabase = await createClient();

  // O RLS do banco já limita tudo às organizações do usuário logado.
  const [properties, leads, deals, rentals, activities] = await Promise.all([
    supabase
      .from("properties")
      .select("*", { count: "exact", head: true })
      .eq("status", "available"),
    supabase
      .from("contacts")
      .select("*", { count: "exact", head: true })
      .eq("kind", "lead")
      .eq("status", "new"),
    supabase
      .from("deals")
      .select("*", { count: "exact", head: true })
      .not("stage", "in", "(won,lost)"),
    supabase
      .from("rentals")
      .select("*", { count: "exact", head: true })
      .eq("status", "active"),
    supabase
      .from("activities")
      .select("id, kind, description, created_at")
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  const stats = [
    { label: "Imóveis disponíveis", value: formatCount(properties) },
    { label: "Leads novos", value: formatCount(leads) },
    { label: "Negociações em andamento", value: formatCount(deals) },
    { label: "Locações ativas", value: formatCount(rentals) },
  ];

  const items = (activities.data ?? []) as ActivityRow[];
  const hasError = [properties, leads, deals, rentals, activities].some(
    (result) => result.error,
  );
  const isEmpty =
    !hasError &&
    [properties, leads, deals, rentals].every(
      (result) => (result.count ?? 0) === 0,
    ) &&
    items.length === 0;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-400">
          Visão geral da operação da imobiliária.
        </p>
      </div>

      {hasError && (
        <div
          role="alert"
          className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300"
        >
          Não foi possível carregar alguns dados. Atualize a página para tentar
          de novo.
        </div>
      )}

      {isEmpty && (
        <div className="rounded-lg border border-electric/30 bg-electric/10 px-4 py-3 text-sm text-electric-soft">
          Ainda não há dados cadastrados. Os números abaixo vêm direto do banco
          e vão aparecer conforme imóveis, contatos, negociações e locações
          forem cadastrados. Esses cadastros ainda estão em construção.
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className="rounded-xl border border-navy-700 bg-navy-900 p-4"
          >
            <p className="text-xs text-slate-400">{s.label}</p>
            <p className="mt-2 text-2xl font-semibold">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <section className="rounded-xl border border-navy-700 bg-navy-900 p-5 lg:col-span-2">
          <h2 className="text-sm font-medium">Atividade recente</h2>
          {items.length === 0 ? (
            <p className="mt-4 text-sm text-slate-500">
              Nenhuma atividade registrada ainda.
            </p>
          ) : (
            <ul className="mt-4 space-y-3">
              {items.map((a) => (
                <li
                  key={a.id}
                  className="flex items-start gap-3 text-sm text-slate-300"
                >
                  <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-electric" />
                  <span className="flex-1">
                    <span className="text-slate-500">
                      {kindLabels[a.kind] ?? a.kind}:{" "}
                    </span>
                    {a.description}
                  </span>
                  <span className="shrink-0 text-xs text-slate-500">
                    {formatDate(a.created_at)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-xl border border-navy-700 bg-navy-900 p-5">
          <h2 className="text-sm font-medium">Agentes de IA</h2>
          <ul className="mt-4 space-y-3">
            {agents.map((a) => (
              <li
                key={a}
                className="flex items-center justify-between text-sm text-slate-300"
              >
                {a}
                <span className="text-xs text-slate-500">Não conectado</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
