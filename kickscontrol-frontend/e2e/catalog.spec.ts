import { test, expect } from '@playwright/test'

test.describe('Catalog', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
  })

  test('hero section is visible', async ({ page }) => {
    await expect(page.locator('text=Las mejores zapatillas')).toBeVisible()
    await expect(page.locator('text=Ver catálogo')).toBeVisible()
  })

  test('category pills are visible and link to filtered catalog', async ({ page }) => {
    const runningLink = page.locator('a', { hasText: 'Running' }).first()
    await expect(runningLink).toBeVisible()
    await runningLink.click()
    await expect(page).toHaveURL(/category=RUNNING/)
  })

  test('products grid loads', async ({ page }) => {
    // Wait for at least one product card to appear
    await expect(page.locator('a[href^="/products/"]').first()).toBeVisible({ timeout: 8000 })
  })

  test('search filters products', async ({ page }) => {
    const searchInput = page.locator('input[type=search]')
    await expect(searchInput).toBeVisible()
    await searchInput.fill('Nike')
    await searchInput.press('Enter')
    await page.waitForURL(/search=Nike/)
    // Results should contain Nike products (or show no results)
    await page.waitForLoadState('networkidle')
    const cards = page.locator('a[href^="/products/"]')
    const count = await cards.count()
    // All visible products should mention Nike or show empty state
    if (count > 0) {
      const firstCardText = await cards.first().textContent()
      expect(firstCardText?.toLowerCase()).toContain('nike')
    }
  })

  test('brand filter chip works', async ({ page }) => {
    const brandChips = page.locator('button', { hasText: 'Adidas' })
    if (await brandChips.count() > 0) {
      await brandChips.first().click()
      await expect(page).toHaveURL(/brand=Adidas/)
    }
  })

  test('clear filters button resets URL', async ({ page }) => {
    await page.goto('/?brand=Nike')
    await page.waitForLoadState('networkidle')
    const clearBtn = page.locator('button', { hasText: 'Limpiar todo' })
    await expect(clearBtn).toBeVisible()
    await clearBtn.click()
    await expect(page).toHaveURL('/')
  })

  test('product card navigates to detail page', async ({ page }) => {
    await page.locator('a[href^="/products/"]').first().click()
    await expect(page).toHaveURL(/\/products\/\d+/)
    await expect(page.locator('button', { hasText: /carrito|talla/i }).first()).toBeVisible({ timeout: 6000 })
  })
})
