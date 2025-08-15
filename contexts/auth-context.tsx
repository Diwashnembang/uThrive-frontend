"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import type { User, UserRole } from "@/types"
import { getCurrentUser, loginUser, logoutUser, registerUser } from "@/lib/auth"

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>
  register: (
    email: string,
    password: string,
    name: string,
    role: UserRole,
  ) => Promise<{ success: boolean; message: string }>
  logout: () => void
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const currentUser = getCurrentUser()
    setUser(currentUser)
    setLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    const result = loginUser(email, password)
    if (result.success && result.user) {
      setUser(result.user)
    }
    return result
  }

  const register = async (email: string, password: string, name: string, role: UserRole) => {
    const result = registerUser(email, password, name, role)
    if (result.success && result.user) {
      setUser(result.user)
    }
    return result
  }

  const logout = () => {
    logoutUser()
    setUser(null)
  }

  return <AuthContext.Provider value={{ user, login, register, logout, loading }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
