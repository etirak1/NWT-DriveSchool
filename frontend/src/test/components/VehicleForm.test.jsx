import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import VehicleForm from '../../components/VehicleForm'

const VALID = {
  brand: 'Volkswagen',
  model: 'Golf',
  registrationNumber: 'ABC-D-123',
  registrationDate: '2022-05-10',
  status: 'ACTIVE',
  lastTechnicalInspection: '2023-06-15',
}

async function fillValidForm() {
  await userEvent.type(screen.getByPlaceholderText('npr. Volkswagen'), VALID.brand)
  await userEvent.type(screen.getByPlaceholderText('npr. Golf'), VALID.model)
  await userEvent.type(screen.getByPlaceholderText('npr. ABC-D-123'), VALID.registrationNumber)

  const dateInputs = document.querySelectorAll('input[type="date"]')
  fireEvent.change(dateInputs[0], { target: { value: VALID.registrationDate } })
  fireEvent.change(dateInputs[1], { target: { value: VALID.lastTechnicalInspection } })
}

describe('VehicleForm — validacija', () => {
  let onSubmit
  let onCancel

  beforeEach(() => {
    onSubmit = vi.fn()
    onCancel = vi.fn()
    render(<VehicleForm onSubmit={onSubmit} onCancel={onCancel} loading={false} />)
  })

  it('prikazuje grešku kada je marka prazna', async () => {
    fireEvent.click(screen.getByText('Sačuvaj vozilo'))
    await waitFor(() => {
      expect(screen.getByText('Marka je obavezna.')).toBeInTheDocument()
    })
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('prikazuje grešku kada je model prazan', async () => {
    await userEvent.type(screen.getByPlaceholderText('npr. Volkswagen'), 'BMW')
    fireEvent.click(screen.getByText('Sačuvaj vozilo'))
    await waitFor(() => {
      expect(screen.getByText('Model je obavezan.')).toBeInTheDocument()
    })
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('prikazuje grešku za pogrešan format registarskog broja', async () => {
    await userEvent.type(screen.getByPlaceholderText('npr. Volkswagen'), 'BMW')
    await userEvent.type(screen.getByPlaceholderText('npr. Golf'), 'X5')
    await userEvent.type(screen.getByPlaceholderText('npr. ABC-D-123'), 'POGRESANFORMAT')
    fireEvent.click(screen.getByText('Sačuvaj vozilo'))
    await waitFor(() => {
      expect(screen.getByText(/Format mora biti/)).toBeInTheDocument()
    })
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('prikazuje grešku kada datum registracije nije unesen', async () => {
    await userEvent.type(screen.getByPlaceholderText('npr. Volkswagen'), 'BMW')
    await userEvent.type(screen.getByPlaceholderText('npr. Golf'), 'X5')
    await userEvent.type(screen.getByPlaceholderText('npr. ABC-D-123'), 'ABC-D-123')
    fireEvent.click(screen.getByText('Sačuvaj vozilo'))
    await waitFor(() => {
      expect(screen.getByText('Datum registracije je obavezan.')).toBeInTheDocument()
    })
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('prikazuje grešku za datum registracije u budućnosti', async () => {
    await userEvent.type(screen.getByPlaceholderText('npr. Volkswagen'), 'BMW')
    await userEvent.type(screen.getByPlaceholderText('npr. Golf'), 'X5')
    await userEvent.type(screen.getByPlaceholderText('npr. ABC-D-123'), 'ABC-D-123')
    const dateInputs = document.querySelectorAll('input[type="date"]')
    fireEvent.change(dateInputs[0], { target: { value: '2099-01-01' } })
    fireEvent.click(screen.getByText('Sačuvaj vozilo'))
    await waitFor(() => {
      expect(screen.getByText(/ne može biti u budućnosti/)).toBeInTheDocument()
    })
    expect(onSubmit).not.toHaveBeenCalled()
  })
})

describe('VehicleForm — uspješno slanje', () => {
  it('poziva onSubmit sa ispravnim podacima', async () => {
    const onSubmit = vi.fn()
    render(<VehicleForm onSubmit={onSubmit} onCancel={vi.fn()} loading={false} />)
    await fillValidForm()
    fireEvent.click(screen.getByText('Sačuvaj vozilo'))
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledOnce()
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          brand: 'Volkswagen',
          model: 'Golf',
          registrationNumber: 'ABC-D-123',
        })
      )
    })
  })

  it('poziva onCancel kada se klikne Odustani', () => {
    const onCancel = vi.fn()
    render(<VehicleForm onSubmit={vi.fn()} onCancel={onCancel} loading={false} />)
    fireEvent.click(screen.getByText('Odustani'))
    expect(onCancel).toHaveBeenCalledOnce()
  })
})

describe('VehicleForm — initial prop', () => {
  it('popunjava formu kada je proslijeđen initial', () => {
    render(<VehicleForm initial={VALID} onSubmit={vi.fn()} onCancel={vi.fn()} loading={false} />)
    expect(screen.getByDisplayValue('Volkswagen')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Golf')).toBeInTheDocument()
    expect(screen.getByDisplayValue('ABC-D-123')).toBeInTheDocument()
  })

  it('dugme je disabled dok loading=true', () => {
    render(<VehicleForm onSubmit={vi.fn()} onCancel={vi.fn()} loading={true} />)
    expect(screen.getByText('Čuvanje...')).toBeDisabled()
  })
})
