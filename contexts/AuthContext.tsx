'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useRouter } from 'next/navigation'

export interface User {
  id: string
  email: string
  createdAt?: string
  updatedAt?: string
}

interface Session {
  access_token: string
  refresh_token: string
  expires_at: number
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
const TOKEN_KEY = 'access_token'
const REFRESH_TOKEN_KEY = 'refresh_token'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // Get token from localStorage
  const getToken = (): string | null => {
    if (typeof window === 'undefined') return null
    return localStorage.getItem(TOKEN_KEY)
  }

  // Get refresh token from localStorage
  const getRefreshToken = (): string | null => {
    if (typeof window === 'undefined') return null
    return localStorage.getItem(REFRESH_TOKEN_KEY)
  }

  // Set tokens in localStorage
  const setTokens = (session: Session) => {
    if (typeof window === 'undefined') return
    localStorage.setItem(TOKEN_KEY, session.access_token)
    localStorage.setItem(REFRESH_TOKEN_KEY, session.refresh_token)
  }

  // Clear tokens from localStorage
  const clearTokens = () => {
    if (typeof window === 'undefined') return
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(REFRESH_TOKEN_KEY)
  }

  // Fetch current user from API
  const fetchUser = async (): Promise<User | null> => {
    const token = getToken()
    if (!token) return null

    try {
      const response = await fetch(`${API_URL}/api/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        // If unauthorized, try to refresh token
        if (response.status === 401) {
          const refreshToken = getRefreshToken()
          if (refreshToken) {
            const refreshed = await refreshAccessToken(refreshToken)
            if (refreshed) {
              // Retry with new token
              const newToken = getToken()
              if (newToken) {
                const retryResponse = await fetch(`${API_URL}/api/auth/me`, {
                  headers: {
                    Authorization: `Bearer ${newToken}`,
                  },
                })
                if (retryResponse.ok) {
                  const data = await retryResponse.json()
                  return data.user
                }
              }
            }
          }
        }
        clearTokens()
        return null
      }

      const data = await response.json()
      return data.user
    } catch (error) {
      console.error('Failed to fetch user:', error)
      return null
    }
  }

  // Refresh access token
  const refreshAccessToken = async (refreshToken: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_URL}/api/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh_token: refreshToken }),
      })

      if (!response.ok) {
        clearTokens()
        return false
      }

      const data = await response.json()
      setTokens(data.session)
      return true
    } catch (error) {
      console.error('Failed to refresh token:', error)
      clearTokens()
      return false
    }
  }

  // Initialize: Check if user is authenticated
  useEffect(() => {
    const initAuth = async () => {
      const token = getToken()
      if (!token) {
        setLoading(false)
        return
      }

      const userData = await fetchUser()
      setUser(userData)
      setLoading(false)
    }

    initAuth()
  }, [])

  // Login
  const login = async (email: string, password: string) => {
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    })

    if (!response.ok) {
      let errorMessage = 'Erro ao fazer login'
      try {
        const errorData = await response.json()
        errorMessage = errorData.error || errorData.message || errorMessage
      } catch {
        errorMessage = response.statusText || `Erro ${response.status}`
      }
      throw new Error(errorMessage)
    }

    const data = await response.json()
    setTokens(data.session)
    setUser(data.user)
  }

  // Register
  const register = async (email: string, password: string) => {
    const response = await fetch(`${API_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    })

    if (!response.ok) {
      let errorMessage = 'Erro ao criar conta'
      try {
        const errorData = await response.json()
        errorMessage = errorData.error || errorData.message || errorMessage
      } catch {
        errorMessage = response.statusText || `Erro ${response.status}`
      }
      throw new Error(errorMessage)
    }

    const data = await response.json()
    if (data.session) {
      setTokens(data.session)
      setUser(data.user)
    }
  }

  // Logout
  const logout = async () => {
    const token = getToken()
    
    // Try to call logout endpoint (optional, can fail silently)
    if (token) {
      try {
        await fetch(`${API_URL}/api/auth/logout`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
      } catch (error) {
        // Ignore errors on logout
        console.error('Logout error:', error)
      }
    }

    clearTokens()
    setUser(null)
  }

  // Refresh user data
  const refreshUser = async () => {
    const userData = await fetchUser()
    setUser(userData)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  
  return context
}
