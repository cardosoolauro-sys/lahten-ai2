import Link from "next/link";
import Field from "@/components/auth/Field";
import SubmitButton from "@/components/auth/SubmitButton";
import { signup } from "@/lib/auth/actions";
import { errorMessage } from "@/lib/auth/messages";

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const errorText = errorMessage(error);

  return (
    <>
      <h1 className="text-xl font-semibold tracking-tight">Criar conta</h1>
      <p className="mt-1 text-sm text-slate-400">
        Cadastre-se e crie o espaço de trabalho da sua imobiliária.
      </p>

      {errorText && (
        <div
          role="alert"
          className="mt-5 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2.5 text-sm text-red-300"
        >
          {errorText}
        </div>
      )}

      <form action={signup} className="mt-6 space-y-4">
        <Field
          label="Seu nome"
          name="full_name"
          autoComplete="name"
          placeholder="Maria Silva"
        />
        <Field
          label="Nome da imobiliária"
          name="org_name"
          autoComplete="organization"
          placeholder="Silva Imóveis"
        />
        <Field
          label="E-mail"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="voce@imobiliaria.com"
        />
        <Field
          label="Senha"
          name="password"
          type="password"
          autoComplete="new-password"
          minLength={8}
          hint="Mínimo de 8 caracteres."
        />
        <SubmitButton pendingText="Criando conta...">Criar conta</SubmitButton>
      </form>

      <p className="mt-6 text-center text-sm text-slate-400">
        Já tem conta?{" "}
        <Link href="/login" className="text-electric-soft hover:text-white">
          Entrar
        </Link>
      </p>
    </>
  );
}
