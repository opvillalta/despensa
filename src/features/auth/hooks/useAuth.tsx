import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { Session, User, AuthChangeEvent } from '@supabase/supabase-js'
import { supabase } from '../../../lib/supabase'

interface AuthContextType {
  user: User | null
  session: Session | null
  householdId: string | null
  loading: boolean
  login: (email: string, pass: string) => Promise<{ data?: unknown; error: Error | null }>
  register: (email: string, pass: string) => Promise<{ data?: { user: User | null; session: Session | null } | null; error: Error | null }>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [householdId, setHouseholdId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  async function fetchHouseholdId(userId: string) {
    try {
      const { data, error } = await supabase
        .from('household_members')
        .select('household_id')
        .eq('user_id', userId)
        .maybeSingle()

      if (!error && data?.household_id) {
        setHouseholdId(data.household_id)
        return
      }

      // Si el usuario existe pero no tiene hogar asignado (ej: trigger no corrió al registrarse),
      // creamos un hogar para él de forma defensiva para que la app no quede inutilizable.
      console.warn('Usuario sin hogar asignado. Creando hogar inicial...')
      const { data: newHousehold, error: hError } = await supabase
        .from('households')
        .insert({ name: 'Mi Hogar' })
        .select('id')
        .single()

      if (hError) {
        console.error('Error al crear hogar de respaldo:', hError)
        return
      }

      if (newHousehold?.id) {
        await supabase.from('household_members').insert({
          household_id: newHousehold.id,
          user_id: userId,
          role: 'owner',
        })
        setHouseholdId(newHousehold.id)
      }
    } catch (err) {
      console.error('Error al obtener o inicializar el hogar:', err)
    }
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }: { data: { session: Session | null } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchHouseholdId(session.user.id)
      }
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: AuthChangeEvent, session: Session | null) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchHouseholdId(session.user.id)
      } else {
        setHouseholdId(null)
      }
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  async function login(email: string, pass: string) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password: pass })
    return { data, error }
  }

  async function register(email: string, pass: string) {
    const { data, error } = await supabase.auth.signUp({ email, password: pass })
    return { data, error }
  }

  async function logout() {
    await supabase.auth.signOut()
  }

  return (
    <AuthContext.Provider value={{ user, session, householdId, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider')
  }
  return context
}
