import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import type { Database } from "@/types/database"

/**
 * Auth callback route — exchanges the Supabase auth code for a session.
 * Used after clicking the invitation link or password reset link in emails.
 *
 * Flow: Supabase email link → /api/auth/callback?code=...&next=/fr/set-password
 *       → exchanges code → redirects to `next` param (or /fr/login as fallback)
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl
  const code = searchParams.get("code")
  const next = searchParams.get("next") || "/fr/login"

  if (!code) {
    // No code — redirect to login with error
    return NextResponse.redirect(new URL("/fr/login?error=missing_code", origin))
  }

  const response = NextResponse.redirect(new URL(next, origin))

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { error } = await supabase.auth.exchangeCodeForSession(code)

  if (error) {
    console.error("Auth callback error:", error.message)
    return NextResponse.redirect(
      new URL("/fr/login?error=callback_failed", origin)
    )
  }

  return response
}
