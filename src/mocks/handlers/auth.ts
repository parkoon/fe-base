import { delay, http, HttpResponse } from 'msw'

import { mockUser } from '../data/auth'

export const authHandlers = [
  // POST /auth/login
  http.post('*/auth/login', async () => {
    await delay(300)
    return HttpResponse.json(mockUser)
  }),

  // GET /auth/me
  http.get('*/auth/me', async () => {
    await delay(200)
    return HttpResponse.json(mockUser)
  }),

  // POST /auth/refresh
  http.post('*/auth/refresh', async () => {
    await delay(200)
    return HttpResponse.json({
      accessToken: 'mock-refreshed-access-token',
      refreshToken: 'mock-refreshed-refresh-token',
    })
  }),
]
