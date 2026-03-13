import createMiddleware from 'next-intl/middleware'
import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'
import { createServerClient } from '@supabase/ssr'
import type { Database } from '@/types/database'
import { LOCALES, DEFAULT_LOCALE } from '@/lib/constants'

const intlMiddleware = createMiddleware({
  locales: LOCALES,
  defaultLocale: DEFAULT_LOCALE,
  localePrefix: 'always',
})

/** Fichiers statiques PWA — ne jamais préfixer avec i18n */
const PWA_FILES = [
  '/manifest.json',
  '/sw.js',
  '/register-sw.js',
  '/offline.html',
]

/** Routes nécessitant une authentification */
const AUTH_PATHS = ['/admin']

/** Routes réservées aux admins uniquement */
const ADMIN_ONLY_PATHS = ['/admin/collaborateurs', '/admin/parametres']

function isAuthPath(pathname: string): boolean {
  return AUTH_PATHS.some((p) => pathname.includes(p))
}

function isAdminOnlyPath(pathname: string): boolean {
  return ADMIN_ONLY_PATHS.some((p) => pathname.includes(p))
}

function getLocaleFromPath(pathname: string): string {
  const match = pathname.match(/^\/(fr|en)\//)
  return match ? match[1] : DEFAULT_LOCALE
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // ─── Fichiers statiques PWA — exclure du routage i18n ─────────────────────
  if (
    PWA_FILES.includes(pathname) ||
    pathname.startsWith('/icons/') ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/favicon')
  ) {
    return NextResponse.next()
  }

  // ─── Routes protégées /[locale]/admin/** ──────────────────────────────────
  if (isAuthPath(pathname)) {
    const { supabaseResponse, user } = await updateSession(request)

    // Non authentifié → redirection vers login
    if (!user) {
      const locale = getLocaleFromPath(pathname)
      const loginUrl = new URL(`/${locale}/login`, request.url)
      loginUrl.searchParams.set('redirectTo', pathname)
      return NextResponse.redirect(loginUrl)
    }

    // Vérification rôle admin pour routes sensibles
    if (isAdminOnlyPath(pathname)) {
      const supabase = createServerClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            getAll() { return request.cookies.getAll() },
            setAll() {},
          },
        }
      )

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single<{ role: string }>()

      if (!profile || profile.role !== 'admin') {
        const locale = getLocaleFromPath(pathname)
        return NextResponse.redirect(new URL(`/${locale}/admin`, request.url))
      }
    }

    return supabaseResponse
  }

  // ─── Routing i18n pour toutes les autres routes ───────────────────────────
  return intlMiddleware(request)
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api|monitoring|manifest\\.json|sw\\.js|register-sw\\.js|offline\\.html|icons/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
