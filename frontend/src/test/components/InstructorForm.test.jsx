import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import InstructorForm from '../../components/InstructorForm'

describe('InstructorForm — validacija', () => {
  let onSubmit

  beforeEach(() => {
    onSubmit = vi.fn()
    render(<InstructorForm onSubmit={onSubmit} onCancel={vi.fn()} loading={false} />)
  })

  it('prikazuje grešku kada User ID nije unesen', async () => {
    fireEvent.click(screen.getByText('Sačuvaj instruktora'))
    await waitFor(() => {
      expect(screen.getByText('User ID je obavezan.')).toBeInTheDocument()
    })
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('prikazuje grešku kada User ID nije broj', async () => {
    await userEvent.type(screen.getByPlaceholderText('npr. 1'), 'abc')
    fireEvent.click(screen.getByText('Sačuvaj instruktora'))
    await waitFor(() => {
      expect(screen.getByText('User ID mora biti pozitivan cijeli broj.')).toBeInTheDocument()
    })
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('prikazuje grešku kada je User ID 0 ili negativan', async () => {
    await userEvent.type(screen.getByPlaceholderText('npr. 1'), '0')
    fireEvent.click(screen.getByText('Sačuvaj instruktora'))
    await waitFor(() => {
      expect(screen.getByText('User ID mora biti veći od 0.')).toBeInTheDocument()
    })
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('prikazuje grešku kada je napomena prazna', async () => {
    await userEvent.type(screen.getByPlaceholderText('npr. 1'), '5')
    fireEvent.click(screen.getByText('Sačuvaj instruktora'))
    await waitFor(() => {
      expect(screen.getByText('Napomena o dostupnosti je obavezna.')).toBeInTheDocument()
    })
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('prikazuje grešku kada je napomena kraća od 3 karaktera', async () => {
    await userEvent.type(screen.getByPlaceholderText('npr. 1'), '5')
    await userEvent.type(screen.getByPlaceholderText('npr. Dostupan pon-pet 9-17'), 'AB')
    fireEvent.click(screen.getByText('Sačuvaj instruktora'))
    await waitFor(() => {
      expect(screen.getByText('Napomena mora imati najmanje 3 karaktera.')).toBeInTheDocument()
    })
    expect(onSubmit).not.toHaveBeenCalled()
  })
})

describe('InstructorForm — uspješno slanje', () => {
  it('poziva onSubmit sa ispravnim podacima', async () => {
    const onSubmit = vi.fn()
    render(<InstructorForm onSubmit={onSubmit} onCancel={vi.fn()} loading={false} />)

    await userEvent.type(screen.getByPlaceholderText('npr. 1'), '7')
    await userEvent.type(screen.getByPlaceholderText('npr. Dostupan pon-pet 9-17'), 'Dostupan pon-pet')

    fireEvent.click(screen.getByText('Sačuvaj instruktora'))

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledOnce()
      expect(onSubmit).toHaveBeenCalledWith({
        userId: 7,
        availabilityNote: 'Dostupan pon-pet',
      })
    })
  })

  it('poziva onCancel kada se klikne Odustani', () => {
    const onCancel = vi.fn()
    render(<InstructorForm onSubmit={vi.fn()} onCancel={onCancel} loading={false} />)
    fireEvent.click(screen.getByText('Odustani'))
    expect(onCancel).toHaveBeenCalledOnce()
  })
})

describe('InstructorForm — initial prop', () => {
  it('popunjava formu kada je proslijeđen initial', () => {
    const initial = { userId: 3, availabilityNote: 'Dostupan petkom' }
    render(<InstructorForm initial={initial} onSubmit={vi.fn()} onCancel={vi.fn()} loading={false} />)
    expect(screen.getByDisplayValue('3')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Dostupan petkom')).toBeInTheDocument()
  })

  it('dugme je disabled dok loading=true', () => {
    render(<InstructorForm onSubmit={vi.fn()} onCancel={vi.fn()} loading={true} />)
    expect(screen.getByText('Čuvanje...')).toBeDisabled()
  })
})
