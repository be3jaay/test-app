'use client'

import { Button } from '@/components/ui/button'
import { CheckCircle } from 'lucide-react'

interface OnboardingSuccessProps {
  fullName: string
  onComplete: () => void
}

export function OnboardingSuccess({
  fullName,
  onComplete,
}: OnboardingSuccessProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background px-4 py-8">
      <div className="w-full max-w-sm text-center">
        {/* Success Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-24 h-24 bg-primary rounded-full flex items-center justify-center">
            <CheckCircle className="w-12 h-12 text-primary-foreground" />
          </div>
        </div>

        {/* Success Message */}
        <h1 className="text-3xl font-bold text-foreground mb-3">
          You're all set!
        </h1>

        <div className="space-y-4 mb-8">
          <p className="text-lg text-muted-foreground">
            You're now visible to customers!
          </p>
          <p className="text-sm text-muted-foreground">
            Welcome to our service community, {fullName}. Customers in your area
            will start seeing your profile and can reach out for your services.
          </p>
        </div>

        {/* Features List */}
        <div className="bg-secondary rounded-xl p-6 mb-8 space-y-3 text-left">
          <div className="flex items-start gap-3">
            <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-primary-foreground text-xs font-bold">✓</span>
            </div>
            <p className="text-sm text-foreground">
              Customers can find and contact you
            </p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-primary-foreground text-xs font-bold">✓</span>
            </div>
            <p className="text-sm text-foreground">
              Receive job requests instantly
            </p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-primary-foreground text-xs font-bold">✓</span>
            </div>
            <p className="text-sm text-foreground">
              Build your reputation with ratings
            </p>
          </div>
        </div>

        <Button
          onClick={onComplete}
          className="w-full h-12 text-base font-semibold bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl"
        >
          Go to Dashboard
        </Button>
      </div>
    </div>
  )
}
