import { env } from './config/env'

function App() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <h1 className="text-3xl font-bold text-blue-600">Hello Tailwind!{env.API_URL}</h1>
    </div>
  )
}

export default App
