import { NextRequest, NextResponse } from "next/server"
import { createAdminClient, createClient } from "@/lib/supabase/server"
import { checkRateLimit, rateLimitResponse } from "@/lib/rate-limit"

export async function POST(request: NextRequest) {
  try {
    // Vérifier que l'appelant est admin
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single()

    if ((profile as any)?.role !== "admin") {
      return NextResponse.json({ error: "Accès non autorisé" }, { status: 403 })
    }

    // Rate limiting: 10 invitations/hour per userId
    const rl = await checkRateLimit(user.id, { prefix: "invite", maxRequests: 10 })
    if (!rl.allowed) return rateLimitResponse(rl, "Trop d'invitations. Veuillez réessayer plus tard.")

    const { email, role, password, full_name } = await request.json()

    if (!email || !role || !password) {
      return NextResponse.json({ error: "Email, rôle et mot de passe requis" }, { status: 400 })
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(String(email))) {
      return NextResponse.json({ error: "Email invalide" }, { status: 400 })
    }
    if (!["admin", "collaborateur"].includes(String(role))) {
      return NextResponse.json({ error: "Rôle invalide" }, { status: 400 })
    }
    if (String(password).length < 8) {
      return NextResponse.json({ error: "Le mot de passe doit contenir au moins 8 caractères" }, { status: 400 })
    }

    // Créer le compte directement avec mot de passe
    const adminSupabase = createAdminClient()
    const { data, error } = await adminSupabase.auth.admin.createUser({
      email: String(email),
      password: String(password),
      email_confirm: true,
      user_metadata: {
        role: String(role),
        full_name: full_name ? String(full_name) : undefined,
      },
    })

    if (error) {
      if (error.message.includes("already been registered")) {
        return NextResponse.json({ error: "Un compte existe déjà avec cet email" }, { status: 409 })
      }
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    // Créer/mettre à jour le profil
    if (data.user) {
      await adminSupabase
        .from("profiles")
        .upsert({
          id: data.user.id,
          email: String(email),
          full_name: full_name ? String(full_name) : String(email),
          role: String(role),
          is_active: true,
        } as never)
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Error creating user:", error)
    return NextResponse.json(
      { error: error.message || "Erreur lors de la création" },
      { status: 500 }
    )
  }
}
