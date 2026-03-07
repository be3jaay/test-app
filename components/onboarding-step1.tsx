'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { User } from 'lucide-react'

interface Step1Props {
  onNext: (fullName: string) => void
}

export function OnboardingStep1({ onNext }: Step1Props) {
  const [fullName, setFullName] = useState('')
  const [error, setError] = useState('')

  const handleNext = () => {
    if (!fullName.trim()) {
      setError('Please enter your full name')
      return
    }
    onNext(fullName)
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background px-4 py-8">
      <div className="w-full max-w-sm">
        {/* Profile Icon */}
        <div className="flex justify-center mb-8">
          <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center">
            <User className="w-10 h-10 text-primary-foreground" />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-foreground text-center mb-2">
          Become a Service Provider
        </h1>
        <p className="text-muted-foreground text-center mb-8 text-sm">
          Start earning by offering your services to nearby customers
        </p>

        {/* Form */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName" className="text-foreground">
              Full Name
            </Label>
            <Input
              id="fullName"
              type="text"
              placeholder="Enter your full name"
              value={fullName}
              onChange={(e) => {
                setFullName(e.target.value)
                setError('')
              }}
              className="h-12 text-base rounded-xl border-input focus:ring-primary"
            />
            {error && <p className="text-red-600 text-sm">{error}</p>}
          </div>

          <p className="text-xs text-muted-foreground mt-4">
            We use your real name to build trust with customers
          </p>

          <Button
            onClick={handleNext}
            className="w-full h-12 text-base font-semibold bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl mt-8"
          >
            Continue
          </Button>
        </div>
      </div>
    </div>
  )
}
