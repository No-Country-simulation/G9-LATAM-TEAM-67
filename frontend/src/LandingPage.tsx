// ===== NUEVO: Servicio de autenticación =====
import { login } from "./services/authService"
import { register } from "./services/authService";
import ComingSoonModal from "./components/ComingSoonModal.tsx"

import { useState, useEffect, useRef } from 'react'
import { useUser } from './UserContext' // ajusta la ruta según dónde esté tu archivo
// ── Icons ─────────────────────────────────────────────────────────────────────

export const IconBrain = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z"/>
    <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z"/>
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

const IconX = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 6 6 18M6 6l12 12"/>
  </svg>
)

const IconEye = ({ open }: { open: boolean }) => open ? (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
) : (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
)

const IconSpinner = () => (
  <svg className="spinner" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
  </svg>
)

const IconTag = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2H2v10l9.29 9.29a1 1 0 0 0 1.41 0l7.59-7.59a1 1 0 0 0 0-1.41L12 2Z"/>
    <path d="M7 7h.01"/>
  </svg>
)

const IconCode = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="16 18 22 12 16 6"/>
    <polyline points="8 6 2 12 8 18"/>
  </svg>
)

const IconChip = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="9" width="6" height="6" rx="1"/>
    <path d="M15 9V5a2 2 0 0 0-2-2H9a2 2 0 0 0-2 2v4M9 15v4a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2v-4M15 9h4a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-4M9 15H5a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h4"/>
  </svg>
)

const IconCloud = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/>
  </svg>
)


// ── Network illustration SVG ──────────────────────────────────────────────────

