import { useState, useEffect, useRef } from 'react'
import { useUser } from './UserContext' // ajusta la ruta según dónde esté tu archivo
import {
  classifyContent,
  type ContentResponse
} from './services/contentService'

type Category =
  | 'Backend'
  | 'Frontend'
  | 'Inteligencia Artificial'
  | 'Cloud'
  | 'Bases de Datos'

interface ClassificationResult {
  category: Category
  confidence: number
  label_id: number
  model: string
  processing_time_ms: number
  tokens_analyzed: number
  subcategories: string[]
  timestamp: string
}

const CATEGORY_CONFIG: Record<Category, { pastelBg: string; dotColor: string; glow: string }> = {
  Backend: { pastelBg: '#bfdbfe', dotColor: '#2563eb', glow: '#3b82f6' },
  Frontend: { pastelBg: '#ddd6fe', dotColor: '#7c3aed', glow: '#8b5cf6' },
  'Inteligencia Artificial': { pastelBg: '#a7f3d0', dotColor: '#059669', glow: '#10b981' },
  Cloud: { pastelBg: '#bae6fd', dotColor: '#0284c7', glow: '#0ea5e9' },
  'Bases de Datos': { pastelBg: '#fed7aa', dotColor: '#ea580c', glow: '#f97316' },
}
// AGREGADO
const CATEGORY_MAP: Record<string, Category> = {
  backend: "Backend",
  frontend: "Frontend",
  cloud: "Cloud",
  "bases de datos": "Bases de Datos",
  database: "Bases de Datos",
  databases: "Bases de Datos",
  ia: "Inteligencia Artificial",
  ai: "Inteligencia Artificial",
  "inteligencia artificial": "Inteligencia Artificial",
}


function mockClassify(title: string, content: string): ClassificationResult {
  const text = (title + ' ' + content).toLowerCase()
  const scores: Record<Category, number> = {
    Backend: 0, Frontend: 0, 'Inteligencia Artificial': 0, Cloud: 0,
    'Bases de Datos': 0, 
  }
  const keywords: Record<Category, string[]> = {
    Backend: ['api', 'rest', 'graphql', 'node', 'django', 'flask', 'express', 'servidor', 'endpoint', 'microservicio', 'backend', 'http', 'middleware', 'autenticación', 'python', 'java', 'go', 'rust'],
    Frontend: ['react', 'vue', 'angular', 'css', 'html', 'dom', 'componente', 'ui', 'ux', 'diseño', 'interfaz', 'javascript', 'typescript', 'tailwind', 'sass', 'responsive', 'frontend'],
    'Inteligencia Artificial': ['machine learning', 'deep learning', 'neural', 'modelo', 'entrenamiento', 'dataset', 'clasificación', 'regresión', 'transformer', 'llm', 'gpt', 'bert', 'ai', 'ia', 'inteligencia artificial', 'tensorflow', 'pytorch', 'sklearn'],
    Cloud: ['aws', 'azure', 'gcp', 'kubernetes', 'docker', 'contenedor', 'nube', 'cloud', 's3', 'lambda', 'serverless', 'instancia', 'escalado', 'load balancer'],
    'Bases de Datos': ['sql', 'mysql', 'postgresql', 'mongodb', 'redis', 'base de datos', 'query', 'índice', 'transacción', 'nosql', 'orm', 'schema', 'tabla', 'relacional'],
  }
  for (const [cat, words] of Object.entries(keywords)) {
    for (const word of words) {
      if (text.includes(word)) scores[cat as Category] += 1
    }
  }
  let top: Category = 'Backend'
  let topScore = 0
  for (const [cat, score] of Object.entries(scores)) {
    if (score > topScore) { topScore = score; top = cat as Category }
  }
  if (topScore === 0) {
    const cats = Object.keys(CATEGORY_CONFIG) as Category[]
    top = cats[Math.floor(Math.random() * cats.length)]
  }
  const confidence = Math.min(99, Math.max(62, topScore * 8 + Math.floor(Math.random() * 15) + 55))
  const subcats: Record<Category, string[]> = {
    Backend: ['API REST', 'Microservicios', 'Autenticación'],
    Frontend: ['Componentes UI', 'State Management', 'Rendimiento Web'],
    'Inteligencia Artificial': ['Clasificación', 'NLP', 'Redes Neuronales'],
    Cloud: ['IaaS', 'Contenedores', 'Serverless'],
    'Bases de Datos': ['SQL', 'Optimización', 'Modelado de Datos'],
   
  }
  return {
    category: top, confidence,
    label_id: Object.keys(CATEGORY_CONFIG).indexOf(top),
    model: 'tech-classifier-v2.1',
    processing_time_ms: Math.floor(Math.random() * 180) + 120,
    tokens_analyzed: Math.floor((title + content).split(/\s+/).length * 1.3),
    subcategories: subcats[top].slice(0, 2),
    timestamp: new Date().toISOString(),
  }
}

