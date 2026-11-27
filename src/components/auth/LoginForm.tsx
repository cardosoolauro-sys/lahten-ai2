
"use client";

import { useActionState, useState } from "react";
import { login, signup } from "@/lib/auth/actions";

const inputCls =
  "w-full border-0 border-b border-[#526457] bg-transparent px-0 py-3.5 text-sm text-[#f0eadb] outline-none placeholder:text-[#777d70] focus:border-[#c8a96a]";

export default function LoginForm({ notice }: { notice?: string }) {
  const [mode, setMode] = useState<"login" | "signup">("login");

  const [loginState, loginAction, loginPending] = useActionState(
    login,
    undefined
  );
  const [signupState, signupAction, signupPending] = useActionState(
    signup,
    undefined
  );

  const isLogin = mode === "login";
  const state = isLogin ? loginState : signupState;
  const pending = isLogin ? loginPending : signupPending;

  return (
    <div className="w-full max-w-[390px]">
      <p className="eyebrow !text-[#c8a96a]">LAHTEN AI · PLATAFORMA</p>

      <h2 className="mt-5 font-serif text-3xl font-normal tracking-wide text-[#f0eadb] sm:text-4xl">
        {isLogin ? "Bem-vindo de volta." : "Comece sua jornada."}
      </h2>

      <p className="mt-3 text-sm leading-6 text-[#a9ad9f]">
        {isLogin
          ? "Acesse seu ambiente de inteligência imobiliária."
          : "Crie seu acesso para começar."}
      </p>

      {notice && (
        <p className="mt-6 border-l-2 border-[#c8a96a] pl-3 text-sm leading-6 text-[#e3cf9f]">
          {notice}
        </p>
      )}

      <form
        key={mode}
        action={isLogin ? loginAction : signupAction}
        className="mt-10 space-y-7"
      >
        <div>
          <label
            htmlFor="email"
            className="mb-1 block text-[10px] font-medium uppercase tracking-[0.2em] text-[#a9ad9f]"
          >
            E-mail
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="voce@imobiliaria.com.br"
            className={inputCls}
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="mb-1 block text-[10px] font-medium uppercase tracking-[0.2em] text-[#a9ad9f]"
          >
            Senha
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            minLength={8}
            maxLength={72}
            autoComplete={isLogin ? "current-password" : "new-password"}
            placeholder="Sua senha"
            className={inputCls}
          />
        </div>

        {state?.error && (
          <p className="text-sm text-red-400">{state.error}</p>
        )}
        {state?.message && (
          <p className="text-sm text-emerald-300">{state.message}</p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-sm bg-[#c8a96a] px-5 py-4 text-[11px] font-semibold uppercase tracking-[0.25em] text-[#101a12] transition-all hover:bg-[#e3cf9f] disabled:opacity-60"
        >
          {pending ? "Aguarde..." : isLogin ? "Acessar plataforma" : "Criar conta"}
        </button>
      </form>

      <div className="my-8 h-px bg-white/[0.09]" />

      <p className="text-center text-sm text-[#a9ad9f]">
        {isLogin ? "Ainda não tem uma conta? " : "Já possui uma conta? "}
        <button
          type="button"
          onClick={() => setMode(isLogin ? "signup" : "login")}
          className="text-[#e3cf9f] underline-offset-4 hover:underline"
        >
          {isLogin ? "Criar conta" : "Entrar"}
        </button>
      </p>

      <p className="mt-12 text-center text-[9px] uppercase tracking-[0.2em] text-[#68766a]">
        Ambiente seguro · LAHTEN AI
      </p>
    </div>
  );
}
