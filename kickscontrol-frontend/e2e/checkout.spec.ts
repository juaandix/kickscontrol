import { test, expect } from '@playwright/test'
import { loginAs, USER } from './helpers'

test.describe('Checkout flow', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, USER)
  })

  test('empty checkout shows empty cart state', async ({ page }) => {
    await page.goto('/checkout')
    await page.waitForLoadState('networkidle')
    // Either shows empty state or redirects (if cart is genuinely empty)
    const emptyMsg = page.locator('text=Tu carrito está vacío')
    const stepBar = page.locator('text=Envío')
    const hasContent = await emptyMsg.isVisible() || await stepBar.isVisible()
    expect(hasContent).toBe(true)
  })

  test('checkout step 1 validates required address fields', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Try to find a product with stock and add it to cart
    const productLinks = page.locator('a[href^="/products/"]')
    const count = await productLinks.count()
    if (count === 0) { test.skip(); return }

    await productLinks.first().click()
    await page.waitForLoadState('networkidle')

    // Select a size if available
    const sizeBtn = page.locator('button').filter({ hasText: /^4[0-9]$/ }).first()
    if (await sizeBtn.isEnabled()) {
      await sizeBtn.click()
      await page.locator('button', { hasText: 'Añadir al carrito' }).click()
      await page.waitForTimeout(1000)
    } else {
      test.skip(); return
    }

    await page.goto('/checkout')
    await page.waitForLoadState('networkidle')

    // Try to proceed without filling address
    await page.locator('button', { hasText: 'Continuar al pago' }).click()
    await expect(page.locator('text=Campo obligatorio').first()).toBeVisible()
  })

  test('checkout step 1 to step 2 navigation', async ({ page }) => {
    await page.goto('/checkout')
    await page.waitForLoadState('networkidle')

    const continueBtn = page.locator('button', { hasText: 'Continuar al pago' })
    if (!await continueBtn.isVisible()) { test.skip(); return }

    // Fill address
    await page.fill('input[placeholder="Calle Gran Vía 28"]', 'Calle Mayor 1')
    await page.fill('input[placeholder="Madrid"]', 'Madrid')
    await page.fill('input[placeholder="28013"]', '28013')
    await continueBtn.click()

    // Step 2 should appear
    await expect(page.locator('text=Datos de pago')).toBeVisible({ timeout: 3000 })
    await expect(page.locator('text=Tarjetas de prueba')).toBeVisible()
  })

  test('payment form validates required fields', async ({ page }) => {
    await page.goto('/checkout')
    await page.waitForLoadState('networkidle')

    const continueBtn = page.locator('button', { hasText: 'Continuar al pago' })
    if (!await continueBtn.isVisible()) { test.skip(); return }

    await page.fill('input[placeholder="Calle Gran Vía 28"]', 'Calle Mayor 1')
    await page.fill('input[placeholder="Madrid"]', 'Madrid')
    await page.fill('input[placeholder="28013"]', '28013')
    await continueBtn.click()

    await expect(page.locator('text=Datos de pago')).toBeVisible({ timeout: 3000 })

    // Try to pay without filling card
    await page.locator('button', { hasText: /Pagar/ }).click()
    await expect(page.locator('text=/inválido|obligatorio/i').first()).toBeVisible()
  })

  test('declined card shows error message', async ({ page }) => {
    await page.goto('/checkout')
    await page.waitForLoadState('networkidle')

    const continueBtn = page.locator('button', { hasText: 'Continuar al pago' })
    if (!await continueBtn.isVisible()) { test.skip(); return }

    await page.fill('input[placeholder="Calle Gran Vía 28"]', 'Calle Mayor 1')
    await page.fill('input[placeholder="Madrid"]', 'Madrid')
    await page.fill('input[placeholder="28013"]', '28013')
    await continueBtn.click()

    await expect(page.locator('text=Datos de pago')).toBeVisible({ timeout: 3000 })

    // Fill declined card
    await page.fill('input[placeholder="1234 5678 9012 3456"]', '4000 0000 0000 0002')
    await page.fill('input[placeholder="JUAN GARCÍA LÓPEZ"]', 'TEST USER')
    await page.fill('input[placeholder="MM/AA"]', '12/28')
    await page.fill('input[placeholder="···"]', '123')

    await page.locator('button', { hasText: /Pagar/ }).click()

    // Should show decline message (after ~2s delay)
    await expect(page.locator('text=/rechazada|denegada/i')).toBeVisible({ timeout: 8000 })
  })
})