const NetworkIllustration = ({ dark }: { dark: boolean }) => {
  const stroke = dark ? '#334155' : '#e2e8f0'
  const nodeMain = 'url(#grad-main)'
  const nodeSecondary = dark ? '#1e2030' : '#f1f5f9'
  const textColor = dark ? '#94a3b8' : '#64748b'
  const glowId = dark ? 'glow-dark' : 'glow-light'

  return (
    <svg viewBox="0 0 480 380" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full" style={{ maxHeight: 360 }}>
      <defs>
        <linearGradient id="grad-main" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#4f46e5"/>
          <stop offset="100%" stopColor="#7c3aed"/>
        </linearGradient>
        <filter id="glow-dark">
          <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
          <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <filter id="glow-light">
          <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
          <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>

      {/* Connection lines */}
      <line x1="240" y1="180" x2="120" y2="100" stroke={stroke} strokeWidth="1.5" strokeDasharray="4 3"/>
      <line x1="240" y1="180" x2="360" y2="100" stroke={stroke} strokeWidth="1.5" strokeDasharray="4 3"/>
      <line x1="240" y1="180" x2="80" y2="240" stroke={stroke} strokeWidth="1.5" strokeDasharray="4 3"/>
      <line x1="240" y1="180" x2="400" y2="240" stroke={stroke} strokeWidth="1.5" strokeDasharray="4 3"/>
      <line x1="240" y1="180" x2="200" y2="310" stroke={stroke} strokeWidth="1.5" strokeDasharray="4 3"/>
      <line x1="240" y1="180" x2="340" y2="310" stroke={stroke} strokeWidth="1.5" strokeDasharray="4 3"/>
      <line x1="120" y1="100" x2="80" y2="240" stroke={stroke} strokeWidth="1" strokeDasharray="3 4" strokeOpacity="0.5"/>
      <line x1="360" y1="100" x2="400" y2="240" stroke={stroke} strokeWidth="1" strokeDasharray="3 4" strokeOpacity="0.5"/>
      <line x1="80" y1="240" x2="200" y2="310" stroke={stroke} strokeWidth="1" strokeDasharray="3 4" strokeOpacity="0.5"/>
      <line x1="400" y1="240" x2="340" y2="310" stroke={stroke} strokeWidth="1" strokeDasharray="3 4" strokeOpacity="0.5"/>

      {/* Satellite small nodes */}
      <circle cx="60" cy="70" r="5" fill={nodeSecondary} stroke={stroke} strokeWidth="1.5"/>
      <circle cx="170" cy="50" r="5" fill={nodeSecondary} stroke={stroke} strokeWidth="1.5"/>
      <circle cx="420" cy="80" r="5" fill={nodeSecondary} stroke={stroke} strokeWidth="1.5"/>
      <circle cx="440" cy="200" r="5" fill={nodeSecondary} stroke={stroke} strokeWidth="1.5"/>
      <circle cx="40" cy="300" r="5" fill={nodeSecondary} stroke={stroke} strokeWidth="1.5"/>
      <circle cx="460" cy="320" r="5" fill={nodeSecondary} stroke={stroke} strokeWidth="1.5"/>
      <line x1="60" y1="70" x2="120" y2="100" stroke={stroke} strokeWidth="1" strokeOpacity="0.4"/>
      <line x1="170" y1="50" x2="120" y2="100" stroke={stroke} strokeWidth="1" strokeOpacity="0.4"/>
      <line x1="420" y1="80" x2="360" y2="100" stroke={stroke} strokeWidth="1" strokeOpacity="0.4"/>
      <line x1="440" y1="200" x2="400" y2="240" stroke={stroke} strokeWidth="1" strokeOpacity="0.4"/>
      <line x1="40" y1="300" x2="80" y2="240" stroke={stroke} strokeWidth="1" strokeOpacity="0.4"/>
      <line x1="460" y1="320" x2="400" y2="240" stroke={stroke} strokeWidth="1" strokeOpacity="0.4"/>

      {/* Category badge nodes */}
      {[
        { x: 120, y: 100, label: 'Backend', bg: '#bfdbfe', dot: '#2563eb' },
        { x: 360, y: 100, label: 'Frontend', bg: '#ddd6fe', dot: '#7c3aed' },
        { x: 80, y: 240, label: 'Cloud', bg: '#bae6fd', dot: '#0284c7' },
        { x: 400, y: 240, label: 'DevOps', bg: '#fecaca', dot: '#dc2626' },
        { x: 200, y: 310, label: 'ML / IA', bg: '#a7f3d0', dot: '#059669' },
        { x: 340, y: 310, label: 'BD', bg: '#fed7aa', dot: '#ea580c' },
      ].map(n => (
        <g key={n.label} filter={`url(#${glowId})`}>
          <rect x={n.x - 32} y={n.y - 14} width={80} height={28} rx="8"
            fill={n.bg} stroke={n.dot} strokeWidth="1.5" strokeOpacity="0.6"/>
          <circle cx={n.x - 18} cy={n.y} r="4" fill={n.dot}/>
          <text x={n.x - 9} y={n.y + 4.5} fontSize="10" fontFamily="Inter, sans-serif"
            fontWeight="600" fill="#0f1117">{n.label}</text>
        </g>
      ))}

      {/* Central node */}
      <circle cx="240" cy="180" r="36" fill={nodeMain} filter={`url(#${glowId})`}/>
      <circle cx="240" cy="180" r="30" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="1"/>
      <text x="240" y="175" textAnchor="middle" fontSize="11" fontFamily="Inter, sans-serif"
        fontWeight="600" fill="white">Clasificador</text>
      <text x="240" y="190" textAnchor="middle" fontSize="10" fontFamily="Inter, sans-serif"
        fill="rgba(255,255,255,0.75)">IA · ML</text>

      {/* Animated pulse ring */}
      <circle cx="240" cy="180" r="42" fill="none" stroke="#6366f1" strokeWidth="1.5" strokeOpacity="0.3">
        <animate attributeName="r" values="42;54;42" dur="3s" repeatCount="indefinite"/>
        <animate attributeName="stroke-opacity" values="0.3;0;0.3" dur="3s" repeatCount="indefinite"/>
      </circle>

      {/* Data flow dots on lines */}
      <circle cx="0" cy="0" r="3" fill="#6366f1" fillOpacity="0.8">
        <animateMotion dur="2.5s" repeatCount="indefinite" path="M240,180 L120,100"/>
      </circle>
      <circle cx="0" cy="0" r="3" fill="#6366f1" fillOpacity="0.8">
        <animateMotion dur="2.8s" repeatCount="indefinite" begin="0.8s" path="M240,180 L360,100"/>
      </circle>
      <circle cx="0" cy="0" r="3" fill="#818cf8" fillOpacity="0.8">
        <animateMotion dur="3.2s" repeatCount="indefinite" begin="1.4s" path="M240,180 L80,240"/>
      </circle>
      <circle cx="0" cy="0" r="3" fill="#818cf8" fillOpacity="0.8">
        <animateMotion dur="2.6s" repeatCount="indefinite" begin="0.4s" path="M240,180 L400,240"/>
      </circle>

      {/* Corner label */}
      <text x="240" y="358" textAnchor="middle" fontSize="10" fontFamily="JetBrains Mono, monospace"
        fill={textColor}>tech-classifier-v2.1 · live</text>
    </svg>
  )
}

