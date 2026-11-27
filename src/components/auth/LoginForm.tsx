"use client";

import { useActionState, useState } from "react";
import { ArrowRight, Eye, EyeOff, Lock, Mail } from "lucide-react";
import { login, signup } from "@/lib/auth/actions";

const fieldCls =
  "flex h-[58px] items-center gap-4 rounded-lg border border-white/15 bg-white/[0.02] px-5 focus-within:border-electric";
const inputCls =
  "min-w-0 flex-1 bg-transparent text-[15px] text-[#ece7d8] outline-none placeholder:text-slate-500";

export default function LoginForm({ notice }: { notice?: string }) {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [showPassword, setShowPassword] = useState(false);
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
    <div className="w-full">
      <h2 className="font-sans text-xl font-light tracking-[0.22em] text-[#f1ecdd] sm:text-[22px]">
        {isLogin ? "BEM-VINDO DE VOLTA" : "CRIAR CONTA"}
      </h2>
      <p className="mt-3 text-[15px] text-[#cdb98f]">
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
        className="mt-12 space-y-5"
      >
        <div>
          <label htmlFor="email" className="sr-only">
            E-mail
          </label>
          <div className={fieldCls}>
            <Mail size={20} strokeWidth={1.4} className="shrink-0 text-slate-300" />
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="Seu e-mail corporativo"
              className={inputCls}
            />
          </div>
        </div>

        <div>
          <label htmlFor="password" className="sr-only">
            Senha
          </label>
          <div className={fieldCls}>
            <Lock size={20} strokeWidth={1.4} className="shrink-0 text-slate-300" />
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              required
              minLength={8}
              maxLength={72}
              autoComplete={isLogin ? "current-password" : "new-password"}
              placeholder="Sua senha"
              className={inputCls}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
              className="shrink-0 text-slate-300 hover:text-white"
            >
              {showPassword ? (
                <EyeOff size={20} strokeWidth={1.4} />
              ) : (
                <Eye size={20} strokeWidth={1.4} />
              )}
            </button>
          </div>
        </div>

        {state?.error && <p className="text-sm text-red-400">{state.error}</p>}
        {state?.message && (
          <p className="text-sm text-emerald-400">{state.message}</p>
        )}

        <button
          type="submit"
          disabled={pending}
          style={{
            background:
              "linear-gradient(100deg, #cfb683 0%, #dcc796 45%, #b8995d 100%)",
          }}
          className="!mt-8 flex h-[57px] w-full items-center justify-center gap-2 rounded-md text-[15px] font-medium !text-[#14201a] shadow-[0_8px_24px_-12px_rgba(200,169,106,0.6)] transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {pending ? "Aguarde..." : isLogin ? "Entrar" : "Criar conta"}
          {!pending && <ArrowRight size={18} strokeWidth={1.8} />}
        </button>
      </form>

      <div className="mt-6 flex items-center gap-4 text-xs text-slate-400">
        <span className="h-px flex-1 bg-white/10" />
        OU
        <span className="h-px flex-1 bg-white/10" />
      </div>

      {/* Ainda não implementado: botão visível, porém desativado */}
      <button
        type="button"
        disabled
        aria-disabled="true"
        title="Login com Google em breve"
        className="mt-6 flex h-[57px] w-full cursor-not-allowed items-center justify-center gap-3 rounded-md border border-electric/30 bg-black/20 text-[15px] text-[#ece7d8]/60"
      >
        <svg viewBox="0 0 48 48" width="18" height="18" aria-hidden="true">
          <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
          <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
          <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
          <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
        </svg>
        Entrar com Google
        <span className="rounded-full border border-white/15 px-2 py-0.5 text-[10px] uppercase tracking-wider text-slate-400">
          Em breve
        </span>
      </button>

      <p className="mt-9 text-center text-sm text-slate-400">
        {isLogin ? "Não tem uma conta? " : "Já tem conta? "}
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
