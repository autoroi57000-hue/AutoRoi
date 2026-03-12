import { NextResponse } from "next/server"
import fs from "fs"
import path from "path"

export async function GET() {
  try {
    const templatePath = path.join(process.cwd(), "public", "templates", "cerfa_15776-02.pdf")
    if (!fs.existsSync(templatePath)) {
      return NextResponse.json({ error: "Template CERFA introuvable" }, { status: 404 })
    }

    const pdfBytes = fs.readFileSync(templatePath)

    return new NextResponse(pdfBytes, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="cerfa-acte-de-vente.pdf"`,
        "Cache-Control": "public, max-age=86400",
      },
    })
  } catch (err) {
    console.error("Acte de vente error:", err)
    return NextResponse.json({ error: "Erreur" }, { status: 500 })
  }
}
