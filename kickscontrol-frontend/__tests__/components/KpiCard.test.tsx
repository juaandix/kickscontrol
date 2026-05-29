import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { KpiCard, KpiCardSkeleton } from '@/components/backoffice/KpiCard'

const mockIcon = <svg data-testid="icon" />

describe('KpiCard', () => {
  it('renders title and value', () => {
    render(<KpiCard title="Ingresos totales" value="€1.234,56" icon={mockIcon} />)

    expect(screen.getByText('Ingresos totales')).toBeInTheDocument()
    expect(screen.getByText('€1.234,56')).toBeInTheDocument()
  })

  it('renders subtitle when provided', () => {
    render(
      <KpiCard title="Pedidos" value="42" subtitle="últimos 30 días" icon={mockIcon} />
    )
    expect(screen.getByText('últimos 30 días')).toBeInTheDocument()
  })

  it('does not render subtitle element when omitted', () => {
    render(<KpiCard title="Pedidos" value="42" icon={mockIcon} />)
    expect(screen.queryByText('últimos 30 días')).not.toBeInTheDocument()
  })

  it('renders the icon', () => {
    render(<KpiCard title="Test" value="0" icon={mockIcon} />)
    expect(screen.getByTestId('icon')).toBeInTheDocument()
  })

  it('applies default accent color class', () => {
    const { container } = render(
      <KpiCard title="Test" value="0" icon={mockIcon} />
    )
    expect(container.querySelector('.bg-orange-100')).toBeInTheDocument()
  })

  it('applies custom accent color class', () => {
    const { container } = render(
      <KpiCard title="Test" value="0" icon={mockIcon} accentColor="bg-green-100 text-green-600" />
    )
    expect(container.querySelector('.bg-green-100')).toBeInTheDocument()
  })
})

describe('KpiCardSkeleton', () => {
  it('renders skeleton placeholder', () => {
    const { container } = render(<KpiCardSkeleton />)
    expect(container.firstChild).toBeInTheDocument()
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument()
  })
})
