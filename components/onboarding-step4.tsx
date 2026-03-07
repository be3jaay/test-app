'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { ChevronLeft } from 'lucide-react'

interface Step4Props {
  fullName: string
  onSubmit: (availability: { online: boolean; offline: boolean }) => void
  onBack: () => void
}

export function OnboardingStep4({
  fullName,
  onSubmit,
  onBack,
}: Step4Props) {
  const [isOnline, setIsOnline] = useState(true)
  const [isOffline, setIsOffline] = useState(true)
  const [error, setError] = useState('')

  const handleSubmit = () => {  
    if (!isOnline && !isOffline) {
      setError('Please select at least one availability option')
      return
    }
    onSubmit({ online: isOnline, offline: isOffline })
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background px-4 py-8">
      <div className="w-full max-w-sm">
        {/* Back Button */}
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-primary mb-6 hover:opacity-75 transition"
        >
          <ChevronLeft className="w-5 h-5" />
          <span className="text-sm">Back</span>
        </button>

        {/* Progress Bar */}
        <div className="flex gap-2 mb-8">
          <div className="h-1 flex-1 bg-primary rounded-full"></div>
          <div className="h-1 flex-1 bg-primary rounded-full"></div>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Your availability
        </h2>
        <p className="text-muted-foreground text-sm mb-6">
          Let customers know when they can reach you
        </p>

        {/* Availability Options */}
        <div className="space-y-3 mb-6">
          {/* Online */}
          <Card className="p-4 border-border hover:border-primary/50 transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-foreground">Online</p>
                <p className="text-xs text-muted-foreground">
                  Available for calls and messages
                </p>
              </div>
              <Switch
                checked={isOnline}
                onCheckedChange={(checked) => {
                  setIsOnline(checked)
                  setError('')
                }}
              />
            </div>
          </Card>

          {/* Offline */}
          <Card className="p-4 border-border hover:border-primary/50 transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-foreground">Offline</p>
                <p className="text-xs text-muted-foreground">
                  Available for in-person visits
                </p>
              </div>
              <Switch
                checked={isOffline}
                onCheckedChange={(checked) => {
                  setIsOffline(checked)
                  setError('')
                }}
              />
            </div>
          </Card>
        </div>

        {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

        <Button
          onClick={handleSubmit}
          className="w-full h-12 text-base font-semibold bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl"
        >
          Start Getting Jobs
        </Button>
      </div>
    </div>
  )
}
