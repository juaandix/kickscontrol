import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { KpiCard, KpiCardSkeleton } from '@/components/backoffice/KpiCard'

describe('KpiCard', () => {
  it('renders title and value', () => {
    render(<KpiCard title="Ingresos totales" value="€1.234,56" />)

    expect(screen.getByText('Ingresos totales')).toBeInTheDocument()
    expect(screen.getByText('€1.234,56')).toBeInTheDocument()
  })

  it('renders subtitle when provided', () => {
    render(<KpiCard title="Pedidos" value="42" subtitle="últimos 30 días" />)
    expect(screen.getByText('últimos 30 días')).toBeInTheDocument()
  })

  it('does not render subtitle element when omitted', () => {
    render(<KpiCard title="Pedidos" value="42" />)
    expect(screen.queryByText('últimos 30 días')).not.toBeInTheDocument()
  })

  it('prints the value in alarm red when flagged', () => {
    render(<KpiCard title="Alertas" value="29" alert />)
    expect(screen.getByText('29')).toHaveClass('text-alarm')
  })

  it('keeps the value in ink by default', () => {
    render(<KpiCard title="Pedidos" value="42" />)
    expect(screen.getByText('42')).not.toHaveClass('text-alarm')
  })
})

describe('KpiCardSkeleton', () => {
  it('renders skeleton placeholder', () => {
    const { container } = render(<KpiCardSkeleton />)
    expect(container.firstChild).toBeInTheDocument()
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument()
  })
})
