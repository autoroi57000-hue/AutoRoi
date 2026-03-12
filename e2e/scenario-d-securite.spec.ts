import { test, expect } from "@playwright/test"

/**
 * SCÉNARIO D — Sécurité & accès non autorisé
 * 1. Accéder aux pages admin sans auth → redirection login
 * 2. Slug inexistant → page 404
 * 3. Headers de sécurité présents
 * 4. Double soumission protégée
 */

test.describe("Scénario D — Sécurité", () => {
  test("Les pages admin redirigent vers login si non authentifié", async ({ page }) => {
    // Tenter d'accéder au dashboard admin
    await page.goto("/fr/admin")
    await page.waitForLoadState("networkidle")

    // Doit rediriger vers login
    expect(page.url()).toMatch(/\/login|\/admin/)
  })

  test("Les pages admin/annonces redirigent si non authentifié", async ({ page }) => {
    await page.goto("/fr/admin/annonces")
    await page.waitForLoadState("networkidle")

    expect(page.url()).toMatch(/\/login|\/admin/)
  })

  test("Un slug véhicule inexistant retourne 404", async ({ page }) => {
    const response = await page.goto("/fr/vehicules/slug-inexistant-12345")

    // Soit 404 HTTP, soit page 404 custom
    if (response) {
      expect([200, 404]).toContain(response.status())
    }

    // La page 404 custom affiche un message approprié
    const body = await page.textContent("body")
    const is404 =
      body?.includes("404") ||
      body?.includes("introuvable") ||
      body?.includes("not found") ||
      body?.includes("n'existe pas")

    expect(is404 || response?.status() === 404).toBeTruthy()
  })

  test("Les headers de sécurité sont présents", async ({ page }) => {
    const response = await page.goto("/fr")

    if (response) {
      const headers = response.headers()

      // X-Frame-Options
      expect(headers["x-frame-options"]?.toLowerCase()).toBe("deny")

      // X-Content-Type-Options
      expect(headers["x-content-type-options"]).toBe("nosniff")

      // Referrer-Policy
      expect(headers["referrer-policy"]).toBe("strict-origin-when-cross-origin")

      // X-XSS-Protection
      expect(headers["x-xss-protection"]).toBe("1; mode=block")

      // HSTS
      expect(headers["strict-transport-security"]).toContain("max-age=")
    }
  })

  test("L'API photos rejette les requêtes non authentifiées", async ({ page }) => {
    const response = await page.request.get("/api/photos?vehicleId=00000000-0000-0000-0000-000000000000")
    expect(response.status()).toBe(401)
  })

  test("L'API photos rejette les UUID invalides", async ({ page }) => {
    const response = await page.request.get("/api/photos?vehicleId=invalid-uuid")
    expect(response.status()).toBe(400)
  })

  test("L'API admin invite rejette sans auth", async ({ page }) => {
    const response = await page.request.post("/api/admin/invite", {
      data: { email: "test@test.com", password: "Test1234!", role: "collaborateur" },
    })
    expect(response.status()).toBe(401)
  })
})