const EXAMPLES = [
  { icon: '☕', label: 'Backend', title: 'Introducción a Spring Boot', content: 'En este contenido se presentan los conceptos básicos para la creación de APIs REST utilizando Java y Spring Boot.' },
  { icon: '⚛️', label: 'Frontend', title: 'Componentes en React', content: 'Creación de componentes reutilizables con React y hooks para el manejo de estado en aplicaciones web modernas.' },
  { icon: '☁️', label: 'Cloud', title: 'Almacenamiento en la nube', content: 'Almacenamiento de archivos y objetos utilizando OCI Object Storage para respaldo y gestión de documentos.' },
]

function highlightJSON(json: string): string {
  return json
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"([^"]+)":/g, '<span style="color:#93c5fd">"$1"</span>:')
    .replace(/: "([^"]*)"/g, ': <span style="color:#6ee7b7">"$1"</span>')
    .replace(/: (\d+\.?\d*)/g, ': <span style="color:#fcd34d">$1</span>')
    .replace(/: (true|false|null)/g, ': <span style="color:#f9a8d4">$1</span>')
}

const IconBrain = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z"/>
    <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z"/>
  </svg>
)

const IconLogout = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
    <polyline points="16 17 21 12 16 7"/>
    <line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
)

const IconZap = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"/>
  </svg>
)
const IconMoon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>
  </svg>
)
const IconSun = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="4"/>
    <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>
  </svg>
)
const IconCopy = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/>
    <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
  </svg>
)
const IconCheck = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 6 9 17l-5-5"/>
  </svg>
)
const IconSpinner = () => (
  <svg className="spinner" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
  </svg>
)

