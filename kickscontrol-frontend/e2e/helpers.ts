import type { Page } from '@playwright/test'

export const ADMIN = { email: 'admin@kickscontrol.com', password: 'admin123' }
export const USER  = { email: 'cliente@kickscontrol.com', password: 'user123' }

export async function loginAs(page: Page, creds: typeof ADMIN) {
  await page.goto('/login')
  await page.fill('input[type=email]', creds.email)
  await page.fill('input[type=password]', creds.password)
  await page.click('button[type=submit]')
  await page.waitForURL('/')
}

export async function logout(page: Page) {
  // Click the logout button (ArrowRightEndOnRectangle icon button in header)
  await page.locator('header button[title="Cerrar sesión"]').click()
}
