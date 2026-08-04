import { useEffect, useState } from 'react'
import LandingPage from './LandingPage'
import Classifier from './Classifier'
import UserManagement from './UserManagement'
import { useUser } from './UserContext'

type Page = 'landing' | 'app' | 'admin'

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

  const handleLogout = () => {
    setUser(null)
    localStorage.removeItem("user")
    setPage('landing')
  }

  return (
    <div className={dark ? 'dark' : ''}>
      <div
        className="min-h-screen transition-colors duration-300"
        style={{
          backgroundColor: 'var(--background)',
          color: 'var(--foreground)'
        }}
      >

        {page === 'landing' && (
          <LandingPage
            dark={dark}
            onToggleDark={() => setDark(d => !d)}
            onEnterApp={() => setPage('app')}
          />
        )}

        {page === 'app' && (
          <Classifier
            dark={dark}
            onToggleDark={() => setDark(d => !d)}
            onGoHome={handleLogout}
            onGoAdmin={() => setPage('admin')}
          />
        )}

        {page === 'admin' && (
          <UserManagement onGoBack={() => setPage('app')} />
        )}
      </div>
    </div>
  )
}