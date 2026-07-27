import { createContext, useContext, useState, type ReactNode } from 'react'

type UserContextType = {
  username: string
  setUsername: (name: string) => void
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }: { children: ReactNode }) {
  const [username, setUsername] = useState<string>('Usuario') // valor por defecto

  return (
    <UserContext.Provider value={{ username, setUsername }}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  const context = useContext(UserContext)
  if (!context) {
    throw new Error('useUser debe usarse dentro de un UserProvider')
  }
  return context
}