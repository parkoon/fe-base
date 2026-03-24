import './index.css'

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import { App } from './app'

async function enableMocking() {
  if (import.meta.env.VITE_APP_ENABLE_API_MOCKING !== 'true') return
  const { initMocks } = await import('./mocks')
  return initMocks()
}

void enableMocking().then(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>
  )
})
