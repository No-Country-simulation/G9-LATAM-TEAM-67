import { useState } from 'react'
import LandingPage from './LandingPage'
import Classifier from './Classifier'
import { useUser } from './UserContext'

type Page = 'landing' | 'app'

export default function App() {
  const [dark, setDark] = useState(false)
  const [page, setPage] = useState<Page>('landing')
  const { setUsername } = useUser()

  return (
    <div className={dark ? 'dark' : ''}>
      <div
        className="min-h-screen transition-colors duration-300"
        style={{ backgroundColor: 'var(--background)', color: 'var(--foreground)' }}
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
              setUsername('Usuario') // resetea el saludo
              setPage('landing')
            }}
          />
        )}
      </div>
    </div>
  )
}