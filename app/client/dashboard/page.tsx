"use client"

import { useRequireAuth } from "@/components/providers/auth-provider"
import { TRole } from "@/services/auth/types"
import Link from "next/link"

export default function ClientDashboardPage() {
  const { isAuthenticated, isLoading } = useRequireAuth([TRole.CLIENT])

  if (isLoading || !isAuthenticated) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-4 p-6">
      <h1 className="text-2xl font-bold">Client Dashboard</h1>
      <p className="text-muted-foreground">You are logged in as a client. This is your dashboard.</p>
      <Link href="/login" className="text-sm text-primary underline">
        Back to login
      </Link>
    </div>
  )
}
