"use client";

import { useActionState, useState } from "react";
import { login, signup } from "@/lib/auth/actions";

const inputCls =
  "w-full border-0 border-b border-navy-700 bg-transparent px-0 py-3 text-sm outline-none placeholder:text-slate-600 focus:border-electric";

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
    <div className="w-full max-w-sm">
      <h2 className="font-serif text-2xl font-medium tracking-[0.16em]">
        {isLogin ? "BEM-VINDO DE VOLTA" : "CRIAR CONTA"}
      </h2>
      <p className="mt-3 text-sm text-slate-400">
        {isLogin
          ? "Acesse sua conta para continuar"
          : "Cadastre-se para começar"}
      </p>

      {notice && (
        <p className="mt-6 border-l-2 border-electric pl-3 text-sm text-electric-soft">
          {notice}
        </p>
      )}

      <form
        key={mode}
        action={isLogin ? loginAction : signupAction}
        className="mt-10 space-y-7"
      >
        <div>
          <label htmlFor="email" className="eyebrow block">
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
          <label htmlFor="password" className="eyebrow block">
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
            placeholder="••••••••"
            className={inputCls}
          />
        </div>

        {state?.error && <p className="text-sm text-red-400">{state.error}</p>}
        {state?.message && (
          <p className="text-sm text-emerald-400">{state.message}</p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-sm bg-electric px-4 py-3.5 text-xs font-semibold uppercase tracking-[0.28em] transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {pending ? "Aguarde..." : isLogin ? "Entrar" : "Criar conta"}
        </button>
      </form>

      <p className="mt-10 text-center text-sm text-slate-400">
        {isLogin ? "Ainda não tem conta? " : "Já tem conta? "}
        <button
          type="button"
          onClick={() => setMode(isLogin ? "signup" : "login")}
          className="text-electric hover:text-electric-soft"
        >
          {isLogin ? "Criar conta" : "Entrar"}
        </button>
      </p>
    </div>
  );
}
