import EnvNotice from "@/components/EnvNotice";
import { hasSupabaseEnv } from "@/lib/supabase/env";

// As telas de acesso (login/cadastro) ocupam a página inteira e têm o próprio visual.
// Este layout só avisa quando as variáveis do Supabase não estão configuradas.
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!hasSupabaseEnv()) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">
          <EnvNotice />
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
