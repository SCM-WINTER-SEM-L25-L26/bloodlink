"use client"

import React, { createContext, useContext, useEffect, useState } from "react"

export interface User {
  id: string
  email: string
  name: string | null
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, name: string, password: string) => Promise<void>
  logout: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)

  // Load user from localStorage on mount (client-side only)
  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    const initializeAuth = async () => {
      setLoading(true)
      const token = localStorage.getItem("auth_token")
      const userData = localStorage.getItem("user")

      if (token && userData) {
        try {
          const parsedUser = JSON.parse(userData)
          const response = await fetch("/api/auth/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token }),
          })

          if (response.ok) {
            const data = await response.json()
            setUser(data.user)
          } else {
            localStorage.removeItem("auth_token")
            localStorage.removeItem("user")
            setUser(null)
          }
        } catch (e) {
          console.error("Error restoring auth from storage:", e)
          localStorage.removeItem("auth_token")
          localStorage.removeItem("user")
          setUser(null)
        }
      } else {
        setUser(null)
      }

      setLoading(false)
      setMounted(true)
    }

    initializeAuth()
  }, [])

  const login = async (email: string, password: string) => {
    setLoading(true)
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Login failed")
      }

      const data = await response.json()
      localStorage.setItem("auth_token", data.token)
      localStorage.setItem("user", JSON.stringify(data.user))
      setUser(data.user)
    } finally {
      setLoading(false)
    }
  }

  const register = async (email: string, name: string, password: string) => {
    setLoading(true)
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase(), name, password }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Registration failed")
      }

      const data = await response.json()
      localStorage.setItem("auth_token", data.token)
      localStorage.setItem("user", JSON.stringify(data.user))
      setUser(data.user)
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    localStorage.removeItem("auth_token")
    localStorage.removeItem("user")
    setUser(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