// ── Field component ───────────────────────────────────────────────────────────

interface FieldProps {
  id: string
  label: string
  type?: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  error?: string
  autoComplete?: string
  suffix?: React.ReactNode
}

function Field({ id, label, type = 'text', value, onChange, placeholder, error, autoComplete, suffix }: FieldProps) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-medium" style={{ color: 'var(--foreground)' }}>
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className="w-full h-11 px-3.5 rounded-xl border text-sm outline-none transition-all"
          style={{
            backgroundColor: 'var(--secondary)',
            borderColor: error ? '#ef4444' : 'var(--border)',
            color: 'var(--foreground)',
            paddingRight: suffix ? '2.75rem' : undefined,
          }}
          onFocus={e => {
            if (!error) { e.target.style.borderColor = 'var(--ring)'; e.target.style.boxShadow = '0 0 0 3px color-mix(in srgb, var(--ring) 15%, transparent)' }
          }}
          onBlur={e => {
            e.target.style.borderColor = error ? '#ef4444' : 'var(--border)'
            e.target.style.boxShadow = 'none'
          }}
        />
        {suffix && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--muted-foreground)' }}>
            {suffix}
          </div>
        )}
      </div>
      {error && <p className="text-xs" style={{ color: '#ef4444' }}>{error}</p>}
    </div>
  )
}

// ── Modal wrapper ─────────────────────────────────────────────────────────────

interface ModalProps {
  onClose: () => void
  children: React.ReactNode
}

function Modal({ onClose, children }: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onClose])

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)' }}
      onClick={e => { if (e.target === overlayRef.current) onClose() }}
    >
      <div
        className="relative w-full max-w-md rounded-2xl border shadow-2xl animate-fade-slide-up"
        style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:opacity-70"
          style={{ color: 'var(--muted-foreground)', backgroundColor: 'var(--secondary)' }}
          aria-label="Cerrar"
        >
          <IconX />
        </button>
        {children}
      </div>
    </div>
  )
}

// ── Login Modal ───────────────────────────────────────────────────────────────

interface LoginModalProps {
  onClose: () => void
  onSwitchToRegister: () => void
  onSuccess: () => void
}

