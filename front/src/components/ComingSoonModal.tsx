import { IconInfoCircle, IconX } from '@tabler/icons-react'

type ComingSoonModalProps = {
  onClose: () => void
}

export default function ComingSoonModal({
  onClose,
}: ComingSoonModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,.55)' }}
    >
      <div
        className="relative w-full max-w-md rounded-3xl border shadow-2xl p-7"
        style={{
          backgroundColor: 'var(--card)',
          borderColor: 'var(--border)',
        }}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-lg transition-colors"
          style={{ color: 'var(--muted-foreground)' }}
        >
           <span className="text-lg font-bold">✕</span>
        </button>

        <div className="flex justify-center mb-5">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center text-3xl"
            style={{
              background: 'linear-gradient(135deg,#4f46e5 0%, #7c3aed 100%)',
            }}
          >
            🚧
          </div>
        </div>

        <h2
          className="text-xl font-bold text-center mb-3"
          style={{ color: 'var(--foreground)' }}
        >
          Próximamente
        </h2>

        <p
          className="text-sm leading-7 text-center"
          style={{ color: 'var(--muted-foreground)' }}
        >
          La opción
          <strong> "Probar sin cuenta"</strong>
          {' '}estará disponible en una próxima versión.
        </p>

        <p
          className="text-sm leading-7 text-center mt-3"
          style={{ color: 'var(--muted-foreground)' }}
        >
          Mientras tanto puedes iniciar sesión o crear una cuenta para
          utilizar todas las funciones del clasificador.
        </p>

        <button
          onClick={onClose}
          className="mt-8 w-full h-11 rounded-xl text-white font-medium transition-transform hover:scale-[1.02]"
          style={{
            background:
              'linear-gradient(135deg,#4f46e5 0%, #7c3aed 100%)',
          }}
        >
          Entendido
        </button>
      </div>
    </div>
  )
}