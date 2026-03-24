import { env } from '@/config/env'

export async function initMocks() {
  if (!env.ENABLE_API_MOCKING) return

  const { worker } = await import('./browser')
  return worker.start({ onUnhandledRequest: 'bypass' })
}