function LoginModal({ onClose, onSwitchToRegister, onSuccess }: LoginModalProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [remember, setRemember] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  // ===== NUEVO =====
  const { setUser } = useUser()

  const validate = () => {
    const e: Record<string, string> = {}
    if (!email.trim()) e.email = 'El correo es requerido'
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = 'Ingresa un correo válido'
    if (!password) e.password = 'La contraseña es requerida'
    // CAMBIO cantidad de caracteres
    else if (password.length < 3) e.password = 'Mínimo 3 caracteres'
    return e
  }

// ===== CAMBIO: Login real contra Spring Boot =====
const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // ===== MANTENER: Validaciones del formulario =====
    const validation = validate()
    if (Object.keys(validation).length) {
        setErrors(validation)
        return
    }
    setErrors({})
    setLoading(true)

    try {
        const response = await login({
            email,
            password
        })
        // ===== NUEVO: Guardar el usuario en el contexto =====
        setUser(response)
       // ===== CAMBIO: Guardamos toda la sesión =====
       localStorage.setItem("user", JSON.stringify(response))
        onSuccess()
    } catch (error) {        // ===== CAMBIO: Mostrar error dentro del formulario =====
        setErrors({
            general: "Correo o contraseña incorrectos."
        })
    } finally {
        setLoading(false)
    }
}

  return (
    <Modal onClose={onClose}>
      <div className="p-8">
        <div className="flex items-center gap-2.5 mb-6">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-sm"
            style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)' }}>
            <IconBrain size={18} />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight">Bienvenido de vuelta</h2>
            <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Inicia sesión en tu cuenta</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Field id="login-email" label="Correo electrónico" type="email" value={email}
            onChange={v => { setEmail(v); setErrors(p => ({ ...p, email: '' })) }}
            placeholder="tu@correo.com" error={errors.email} autoComplete="email"/>

          <Field id="login-password" label="Contraseña"
            type={showPass ? 'text' : 'password'} value={password}
            onChange={v => { setPassword(v); setErrors(p => ({ ...p, password: '' })) }}
            placeholder="••••••••" error={errors.password} autoComplete="current-password"
            suffix={
              <button type="button" onClick={() => setShowPass(s => !s)} className="hover:opacity-70 transition-opacity">
                <IconEye open={showPass} />
              </button>
            }
          />

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)}
                className="w-4 h-4 rounded accent-indigo-500"/>
              <span className="text-sm" style={{ color: 'var(--muted-foreground)' }}>Recordarme</span>
            </label>
            <button type="button" className="text-sm font-medium transition-opacity hover:opacity-70"
              style={{ color: 'var(--primary)' }}>
              ¿Olvidaste tu contraseña?
            </button>
          </div>

          <button type="submit" disabled={loading}
            className="flex items-center justify-center gap-2 w-full h-11 rounded-xl font-semibold text-sm transition-all active:scale-95 disabled:opacity-70 mt-2"
            style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)', color: '#fff',
              boxShadow: '0 4px 14px color-mix(in srgb, var(--primary) 30%, transparent)' }}>
            {loading ? <><IconSpinner />Iniciando sesión...</> : 'Iniciar sesión'}
          </button>
        </form>

        <div className="relative my-5">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full h-px" style={{ backgroundColor: 'var(--border)' }}/>
          </div>
          <div className="relative flex justify-center">
            <span className="px-3 text-xs" style={{ backgroundColor: 'var(--card)', color: 'var(--muted-foreground)' }}>
              o continúa con
            </span>
          </div>
        </div>

        <p className="text-center text-sm mt-5" style={{ color: 'var(--muted-foreground)' }}>
          ¿No tienes cuenta?{' '}
          <button onClick={onSwitchToRegister} className="font-semibold hover:opacity-70 transition-opacity"
            style={{ color: 'var(--primary)' }}>
            Regístrate aquí
          </button>
        </p>
      </div>
    </Modal>
  )
}

// ── Register  ────────────────────────────────────────────────────────────

