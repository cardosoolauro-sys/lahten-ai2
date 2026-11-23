import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseEnv, hasSupabaseEnv } from "@/lib/supabase/env";

const authPages = ["/login", "/cadastro"];
const publicPaths = [...authPages, "/auth/callback"];

function redirectTo(request: NextRequest, path: string, from: NextResponse) {
  const target = request.nextUrl.clone();
  target.pathname = path;
  target.search = "";

  const redirect = NextResponse.redirect(target);
  from.cookies.getAll().forEach((cookie) => redirect.cookies.set(cookie));
  return redirect;
}

export async function proxy(request: NextRequest) {
  // Sem as variáveis de ambiente não há como validar a sessão.
  // As páginas mostram um aviso de configuração.
  if (!hasSupabaseEnv()) return NextResponse.next();

  const { url, key } = getSupabaseEnv();
  let response = NextResponse.next({ request });

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value),
        );
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  if (!user && !publicPaths.includes(pathname)) {
    return redirectTo(request, "/login", response);
  }

  if (user && authPages.includes(pathname)) {
    return redirectTo(request, "/dashboard", response);
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
