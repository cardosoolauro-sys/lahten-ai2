import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowRight,
  Building2,
  FileText,
  Handshake,
  Percent,
  Sparkles,
  Users,
} from "lucide-react";
import { Donut, PerformanceChart, Sparkline } from "@/components/dashboard/charts";
import { STAGES } from "@/lib/deals/constants";
import { createClient } from "@/lib/supabase/server";

const TZ = "America/Sao_Paulo";
const DAY = 86_400_000;

function greeting(): string {
  const hour = Number(
    new Intl.DateTimeFormat("pt-BR", {
      hour: "numeric",
      hour12: false,
      timeZone: TZ,
    }).format(new Date())
  );
  if (hour < 12) return "Bom dia";
  if (hour < 18) return "Boa tarde";
  return "Boa noite";
}

function firstName(email?: string): string {
  const local = (email ?? "").split("@")[0] ?? "";
  const token = local.split(/[._-]+/)[0] ?? "";
  if (!/^[A-Za-zÀ-ÿ]{2,}$/.test(token)) return "";
  return token.charAt(0).toUpperCase() + token.slice(1);
}

function relTime(iso: string, now: number): string {
  const min = Math.floor(Math.max(0, now - Date.parse(iso)) / 60_000);
  if (min < 1) return "Agora";
  if (min < 60) return `Há ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `Há ${h} h`;
  const d = Math.floor(h / 24);
  if (d < 30) return `Há ${d} d`;
  return new Date(iso).toLocaleDateString("pt-BR", { timeZone: TZ });
}

type CreatedRow = { created_at: string };

const times = (rows: unknown): number[] =>
  ((rows ?? []) as CreatedRow[]).map((r) => Date.parse(r.created_at));

function countBetween(ts: number[], from: number, to: number): number {
  return ts.filter((t) => t >= from && t < to).length;
}

function buckets(ts: number[], now: number, bucketMs: number, n: number) {
  const out = new Array<number>(n).fill(0);
  for (const t of ts) {
    const idx = n - 1 - Math.floor((now - t) / bucketMs);
    if (idx >= 0 && idx < n) out[idx] += 1;
  }
  return out;
}

function delta(ts: number[], now: number): number | null {
  const last = countBetween(ts, now - 30 * DAY, now + 1);
  const prev = countBetween(ts, now - 60 * DAY, now - 30 * DAY);
  if (prev === 0) return null;
  return Math.round(((last - prev) / prev) * 100);
}

const dayMonth = new Intl.DateTimeFormat("pt-BR", {
  timeZone: TZ,
  day: "2-digit",
  month: "2-digit",
});

type ActivityItem = {
  kind: "contact" | "property" | "deal" | "document";
  title: string;
  detail: string;
  at: string;
};

const ACTIVITY_ICON = {
  contact: Users,
  property: Building2,
  deal: Handshake,
  document: FileText,
};

const panel =
  "rounded-xl border border-electric/15 bg-gradient-to-b from-white/[0.035] to-white/[0.01]";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ dias?: string | string[] }>;
}) {
  const params = await searchParams;
  const dias = params.dias === "90" ? 90 : 30;

  const supabase = await createClient();

  const { data: memberships } = await supabase
    .from("memberships")
    .select("org_id")
    .limit(1);
  const orgId = memberships?.[0]?.org_id;
  if (!orgId) redirect("/onboarding");

  const now = Date.now();
  const sinceIso = new Date(now - 183 * DAY).toISOString();

  const count = (table: string) =>
    supabase.from(table).select("id", { count: "exact", head: true });
  const created = (table: string) =>
    supabase
      .from(table)
      .select("created_at")
      .eq("org_id", orgId)
      .gte("created_at", sinceIso)
      .order("created_at", { ascending: false })
      .limit(1500);

  const [
    claims,
    available,
    newLeads,
    openDeals,
    wonDeals,
    lostDeals,
    contactRows,
    propertyRows,
    dealRows,
    recentContacts,
    recentProperties,
    recentDeals,
    recentDocs,
  ] = await Promise.all([
    supabase.auth.getClaims(),
    count("properties").eq("org_id", orgId).eq("status", "available"),
    count("contacts").eq("org_id", orgId).eq("status", "new"),
    count("deals")
      .eq("org_id", orgId)
      .in("stage", ["proposal", "visit", "negotiation"]),
    count("deals").eq("org_id", orgId).eq("stage", "won"),
    count("deals").eq("org_id", orgId).eq("stage", "lost"),
    created("contacts"),
    created("properties"),
    created("deals"),
    supabase
      .from("contacts")
      .select("full_name, created_at")
      .eq("org_id", orgId)
      .order("created_at", { ascending: false })
      .limit(4),
    supabase
      .from("properties")
      .select("title, created_at")
      .eq("org_id", orgId)
      .order("created_at", { ascending: false })
      .limit(4),
    supabase
      .from("deals")
      .select("stage, created_at")
      .eq("org_id", orgId)
      .order("created_at", { ascending: false })
      .limit(4),
    supabase
      .from("documents")
      .select("name, created_at")
      .eq("org_id", orgId)
      .order("created_at", { ascending: false })
      .limit(4),
  ]);

  const email = (claims.data?.claims as { email?: string } | undefined)?.email;
  const name = firstName(email);

  const contactTs = times(contactRows.data);
  const propertyTs = times(propertyRows.data);
  const dealTs = times(dealRows.data);

  const won = wonDeals.count ?? 0;
  const lost = lostDeals.count ?? 0;
  const open = openDeals.count ?? 0;
  const hasConversion = won + lost > 0;
  const conversionRate = hasConversion ? (won / (won + lost)) * 100 : 0;

  const num = (c: number | null) => (c === null ? "—" : String(c));

  const kpis: {
    label: string;
    value: string;
    suffix?: string;
    icon: typeof Users;
    spark?: number[];
    delta?: number | null;
  }[] = [
    {
      label: "Imóveis ativos",
      value: num(available.count),
      icon: Building2,
      spark: buckets(propertyTs, now, 7 * DAY, 8),
      delta: delta(propertyTs, now),
    },
    {
      label: "Leads novos",
      value: num(newLeads.count),
      icon: Users,
      spark: buckets(contactTs, now, 7 * DAY, 8),
      delta: delta(contactTs, now),
    },
    {
      label: "Negociações em andamento",
      value: num(openDeals.count),
      icon: Handshake,
      spark: buckets(dealTs, now, 7 * DAY, 8),
      delta: delta(dealTs, now),
    },
  ];
  if (hasConversion) {
    kpis.push({
      label: "Conversão",
      value: conversionRate.toFixed(1).replace(".", ","),
      suffix: "%",
      icon: Percent,
    });
  }

  // Gráfico: novos contatos por período (15 pontos)
  const points = 15;
  const bucketMs = (dias / points) * DAY;
  const chartValues = buckets(contactTs, now, bucketMs, points);
  const chartLabels = chartValues.map((_, i) =>
    dayMonth.format(new Date(now - (points - i) * bucketMs))
  );
  const hasChartData = chartValues.some((v) => v > 0);

  const activity: ActivityItem[] = [
    ...(recentContacts.data ?? []).map(
      (c: { full_name: string; created_at: string }) => ({
        kind: "contact" as const,
        title: "Novo contato cadastrado",
        detail: c.full_name,
        at: c.created_at,
      })
    ),
    ...(recentProperties.data ?? []).map(
      (p: { title: string; created_at: string }) => ({
        kind: "property" as const,
        title: "Imóvel cadastrado",
        detail: p.title,
        at: p.created_at,
      })
    ),
    ...(recentDeals.data ?? []).map(
      (d: { stage: string; created_at: string }) => ({
        kind: "deal" as const,
        title: "Negócio registrado",
        detail: STAGES[d.stage] ?? d.stage,
        at: d.created_at,
      })
    ),
    ...(recentDocs.data ?? []).map(
      (d: { name: string; created_at: string }) => ({
        kind: "document" as const,
        title: "Documento enviado",
        detail: d.name,
        at: d.created_at,
      })
    ),
  ]
    .sort((a, b) => Date.parse(b.at) - Date.parse(a.at))
    .slice(0, 4);

  const kpiCols =
    kpis.length === 4 ? "lg:grid-cols-4" : "lg:grid-cols-3";

  return (
    <div>
      {/* Cabeçalho com a fotografia atrás da barra superior */}
      <div className="relative -mx-4 -mt-[5.5rem] sm:-mx-6 sm:-mt-24 lg:-mx-10 lg:-mt-[7.5rem]">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute right-0 top-0 h-[22rem] w-full lg:w-[68%]"
          style={{
            backgroundImage:
              "linear-gradient(90deg, #06100c 0%, rgba(6,16,12,0.55) 28%, rgba(6,16,12,0) 68%), linear-gradient(0deg, #06100c 0%, rgba(6,16,12,0.65) 20%, rgba(6,16,12,0) 58%), linear-gradient(180deg, rgba(6,16,12,0.55) 0%, rgba(6,16,12,0) 28%), url('/images/dashboard-hero.jpg'), url('/images/architecture.svg')",
            backgroundSize: "100% 100%, 100% 100%, 100% 100%, cover, cover",
            backgroundPosition: "center, center, center, right top, right top",
            backgroundRepeat: "no-repeat",
            backgroundColor: "#06100c",
          }}
        />

        <div className="relative px-4 pt-24 sm:px-6 sm:pt-28 lg:px-10 lg:pt-[8.25rem]">
          <div className="mb-5 h-px w-16 bg-electric" />
          <h1 className="text-4xl font-light sm:text-5xl lg:text-[3.3rem] lg:leading-tight">
            {greeting()}
            {name ? `, ${name}` : ""}.
          </h1>
          <p className="mt-2 max-w-xl font-serif text-xl text-[#e6e0cf] sm:text-2xl">
            Sua imobiliária mais inteligente, todos os dias.
          </p>

          <div className={`mt-12 grid grid-cols-2 gap-3 sm:gap-4 ${kpiCols}`}>
            {kpis.map((k, i) => {
              const Icon = k.icon;
              const hint =
                "Cadastros dos últimos 30 dias em relação aos 30 dias anteriores";
              return (
                <div
                  key={k.label}
                  className="rounded-xl border border-electric/20 bg-black/35 p-4 backdrop-blur-sm sm:p-5"
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      size={22}
                      strokeWidth={1.4}
                      className="shrink-0 text-electric"
                    />
                    <p className="text-[13px] leading-tight text-slate-200 sm:text-sm">
                      {k.label}
                    </p>
                  </div>
                  <div className="mt-4 flex items-end justify-between gap-3">
                    <div className="flex flex-wrap items-baseline gap-x-3">
                      <p className="text-3xl font-medium leading-none sm:text-[2rem]">
                        {k.value}
                        {k.suffix && (
                          <span className="ml-0.5 text-lg">{k.suffix}</span>
                        )}
                      </p>
                      {k.delta !== undefined && k.delta !== null && (
                        <p
                          title={hint}
                          className={`text-xs ${
                            k.delta >= 0 ? "text-emerald-400" : "text-amber-400"
                          }`}
                        >
                          {k.delta >= 0 ? "↑" : "↓"} {Math.abs(k.delta)}%
                        </p>
                      )}
                    </div>
                    {k.spark && (
                      <div
                        className="hidden h-10 w-24 shrink-0 sm:block"
                        title="Cadastros por semana (últimas 8 semanas)"
                      >
                        <Sparkline values={k.spark} gid={`spark-${i}`} />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Performance e atividade */}
      <div className="mt-6 grid gap-4 lg:grid-cols-[1.75fr_1fr]">
        <section className={`${panel} p-5 sm:p-6`}>
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-serif text-xl sm:text-2xl">
              Performance da Imobiliária
            </h2>
            <div className="flex overflow-hidden rounded-md border border-navy-700 text-xs">
              {[30, 90].map((d) => (
                <Link
                  key={d}
                  href={d === 30 ? "/dashboard" : `/dashboard?dias=${d}`}
                  className={`px-3 py-1.5 ${
                    dias === d
                      ? "bg-electric/15 text-white"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  {d} dias
                </Link>
              ))}
            </div>
          </div>

          <div className="mt-5 grid gap-6 lg:grid-cols-[1fr_auto]">
            <div>
              {hasChartData ? (
                <PerformanceChart
                  values={chartValues}
                  labels={chartLabels}
                  tooltipSuffix="contatos"
                />
              ) : (
                <p className="rounded-lg border border-dashed border-navy-700 py-16 text-center text-sm text-slate-500">
                  Sem novos contatos neste período. Cadastre contatos no CRM
                  para acompanhar a evolução.
                </p>
              )}
              <p className="mt-2 text-xs text-slate-500">
                Novos contatos cadastrados no período.
              </p>
            </div>

            <div className="flex flex-col items-center gap-4 border-t border-navy-700 pt-6 lg:w-44 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
              <Donut
                segments={[
                  { value: won, color: "#d3b97d" },
                  { value: open, color: "#5fa88a" },
                  { value: lost, color: "#33443a" },
                ]}
                centerValue={
                  hasConversion ? `${Math.round(conversionRate)}%` : "—"
                }
                caption="Conversão"
              />
              <ul className="w-full space-y-2 text-xs text-slate-300">
                <li className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-[#d3b97d]" />
                  Ganhos
                  <span className="ml-auto text-slate-500">{won}</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-[#5fa88a]" />
                  Em aberto
                  <span className="ml-auto text-slate-500">{open}</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-[#33443a]" />
                  Perdidos
                  <span className="ml-auto text-slate-500">{lost}</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        <section className={`${panel} p-5 sm:p-6`}>
          <h2 className="font-serif text-xl sm:text-2xl">Atividade Recente</h2>

          {activity.length === 0 ? (
            <p className="mt-6 rounded-lg border border-dashed border-navy-700 py-10 text-center text-sm text-slate-500">
              Nenhuma atividade ainda.
            </p>
          ) : (
            <ul className="relative mt-6 space-y-5">
              <span
                aria-hidden="true"
                className="absolute bottom-3 left-[5px] top-3 w-px bg-navy-700"
              />
              {activity.map((a, i) => {
                const Icon = ACTIVITY_ICON[a.kind];
                return (
                  <li key={`${a.at}-${i}`} className="relative flex gap-4">
                    <span
                      className={`z-10 mt-5 h-[11px] w-[11px] shrink-0 rounded-full border-2 border-[#0b1913] ${
                        i === 0 ? "bg-emerald-400" : "bg-electric"
                      }`}
                    />
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-electric/20 bg-black/25">
                      <Icon
                        size={20}
                        strokeWidth={1.4}
                        className="text-electric"
                      />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm text-slate-100">
                        {a.title}
                      </p>
                      <p className="mt-0.5 truncate text-xs text-slate-500">
                        {relTime(a.at, now)} • {a.detail}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>

      {/* Agentes e acesso à IA */}
      <div className="mt-4 grid gap-4 lg:grid-cols-[1.45fr_1fr]">
        <section className={`${panel} p-5 sm:p-6`}>
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-xl sm:text-2xl">Agentes de IA</h2>
            <Link
              href="/agents"
              className="flex items-center gap-1 text-xs text-electric hover:text-electric-soft"
            >
              Ver todos
              <ArrowRight size={14} strokeWidth={1.6} />
            </Link>
          </div>

          <div className="mt-5 flex flex-col gap-5 sm:flex-row sm:items-center">
            <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl border border-electric/25 bg-black/25">
              <Sparkles size={28} strokeWidth={1.3} className="text-electric" />
            </span>
            <div className="sm:w-44">
              <p className="text-sm text-slate-100">Nenhum agente ativo</p>
              <p className="mt-1.5 flex items-center gap-2 text-xs text-amber-300/90">
                <span className="h-2 w-2 rounded-full bg-amber-400" />
                Em construção
              </p>
            </div>
            <p className="flex-1 border-navy-700 text-sm text-slate-400 sm:border-l sm:pl-6">
              Os agentes de IA ainda estão em desenvolvimento e não executam
              tarefas.
            </p>
            <Link
              href="/agents"
              className="rounded-md border border-white/20 bg-black/30 px-5 py-2.5 text-center text-sm hover:border-electric/60"
            >
              Ver detalhes
            </Link>
          </div>
        </section>

        <section
          className="relative overflow-hidden rounded-xl border border-electric/15 p-5 sm:p-6"
          style={{
            backgroundImage:
              "linear-gradient(100deg, rgba(10,25,19,0.96) 0%, rgba(10,25,19,0.82) 55%, rgba(10,25,19,0.45) 100%), url('/images/dashboard-hero.jpg'), url('/images/architecture.svg')",
            backgroundSize: "cover",
            backgroundPosition: "center, right center, right center",
            backgroundColor: "#0a1913",
          }}
        >
          <h2 className="max-w-[16rem] font-serif text-xl leading-snug sm:text-2xl">
            Respostas a partir dos seus documentos.
          </h2>
          <div className="mt-6 flex items-end justify-between gap-4">
            <p className="eyebrow !tracking-[0.3em]">Lahten AI</p>
            <Link
              href="/documents"
              className="flex items-center gap-2 rounded-md bg-electric px-4 py-2.5 text-sm font-medium hover:opacity-90"
            >
              Perguntar à IA
              <ArrowRight size={15} strokeWidth={1.8} />
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
