'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { useRouter } from 'next/navigation'
import authService, {
  AuthResponse,
  LoginCredentials,
  RegisterData,
} from '@/lib/services/auth-service'

export interface User {
  _id: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  bio?: string
  profileImage?: string
  role: 'user' | 'admin' | 'premium_user'
  status: 'active' | 'inactive' | 'suspended'
  emailVerified: boolean
}

export interface UseAuthReturn {
  user: User | null
  loading: boolean
  error: string | null
  isAuthenticated: boolean
  login: (credentials: LoginCredentials) => Promise<void>
  register: (data: RegisterData) => Promise<void>
  logout: () => Promise<void>
  updateProfile: (data: Record<string, unknown>) => Promise<void>
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>
}

const AuthContext = createContext<UseAuthReturn | null>(null)

function isAuthFailure(message: string): boolean {
  const lower = message.toLowerCase()
  return (
    lower.includes('unauthorized') ||
    lower.includes('invalid token') ||
    lower.includes('not found') ||
    lower.includes('401') ||
    lower.includes('404')
  )
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    const initializeAuth = async () => {
      const stored = authService.getStoredUser() as User | null
      if (stored && !cancelled) {
        setUser(stored)
      }

      if (!authService.isAuthenticated()) {
        if (!cancelled) setLoading(false)
        return
      }

      try {
        const profile = await authService.getProfile()
        if (!cancelled && profile) {
          setUser(profile as User)
          authService.storeUser(profile)
        }
      } catch (profileErr) {
        const message =
          profileErr instanceof Error ? profileErr.message : 'Profile fetch failed'

        if (isAuthFailure(message)) {
          authService.clearSession()
          if (!cancelled) setUser(null)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    initializeAuth()
    return () => {
      cancelled = true
    }
  }, [])

  const login = useCallback(
    async (credentials: LoginCredentials) => {
      try {
        setError(null)
        setLoading(true)
        const response: AuthResponse = await authService.login(credentials)
        setUser(response.user as User)
        authService.storeUser(response.user)
        router.push('/dashboard')
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error ? err.message : 'Login failed'
        setError(errorMessage)
        throw err
      } finally {
        setLoading(false)
      }
    },
    [router]
  )

  const register = useCallback(
    async (data: RegisterData) => {
      try {
        setError(null)
        setLoading(true)
        const response: AuthResponse = await authService.register(data)
        setUser(response.user as User)
        authService.storeUser(response.user)
        router.push('/dashboard')
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error ? err.message : 'Registration failed'
        setError(errorMessage)
        throw err
      } finally {
        setLoading(false)
      }
    },
    [router]
  )

  const logout = useCallback(async () => {
    try {
      setError(null)
      await authService.logout()
    } catch (err) {
      console.warn('Logout error:', err)
    } finally {
      setUser(null)
      router.push('/login')
    }
  }, [router])

  const updateProfile = useCallback(async (data: Record<string, unknown>) => {
    try {
      setError(null)
      setLoading(true)
      const nextUser = (await authService.updateProfile(data)) as User
      setUser(nextUser)
      authService.storeUser(nextUser)
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : 'Profile update failed'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const changePassword = useCallback(
    async (currentPassword: string, newPassword: string) => {
      try {
        setError(null)
        setLoading(true)
        await authService.changePassword({ currentPassword, newPassword })
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error ? err.message : 'Password change failed'
        setError(errorMessage)
        throw err
      } finally {
        setLoading(false)
      }
    },
    []
  )

  const value = useMemo<UseAuthReturn>(
    () => ({
      user,
      loading,
      error,
      isAuthenticated: !!user,
      login,
      register,
      logout,
      updateProfile,
      changePassword,
    }),
    [user, loading, error, login, register, logout, updateProfile, changePassword]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): UseAuthReturn {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
