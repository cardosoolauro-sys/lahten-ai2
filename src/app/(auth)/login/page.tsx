
import BrandMark from "@/components/brand/BrandMark";
import LoginForm from "@/components/auth/LoginForm";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ erro?: string }>;
}) {
  const { erro } = await searchParams;

  const notice =
    erro === "confirmacao"
      ? "Não foi possível confirmar o e-mail. O link pode ter expirado."
      : undefined;

  return (
    <main className="grid min-h-screen bg-[#07130e] lg:grid-cols-[58fr_42fr]">
      {/* FOTO À ESQUERDA */}
      <section
        className="relative flex min-h-[420px] flex-col justify-between overflow-hidden px-8 py-10 lg:min-h-screen lg:px-16 lg:py-14"
        style={{
          backgroundImage:
            "linear-gradient(180deg, rgba(6,16,12,.35), rgba(6,16,12,.12) 45%, rgba(6,16,12,.85)), url('/images/login-hero.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="flex items-center gap-3 text-[#f0eadb]">
          <BrandMark size={32} />
          <span className="font-serif text-xl tracking-[0.3em]">
            LAHTEN <span className="text-[#c8a96a]">AI</span>
          </span>
        </div>

        <div className="max-w-xl">
          <h1 className="font-serif text-4xl leading-tight text-[#f4efe0] lg:text-5xl">
            A inteligência por trás dos negócios imobiliários.
          </h1>
          <div className="mt-8 h-px w-20 bg-[#c8a96a]" />
          <p className="mt-6 text-[10px] uppercase tracking-[0.25em] text-[#eee6d5]">
            INOVAÇÃO • ESTRATÉGIA • RESULTADOS
          </p>
        </div>
      </section>

      {/* FORMULÁRIO À DIREITA */}
      <section className="flex min-h-screen items-center justify-center bg-[#07130e] px-7 py-14 lg:px-14">
        <LoginForm notice={notice} />
      </section>
    </main>
  );
}
