import { notFound } from "next/navigation";
import { modules } from "@/lib/modules";

export function generateStaticParams() {
  return modules
    .filter((m) => m.slug !== "dashboard")
    .map((m) => ({ module: m.slug }));
}

export default async function ModulePage({
  params,
}: {
  params: Promise<{ module: string }>;
}) {
  const { module: slug } = await params;
  const mod = modules.find((m) => m.slug === slug && slug !== "dashboard");

  if (!mod) notFound();

  const Icon = mod.icon;

  return (
    <div className="mx-auto max-w-3xl">
      <div className="rounded-xl border border-navy-700 bg-navy-900 p-8 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-electric/15 text-electric">
          <Icon size={24} />
        </div>
        <h1 className="mt-4 text-2xl font-semibold tracking-tight">
          {mod.label}
        </h1>
        <p className="mt-2 text-sm text-slate-400">{mod.description}</p>
        <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-navy-700 bg-navy-950 px-3 py-1 text-xs text-slate-400">
          Em construção · previsto para a {mod.phase}
        </div>
      </div>
    </div>
  );
    }
