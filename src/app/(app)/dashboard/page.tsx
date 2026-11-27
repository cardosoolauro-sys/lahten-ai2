
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowUpRight,
  Building2,
  Users,
  Handshake,
  Activity,
  Sparkles,
  Clock3,
} from "lucide-react";
import { stageLabel } from "@/lib/deals/constants";
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

type ActivityItem = { text: string; at: string };

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

  const stats = [
    {
      label: "Imóveis disponíveis",
      value: available.count === null ? "—" : String(available.count),
      icon: Building2,
    },
    {
      label: "Novos leads",
      value: newLeads.count === null ? "—" : String(newLeads.count),
      icon: Users,
    },
    {
      label: "Em negociação",
      value: openDeals.count === null ? "—" : String(openDeals.count),
      icon: Handshake,
    },
    ...(conversion
      ? [{ label: "Conversão", value: conversion, icon: Activity }]
      : []),
  ];

  const activity: ActivityItem[] = [
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
        text: `Negócio registrado (${stageLabel(d.stage)})`,
        at: d.created_at,
      })
    ),
  ]
    .sort((a, b) => Date.parse(b.at) - Date.parse(a.at))
    .slice(0, 6);

  return (
    <div className="mx-auto max-w-[1440px] space-y-8">
      <section
        className="relative isolate flex min-h-[280px] items-end overflow-hidden rounded-sm border border-white/[0.08] sm:min-h-[340px]"
        style={{
          backgroundColor: "#0a1913",
          backgroundImage:
            "linear-gradient(90deg, rgba(5,17,12,0.88) 0%, rgba(5,17,12,0.56) 58%, rgba(5,17,12,0.18) 100%), linear-gradient(0deg, rgba(5,17,12,0.48), transparent 65%), url('/images/dashboard-hero.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="relative z-10 max-w-2xl px-6 py-9 sm:px-10 sm:py-12 lg:px-14 lg:py-14">
          <p className="eyebrow !text-electric">
            {org.data?.name ?? "LAHTEN AI"}
          </p>
          <h1 className="mt-5 text-4xl font-normal leading-tight text-[#f4efe0] sm:text-5xl lg:text-6xl">
            {greeting()}
            {name ? `, ${name}.` : "."}
          </h1>
          <p className="mt-4 max-w-md text-sm leading-7 text-[#d5d4c9] sm:text-base">
            A inteligência por trás dos negócios imobiliários.
          </p>
          <div className="mt-7 h-px w-16 bg-electric" />
          <p className="mt-4 text-[10px] uppercase tracking-[0.25em] text-[#c8c4b5]">
            Inovação · Estratégia · Resultados
          </p>
        </div>
      </section>

      <section>
        <div className="mb-5 flex items-center justify-between">
          <div>
            <p className="eyebrow">Visão geral</p>
            <h2 className="mt-1 font-serif text-2xl text-[#eee9dc]">
              Desempenho da operação
            </h2>
          </div>
          <span className="hidden text-[10px] uppercase tracking-[0.18em] text-slate-500 sm:block">
            Dados da sua organização
          </span>
        </div>

        <div
          className={`grid grid-cols-1 gap-3 sm:grid-cols-2 ${
            stats.length === 4 ? "xl:grid-cols-4" : "xl:grid-cols-3"
          }`}
        >
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <article
                key={stat.label}
                className="group border border-white/[0.08] bg-[#0a1913] px-5 py-5 transition-colors hover:border-electric/40"
              >
                <div className="flex items-center justify-between">
                  <p className="text-xs tracking-wide text-slate-400">
                    {stat.label}
                  </p>
                  <Icon
                    size={17}
                    strokeWidth={1.4}
                    className="text-electric/75"
                  />
                </div>
                <p className="mt-5 font-serif text-4xl text-[#f0eadb]">
                  {stat.value}
                </p>
                <div className="mt-5 h-px w-full bg-white/[0.07] transition-colors group-hover:bg-electric/40" />
              </article>
            );
          })}
        </div>
      </section>

      <div className="grid gap-8 xl:grid-cols-[1.45fr_1fr]">
        <section className="min-w-0">
          <div className="mb-5 flex items-end justify-between">
            <div>
              <p className="eyebrow">Acompanhamento</p>
              <h2 className="mt-1 font-serif text-2xl text-[#eee9dc]">
                Atividade recente
              </h2>
            </div>
            <Clock3 size={18} className="mb-1 text-electric/70" />
          </div>

          {activity.length === 0 ? (
            <div className="border-y border-white/[0.09] py-8">
              <p className="text-sm text-slate-400">
                Nenhuma atividade registrada ainda.
              </p>
              <p className="mt-2 text-xs text-slate-500">
                Quando sua equipe cadastrar contatos, imóveis e negócios, as
                atualizações aparecerão aqui.
              </p>
            </div>
          ) : (
            <ul className="border-t border-white/[0.09]">
              {activity.map((item, index) => (
                <li
                  key={`${item.at}-${index}`}
                  className="flex items-start gap-4 border-b border-white/[0.08] py-4"
                >
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-electric" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-slate-200">{item.text}</p>
                    <p className="mt-1.5 text-xs text-slate-500">
                      {new Date(item.at).toLocaleString("pt-BR", {
                        timeZone: "America/Sao_Paulo",
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="min-w-0">
          <div className="mb-5 flex items-end justify-between">
            <div>
              <p className="eyebrow">Inteligência artificial</p>
              <h2 className="mt-1 font-serif text-2xl text-[#eee9dc]">
                Seus agentes
              </h2>
            </div>
            <Link
              href="/agents"
              className="flex items-center gap-1 text-xs text-electric hover:text-[#e3cf9f]"
            >
              Ver detalhes <ArrowUpRight size={14} />
            </Link>
          </div>

          <div className="border-t border-white/[0.09]">
            {agents.map((agent) => (
              <div
                key={agent.name}
                className="flex items-center gap-3 border-b border-white/[0.08] py-4"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center border border-electric/20 bg-electric/[0.06]">
                  <Sparkles
                    size={16}
                    strokeWidth={1.4}
                    className="text-electric"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-slate-200">
                    {agent.name}
                  </p>
                  <p className="mt-1 truncate text-xs text-slate-500">
                    {agent.role}
                  </p>
                </div>
                <span className="flex shrink-0 items-center gap-1.5 text-[10px] text-slate-500">
                  <span className="h-1.5 w-1.5 rounded-full bg-slate-600" />
                  Não conectado
                </span>
              </div>
            ))}
          </div>
          <p className="mt-4 text-[11px] leading-5 text-slate-500">
            O estado exibido corresponde ao estado atual de conexão dos
            agentes.
          </p>
        </section>
      </div>
    </div>
  );
}
