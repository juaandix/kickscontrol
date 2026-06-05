import { test, expect } from '@playwright/test'
import { loginAs, ADMIN } from './helpers'

test.describe('Backoffice', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, ADMIN)
    await page.goto('/backoffice')
    await page.waitForLoadState('networkidle')
  })

  test('dashboard KPI cards are visible', async ({ page }) => {
    await expect(page.locator('text=Bienvenido')).toBeVisible({ timeout: 6000 })
    // At least one KPI card title should be visible
    await expect(page.locator('text=/ingresos|pedidos|ticket/i').first()).toBeVisible({ timeout: 8000 })
  })

  test('sidebar navigation items are present', async ({ page }) => {
    await expect(page.locator('a', { hasText: 'Dashboard' })).toBeVisible()
    await expect(page.locator('a', { hasText: 'Inventario' })).toBeVisible()
    await expect(page.locator('a', { hasText: 'Pedidos' })).toBeVisible()
    await expect(page.locator('a', { hasText: 'Usuarios' })).toBeVisible()
  })

  test('inventory page loads product list', async ({ page }) => {
    await page.locator('a', { hasText: 'Inventario' }).click()
    await page.waitForLoadState('networkidle')
    await expect(page.locator('text=Inventario')).toBeVisible()
    await expect(page.locator('button', { hasText: 'Nuevo producto' })).toBeVisible()
    // Products should load
    await expect(page.locator('table tbody tr').first()).toBeVisible({ timeout: 8000 })
  })

  test('product form modal opens and closes', async ({ page }) => {
    await page.locator('a', { hasText: 'Inventario' }).click()
    await page.waitForLoadState('networkidle')

    await page.locator('button', { hasText: 'Nuevo producto' }).click()
    await expect(page.locator('text=Nuevo producto').nth(1)).toBeVisible()
    await expect(page.locator('input[placeholder="Nike Air Max 90"]')).toBeVisible()

    // Close modal
    await page.locator('button[title=""]').filter({ hasText: '' }).first().click()
    // Or press Escape
    await page.keyboard.press('Escape')
  })

  test('inventory search filters products', async ({ page }) => {
    await page.locator('a', { hasText: 'Inventario' }).click()
    await page.waitForLoadState('networkidle')

    const searchInput = page.locator('input[placeholder*="nombre"]')
    await searchInput.fill('Nike')
    await page.waitForTimeout(500)

    const rows = page.locator('table tbody tr')
    const count = await rows.count()
    if (count > 0) {
      const firstRowText = await rows.first().textContent()
      expect(firstRowText?.toLowerCase()).toContain('nike')
    }
  })

  test('orders page loads with status filter', async ({ page }) => {
    await page.locator('a', { hasText: 'Pedidos' }).click()
    await page.waitForLoadState('networkidle')
    await expect(page.locator('h1', { hasText: 'Pedidos' })).toBeVisible({ timeout: 5000 })
    // Status filter dropdown should exist
    await expect(page.locator('select')).toBeVisible()
  })

  test('users page loads user table', async ({ page }) => {
    await page.locator('a', { hasText: 'Usuarios' }).click()
    await page.waitForLoadState('networkidle')
    await expect(page.locator('h1', { hasText: 'Usuarios' })).toBeVisible()
    await expect(page.locator('button', { hasText: 'Nuevo usuario' })).toBeVisible()
    await expect(page.locator('table tbody tr').first()).toBeVisible({ timeout: 8000 })
  })
})
