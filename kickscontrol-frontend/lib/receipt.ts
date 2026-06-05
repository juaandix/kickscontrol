import type { OrderDto } from './cart'

export interface ReceiptPaymentInfo {
  transactionId: string
  cardLast4: string
  cardType: string
  paidAt: string
}

export async function downloadReceipt(order: OrderDto, userName: string, payment: ReceiptPaymentInfo) {
  const { jsPDF } = await import('jspdf')
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })

  const W = 210
  const margin = 20
  let y = 0

  // ── Header ──────────────────────────────────────────────
  doc.setFillColor(20, 20, 20)
  doc.rect(0, 0, W, 40, 'F')

  doc.setFontSize(22)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(255, 255, 255)
  doc.text('KICKS', margin, 22)

  doc.setTextColor(249, 115, 22) // orange-500
  doc.text('CONTROL', margin + 30, 22)

  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(180, 180, 180)
  doc.text('Recibo de compra', W - margin, 22, { align: 'right' })

  y = 55

  // ── Recibo info ──────────────────────────────────────────
  doc.setTextColor(30, 30, 30)
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text(`Pedido #${order.id}`, margin, y)

  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(100, 100, 100)
  doc.text(new Date(order.createdAt).toLocaleDateString('es-ES', {
    day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
  }), margin, y + 6)

  doc.setTextColor(30, 30, 30)
  doc.setFontSize(9)
  doc.text(`Cliente: ${userName}`, W - margin, y, { align: 'right' })
  doc.setTextColor(100, 100, 100)
  doc.text(`TX: ${payment.transactionId}`, W - margin, y + 6, { align: 'right' })

  y += 20

  // ── Divider ──────────────────────────────────────────────
  doc.setDrawColor(230, 230, 230)
  doc.setLineWidth(0.3)
  doc.line(margin, y, W - margin, y)
  y += 10

  // ── Items header ─────────────────────────────────────────
  doc.setFillColor(248, 248, 248)
  doc.rect(margin, y - 4, W - margin * 2, 10, 'F')

  doc.setFontSize(8)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(80, 80, 80)
  doc.text('PRODUCTO', margin + 2, y + 2)
  doc.text('TALLA', margin + 90, y + 2)
  doc.text('COLOR', margin + 110, y + 2)
  doc.text('UDS', margin + 140, y + 2)
  doc.text('IMPORTE', W - margin - 2, y + 2, { align: 'right' })
  y += 12

  // ── Items ────────────────────────────────────────────────
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(30, 30, 30)

  for (const item of order.items) {
    if (y > 240) { doc.addPage(); y = 20 }

    doc.setFontSize(9)
    doc.setFont('helvetica', 'bold')
    const name = item.productName.length > 30 ? item.productName.slice(0, 28) + '…' : item.productName
    doc.text(name, margin + 2, y)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    doc.setTextColor(100, 100, 100)
    doc.text(item.productBrand, margin + 2, y + 5)

    doc.setTextColor(30, 30, 30)
    doc.setFontSize(9)
    doc.text(item.size, margin + 90, y)
    doc.text(item.color, margin + 110, y)
    doc.text(`×${item.quantity}`, margin + 140, y)
    doc.text(`${item.subtotal.toFixed(2)} €`, W - margin - 2, y, { align: 'right' })

    doc.setDrawColor(240, 240, 240)
    doc.line(margin, y + 8, W - margin, y + 8)
    y += 14
  }

  y += 4

  // ── Totals ───────────────────────────────────────────────
  const totalsX = W - margin - 60

  doc.setFontSize(9)
  doc.setTextColor(100, 100, 100)
  doc.text('Subtotal', totalsX, y)
  doc.setTextColor(30, 30, 30)
  doc.text(`${order.totalAmount.toFixed(2)} €`, W - margin - 2, y, { align: 'right' })
  y += 7

  doc.setTextColor(100, 100, 100)
  doc.text('Envío', totalsX, y)
  doc.setTextColor(34, 197, 94)
  doc.text('Gratis', W - margin - 2, y, { align: 'right' })
  y += 3

  doc.setDrawColor(200, 200, 200)
  doc.line(totalsX - 2, y, W - margin, y)
  y += 7

  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(30, 30, 30)
  doc.text('TOTAL', totalsX, y)
  doc.setTextColor(249, 115, 22)
  doc.text(`${order.totalAmount.toFixed(2)} €`, W - margin - 2, y, { align: 'right' })
  y += 16

  // ── Payment info ─────────────────────────────────────────
  doc.setFillColor(255, 247, 237)
  doc.roundedRect(margin, y - 4, W - margin * 2, 28, 3, 3, 'F')

  doc.setFontSize(8)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(194, 65, 12)
  doc.text('PAGO CONFIRMADO', margin + 5, y + 4)

  doc.setFont('helvetica', 'normal')
  doc.setTextColor(60, 60, 60)
  doc.text(`Método: ${payment.cardType} ···· ${payment.cardLast4}`, margin + 5, y + 12)
  doc.text(`Fecha: ${new Date(payment.paidAt).toLocaleString('es-ES')}`, margin + 5, y + 18)
  doc.text(`ID transacción: ${payment.transactionId}`, W - margin - 5, y + 12, { align: 'right' })

  y += 40

  // ── Shipping address ─────────────────────────────────────
  doc.setFontSize(8)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(100, 100, 100)
  doc.text('DIRECCIÓN DE ENTREGA', margin, y)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(40, 40, 40)
  doc.text(order.shippingAddress, margin, y + 6)
  y += 20

  // ── Footer ───────────────────────────────────────────────
  doc.setFillColor(248, 248, 248)
  doc.rect(0, 280, W, 17, 'F')
  doc.setFontSize(7)
  doc.setTextColor(150, 150, 150)
  doc.text('KicksControl — Proyecto de portfolio · Este documento es un recibo simulado', W / 2, 289, { align: 'center' })

  doc.save(`recibo-kickscontrol-${order.id}.pdf`)
}
