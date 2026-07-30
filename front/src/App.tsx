import { useEffect, useState } from 'react'
import LandingPage from './LandingPage'
import Classifier from './Classifier'
import { useUser } from './UserContext'

type Page = 'landing' | 'app'

export default function App() {
  const [dark, setDark] = useState(false)
  // ===== SIN CAMBIOS =====
  const [page, setPage] = useState<Page>('landing')
  // ===== CAMBIO: Nuevo contexto de usuario =====
  const { user, setUser } = useUser()
  // ===== NUEVO: Si existe una sesión restaurada, entrar a la aplicación =====
  useEffect(() => {
    if (user) {
      setPage('app')
    }
  }, [user])

  return (
    <div className={dark ? 'dark' : ''}>
      <div
        className="min-h-screen transition-colors duration-300"
        style={{
          backgroundColor: 'var(--background)',
          color: 'var(--foreground)'
        }}
      >

        {page === 'landing' ? (
          <LandingPage
            dark={dark}
            onToggleDark={() => setDark(d => !d)}
            onEnterApp={() => setPage('app')}
          />
        ) : (
          <Classifier
            dark={dark}
            onToggleDark={() => setDark(d => !d)}
            onGoHome={() => {
              setUser(null)
              localStorage.removeItem("user")
              setPage('landing')
            }}
          />
        )}
      </div>
    </div>
  )
}