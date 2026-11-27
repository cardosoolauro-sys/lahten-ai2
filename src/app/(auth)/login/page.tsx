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
    <main className="grid min-h-screen lg:grid-cols-[61fr_39fr]">
      <section
        className="relative flex min-h-[480px] flex-col justify-between overflow-hidden px-7 py-9 lg:min-h-screen lg:border-r lg:border-electric/40 lg:py-16 lg:pl-[12%] lg:pr-10"
        style={{
          backgroundColor: "#07120d",
          backgroundImage:
            "linear-gradient(90deg, rgba(6,16,12,0.5) 0%, rgba(6,16,12,0.05) 55%, rgba(6,16,12,0) 100%), linear-gradient(180deg, rgba(6,16,12,0.25) 0%, rgba(6,16,12,0) 35%, rgba(6,16,12,0.45) 100%), url('/images/login-hero.jpg'), url('/images/architecture.svg')",
          backgroundSize: "100% 100%, 100% 100%, cover, cover",
          backgroundPosition: "center, center, right center, center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-[3.5%] hidden w-px bg-electric/35 lg:block"
        />

        <div className="relative flex items-center gap-4">
          <BrandMark size={34} />
          <span className="font-serif text-2xl font-light tracking-[0.32em] text-[#f1ecdd]">
            LAHTEN AI
          </span>
        </div>

        <div className="relative max-w-xl">
          <h1 className="font-serif text-4xl font-light leading-[1.12] text-[#f4efe0] sm:text-5xl lg:text-[3.6rem]">
            A inteligência
            <br />
            por trás dos
            <br />
            <em className="text-[#d8bf92]">negócios imobiliários.</em>
          </h1>
          <div className="mt-9 h-px w-14 bg-electric/70" />
        </div>

        <div className="relative">
          <div className="h-px w-80 max-w-full bg-electric/40" />
          <div className="mt-5 flex items-center gap-5">
            <p className="eyebrow !tracking-[0.3em] !text-slate-300">
              Inovação • Estratégia • Resultados
            </p>
            <span className="hidden h-px flex-1 bg-electric/30 sm:block" />
          </div>
        </div>
      </section>

      <section
        className="relative flex items-center justify-center overflow-hidden px-6 py-14 lg:px-12"
        style={{
          background:
            "radial-gradient(120% 90% at 85% 0%, #153227 0%, #0b1a13 45%, #07130e 100%)",
        }}
      >
        <svg
          aria-hidden="true"
          className="pointer-events-none absolute -right-10 -top-24 h-[620px] w-[620px] opacity-70"
          viewBox="0 0 600 600"
          fill="none"
        >
          <circle cx="520" cy="80" r="330" stroke="#c8a96a" strokeOpacity="0.16" />
          <circle cx="520" cy="80" r="470" stroke="#c8a96a" strokeOpacity="0.1" />
        </svg>

        <div className="relative z-10 w-full max-w-[26rem]">
          <LoginForm notice={notice} />
        </div>
      </section>
    </main>
  );
}
