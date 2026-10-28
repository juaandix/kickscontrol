// Capturas del portfolio: tienda online, backoffice y tienda física.
//
//   BASE=http://localhost:3000 node scripts/capturas-portfolio.mjs [--con-venta]
//
// Necesita la API y el frontend arrancados con el seed (cuentas de demo). Mejor contra
// `next build && next start`, que no pinta los indicadores del modo desarrollo.
// Solo lee datos, salvo con --con-venta: entonces cobra una venta real en la caja
// (descuenta stock) para capturar el ticket cobrado.

import { chromium } from 'playwright'
import { mkdir } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const BASE = process.env.BASE ?? 'http://localhost:3000'
const OUT = process.env.OUT ?? path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../docs/capturas')
const WITH_SALE = process.argv.includes('--con-venta')

const DESKTOP = { width: 1440, height: 900 }
const TABLET = { width: 1180, height: 820 }
const MOBILE = { width: 390, height: 844 }

const ADMIN = ['admin@kickscontrol.com', 'Admin1234!']
const SHIFT_LEADER = ['shiftleader@kickscontrol.com', 'Admin1234!']
const CUSTOMER = ['cliente@kickscontrol.com', 'User1234!']

await mkdir(OUT, { recursive: true })
const browser = await chromium.launch()
let count = 0

async function page(viewport, account) {
  const ctx = await browser.newContext({ viewport, deviceScaleFactor: 2, locale: 'es-ES' })
  const p = await ctx.newPage()
  if (account) {
    await p.goto(`${BASE}/login`)
    await p.fill('input[type=email]', account[0])
    await p.fill('input[type=password]', account[1])
    await p.click('button[type=submit]')
    await p.waitForURL(u => !u.pathname.startsWith('/login'))
  }
  return p
}

async function shot(p, name, { full = false, settle = 1200 } = {}) {
  await p.waitForTimeout(settle)
  await p.screenshot({ path: path.join(OUT, `${name}.png`), fullPage: full })
  count++
  console.log(`✓ ${name}`)
}

const go = (p, url) => p.goto(`${BASE}${url}`, { waitUntil: 'networkidle' })

// ── Tienda online ─────────────────────────────────────────────────────────────
{
  const p = await page(DESKTOP)
  await go(p, '/'); await shot(p, '01-web-portada', { settle: 2500 })
  await p.evaluate(() => document.querySelector('#catalog')?.scrollIntoView())
  await shot(p, '02-web-catalogo')
  await go(p, '/categoria/running'); await shot(p, '03-web-categoria-running', { settle: 2500 })
  await go(p, '/categoria/skateboarding'); await shot(p, '04-web-categoria-skate', { settle: 2500 })
  await go(p, '/products/1')
  await p.locator('button[aria-label*="talla"]:not([disabled])').nth(2).click()
  await shot(p, '05-web-producto-talla')
  await p.context().close()
}
{
  const p = await page(DESKTOP, CUSTOMER)
  await go(p, '/')
  await p.locator('button[aria-label^="Abrir carrito"]').click()
  await shot(p, '06-web-cesta', { settle: 900 })
  await go(p, '/checkout')
  await p.fill('input[placeholder="Calle Gran Vía 28"]', 'Calle Gran Vía 42')
  await p.fill('input[placeholder="Madrid"]', 'Madrid')
  await p.fill('input[placeholder="28013"]', '28013')
  await p.getByRole('button', { name: /Continuar al pago/ }).click()
  await p.fill('input[placeholder="1234 5678 9012 3456"]', '4242 4242 4242 4242')
  await p.fill('input[placeholder="JUAN GARCÍA LÓPEZ"]', 'MARÍA LÓPEZ')
  await p.fill('input[placeholder="MM/AA"]', '12/28')
  await shot(p, '07-web-checkout-pago')
  await go(p, '/orders'); await shot(p, '08-web-mis-pedidos')
  await p.context().close()
}

// ── Backoffice ────────────────────────────────────────────────────────────────
{
  const p = await page(DESKTOP, ADMIN)
  await go(p, '/backoffice'); await shot(p, '09-backoffice-dashboard', { full: true, settle: 2500 })
  await p.getByRole('button', { name: 'Reponer' }).first().click()
  await shot(p, '10-backoffice-ajuste-stock', { settle: 1500 })
  await p.keyboard.press('Escape')
  await go(p, '/backoffice/inventory')
  await p.locator('tbody button[aria-expanded]').first().click()
  await shot(p, '11-backoffice-inventario-matriz')
  await go(p, '/backoffice/orders')
  await p.locator('tbody button[aria-expanded]').first().click()
  await shot(p, '12-backoffice-pedidos')
  await go(p, '/backoffice/users'); await shot(p, '13-backoffice-usuarios')
  await p.context().close()
}

// ── Tienda física ─────────────────────────────────────────────────────────────
{
  const p = await page(TABLET)
  await go(p, '/tienda'); await shot(p, '14-tienda-portada')
  await go(p, '/tienda/catalogo'); await shot(p, '15-tienda-catalogo', { settle: 2000 })
  await p.locator('ul[aria-label=Modelos] button').nth(3).click()
  await shot(p, '16-tienda-tallas', { settle: 1500 })
  await go(p, '/tienda/caja'); await shot(p, '17-tienda-acceso-personal')
  await p.context().close()
}
{
  const p = await page(TABLET, SHIFT_LEADER)
  await go(p, '/tienda/caja')
  await p.fill('#till-search', 'NK-AF1L-41-TW'); await p.keyboard.press('Enter'); await p.waitForTimeout(1200)
  await p.fill('#till-search', 'samba'); await p.waitForTimeout(1200)
  await p.locator('ul[aria-label=Resultados] button').first().click(); await p.waitForTimeout(1500)
  await p.locator('button[aria-label^="Talla "]:not([disabled])').nth(1).click()
  await p.getByRole('radio', { name: 'Efectivo' }).click()
  await p.locator('#till-cash').fill('250')
  await shot(p, '18-tienda-caja-ticket')
  if (WITH_SALE) {
    await p.getByRole('button', { name: /^Cobrar/ }).click()
    await shot(p, '19-tienda-caja-cobrado', { settle: 2000 })
  }
  await p.context().close()
}

// ── Móvil y tablet ────────────────────────────────────────────────────────────
{
  const p = await page(MOBILE)
  await go(p, '/'); await shot(p, '20-movil-portada', { settle: 2500 })
  await go(p, '/products/1'); await shot(p, '21-movil-producto')
  await p.context().close()
}
{
  const p = await page(MOBILE, ADMIN)
  await go(p, '/backoffice'); await shot(p, '22-movil-backoffice', { settle: 2500 })
  await p.context().close()
}
{
  const p = await page({ width: 820, height: 1180 }, SHIFT_LEADER)
  await go(p, '/tienda/catalogo'); await shot(p, '23-tablet-vertical-catalogo-tienda', { settle: 2000 })
  await p.context().close()
}

await browser.close()
console.log(`\n${count} capturas en ${OUT}`)
