"use client"

import { createContext, useCallback, useContext, useEffect, useState, useRef } from "react"
import { usePathname, useRouter } from "next/navigation"
import { TokenStorage } from "@/services/token-storage"
import { TRole } from "@/services/auth/types"
import ApiService from "@/services/api-services"

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
  const pathname = usePathname()
  const isMountedRef = useRef(false)
  const [state, setState] = useState<AuthState>({
    isAuthenticated: false,
    role: null,
    isLoading: true,
  })

  // Initialize auth state on mount to prevent hydration mismatch
  useEffect(() => {
    const token = TokenStorage.getAccessToken()
    const role = TokenStorage.getRole()
    setState({
      isAuthenticated: !!token,
      role,
      isLoading: false,
    })
    isMountedRef.current = true

    // If logged in but userId is missing, fetch profile to recover it
    if (token && !TokenStorage.getUserId()) {
      ApiService.get<{ _id?: string; data?: { _id?: string } }>("/auth/profile")
        .then((res: any) => {
          const id = res?._id || res?.data?._id
          if (id) TokenStorage.setUserId(id)
        })
        .catch(() => {})
    }
  }, [])

  // Re-sync auth state from storage whenever route changes (e.g. after login redirect)
  useEffect(() => {
    if (!isMountedRef.current) return
    const token = TokenStorage.getAccessToken()
    const role = TokenStorage.getRole()
    setState({
      isAuthenticated: !!token,
      role,
      isLoading: false,
    })
  }, [pathname])

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
