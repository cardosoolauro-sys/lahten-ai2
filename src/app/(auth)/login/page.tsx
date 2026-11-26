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
    <main className="grid min-h-screen lg:grid-cols-[1.15fr_1fr]">
      <section
        className="relative flex min-h-[260px] flex-col justify-between p-6 lg:min-h-screen lg:p-14"
        style={{
          backgroundColor: "#07120d",
          backgroundImage:
            "linear-gradient(180deg, rgba(6,16,12,0.6) 0%, rgba(6,16,12,0.3) 45%, rgba(6,16,12,0.88) 100%), url('/images/login-hero.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="flex items-center gap-3 text-[#ece7d8]">
          <BrandMark size={30} />
          <span className="font-serif text-lg tracking-[0.3em]">
            LAHTEN <span className="ml-1 text-electric">AI</span>
          </span>
        </div>

        <div className="max-w-md">
          <p className="font-serif text-2xl leading-snug text-[#f1ecdd] sm:text-3xl lg:text-4xl">
            A inteligência por trás dos negócios imobiliários.
          </p>
          <div className="mt-6 h-px w-16 bg-electric/70" />
          <p className="eyebrow mt-5 hidden !text-slate-300 lg:block">
            Inovação • Estratégia • Resultados
          </p>
        </div>
      </section>

      <section className="flex items-center justify-center bg-navy-950 px-6 py-12 lg:px-14">
        <LoginForm notice={notice} />
      </section>
    </main>
  );
}
