export default function EnvNotice() {
  return (
    <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
      <p className="font-medium">Supabase não configurado</p>
      <p className="mt-1 text-amber-200/80">
        Defina <code>NEXT_PUBLIC_SUPABASE_URL</code> e{" "}
        <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> nas variáveis de ambiente
        (Vercel ou <code>.env.local</code>) e faça um novo deploy.
      </p>
    </div>
  );
}
