import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowUpRight } from "lucide-react";
import { STAGES } from "@/lib/deals/constants";
import { createClient } from "@/lib/supabase/server";

const agents = [
  { name: "Sales Agent", role: "Funil e propostas" },
  { name: "Rental Agent", role: "Contratos e locações" },
  { name: "Research Agent", role: "Pesquisa de mercado" },
  { name: "Document Agent", role: "Análise de documentos" },
];

function greeting(): string {
  const hour = Number(
    new Intl.DateTimeFormat("pt-BR", {
      hour: "numeric",
      hour12: false,
      timeZone: "America/Sao_Paulo",
    }).format(new Date())
  );
  if (hour < 12) return "Bom dia";
  if (hour < 18) return "Boa tarde";
  return "Boa noite";
}

function firstName(email?: string): string {
  const local = (email ?? "").split("@")[0] ?? "";
  const token = local.split(/[._-]/)[0] ?? "";
  return token ? token.charAt(0).toUpperCase() + token.slice(1) : "";
}

type Activity = { text: string; at: string };

export default async function DashboardPage() {
  const supabase = await createClient();

  const { data: memberships } = await supabase
    .from("memberships")
    .select("org_id")
    .limit(1);
  const orgId = memberships?.[0]?.org_id;
  if (!orgId) redirect("/onboarding");

  const count = (table: string) =>
    supabase.from(table).select("id", { count: "exact", head: true });

  const [
    org,
    claims,
    available,
    newLeads,
    openDeals,
    wonDeals,
    lostDeals,
    recentContacts,
    recentProperties,
    recentDeals,
  ] = await Promise.all([
    supabase.from("organizations").select("name").eq("id", orgId).maybeSingle(),
    supabase.auth.getClaims(),
    count("properties").eq("org_id", orgId).eq("status", "available"),
    count("contacts").eq("org_id", orgId).eq("status", "new"),
    count("deals")
      .eq("org_id", orgId)
      .in("stage", ["proposal", "visit", "negotiation"]),
    count("deals").eq("org_id", orgId).eq("stage", "won"),
    count("deals").eq("org_id", orgId).eq("stage", "lost"),
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
  ]);

  const email = (claims.data?.claims as { email?: string } | undefined)?.email;
  const name = firstName(email);

  const won = wonDeals.count ?? 0;
  const lost = lostDeals.count ?? 0;
  const conversion =
    won + lost > 0 ? `${Math.round((won / (won + lost)) * 100)}%` : null;

  const stats: { label: string; value: string }[] = [
    {
      label: "Imóveis ativos",
      value: available.count === null ? "—" : String(available.count),
    },
    {
      label: "Leads novos",
      value: newLeads.count === null ? "—" : String(newLeads.count),
    },
    {
      label: "Negociações em andamento",
      value: openDeals.count === null ? "—" : String(openDeals.count),
    },
  ];
  if (conversion) stats.push({ label: "Conversão", value: conversion });

  const activity: Activity[] = [
    ...(recentContacts.data ?? []).map(
      (c: { full_name: string; created_at: string }) => ({
        text: `Novo contato: ${c.full_name}`,
        at: c.created_at,
      })
    ),
    ...(recentProperties.data ?? []).map(
      (p: { title: string; created_at: string }) => ({
        text: `Imóvel cadastrado: ${p.title}`,
        at: p.created_at,
      })
    ),
    ...(recentDeals.data ?? []).map(
      (d: { stage: string; created_at: string }) => ({
        text: `Negócio registrado (${STAGES[d.stage] ?? d.stage})`,
        at: d.created_at,
      })
    ),
  ]
    .sort((a, b) => Date.parse(b.at) - Date.parse(a.at))
    .slice(0, 6);

  return (
    <div className="mx-auto max-w-6xl space-y-10">
      <section
        className="relative overflow-hidden rounded-2xl border border-navy-700"
        style={{
          backgroundColor: "#0a1913",
          backgroundImage:
            "linear-gradient(180deg, rgba(6,16,12,0.72) 0%, rgba(6,16,12,0.6) 45%, rgba(6,16,12,0.92) 100%), url('/images/dashboard-hero.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="px-5 pb-6 pt-8 sm:px-8 sm:pt-12 lg:px-10 lg:pt-16">
          <p className="eyebrow !text-electric">{org.data?.name ?? ""}</p>
          <h1 className="mt-4 text-3xl font-medium sm:text-5xl">
            {greeting()}
            {name ? `, ${name}` : ""}
          </h1>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-slate-300">
            A inteligência por trás dos negócios imobiliários.
          </p>

          <div
            className={`mt-10 grid gap-px overflow-hidden rounded-xl border border-white/10 bg-white/10 ${
              stats.length === 4
                ? "grid-cols-2 lg:grid-cols-4"
                : "grid-cols-1 sm:grid-cols-3"
            }`}
          >
            {stats.map((s) => (
              <div
                key={s.label}
                className="bg-navy-950/70 p-4 backdrop-blur-sm sm:p-5"
              >
                <p className="eyebrow">{s.label}</p>
                <p className="mt-3 font-serif text-3xl font-medium sm:text-4xl">
                  {s.value}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="grid gap-10 lg:grid-cols-5">
        <section className="lg:col-span-3">
          <p className="eyebrow mb-4">Atividade recente</p>
          {activity.length === 0 ? (
            <p className="border-t border-navy-700 py-6 text-sm text-slate-500">
              Nenhuma atividade ainda. Cadastre contatos, imóveis e negócios
              para vê-los aqui.
            </p>
          ) : (
            <ul className="border-t border-navy-700">
              {activity.map((a, i) => (
                <li
                  key={`${a.at}-${i}`}
                  className="flex items-start justify-between gap-4 border-b border-navy-700 py-3.5"
                >
                  <p className="text-sm text-slate-200">{a.text}</p>
                  <p className="shrink-0 text-xs text-slate-500">
                    {new Date(a.at).toLocaleString("pt-BR", {
                      timeZone: "America/Sao_Paulo",
                      dateStyle: "short",
                      timeStyle: "short",
                    })}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <p className="eyebrow">Agentes de IA</p>
            <Link
              href="/agents"
              className="flex items-center gap-1 text-xs text-electric hover:text-electric-soft"
            >
              Ver detalhes
              <ArrowUpRight size={14} strokeWidth={1.6} />
            </Link>
          </div>
          <ul className="border-t border-navy-700">
            {agents.map((a) => (
              <li
                key={a.name}
                className="flex items-center justify-between gap-3 border-b border-navy-700 py-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm text-slate-200">{a.name}</p>
                  <p className="truncate text-xs text-slate-500">{a.role}</p>
                </div>
                <span className="flex shrink-0 items-center gap-1.5 text-[11px] text-slate-500">
                  <span className="h-1.5 w-1.5 rounded-full bg-slate-600" />
                  Não conectado
                </span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
       }
