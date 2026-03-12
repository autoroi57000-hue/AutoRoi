import { type Page } from "@playwright/test"

/**
 * Login as admin via the login page.
 * Reads credentials from env or falls back to defaults.
 */
export async function loginAsAdmin(page: Page, locale = "fr") {
  const email = process.env.TEST_ADMIN_EMAIL || "auto.roi57000@gmail.com"
  const password = process.env.TEST_ADMIN_PASSWORD || "Admin123!"

  await page.goto(`/${locale}/login`)
  await page.waitForLoadState("networkidle")

  await page.fill('input[name="email"], input[type="email"]', email)
  await page.fill('input[name="password"], input[type="password"]', password)
  await page.click('button[type="submit"]')

  // Wait for redirect to admin dashboard
  await page.waitForURL(`**/${locale}/admin/**`, { timeout: 15_000 })
}