interface RegisterModalProps {
  onClose: () => void
  onSwitchToLogin: () => void
  onSuccess: () => void
}
function RegisterModal({ onClose, onSwitchToLogin, onSuccess }: RegisterModalProps) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [terms, setTerms] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = () => {
    const e: Record<string, string> = {}
    if (!name.trim()) e.name = 'El nombre es requerido'
    if (!email.trim()) e.email = 'El correo es requerido'
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = 'Ingresa un correo válido'
    if (!password) e.password = 'La contraseña es requerida'
    else if (password.length < 3) e.password = 'Mínimo 3register caracteres'
    if (password !== confirm) e.confirm = 'Las contraseñas no coinciden'
    if (!terms) e.terms = 'Debes aceptar los términos'
    return e
  }

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  const errs = validate()
  if (Object.keys(errs).length) {
    setErrors(errs)
    return
  }
  setLoading(true)

  try {
    await register({
      name: name.trim(),
      email: email.trim(),
      password
    })
    onSuccess()

  } catch (error) {
    setErrors({
      email: error instanceof Error
        ? error.message
        : "No fue posible crear la cuenta"
    })
  } finally {
    setLoading(false)
  }
}

  const strength = password.length === 0 ? 0 : password.length < 6 ? 1 : password.length < 10 ? 2 : 3

  return (
    <Modal onClose={onClose}>
      <div className="p-8">
        <div className="flex items-center gap-2.5 mb-6">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-sm"
            style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)' }}>
            <IconBrain size={18} />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight">Crea tu cuenta</h2>
            <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Empieza gratis, sin tarjeta</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Field id="reg-name" label="Nombre completo" value={name}
            onChange={v => { setName(v); setErrors(p => ({ ...p, name: '' })) }}
            placeholder="Ana García" error={errors.name} autoComplete="name"/>

          <Field id="reg-email" label="Correo electrónico" type="email" value={email}
            onChange={v => { setEmail(v); setErrors(p => ({ ...p, email: '' })) }}
            placeholder="tu@correo.com" error={errors.email} autoComplete="email"/>

          <div className="space-y-1.5">
            <Field id="reg-pass" label="Contraseña" type={showPass ? 'text' : 'password'} value={password}
              onChange={v => { setPassword(v); setErrors(p => ({ ...p, password: '' })) }}
              placeholder="Mínimo 8 caracteres" error={errors.password} autoComplete="new-password"
              suffix={
                <button type="button" onClick={() => setShowPass(s => !s)} className="hover:opacity-70 transition-opacity">
                  <IconEye open={showPass} />
                </button>
              }
            />
            {password.length > 0 && (
              <div className="flex gap-1 mt-1">
                {[1, 2, 3].map(i => (
                  <div key={i} className="flex-1 h-1 rounded-full transition-colors"
                    style={{ backgroundColor: i <= strength ? (strength === 1 ? '#ef4444' : strength === 2 ? '#f59e0b' : '#10b981') : 'var(--border)' }}/>
                ))}
                <span className="text-xs ml-1 self-center" style={{ color: 'var(--muted-foreground)' }}>
                  {strength === 1 ? 'Débil' : strength === 2 ? 'Media' : 'Fuerte'}
                </span>
              </div>
            )}
          </div>

          <Field id="reg-confirm" label="Confirmar contraseña" type={showConfirm ? 'text' : 'password'} value={confirm}
            onChange={v => { setConfirm(v); setErrors(p => ({ ...p, confirm: '' })) }}
            placeholder="Repite tu contraseña" error={errors.confirm} autoComplete="new-password"
            suffix={
              <button type="button" onClick={() => setShowConfirm(s => !s)} className="hover:opacity-70 transition-opacity">
                <IconEye open={showConfirm} />
              </button>
            }
          />

          <div className="space-y-1">
            <label className="flex items-start gap-2.5 cursor-pointer select-none">
              <input type="checkbox" checked={terms} onChange={e => { setTerms(e.target.checked); setErrors(p => ({ ...p, terms: '' })) }}
                className="w-4 h-4 rounded mt-0.5 accent-indigo-500"/>
              <span className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                Acepto los{' '}
                <span className="font-medium" style={{ color: 'var(--primary)' }}>términos y condiciones</span>
                {' '}y la política de privacidad
              </span>
            </label>
            {errors.terms && <p className="text-xs ml-6" style={{ color: '#ef4444' }}>{errors.terms}</p>}
          </div>

          <button type="submit" disabled={loading}
            className="flex items-center justify-center gap-2 w-full h-11 rounded-xl font-semibold text-sm transition-all active:scale-95 disabled:opacity-70"
            style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)', color: '#fff',
              boxShadow: '0 4px 14px color-mix(in srgb, var(--primary) 30%, transparent)' }}>
            {loading ? <><IconSpinner />Creando cuenta...</> : 'Crear cuenta'}
          </button>
        </form>

        <p className="text-center text-sm mt-5" style={{ color: 'var(--muted-foreground)' }}>
          ¿Ya tienes cuenta?{' '}
          <button onClick={onSwitchToLogin} className="font-semibold hover:opacity-70 transition-opacity"
            style={{ color: 'var(--primary)' }}>
            Inicia sesión aquí
          </button>
        </p>
      </div>
    </Modal>
  )
}

