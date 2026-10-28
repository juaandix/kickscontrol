import { describe, it, expect } from 'vitest'
import { looksLikeSku } from '@/lib/store'

describe('looksLikeSku', () => {
  it('treats a scanned box reference as a SKU', () => {
    expect(looksLikeSku('NK-AM90-42-WB')).toBe(true)
    expect(looksLikeSku('kc-windb-xl-rwb')).toBe(true)
    expect(looksLikeSku('  AD-SS-39-WG  ')).toBe(true)
  })

  it('treats model names as a search', () => {
    expect(looksLikeSku('air max')).toBe(false)
    expect(looksLikeSku('2002R')).toBe(false)
    expect(looksLikeSku('Gel-Kinsei')).toBe(false)
  })
})
