import { redirect } from "next/navigation";

// O cadastro agora é feito na própria tela de login (botão "Criar conta").
export default function SignupPage() {
  redirect("/login");
}