function ConfidenceRing({ value, color }: { value: number; color: string }) {
  const [displayed, setDisplayed] = useState(0)
  const r = 36
  const circ = 2 * Math.PI * r
  const progress = (displayed / 100) * circ

  useEffect(() => {
    const start = Date.now()
    const duration = 1200
    const tick = () => {
      const elapsed = Date.now() - start
      const t = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - t, 3)
      setDisplayed(Math.round(eased * value))
      if (t < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [value])

  return (
    <div className="relative flex items-center justify-center" style={{ width: 96, height: 96 }}>
      <svg width="96" height="96" viewBox="0 0 96 96" style={{ transform: 'rotate(-90deg)' }}>
        <circle cx="48" cy="48" r={r} fill="none" stroke="var(--border)" strokeWidth="6" />
        <circle cx="48" cy="48" r={r} fill="none" stroke={color} strokeWidth="6" strokeLinecap="round"
          strokeDasharray={circ} strokeDashoffset={circ - progress}
          style={{ transition: 'stroke-dashoffset 0.05s linear' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xl font-bold" style={{ color, fontFamily: "'JetBrains Mono', monospace", lineHeight: 1 }}>
          {displayed}%
        </span>
        <span className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>confianza</span>
      </div>
    </div>
  )
}

interface ClassifierProps {
  dark: boolean
  onToggleDark: () => void
  onGoHome: () => void
}

export default function Classifier({ dark, onToggleDark, onGoHome }: ClassifierProps) {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
//   const [result, setResult] = useState<ClassificationResult | null>(null) // CAMBIO
  const [result, setResult] = useState<ClassificationResult | null>(null)

  const [copied, setCopied] = useState(false)
  const [resultKey, setResultKey] = useState(0)
  const resultRef = useRef<HTMLDivElement>(null)

 const [error, setError] = useState<string | null>(null)

const handleAnalyze = async () => {
  // ===== VALIDACIÓN EXISTENTE =====
  if (!content.trim()) return

  // ===== NUEVO: Verifica que exista un usuario autenticado =====
  if (!user) {
    setError('Debes iniciar sesión para clasificar contenido.')
    return
  }

  setLoading(true)
  setResult(null)
  setError(null)

  try {
    // ===== CAMBIO: Ya no usamos fetch directamente =====
    // Toda la comunicación con el backend queda en contentService.ts
    const data = await classifyContent(
      {
        titulo: title,
        texto: content,
      },
      user.token // ===== CAMBIO: Enviamos el JWT =====
    )
console.log("Respuesta del backend:", data) //************************************************ */
    // ===== SIN CAMBIOS =====
    setResult(data)
    setResultKey(k => k + 1)

    setTimeout(() => {
      resultRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      })
    }, 100)

  } catch (err) {
    // ===== CAMBIO: Ahora mostramos el mensaje real del error =====
    if (err instanceof Error) {
      setError(err.message)
    } else {
      setError('Ocurrió un error inesperado.')
    }
  } finally {
    // ===== SIN CAMBIOS =====
    setLoading(false)
  }
}

const handleExample = (ex: typeof EXAMPLES[0]) => {
  setTitle(ex.title)
  setContent(ex.content)
  setError(null)
  setLoading(true)
  setResult(null)

  // Simula el tiempo de respuesta de una API real
  setTimeout(() => {
    const mockResult = mockClassify(ex.title, ex.content)
    setResult(mockResult)
    setResultKey(k => k + 1)
    setLoading(false)
    setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100)
  }, 800)
}

  const handleCopy = () => {
    if (!result) return
    navigator.clipboard.writeText(JSON.stringify(result, null, 2))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  const { user } = useUser()

   const wordCount = content.trim().split(/\s+/).filter(Boolean).length
   const isValid = wordCount >= 10 && wordCount <= 200


// ===== NUEVO: Convierte la categoría del backend al formato del frontend =====
const mappedCategory = result
  ? CATEGORY_MAP[result.categoria.toLowerCase()]
  : undefined

// ===== NUEVO: Obtiene la configuración visual =====
const catConfig = mappedCategory
  ? CATEGORY_CONFIG[mappedCategory]
  : null

// ===== NUEVO: Convierte la probabilidad (0.53 -> 53%) =====
const confidence = result
  ? Math.round(result.probabilidad * 100)
  : 0


  const jsonStr = result ? JSON.stringify(result, null, 2) : ''

  return (
    <>
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at center, color-mix(in srgb, var(--primary) 6%, transparent) 1px, transparent 1px)`,
          backgroundSize: '28px 28px',
        }}
      />

      <header
        className="sticky top-0 z-50 backdrop-blur-md border-b"
        style={{ backgroundColor: 'color-mix(in srgb, var(--background) 85%, transparent)', borderColor: 'var(--border)' }}
      >
        <div className="max-w-5xl mx-auto px-5 h-14 flex items-center justify-between">
          <button className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white shadow-sm"
              style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)' }}>
              <IconBrain />
            </div>
            <div>
              <span className="font-semibold text-sm tracking-tight">Clasificador de Contenido Técnico</span>
              <span className="hidden sm:block text-xs" style={{ color: 'var(--muted-foreground)', lineHeight: 1 }}>
                Organiza tu conocimiento con IA
              </span>
            </div>
          </button>
          <div className="flex items-center gap-3">
            <button
  onClick={onGoHome}
  className="hidden sm:flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border transition-all hover:shadow-sm"
  style={{ borderColor: 'var(--border)', color: 'var(--muted-foreground)' }}
  onMouseEnter={e => {
    (e.currentTarget as HTMLElement).style.borderColor = '#ef4444'
    ;(e.currentTarget as HTMLElement).style.color = '#ef4444'
  }}
  onMouseLeave={e => {
    (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'
    ;(e.currentTarget as HTMLElement).style.color = 'var(--muted-foreground)'
  }}
>
  <IconLogout />
  Cerrar sesión
</button>
            <button onClick={onToggleDark}
              className="w-8 h-8 rounded-lg flex items-center justify-center border transition-colors hover:opacity-80"
              style={{ borderColor: 'var(--border)', color: 'var(--muted-foreground)' }}
              aria-label="Toggle dark mode">
              {dark ? <IconSun /> : <IconMoon />}
            </button>
          </div>
        </div>
      </header>

      <main className="relative max-w-5xl mx-auto px-5 py-12 space-y-10">
        <div className="text-center space-y-3 pb-2">
          <div className="inline-flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-full border"
            style={{ borderColor: 'color-mix(in srgb, var(--primary) 30%, transparent)', backgroundColor: 'color-mix(in srgb, var(--primary) 8%, transparent)', color: 'var(--primary)' }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: 'var(--primary)' }} />
            Clasificación automática con ML
          </div>
           <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-1">
              Bienvenido, {" "}
              <span style={{ background: 'linear-gradient(135deg, var(--primary) 0%, #7c3aed 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                {user.name.toUpperCase()}
              </span>
            </h1>

            <p className="text-lg sm:text-xl font-semibold">
              Pega tu texto, obtén su categoría
            </p>
          <p className="text-base max-w-xl mx-auto" style={{ color: 'var(--muted-foreground)' }}>
            Analiza artículos, apuntes y descripciones de cursos. El modelo detecta la disciplina técnica y el nivel de confianza en segundos.
          </p>
        </div>

        <div className="rounded-2xl border p-6 sm:p-8 shadow-sm space-y-5"
          style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
          <div className="space-y-1.5">
            <label className="text-sm font-medium" htmlFor="title">
              Título <span style={{ color: 'var(--muted-foreground)', fontWeight: 400 }}>(opcional)</span>
            </label>
            <input id="title" type="text" value={title} onChange={e => setTitle(e.target.value)}
              placeholder="Ej: Introducción a Kubernetes y contenedores"
              className="w-full h-10 px-3.5 rounded-xl border text-sm outline-none transition-all"
              style={{ backgroundColor: 'var(--secondary)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
              onFocus={e => { e.target.style.borderColor = 'var(--ring)'; e.target.style.boxShadow = '0 0 0 3px color-mix(in srgb, var(--ring) 15%, transparent)' }}
              onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none' }}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium" htmlFor="content">Contenido técnico</label>
            <textarea id="content" value={content}
              onChange={e => {
                const words = e.target.value.trim().split(/\s+/).filter(Boolean)
                if (words.length <= 200) {
                  setContent(e.target.value)
                }
              }}
              placeholder="Pega aquí el texto técnico que quieres analizar... (artículo, apunte, descripción de curso, documentación)"
              rows={7} className="w-full px-3.5 py-3 rounded-xl border text-sm outline-none transition-all resize-none leading-relaxed"
              style={{ backgroundColor: 'var(--secondary)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
              onFocus={e => { e.target.style.borderColor = 'var(--ring)'; e.target.style.boxShadow = '0 0 0 3px color-mix(in srgb, var(--ring) 15%, transparent)' }}
              onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none' }}
            />
            <p className="text-xs" style={{ color: isValid ? 'var(--muted-foreground)' : '#dc2626' }}>
              {wordCount} / 200 palabras · Mínimo: 10 palabras
            </p>
          </div>
          <button onClick={handleAnalyze} disabled={loading || !isValid}
            className="flex items-center justify-center gap-2 w-full sm:w-auto sm:px-8 h-11 rounded-xl font-medium text-sm transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: loading || !content.trim() ? 'var(--muted)' : 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
              color: loading || !content.trim() ? 'var(--muted-foreground)' : '#fff',
              boxShadow: loading || !content.trim() ? 'none' : '0 4px 14px color-mix(in srgb, var(--primary) 35%, transparent)',
            }}>
            {loading ? (<><IconSpinner /><span>Analizando contenido...</span></>) : (<><IconZap /><span>Analizar contenido</span></>)}
          </button>
          {error && (
            <div className="rounded-xl border p-4 text-sm"
              style={{ borderColor: '#fca5a5', backgroundColor: '#fef2f2', color: '#b91c1c' }}>
              {error}
            </div>
          )}
        </div>

        {result && catConfig && (
          <div key={resultKey} ref={resultRef} className="animate-fade-slide-up space-y-4">
            <div className="rounded-2xl border p-6 sm:p-8 shadow-sm"
              style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
              <div className="flex flex-col sm:flex-row sm:items-start gap-6">
                <div className="flex-1 space-y-4">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-widest mb-2" style={{ color: 'var(--muted-foreground)' }}>
                      Categoría detectada
                    </p>
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-base font-semibold"
                      style={{ backgroundColor: catConfig.pastelBg, color: '#0f1117' }}>
                      <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: catConfig.dotColor }} />
             {mappedCategory}
                    </div>
                  </div>

               <div className="grid grid-cols-3 gap-4 pt-2">
                 <div>
                   <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}
                   >
                     ID
                   </p>

                   <p className="text-sm font-medium mt-0.5" style={{ fontFamily: "'JetBrains Mono', monospace" }}
                   >
                     {result.id}
                   </p>
                 </div>
                 <div>
                   <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}
                   >
                     Probabilidad
                   </p>
                   <p className="text-sm font-medium mt-0.5" style={{ fontFamily: "'JetBrains Mono', monospace" }}
                   >
                     {confidence}%
                   </p>
                 </div>
                 <div>
                   <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}
                   >
                     Fecha
                   </p>

                   <p className="text-sm font-medium mt-0.5" style={{ fontFamily: "'JetBrains Mono', monospace" }}
                   >
                     {new Date(result.fecha).toLocaleString()}
                   </p>
                 </div>
               </div>


                </div>
                <div className="flex flex-col items-center gap-2">
                  <ConfidenceRing value={confidence} color={catConfig.glow} />
                  <div className="w-24">
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--muted)' }}>
                      <div className="h-full rounded-full transition-all duration-1000"
                        style={{ width: `${confidence}%`, backgroundColor: catConfig.glow, transitionDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border overflow-hidden shadow-sm" style={{ borderColor: 'var(--border)' }}>
              <div className="flex items-center justify-between px-4 py-2.5 border-b"
                style={{ backgroundColor: '#0f1117', borderColor: '#1e2030' }}>
                <div className="flex items-center gap-3">
                  <div className="flex gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-red-500/80" />
                    <span className="w-3 h-3 rounded-full bg-yellow-500/80" />
                    <span className="w-3 h-3 rounded-full bg-green-500/80" />
                  </div>
                  <span className="text-xs" style={{ color: '#6b7280', fontFamily: "'JetBrains Mono', monospace" }}>
                    POST /api/classify → 200 OK
                  </span>
                </div>
                <button onClick={handleCopy} className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg transition-colors"
                  style={{ color: copied ? '#6ee7b7' : '#6b7280', backgroundColor: copied ? 'rgba(110,231,183,0.1)' : 'rgba(107,114,128,0.1)' }}>
                  {copied ? <IconCheck /> : <IconCopy />}
                  {copied ? 'Copiado' : 'Copiar JSON'}
                </button>
              </div>
              <pre className="p-5 text-sm overflow-x-auto leading-relaxed"
                style={{ backgroundColor: '#0b0d14', fontFamily: "'JetBrains Mono', monospace", fontSize: '0.8rem' }}
                dangerouslySetInnerHTML={{ __html: highlightJSON(jsonStr) }}
              />
            </div>
          </div>
        )}

        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <h2 className="text-sm font-semibold uppercase tracking-widest" style={{ color: 'var(--muted-foreground)' }}>
              Prueba con un ejemplo
            </h2>
            <div className="flex-1 h-px" style={{ backgroundColor: 'var(--border)' }} />
          </div>
          <div className="grid sm:grid-cols-3 gap-3">
            {EXAMPLES.map(ex => (
              <button key={ex.title} onClick={() => handleExample(ex)}
                className="text-left p-4 rounded-xl border transition-all hover:shadow-md"
                style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = 'color-mix(in srgb, var(--primary) 40%, transparent)'
                  ;(e.currentTarget as HTMLElement).style.backgroundColor = 'color-mix(in srgb, var(--primary) 4%, var(--card))'
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'
                  ;(e.currentTarget as HTMLElement).style.backgroundColor = 'var(--card)'
                }}>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="text-xl">{ex.icon}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full border mt-0.5"
                    style={{ borderColor: 'var(--border)', color: 'var(--muted-foreground)' }}>
                    {ex.label}
                  </span>
                </div>
                <p className="text-sm font-medium leading-snug mb-1">{ex.title}</p>
                <p className="text-xs line-clamp-2" style={{ color: 'var(--muted-foreground)' }}>{ex.content}</p>
                <p className="text-xs mt-3 font-medium" style={{ color: 'var(--primary)' }}>Usar este ejemplo →</p>
              </button>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t mt-16 py-6 text-center" style={{ borderColor: 'var(--border)' }}>
        <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
          Clasificador de Contenido Técnico · Hackathon MVP 2026 · Modelo{' '}
          <code className="px-1.5 py-0.5 rounded"
            style={{ backgroundColor: 'var(--secondary)', fontFamily: "'JetBrains Mono', monospace", fontSize: '0.7rem' }}>
            tech-classifier-v2.1
          </code>
        </p>
      </footer>
    </>
  )
}
