import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { StockBadge } from '@/components/ui/StockBadge'

describe('StockBadge', () => {
  it('renders "Agotado" when stock is 0', () => {
    render(<StockBadge stock={0} />)
    expect(screen.getByText('Agotado')).toBeInTheDocument()
  })

  it('renders "Últimas unidades" when stock is at the low threshold', () => {
    render(<StockBadge stock={5} />)
    expect(screen.getByText('Últimas unidades')).toBeInTheDocument()
  })

  it('renders "Últimas unidades" when stock is below the threshold', () => {
    render(<StockBadge stock={2} />)
    expect(screen.getByText('Últimas unidades')).toBeInTheDocument()
  })

  it('renders nothing when stock is above the threshold', () => {
    const { container } = render(<StockBadge stock={10} />)
    expect(container).toBeEmptyDOMElement()
  })

  it('uses custom lowThreshold', () => {
    render(<StockBadge stock={8} lowThreshold={10} />)
    expect(screen.getByText('Últimas unidades')).toBeInTheDocument()
  })

  it('renders nothing when stock equals custom threshold + 1', () => {
    const { container } = render(<StockBadge stock={11} lowThreshold={10} />)
    expect(container).toBeEmptyDOMElement()
  })

  it('"Agotado" badge has neutral styling', () => {
    render(<StockBadge stock={0} />)
    const badge = screen.getByText('Agotado')
    expect(badge).toHaveClass('text-neutral-500')
  })

  it('"Últimas unidades" badge has orange styling', () => {
    render(<StockBadge stock={3} />)
    const badge = screen.getByText('Últimas unidades')
    expect(badge).toHaveClass('text-orange-700')
  })
})
