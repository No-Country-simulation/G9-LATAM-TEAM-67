import { useEffect, useState } from 'react'
import LandingPage from './LandingPage'
import Classifier from './Classifier'
import ContentLibrary from './ContentLibrary'
import { useUser } from './UserContext'

type Page = 'landing' | 'classifier' | 'contents'

export default function App() {
  const [dark, setDark] = useState(false)
  // ===== SIN CAMBIOS =====
  const [page, setPage] = useState<Page>('landing')
  // ===== CAMBIO: Nuevo contexto de usuario =====
  const { user, setUser } = useUser()
  // ===== NUEVO: Si existe una sesión restaurada, entrar a la aplicación =====
  useEffect(() => {
    if (user) {
      setPage('classifier')
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
            onEnterApp={() => setPage('classifier')}
          />
        ) : page === 'classifier' ? (
          <Classifier
            dark={dark}
            onToggleDark={() => setDark(d => !d)}
            onGoHome={() => setPage('landing')}
            onViewContents={() => setPage('contents')}
            onLogout={() => {
              setUser(null)
              setPage('landing')
            }}
          />
        ) : (
          <ContentLibrary
            dark={dark}
            onToggleDark={() => setDark(d => !d)}
            onGoHome={() => setPage('landing')}
            onClassify={() => setPage('classifier')}
            onLogout={() => {
              setUser(null)
              setPage('landing')
            }}
          />
        )}
      </div>
    </div>
  )
}
