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
      ? "Não foi possível confirmar o e-mail. O link pode ter expirado. Tente criar a conta novamente."
      : undefined;

  return (
    <main className="grid min-h-screen lg:grid-cols-[58fr_42fr]">
      <section
        className="relative flex min-h-[340px] flex-col justify-between px-6 py-8 lg:min-h-screen lg:px-16 lg:py-14"
        style={{
          backgroundColor: "#07120d",
          backgroundImage:
            "linear-gradient(180deg, rgba(6,16,12,0.55) 0%, rgba(6,16,12,0.2) 40%, rgba(6,16,12,0.9) 100%), url('/images/login-hero.jpg'), url('/images/architecture.svg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="flex items-center gap-3 text-[#ece7d8]">
          <BrandMark size={32} />
          <span className="font-serif text-xl tracking-[0.3em]">
            LAHTEN <span className="ml-1 text-electric">AI</span>
          </span>
        </div>

        <div className="max-w-lg">
          <p className="font-serif text-3xl leading-[1.2] text-[#f4efe0] sm:text-4xl lg:text-5xl">
            A inteligência por trás dos negócios imobiliários.
          </p>
          <div className="mt-8 h-px w-20 bg-electric/70" />
          <p className="eyebrow mt-6 !text-slate-300">
            Inovação • Estratégia • Resultados
          </p>
        </div>
      </section>

      <section className="flex items-center justify-center bg-[#07130e] px-6 py-14 lg:px-16">
        <LoginForm notice={notice} />
      </section>
    </main>
  );
}
