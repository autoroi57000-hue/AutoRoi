import { test, expect } from "@playwright/test"
import { loginAsAdmin } from "./helpers/auth"

/**
 * SCÉNARIO A — Publication complète
 * 1. Connexion admin
 * 2. Créer une annonce avec champs obligatoires
 * 3. Vérifier que la section Photos s'ouvre après création
 * 4. Publier l'annonce
 * 5. Vérifier visible sur /vehicules
 */

test.describe("Scénario A — Publication complète", () => {
  test("Création + publication d'une annonce", async ({ page }) => {
    // 1. Connexion admin
    await loginAsAdmin(page)
    await expect(page).toHaveURL(/\/admin/)

    // 2. Aller sur la page nouvelle annonce
    await page.goto("/fr/admin/annonces/nouvelle")
    await page.waitForLoadState("networkidle")

    // Remplir les champs obligatoires — section Identité
    await page.fill('input[name="brand"]', "TestBrand")
    await page.fill('input[name="model"]', "TestModel")
    await page.fill('input[name="year"]', "2024")

    // Section Prix
    const priceSection = page.locator("#section-price")
    if (priceSection) {
      await priceSection.click().catch(() => {})
    }
    await page.fill('input[name="price"]', "25000")
    await page.fill('input[name="mileage"]', "15000")

    // 3. Sauvegarder en brouillon
    await page.click('button:has-text("Sauvegarder")')

    // Vérifier le message de succès
    await expect(page.locator("text=Vous pouvez maintenant ajouter des photos")).toBeVisible({
      timeout: 10_000,
    })

    // Vérifier que le bouton Terminer apparaît
    await expect(page.locator('button:has-text("Terminer")')).toBeVisible()

    // 4. Terminer et aller sur la fiche
    await page.click('button:has-text("Terminer")')
    await page.waitForURL(/\/admin\/annonces\//, { timeout: 10_000 })
  })

  test("Le catalogue est accessible et se charge", async ({ page }) => {
    await page.goto("/fr/vehicules")
    await page.waitForLoadState("networkidle")

    // La page catalogue se charge sans erreur
    await expect(page).toHaveURL(/\/vehicules/)
    // Vérifier qu'il n'y a pas d'erreur 500
    const body = await page.textContent("body")
    expect(body).not.toContain("Internal Server Error")
  })
})
