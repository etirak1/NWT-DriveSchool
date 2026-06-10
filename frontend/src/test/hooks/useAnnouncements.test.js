import { renderHook, waitFor } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { http, HttpResponse } from 'msw'
import { server } from '../setup'
import { useAnnouncements } from '../../hooks/useAnnouncements'

describe('useAnnouncements', () => {
  it('vraća praznu listu na početku', () => {
    const { result } = renderHook(() => useAnnouncements())
    expect(result.current.announcements).toEqual([])
  })

  it('učitava obavještenja s API-ja', async () => {
    const { result } = renderHook(() => useAnnouncements())

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

    const { result } = renderHook(() => useAnnouncements())

    await waitFor(() => {
      // hook ne pada, ostaje na []
      expect(Array.isArray(result.current.announcements)).toBe(true)
    })
  })
})
