export interface PaymentResult {
  success: boolean
  transactionId?: string
  errorCode?: 'DECLINED' | 'INSUFFICIENT_FUNDS' | 'EXPIRED_CARD' | 'INVALID_CARD'
  errorMessage?: string
}

export interface PaymentData {
  cardNumber: string
  cardName: string
  expiry: string
  cvv: string
}

// Specific test numbers that trigger declines
const DECLINE_MAP: Record<string, PaymentResult['errorCode']> = {
  '4000000000000002': 'DECLINED',
  '4000000000009995': 'INSUFFICIENT_FUNDS',
  '4000000000000069': 'EXPIRED_CARD',
}

function randomTransactionId(): string {
  return 'TXN-' + Math.random().toString(36).slice(2, 10).toUpperCase() + '-' + Date.now().toString(36).toUpperCase()
}

export function getCardType(number: string): 'visa' | 'mastercard' | 'amex' | 'unknown' {
  const clean = number.replace(/\s/g, '')
  if (/^4/.test(clean)) return 'visa'
  if (/^5[1-5]/.test(clean) || /^2(2[2-9]|[3-6]|7[01])/.test(clean)) return 'mastercard'
  if (/^3[47]/.test(clean)) return 'amex'
  return 'unknown'
}

export function formatCardNumber(value: string): string {
  const clean = value.replace(/\D/g, '')
  const type = getCardType(clean)
  if (type === 'amex') {
    return clean.replace(/(\d{4})(\d{6})(\d{5})/, '$1 $2 $3').trim()
  }
  return clean.replace(/(\d{4})(?=\d)/g, '$1 ').trim()
}

export function formatExpiry(value: string): string {
  const clean = value.replace(/\D/g, '')
  if (clean.length >= 3) {
    return clean.slice(0, 2) + '/' + clean.slice(2, 4)
  }
  return clean
}

export function validateCard(data: PaymentData): string | null {
  const clean = data.cardNumber.replace(/\s/g, '')
  if (clean.length < 13) return 'Número de tarjeta inválido'
  if (!data.cardName.trim()) return 'El nombre del titular es obligatorio'
  const [mm, yy] = data.expiry.split('/')
  if (!mm || !yy || mm.length !== 2 || yy.length !== 2) return 'Fecha de caducidad inválida'
  const month = parseInt(mm)
  const year = 2000 + parseInt(yy)
  const now = new Date()
  if (month < 1 || month > 12) return 'Mes inválido'
  if (year < now.getFullYear() || (year === now.getFullYear() && month < now.getMonth() + 1)) {
    return 'Tarjeta caducada'
  }
  if (data.cvv.length < 3) return 'CVV inválido'
  return null
}

export async function simulatePayment(data: PaymentData): Promise<PaymentResult> {
  const clean = data.cardNumber.replace(/\s/g, '')

  // Simulate network delay (1.5–2.5s)
  await new Promise(r => setTimeout(r, 1500 + Math.random() * 1000))

  const declineCode = DECLINE_MAP[clean]
  if (declineCode) {
    const messages: Record<string, string> = {
      DECLINED: 'Tarjeta rechazada. Contacta con tu banco.',
      INSUFFICIENT_FUNDS: 'Fondos insuficientes.',
      EXPIRED_CARD: 'La tarjeta está caducada.',
      INVALID_CARD: 'Tarjeta inválida.',
    }
    return { success: false, errorCode: declineCode, errorMessage: messages[declineCode] }
  }

  return { success: true, transactionId: randomTransactionId() }
}
