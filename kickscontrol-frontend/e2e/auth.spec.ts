import { test, expect } from '@playwright/test'
import { ADMIN, USER, loginAs, logout } from './helpers'

test.describe('Authentication', () => {
  test('login page renders correctly', async ({ page }) => {
    await page.goto('/login')
    await expect(page.locator('text=kickscontrol')).toBeVisible()
    await expect(page.locator('input[type=email]')).toBeVisible()
    await expect(page.locator('input[type=password]')).toBeVisible()
    await expect(page.locator('button[type=submit]')).toHaveText('Iniciar sesión')
  })

  test('shows error on wrong credentials', async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[type=email]', 'wrong@email.com')
    await page.fill('input[type=password]', 'wrongpassword')
    await page.click('button[type=submit]')
    await expect(page.locator('text=/credenciales|Invalid/i')).toBeVisible({ timeout: 5000 })
  })

  test('admin login redirects to home and shows Backoffice link', async ({ page }) => {
    await loginAs(page, ADMIN)
    await expect(page).toHaveURL('/')
    await expect(page.locator('a[href="/backoffice"]')).toBeVisible()
  })

  test('user login does not show Backoffice link', async ({ page }) => {
    await loginAs(page, USER)
    await expect(page).toHaveURL('/')
    await expect(page.locator('a[href="/backoffice"]')).not.toBeVisible()
  })

  test('logout clears session and shows login button', async ({ page }) => {
    await loginAs(page, ADMIN)
    await logout(page)
    await expect(page.locator('a[href="/login"]')).toBeVisible({ timeout: 3000 })
  })

  test('unauthenticated access to /backoffice redirects to login', async ({ page }) => {
    // Ensure no cookies
    await page.context().clearCookies()
    await page.goto('/backoffice')
    await expect(page).toHaveURL(/\/login/)
  })

  test('authenticated user redirected away from /login', async ({ page }) => {
    await loginAs(page, ADMIN)
    await page.goto('/login')
    await expect(page).toHaveURL('/')
  })
})
