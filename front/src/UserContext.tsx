import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'

// ===== NUEVO: Tipo que representa al usuario autenticado =====
export type User = {
  id: number
  name: string
  email: string
  role: string
  token: string
}

// ===== CAMBIO: Ahora el contexto guarda un usuario completo =====
type UserContextType = {
  user: User | null
  setUser: (user: User | null) => void
}

// ===== CAMBIO: Se mantiene la creación del contexto =====
const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const savedUser = localStorage.getItem("user")
    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }
  }, [])

  const saveUser = (user: User | null) => {
    setUser(user)
    if (user) {
      localStorage.setItem("user", JSON.stringify(user))
    } else {
      localStorage.removeItem("user")
    }
  }
  return (
    <UserContext.Provider value={{ user, setUser: saveUser }}>
      {children}
    </UserContext.Provider>
  )
}

// ===== SIN CAMBIOS: Hook para acceder al contexto =====
export function useUser() {
  const context = useContext(UserContext)
  if (!context) {
    throw new Error('useUser debe usarse dentro de un UserProvider')
  }

  return context
}
