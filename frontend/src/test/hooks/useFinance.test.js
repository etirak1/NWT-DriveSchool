import React from 'react'
import { renderHook, waitFor } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useFinance } from '../../hooks/useFinance'

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return ({ children }) => React.createElement(QueryClientProvider, { client: queryClient }, children)
}

describe('useFinance', () => {
  it('vraća početne null/[] vrijednosti bez candidateId', () => {
    const { result } = renderHook(() => useFinance(null), { wrapper: createWrapper() })
    expect(result.current.financeStatus).toBeNull()
    expect(result.current.payments).toEqual([])
  })

  it('ne poziva API kada je candidateId undefined', () => {
    const { result } = renderHook(() => useFinance(undefined), { wrapper: createWrapper() })
    expect(result.current.financeStatus).toBeNull()
    expect(result.current.payments).toEqual([])
  })

  it('učitava financeStatus za proslijeđeni candidateId', async () => {
    const { result } = renderHook(() => useFinance(42), { wrapper: createWrapper() })

    await waitFor(() => {
      expect(result.current.financeStatus).not.toBeNull()
    })

    expect(result.current.financeStatus.totalAmount).toBe(1200)
    expect(result.current.financeStatus.paidAmount).toBe(600)
    expect(result.current.financeStatus.remainingDebt).toBe(600)
    expect(result.current.financeStatus.enrollmentEligible).toBe(true)
    expect(result.current.financeStatus.examEligible).toBe(false)
  })

  it('učitava listu uplata', async () => {
    const { result } = renderHook(() => useFinance(42), { wrapper: createWrapper() })

    await waitFor(() => {
      expect(result.current.payments).toHaveLength(2)
    })

    expect(result.current.payments[0].amount).toBe(300)
    expect(result.current.payments[1].amount).toBe(300)
  })
})
