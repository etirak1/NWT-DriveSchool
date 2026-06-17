import React from 'react'
import { renderHook, waitFor } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { http, HttpResponse } from 'msw'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { server } from '../setup'
import { useAnnouncements } from '../../hooks/useAnnouncements'

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return ({ children }) => React.createElement(QueryClientProvider, { client: queryClient }, children)
}

describe('useAnnouncements', () => {
  it('vraća praznu listu na početku', () => {
    const { result } = renderHook(() => useAnnouncements(), { wrapper: createWrapper() })
    expect(result.current.announcements).toEqual([])
  })

  it('učitava obavještenja s API-ja', async () => {
    const { result } = renderHook(() => useAnnouncements(), { wrapper: createWrapper() })

    await waitFor(() => {
      expect(result.current.announcements).toHaveLength(1)
    })

    expect(result.current.announcements[0].title).toBe('Obavještenje 1')
  })

  it('vraća praznu listu kada API vrati grešku', async () => {
    server.use(
      http.get('http://localhost:8080/api/announcements', () =>
        HttpResponse.json({ message: 'Error' }, { status: 500 })
      )
    )

    const { result } = renderHook(() => useAnnouncements(), { wrapper: createWrapper() })

    await waitFor(() => {
      expect(Array.isArray(result.current.announcements)).toBe(true)
    })
  })
})
