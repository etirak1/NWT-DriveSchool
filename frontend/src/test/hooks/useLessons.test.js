import { renderHook, waitFor, act } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { http, HttpResponse } from 'msw'
import { server } from '../setup'
import { useLessons } from '../../hooks/useLessons'

describe('useLessons', () => {
  it('vraća prazne početne vrijednosti', () => {
    const { result } = renderHook(() => useLessons())
    expect(result.current.pageData.content).toEqual([])
    expect(result.current.pageData.totalPages).toBe(0)
    expect(result.current.pendingLessons).toEqual([])
  })

  it('učitava my-lessons nakon mount-a', async () => {
    server.use(
      http.get('http://localhost:8080/api/lessons/my-lessons', () =>
        HttpResponse.json({
          content: [
            { lessonId: 1, dateTime: '2024-06-01T10:00', status: 'ZAKAZANO', lessonType: 'VOŽNJA' },
            { lessonId: 2, dateTime: '2024-06-05T11:00', status: 'ODRAĐENO', lessonType: 'VOŽNJA' },
          ],
          totalPages: 1,
          number: 0,
        })
      )
    )

    const { result } = renderHook(() => useLessons())

    await waitFor(() => {
      expect(result.current.pageData.content).toHaveLength(2)
    })

    expect(result.current.pageData.totalPages).toBe(1)
    expect(result.current.pageData.content[0].lessonId).toBe(1)
  })

  it('učitava pending lessons', async () => {
    server.use(
      http.get('http://localhost:8080/api/lessons/pending', () =>
        HttpResponse.json([
          { lessonId: 5, dateTime: '2024-07-01T09:00', status: 'PENDING' },
        ])
      )
    )

    const { result } = renderHook(() => useLessons())

    await waitFor(() => {
      expect(result.current.pendingLessons).toHaveLength(1)
    })

    expect(result.current.pendingLessons[0].lessonId).toBe(5)
  })

  it('eksponira fetchLessons funkciju', () => {
    const { result } = renderHook(() => useLessons())
    expect(typeof result.current.fetchLessons).toBe('function')
  })

  it('eksponira respondToLesson funkciju', () => {
    const { result } = renderHook(() => useLessons())
    expect(typeof result.current.respondToLesson).toBe('function')
  })

  it('vraća prazan content kada API vrati grešku', async () => {
    server.use(
      http.get('http://localhost:8080/api/lessons/my-lessons', () =>
        HttpResponse.json({ message: 'Server error' }, { status: 500 })
      )
    )

    const { result } = renderHook(() => useLessons())

    // hook ne pada, ostaje na default vrijednosti
    await waitFor(() => {
      expect(result.current.pageData.content).toEqual([])
    })
  })
})
