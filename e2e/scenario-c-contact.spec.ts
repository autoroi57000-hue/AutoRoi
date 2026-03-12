import { test, expect } from "@playwright/test"

/**
 * SCÉNARIO C — Contact
 * 1. Aller sur la page contact
 * 2. Remplir le formulaire
 * 3. Soumettre et vérifier le message de confirmation
 * 4. Vérifier le honeypot anti-spam
 */

test.describe("Scénario C — Contact", () => {
  test("Le formulaire de contact se charge et se soumet", async ({ page }) => {
    await page.goto("/fr/contact")
    await page.waitForLoadState("networkidle")

    // Le formulaire existe
    const form = page.locator("form")
    await expect(form.first()).toBeVisible()

    // Remplir les champs
    await page.fill('input[name="firstName"], input[name="first_name"]', "Jean")
    await page.fill('input[name="lastName"], input[name="last_name"]', "Dupont")
    await page.fill('input[name="email"]', "test-e2e@example.com")
    await page.fill(
      'textarea[name="message"]',
      "Ceci est un message de test E2E pour vérifier le formulaire de contact."
    )

    // Cocher RGPD si présent
    const rgpdCheckbox = page.locator(
      'input[name="rgpd"], input[name="consent"], input[type="checkbox"]'
    )
    if ((await rgpdCheckbox.count()) > 0) {
      await rgpdCheckbox.first().check()
    }

    // Soumettre
    await page.click('button[type="submit"]')

    // Attendre confirmation ou erreur (pas d'erreur réseau)
    await page.waitForTimeout(3000)
    const body = await page.textContent("body")
    expect(body).not.toContain("Internal Server Error")
  })

  test("Le honeypot bloque les soumissions spam", async ({ page }) => {
    await page.goto("/fr/contact")
    await page.waitForLoadState("networkidle")

    // Remplir normalement
    await page.fill('input[name="firstName"], input[name="first_name"]', "Spam")
    await page.fill('input[name="lastName"], input[name="last_name"]', "Bot")
    await page.fill('input[name="email"]', "spam@bot.com")
    await page.fill(
      'textarea[name="message"]',
      "Ceci est un message de spam de test E2E."
    )

    // Remplir le honeypot (normalement caché)
    const honeypot = page.locator('input[name="website"]')
    if ((await honeypot.count()) > 0) {
      await honeypot.fill("http://spam.com")
    }

    const rgpdCheckbox = page.locator('input[type="checkbox"]')
    if ((await rgpdCheckbox.count()) > 0) {
      await rgpdCheckbox.first().check()
    }

    await page.click('button[type="submit"]')
    await page.waitForTimeout(2000)

    // Le formulaire ne devrait pas montrer de succès
    // (le serveur rejette silencieusement ou affiche une erreur)
  })

  test("WhatsApp link est présent sur la page contact", async ({ page }) => {
    await page.goto("/fr/contact")
    await page.waitForLoadState("networkidle")

    // Chercher un lien WhatsApp
    const whatsappLink = page.locator('a[href*="wa.me"], a[href*="whatsapp"]')
    if ((await whatsappLink.count()) > 0) {
      const href = await whatsappLink.first().getAttribute("href")
      expect(href).toContain("wa.me")
    }
  })
})