// ── Feature card ──────────────────────────────────────────────────────────────

interface FeatureCardProps {
  icon: React.ReactNode
  iconBg: string
  title: string
  description: string
}

function FeatureCard({ icon, iconBg, title, description }: FeatureCardProps) {
  const ref = useRef<HTMLDivElement>(null)

  return (
    <div
      ref={ref}
      className="p-6 rounded-2xl border transition-all duration-200"
      style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}
      onMouseEnter={e => {
        const el = e.currentTarget as HTMLElement
        el.style.borderColor = 'color-mix(in srgb, var(--primary) 35%, transparent)'
        el.style.boxShadow = '0 8px 24px color-mix(in srgb, var(--primary) 8%, transparent)'
        el.style.transform = 'translateY(-2px)'
      }}
      onMouseLeave={e => {
        const el = e.currentTarget as HTMLElement
        el.style.borderColor = 'var(--border)'
        el.style.boxShadow = 'none'
        el.style.transform = 'translateY(0)'
      }}
    >
      <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ background: iconBg }}>
        <div className="text-white">{icon}</div>
      </div>
      <h3 className="font-semibold text-base mb-2">{title}</h3>
      <p className="text-sm leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>{description}</p>
    </div>
  )
}

// ── Main LandingPage ──────────────────────────────────────────────────────────

interface LandingPageProps {
  dark: boolean
  onToggleDark: () => void
  onEnterApp: () => void
}

type ModalType = 'login' | 'register' | null

