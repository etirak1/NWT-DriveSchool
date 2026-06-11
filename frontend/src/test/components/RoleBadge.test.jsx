import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import RoleBadge from '../../components/RoleBadge'

describe('RoleBadge', () => {
  it('prikazuje ADMIN ulogu', () => {
    render(<RoleBadge role="ADMIN" />)
    expect(screen.getByText('ADMIN')).toBeInTheDocument()
  })

  it('prikazuje INSTRUCTOR ulogu', () => {
    render(<RoleBadge role="INSTRUCTOR" />)
    expect(screen.getByText('INSTRUCTOR')).toBeInTheDocument()
  })

  it('prikazuje CANDIDATE ulogu', () => {
    render(<RoleBadge role="CANDIDATE" />)
    expect(screen.getByText('CANDIDATE')).toBeInTheDocument()
  })

  it('prikazuje — kada je role undefined', () => {
    render(<RoleBadge role={undefined} />)
    expect(screen.getByText('—')).toBeInTheDocument()
  })

  it('prikazuje — kada je role null', () => {
    render(<RoleBadge role={null} />)
    expect(screen.getByText('—')).toBeInTheDocument()
  })

  it('prikazuje nepoznatu ulogu bez pada', () => {
    render(<RoleBadge role="CUSTOM_ROLE" />)
    expect(screen.getByText('CUSTOM_ROLE')).toBeInTheDocument()
  })
})
