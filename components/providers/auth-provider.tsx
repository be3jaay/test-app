"use client"

import { createContext, useCallback, useContext, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { TokenStorage } from "@/services/token-storage"
import { TRole } from "@/services/auth/types"

type AuthState = {
  isAuthenticated: boolean
  role: string | null
  isLoading: boolean
}

type AuthContextValue = AuthState & {
  logout: () => void
  getDashboardPath: () => string
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [state, setState] = useState<AuthState>({
    isAuthenticated: false,
    role: null,
    isLoading: true,
  })

  useEffect(() => {
    const token = TokenStorage.getAccessToken()
    const role = TokenStorage.getRole()
    setState({
      isAuthenticated: !!token,
      role,
      isLoading: false,
    })
  }, [])

  const logout = useCallback(() => {
    TokenStorage.clear()
    setState({ isAuthenticated: false, role: null, isLoading: false })
    router.push("/login")
  }, [router])

  const getDashboardPath = useCallback(() => {
    const role = TokenStorage.getRole()
    if (role === TRole.WORKER) return "/worker/dashboard"
    return "/client/dashboard"
  }, [])

  const value: AuthContextValue = {
    ...state,
    logout,
    getDashboardPath,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}

export function useRequireAuth(allowedRoles?: string[]) {
  const { isAuthenticated, role, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (isLoading) return
    if (!isAuthenticated) {
      router.replace("/login")
      return
    }
    if (allowedRoles?.length && role && !allowedRoles.includes(role)) {
      router.replace(role === TRole.WORKER ? "/worker/dashboard" : "/client/dashboard")
    }
  }, [isAuthenticated, role, isLoading, allowedRoles, router])

  return { isAuthenticated, role, isLoading }
}
