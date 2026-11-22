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
  "Sales Agent",
  "Rental Agent",
  "Research Agent",
  "Document Agent",
  "Financial Agent",
  "Customer Agent",
  "Operations Agent",
];

export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-400">
          Visão geral da operação da imobiliária.
        </p>
      </div>

      <div className="rounded-lg border border-electric/30 bg-electric/10 px-4 py-3 text-sm text-electric-soft">
        Dados de demonstração. Nenhum número abaixo é real nem está conectado a
        banco de dados.
      </div>

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
          <h2 className="text-sm font-medium">Atividade recente (exemplo)</h2>
          <ul className="mt-4 space-y-3">
            {activity.map((a) => (
              <li
                key={a}
                className="flex items-start gap-3 text-sm text-slate-300"
              >
                <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-electric" />
                {a}
              </li>
            ))}
          </ul>
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
