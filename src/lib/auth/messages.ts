const errors: Record<string, string> = {
  missing_fields: "Preencha todos os campos.",
  invalid_credentials: "E-mail ou senha incorretos.",
  email_not_confirmed:
    "Confirme o seu e-mail antes de entrar. Procure a mensagem na sua caixa de entrada.",
  user_already_exists: "Este e-mail já está cadastrado. Tente entrar.",
  email_exists: "Este e-mail já está cadastrado. Tente entrar.",
  weak_password: "Senha fraca. Use pelo menos 8 caracteres.",
  email_address_invalid: "Informe um e-mail válido.",
  over_email_send_rate_limit:
    "Muitos e-mails enviados. Aguarde alguns minutos e tente de novo.",
  over_request_rate_limit:
    "Muitas tentativas. Aguarde alguns minutos e tente de novo.",
  signup_disabled: "Novos cadastros estão desativados no momento.",
  callback:
    "O link de confirmação é inválido ou expirou. Tente entrar com o seu e-mail e senha.",
};

const infos: Record<string, string> = {
  confirm_email:
    "Enviamos um e-mail de confirmação. Clique no link da mensagem e depois entre aqui.",
};

export function errorMessage(code?: string): string | null {
  if (!code) return null;
  return errors[code] ?? "Não foi possível concluir. Tente novamente.";
}

export function infoMessage(code?: string): string | null {
  if (!code) return null;
  return infos[code] ?? null;
}
