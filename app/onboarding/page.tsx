"use client"

import { useRequireAuth } from "@/components/providers/auth-provider"
import { ClientOnboarding } from "@/components/onboarding/client-onboarding"
import { WorkerOnboarding } from "@/components/onboarding/worker-onboarding"
import { TRole } from "@/services/auth/types"

export default function OnboardingPage() {
  const { isAuthenticated, role, isLoading } = useRequireAuth()

  if (isLoading || !isAuthenticated) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <p>Loading...</p>
      </div>
    )
  }

  return role === TRole.WORKER ? <WorkerOnboarding /> : <ClientOnboarding />
}
