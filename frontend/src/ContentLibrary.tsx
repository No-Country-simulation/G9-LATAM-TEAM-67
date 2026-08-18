import { useEffect, useState } from 'react'
import { useUser } from './UserContext'
import {IconBrain} from './LandingPage.tsx'
import {
  ContentServiceError,
  getAllContents,
  getContentCategories,
  getContentsByCategory,
  type ClassificationResponse,
} from './services/contentService'

type ContentLibraryProps = {
  dark: boolean
  onToggleDark: () => void
  onGoHome: () => void
  onClassify: () => void
  onLogout: () => void
}

function probabilityAsPercentage(probability: number) {
  const normalized = probability <= 1 ? probability * 100 : probability
  return Math.max(0, Math.min(100, normalized)).toFixed(1)
}

function readableDate(value: string) {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString('es-MX')
}

export default function ContentLibrary({
  dark,
  onToggleDark,
  onGoHome,
  onClassify,
  onLogout,
}: ContentLibraryProps) {
  const { user } = useUser()
  const [contents, setContents] = useState<ClassificationResponse[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [selectedCategory, setSelectedCategory] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const token = user?.token
    if (!token) {
      setError('Tu sesión no está disponible. Inicia sesión nuevamente.')
      setLoading(false)
      return
    }

    let active = true
    setLoading(true)
    setError(null)

    Promise.all([getAllContents(token), getContentCategories(token)])
      .then(([loadedContents, loadedCategories]) => {
        if (!active) return
        setContents(loadedContents)
        setCategories([...new Set(loadedCategories)].sort((a, b) => a.localeCompare(b)))
      })
      .catch((requestError: unknown) => {
        if (!active) return
        setError(requestError instanceof ContentServiceError
          ? requestError.message
          : 'No fue posible conectar con la API.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [user?.token])

  const handleCategoryChange = async (category: string) => {
    setSelectedCategory(category)
    const token = user?.token
    if (!token) return

    setLoading(true)
    setError(null)
    try {
      const loadedContents = category
        ? await getContentsByCategory(category, token)
        : await getAllContents(token)
      setContents(loadedContents)
    } catch (requestError) {
      setError(requestError instanceof ContentServiceError
        ? requestError.message
        : 'No fue posible conectar con la API.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle at center, color-mix(in srgb, var(--primary) 6%, transparent) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
      />

      <header
        className="sticky top-0 z-50 backdrop-blur-md border-b"
        style={{
          backgroundColor: 'color-mix(in srgb, var(--background) 85%, transparent)',
          borderColor: 'var(--border)',
        }}
      >
        <div className="max-w-6xl mx-auto px-5 h-14 flex items-center justify-between">
          <button
            type="button"
            onClick={onGoHome}
            className="flex items-center gap-2.5 hover:opacity-80 transition-opacity"
          >
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold shadow-sm"
              style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)' }}
            >
               <IconBrain size={18} />
            </div>
            <div className="text-left">
              <span className="block font-semibold text-sm tracking-tight">TECHMIND - Biblioteca de contenidos</span>
              <span className="hidden sm:block text-xs" style={{ color: 'var(--muted-foreground)', lineHeight: 1 }}>
                Explora el conocimiento clasificado
              </span>
            </div>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClassify}
              className="h-8 px-3 rounded-lg text-xs font-semibold border transition-colors hover:opacity-80"
              style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card)' }}
            >
              Clasificar
            </button>
            <button
              onClick={onLogout}
              className="hidden sm:block h-8 px-3 rounded-lg text-xs font-medium border transition-colors hover:opacity-80"
              style={{ borderColor: 'var(--border)', color: '#ef4444' }}
                            onMouseEnter={e => {
                              e.currentTarget.style.borderColor = '#ef4444'
                              e.currentTarget.style.color = '#ef4444'
                            }}
                            onMouseLeave={e => {
                              e.currentTarget.style.borderColor = 'var(--border)'
                              e.currentTarget.style.color = 'var(--muted-foreground)'
                            }}
            >
              Cerrar sesión
            </button>
            <button
              onClick={onToggleDark}
              className="w-8 h-8 rounded-lg border transition-colors hover:opacity-80"
              style={{ borderColor: 'var(--border)' }}
              aria-label="Cambiar tema"
            >
              {dark ? '☀' : '☾'}
            </button>
          </div>
        </div>
      </header>

      <main className="relative max-w-6xl mx-auto px-5 py-12 space-y-8">
        <section className="flex flex-col md:flex-row md:items-end justify-between gap-5">
          <div>
            <div
              className="inline-flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-full border mb-4"
              style={{
                borderColor: 'color-mix(in srgb, var(--primary) 30%, transparent)',
                backgroundColor: 'color-mix(in srgb, var(--primary) 8%, transparent)',
                color: 'var(--primary)',
              }}
            >
              Contenidos guardados
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Tu biblioteca técnica</h1>
            <p className="mt-2 text-sm" style={{ color: 'var(--muted-foreground)' }}>
              Consulta todos los contenidos o filtra los resultados por categoría.
            </p>
          </div>

          <label className="w-full md:w-72 text-sm font-medium">
            Categoría
            <select
              value={selectedCategory}
              onChange={event => void handleCategoryChange(event.target.value)}
              disabled={loading}
              className="mt-2 w-full h-11 px-3 rounded-xl border outline-none transition-colors disabled:opacity-60"
              style={{
                backgroundColor: 'var(--card)',
                borderColor: 'var(--border)',
                color: 'var(--foreground)',
              }}
            >
              <option value="">Todas las categorías</option>
              {categories.map(category => (
                <option key={category} value={category}>{category.toUpperCase()}</option>
              ))}
            </select>
          </label>
        </section>

        {error && (
          <div
            className="rounded-2xl border px-5 py-4 text-sm"
            style={{ borderColor: '#fca5a5', backgroundColor: 'color-mix(in srgb, #ef4444 8%, var(--card))', color: '#dc2626' }}
          >
            {error}
          </div>
        )}

        {loading ? (
          <div className="py-20 text-center" style={{ color: 'var(--muted-foreground)' }}>
            <div
              className="w-9 h-9 mx-auto mb-4 rounded-full border-2 border-t-transparent animate-spin"
              style={{ borderColor: 'var(--primary)', borderTopColor: 'transparent' }}
            />
            Cargando contenidos...
          </div>
        ) : contents.length === 0 && !error ? (
          <div
            className="rounded-3xl border p-12 text-center"
            style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}
          >
            <div className="text-4xl mb-4">⌕</div>
            <h2 className="text-lg font-semibold">No hay contenidos para mostrar</h2>
            <p className="mt-2 text-sm" style={{ color: 'var(--muted-foreground)' }}>
              Prueba otra categoría o clasifica un contenido nuevo.
            </p>
            <button
              onClick={onClassify}
              className="mt-6 h-10 px-5 rounded-xl text-sm font-semibold text-white"
              style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)' }}
            >
              Clasificar contenido
            </button>
          </div>
        ) : (
          <section className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
            {contents.map(content => (
              <article
                key={content.id}
                className="rounded-2xl border p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
                style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}
              >
                <div className="flex items-start justify-between gap-3">
                  <span
                    className="inline-flex px-2.5 py-1 rounded-lg text-xs font-semibold"
                    style={{ backgroundColor: 'color-mix(in srgb, var(--primary) 12%, transparent)', color: 'var(--primary)' }}
                  >
                    {content.categoria}
                  </span>
                  <span className="text-xs font-mono" style={{ color: 'var(--muted-foreground)' }}>
                    {probabilityAsPercentage(content.probabilidad)}%
                  </span>
                </div>
                <h2 className="mt-4 text-lg font-semibold leading-snug">{content.titulo}</h2>
                <p
                  className="mt-2 text-sm leading-6 line-clamp-4"
                  style={{ color: 'var(--muted-foreground)' }}
                >
                  {content.texto}
                </p>
                <div className="mt-5 pt-4 border-t text-xs flex justify-between gap-3" style={{ borderColor: 'var(--border)', color: 'var(--muted-foreground)' }}>
                  <span>#{content.id}</span>
                  <time dateTime={content.fecha}>{readableDate(content.fecha)}</time>
                </div>
              </article>
            ))}
          </section>
        )}
      </main>
    </>
  )
}
