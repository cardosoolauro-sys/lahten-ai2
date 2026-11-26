import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { modules } from "@/lib/modules";

const stats = [
  { label: "Imóveis ativos", value: "128" },
  { label: "Leads novos", value: "34" },
  { label: "Negociações", value: "17" },
  { label: "Locações ativas", value: "52" },
];

const activity = [
  "Novo lead cadastrado: Apartamento 3 quartos",
  "Visita agendada para sexta-feira",
  "Contrato de locação aguardando revisão",
  "Proposta enviada ao cliente",
];

const agents = [
  { name: "Sales Agent", role: "Funil e propostas" },
  { name: "Rental Agent", role: "Contratos e locações" },
  { name: "Research Agent", role: "Pesquisa de mercado" },
  { name: "Document Agent", role: "Análise de documentos" },
  { name: "Financial Agent", role: "Cobranças e finanças" },
  { name: "Customer Agent", role: "Atendimento a clientes" },
  { name: "Operations Agent", role: "Rotinas operacionais" },
];

const shortcuts = ["workspace", "knowledge", "documents", "crm"]
  .map((slug) => modules.find((m) => m.slug === slug))
  .filter((m): m is (typeof modules)[number] => Boolean(m));

export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-10">
      <header>
        <p className="eyebrow">Visão geral</p>
        <h1 className="mt-3 text-3xl font-medium sm:text-4xl">
          Central de inteligência
        </h1>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-slate-400">
          A operação da sua imobiliária em um só lugar.
        </p>
      </header>

      <div className="flex items-start gap-3 rounded-lg border border-electric/25 bg-electric/[0.07] px-4 py-3 text-[13px] text-electric-soft">
        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-electric" />
        <p>
          Dados de demonstração. Os indicadores e a atividade abaixo não são
          reais nem estão conectados ao banco de dados.
        </p>
      </div>

      <section aria-label="Indicadores">
        <div className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-navy-700 bg-navy-700 lg:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="bg-navy-900 p-5 sm:p-6">
              <p className="eyebrow">{s.label}</p>
              <p className="mt-4 font-serif text-4xl font-medium tracking-tight">
                {s.value}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section aria-label="Acesso rápido">
        <p className="eyebrow mb-4">Acesso rápido</p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {shortcuts.map((m) => {
            const Icon = m.icon;
            return (
              <Link
                key={m.slug}
                href={`/${m.slug}`}
                className="group rounded-xl border border-navy-700 bg-navy-900 p-5 hover:border-electric/40"
              >
                <div className="flex items-center justify-between">
                  <Icon size={18} strokeWidth={1.6} className="text-electric" />
                  <ArrowUpRight
                    size={16}
                    strokeWidth={1.6}
                    className="text-slate-600 group-hover:text-electric-soft"
                  />
                </div>
                <p className="mt-6 text-sm font-medium">{m.label}</p>
                <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-slate-500">
                  {m.description}
                </p>
              </Link>
            );
          })}
        </div>
      </section>

      <div className="grid gap-10 lg:grid-cols-5">
        <section className="lg:col-span-3">
          <p className="eyebrow mb-4">Atividade recente (exemplo)</p>
          <ul className="border-t border-navy-700">
            {activity.map((a) => (
              <li
                key={a}
                className="flex items-start gap-3 border-b border-navy-700 py-3.5 text-sm text-slate-300"
              >
                <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-electric" />
                {a}
              </li>
            ))}
          </ul>
        </section>

        <section className="lg:col-span-2">
          <p className="eyebrow mb-4">Agentes de IA</p>
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
