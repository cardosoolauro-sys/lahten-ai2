import EnvNotice from "@/components/EnvNotice";
import { hasSupabaseEnv } from "@/lib/supabase/env";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center text-2xl font-semibold tracking-tight">
          LAHTEN <span className="text-electric">AI</span>
        </div>

        <div className="rounded-xl border border-navy-700 bg-navy-900 p-6 sm:p-8">
          {hasSupabaseEnv() ? children : <EnvNotice />}
        </div>

        <p className="mt-6 text-center text-xs text-slate-500">
          A inteligência por trás dos negócios imobiliários.
        </p>
      </div>
    </div>
  );
}