export default function LandingPage({ dark, onToggleDark, onEnterApp }: LandingPageProps) {
  const [modal, setModal] = useState<ModalType>(null)
  const [showComingSoon, setShowComingSoon] = useState(false)

  const handleSuccess = () => {
    setModal(null)
    onEnterApp()
  }

  return (
    <>
      {/* Grid dot background */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at center, color-mix(in srgb, var(--primary) 5%, transparent) 1px, transparent 1px)`,
          backgroundSize: '28px 28px',
        }}
      />
      {/* Top glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at center top, color-mix(in srgb, #4f46e5 12%, transparent), transparent 70%)' }}
      />

      {/* ── Navbar ── */}
      <header
        className="sticky top-0 z-40 backdrop-blur-md border-b"
        style={{ backgroundColor: 'color-mix(in srgb, var(--background) 85%, transparent)', borderColor: 'var(--border)' }}
      >
        <div className="max-w-6xl mx-auto px-5 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white shadow-sm"
              style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)' }}>
              <IconBrain size={18} />
            </div>
            <span className="font-semibold text-sm tracking-tight">Organización Inteligente del Conocimiento Técnico</span>
          </div>

          <div className="flex items-center gap-2.5">
            <button onClick={onToggleDark}
              className="w-8 h-8 rounded-lg flex items-center justify-center border transition-colors hover:opacity-80"
              style={{ borderColor: 'var(--border)', color: 'var(--muted-foreground)' }}
              aria-label="Toggle dark mode">
              {dark ? <IconSun /> : <IconMoon />}
            </button>
            <button onClick={() => setModal('login')}
              className="h-9 px-4 rounded-xl text-sm font-medium border transition-all hover:shadow-sm"
              style={{ borderColor: 'var(--border)', color: 'var(--foreground)', backgroundColor: 'var(--card)' }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = 'color-mix(in srgb, var(--primary) 50%, transparent)'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'}>
              Iniciar sesión
            </button>
            <button onClick={() => setModal('register')}
              className="h-9 px-4 rounded-xl text-sm font-semibold transition-all active:scale-95"
              style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)', color: '#fff',
                boxShadow: '0 2px 10px color-mix(in srgb, var(--primary) 30%, transparent)' }}>
              Crear cuenta
            </button>
          </div>
        </div>
      </header>

      <main className="relative max-w-6xl mx-auto px-5">
        {/* ── Hero ── */}
        <section className="py-20 sm:py-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-full border"
                style={{ borderColor: 'color-mix(in srgb, var(--primary) 30%, transparent)',
                  backgroundColor: 'color-mix(in srgb, var(--primary) 8%, transparent)', color: 'var(--primary)' }}>
                <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: 'var(--primary)' }}/>
                Hackathon ONE · Alura + Oracle 2026
              </div>

              <h1 className="text-4xl sm:text-5xl font-bold tracking-tight leading-tight">
                Organiza tu{' '}
                <span style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  conocimiento técnico
                </span>
                {' '}con Inteligencia Artificial
              </h1>

              <p className="text-lg leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>
                Clasifica, organiza y encuentra tu contenido técnico de forma automática usando Machine Learning. Detecta categorías y niveles de confianza en segundos.
              </p>

{/*             <div className="flex flex-col sm:flex-row gap-3 pt-2">
                 <button onClick={() => setModal('register')}
                   className="flex items-center justify-center gap-2 h-12 px-8 rounded-xl font-semibold text-base transition-all active:scale-95"
                   style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)', color: '#fff',
                     boxShadow: '0 6px 20px color-mix(in srgb, var(--primary) 35%, transparent)' }}>
                   Registrate →
                 </button>
                 <button
                   onClick={() => setShowComingSoon(true)}
                   className="flex items-center justify-center h-12 px-8 rounded-xl font-medium text-base border transition-all"
                   style={{ borderColor: 'var(--border)', color: 'var(--foreground)', backgroundColor: 'var(--card)' }}
                   onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = 'color-mix(in srgb, var(--primary) 40%, transparent)'}
                   onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'}>
                   Prueba sin cuenta
                 </button>
               </div>*/}

              {/* Social proof strip */}
              <div className="flex items-center gap-4 pt-4">
                <div className="flex -space-x-2">
                  {['#4f46e5','#7c3aed','#059669','#0284c7'].map((c, i) => (
                    <div key={i} className="w-7 h-7 rounded-full border-2 flex items-center justify-center text-white text-xs font-bold"
                      style={{ borderColor: 'var(--background)', backgroundColor: c }}>
                      {['A','B','C','D'][i]}
                    </div>
                  ))}
                </div>
                <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                  <span className="font-semibold" style={{ color: 'var(--foreground)' }}>+240</span> clasificaciones realizadas
                </p>
              </div>
            </div>

            {/* Illustration */}
            <div className="relative">
              <div className="absolute inset-0 rounded-3xl"
                style={{ background: 'radial-gradient(ellipse at center, color-mix(in srgb, var(--primary) 8%, transparent), transparent 70%)' }}
              />
              <div className="relative rounded-3xl p-4">
                <NetworkIllustration dark={dark} />
              </div>
            </div>
          </div>
        </section>

                {/* ── CTA Banner ── */}
                <section className="pb-10">
                  <div className="relative overflow-hidden rounded-3xl p-10 sm:p-14 text-center"
                    style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)' }}>
                    {/* Decorative circles */}
                    <div className="absolute -top-10 -left-10 w-48 h-48 rounded-full opacity-20"
                      style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}/>
                    <div className="absolute -bottom-12 -right-8 w-56 h-56 rounded-full opacity-10"
                      style={{ backgroundColor: 'rgba(255,255,255,0.3)' }}/>
                    <div className="relative z-10 space-y-4">
                      <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
                        ¿Listo para clasificar tu conocimiento?
                      </h2>
                      <p className="text-base text-white/75 max-w-lg mx-auto">
                        Prueba el clasificador con tus propios textos técnicos ahora mismo, crea tu propia cuenta para una experiencia más personalizada.
                      </p>
                      <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                        <button onClick={() => setModal('register')}
                          className="h-12 px-8 rounded-xl font-semibold text-base transition-all active:scale-95"
                          style={{ backgroundColor: 'white', color: '#4f46e5' }}>
                          Registrate
                        </button>
                        <button onClick={() => setShowComingSoon(true)}
                          className="h-12 px-8 rounded-xl font-medium text-base border border-white/30 text-white transition-all hover:bg-white/10">
                          Probar sin cuenta
                        </button>
                      </div>
                    </div>
                  </div>
                </section>


        {/* ── Stats strip ── */}
        <section className="border-t border-b py-8 mb-20"
          style={{ borderColor: 'var(--border)' }}>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
            {[
              { value: '5', label: 'Categorías técnicas' },
              { value: '< 5s', label: 'Tiempo de respuesta' },
              { value: '90%', label: 'Precisión promedio' },
              { value: 'JSON', label: 'Respuesta estructurada' },
            ].map(s => (
              <div key={s.label}>
                <p className="text-2xl font-bold tracking-tight"
                  style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  {s.value}
                </p>
                <p className="text-sm mt-1" style={{ color: 'var(--muted-foreground)' }}>{s.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Features ── */}
        <section className="pb-24">
          <div className="text-center mb-12 space-y-3">
            <div className="inline-flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-full border"
              style={{ borderColor: 'color-mix(in srgb, var(--primary) 30%, transparent)',
                backgroundColor: 'color-mix(in srgb, var(--primary) 8%, transparent)', color: 'var(--primary)' }}>
              Características
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Todo lo que necesitas para{' '}
              <span style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                organizar tu aprendizaje
              </span>
            </h2>
            <p className="text-base max-w-xl mx-auto" style={{ color: 'var(--muted-foreground)' }}>
              Un clasificador inteligente pensado para estudiantes y profesionales de tecnología.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <FeatureCard
              icon={<IconTag />}
              iconBg="linear-gradient(135deg, #4f46e5, #6366f1)"
              title="Clasificación automática"
              description="Detecta la categoría técnica de cualquier texto en segundos: Backend, Frontend, Cloud y más."
            />
            <FeatureCard
              icon={<IconCode />}
              iconBg="linear-gradient(135deg, #059669, #10b981)"
              title="Respuesta en JSON"
              description="Obtén el resultado estructurado en JSON con categoría, confianza, subcategorías y métricas del modelo."
            />
            <FeatureCard
              icon={<IconChip />}
              iconBg="linear-gradient(135deg, #7c3aed, #8b5cf6)"
              title="Basado en ML"
              description="Motor de clasificación basado en Machine Learning entrenado con contenido técnico real."
            />
            <FeatureCard
              icon={<IconCloud />}
              iconBg="linear-gradient(135deg, #0284c7, #0ea5e9)"
              title="Integración OCI"
              description="Arquitectura preparada para integrarse con Oracle Cloud Infrastructure Object Storage para escalar sin límites."
            />
          </div>
        </section>

      </main>

      {/* ── Footer ── */}
      <footer className="border-t py-10" style={{ borderColor: 'var(--border)' }}>
        <div className="max-w-6xl mx-auto px-5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white"
                style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)' }}>
                <IconBrain size={14} />
              </div>
              <span className="text-sm font-semibold">Clasificador de Contenido Técnico</span>
            </div>

                </div>

          <div className="mt-6 pt-6 border-t flex flex-col sm:flex-row items-center justify-between gap-2"
            style={{ borderColor: 'var(--border)' }}>
            <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
              Hecho para{' '}
              <span className="font-medium" style={{ color: 'var(--foreground)' }}>Hackathon ONE · Alura + Oracle</span>
            </p>
            <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
              Modelo{' '}
              <code className="px-1.5 py-0.5 rounded"
                style={{ backgroundColor: 'var(--secondary)', fontFamily: "'JetBrains Mono', monospace", fontSize: '0.7rem' }}>
                tech-classifier-v2.1
              </code>
            </p>
          </div>
        </div>
      </footer>

      {/* ── Modals ── */}
      {modal === 'login' && (
        <LoginModal
          onClose={() => setModal(null)}
          onSwitchToRegister={() => setModal('register')}
          onSuccess={handleSuccess}
        />
      )}
      {modal === 'register' && (
        <RegisterModal
          onClose={() => setModal(null)}
          onSwitchToLogin={() => setModal('login')}
          onSuccess={() => setModal('login')}
        />
      )}
  {showComingSoon && (
    <ComingSoonModal
      onClose={() => setShowComingSoon(false)}
    />
  )}
    </>
  )
}
