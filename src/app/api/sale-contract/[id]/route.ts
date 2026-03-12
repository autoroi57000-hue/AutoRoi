import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { generateSaleContract } from "@/lib/sale-contract"

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    // Vérifier l'authentification admin/collaborateur
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single()

    const role = (profile as { role: string } | null)?.role
    if (!role || (role !== "admin" && role !== "collaborateur")) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 })
    }

    // Vérifier que le véhicule existe
    const { data: vehicle, error: vehicleError } = await supabase
      .from("vehicles")
      .select("brand, model, year")
      .eq("id", id)
      .single()

    if (vehicleError || !vehicle) {
      return NextResponse.json({ error: "Véhicule introuvable" }, { status: 404 })
    }

    // Générer le PDF
    const pdfBuffer = await generateSaleContract(id)

    // Nom du fichier
    const v = vehicle as { brand: string; model: string; year: number }
    const date = new Date().toISOString().split("T")[0]
    const filename = `Contrat-Vente-${v.brand}-${v.model}-${date}.pdf`
      .replace(/\s+/g, "-")
      .replace(/[^a-zA-Z0-9\-_.]/g, "")

    return new NextResponse(Buffer.from(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    })
  } catch (err) {
    console.error("Sale contract generation error:", err)
    return NextResponse.json(
      { error: "Erreur lors de la génération du contrat de vente" },
      { status: 500 }
    )
  }
}
