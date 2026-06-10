import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import StatusBadge from '../../components/StatusBadge'

describe('StatusBadge', () => {
  it('prikazuje ACTIVE status', () => {
    render(<StatusBadge status="ACTIVE" />)
    expect(screen.getByText('ACTIVE')).toBeInTheDocument()
  })

  it('prikazuje INACTIVE status', () => {
    render(<StatusBadge status="INACTIVE" />)
    expect(screen.getByText('INACTIVE')).toBeInTheDocument()
  })

  it('prikazuje — kada je status undefined', () => {
    render(<StatusBadge status={undefined} />)
    expect(screen.getByText('—')).toBeInTheDocument()
  })

  it('prikazuje — kada je status null', () => {
    render(<StatusBadge status={null} />)
    expect(screen.getByText('—')).toBeInTheDocument()
  })

  it('prikazuje nepoznat status bez pada', () => {
    render(<StatusBadge status="PENDING" />)
    expect(screen.getByText('PENDING')).toBeInTheDocument()
  })
})
