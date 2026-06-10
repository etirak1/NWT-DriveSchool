import { http, HttpResponse } from 'msw'

const BASE = 'http://localhost:8080'

export const handlers = [
  // --- Finance ---
  http.get(`${BASE}/accounts/:candidateId/status`, () =>
    HttpResponse.json({
      totalAmount: 1200,
      paidAmount: 600,
      remainingDebt: 600,
      enrollmentEligible: true,
      examEligible: false,
      obligations: [],
    })
  ),

  http.get(`${BASE}/accounts/:candidateId/payments`, () =>
    HttpResponse.json([
      { paymentId: 1, amount: 300, date: '2024-01-10' },
      { paymentId: 2, amount: 300, date: '2024-03-15' },
    ])
  ),

  // --- Candidates ---
  http.get(`${BASE}/api/candidates/by-user/:userId`, () =>
    HttpResponse.json({
      candidateId: 42,
      userId: 1,
      enrollmentDate: '2024-01-01',
      progressPercentage: 50,
    })
  ),

  // --- Lessons ---
  http.get(`${BASE}/api/lessons/pending`, () => HttpResponse.json([])),

  http.get(`${BASE}/api/lessons/my-lessons`, () =>
    HttpResponse.json({ content: [], totalPages: 0, number: 0 })
  ),

  http.get(`${BASE}/api/lessons/eligibility`, () =>
    HttpResponse.json({ theoryPassed: true, lessonsThisWeek: 1, weeklyLimit: 4, canBook: true })
  ),

  // --- Driving lessons ---
  http.get(`${BASE}/api/driving-lessons/candidate/:id/count`, () =>
    HttpResponse.json({ completed: 10 })
  ),

  // --- Theory ---
  http.get(`${BASE}/api/theory-lessons/candidate/:id`, () =>
    HttpResponse.json([
      { lessonId: 1, completed: true },
      { lessonId: 2, completed: true },
      { lessonId: 3, completed: false },
    ])
  ),

  // --- Phases / Timeline ---
  http.get(`${BASE}/api/phases/candidate/:id`, () => HttpResponse.json([])),

  http.get(`${BASE}/api/phases/candidate/:id/timeline`, () =>
    HttpResponse.json([
      { key: 'UPIS',           label: 'Upis',             status: 'ZAVRŠENO' },
      { key: 'TEORIJA',        label: 'Teorija',          status: 'U TOKU'   },
      { key: 'TEORIJSKI_ISPIT',label: 'Teorijski ispit',  status: 'ZAKLJUČANO' },
      { key: 'VOZNJA',         label: 'Vožnja',           status: 'ZAKLJUČANO' },
      { key: 'PRAKTICNI_ISPIT',label: 'Praktični ispit',  status: 'ZAKLJUČANO' },
      { key: 'ZAVRSENO',       label: 'Završeno',         status: 'ZAKLJUČANO' },
    ])
  ),

  // --- Feedback ---
  http.get(`${BASE}/api/feedbacks/candidate/:id/exists`, () =>
    HttpResponse.json(false)
  ),

  // --- Theory plan ---
  http.get(`${BASE}/api/theory-plans/candidate/:id/theory-eligibility`, () =>
    HttpResponse.json({ eligible: false, attendedCount: 2, requiredCount: 40 })
  ),

  // --- Announcements ---
  http.get(`${BASE}/api/announcements`, () =>
    HttpResponse.json([
      { id: 1, title: 'Obavještenje 1', content: 'Sadržaj 1', createdAt: '2024-06-01' },
    ])
  ),
]
