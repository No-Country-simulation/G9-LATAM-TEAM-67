import { useEffect, useState } from 'react'
import LandingPage from './LandingPage'
import Classifier from './Classifier'
import ContentLibrary from './ContentLibrary'
// ===== NUEVO: Componente de gestión de usuarios =====
import UserManagement from './UserManagement'
import { useUser } from './UserContext'

// ===== CAMBIO: Se agrega 'admin' como página posible =====
type Page = 'landing' | 'classifier' | 'contents' | 'admin'

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
            // ===== NUEVO: Ir a gestión de usuarios =====
            onGoAdmin={() => setPage('admin')}
            onLogout={() => {
              setUser(null)
              setPage('landing')
            }}
          />
        ) : page === 'contents' ? (
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
        ) : (
          // ===== NUEVO: Página de administración de usuarios =====
          <UserManagement
            onGoBack={() => setPage('classifier')}
          />
        )}
      </div>
    </div>
  )
}