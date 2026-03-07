'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { ChevronLeft, MapPin } from 'lucide-react'

interface Step3Props {
  fullName: string
  skill: string
  onNext: (description: string, location: string) => void
  onBack: () => void
}

export function OnboardingStep3({
  fullName,
  skill,
  onNext,
  onBack,
}: Step3Props) {
  const [description, setDescription] = useState('')
  const [location, setLocation] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleNext = () => {
    const newErrors: Record<string, string> = {}

    if (!description.trim()) {
      newErrors.description = 'Please describe your services'
    }
    if (!location.trim()) {
      newErrors.location = 'Please enter your location'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    onNext(description, location)
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
          Tell us about your services
        </h2>
        <p className="text-muted-foreground text-sm mb-6">
          Help customers understand what you offer
        </p>

        {/* Form */}
        <div className="space-y-4">
          {/* Service Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-foreground">
              Service Description
            </Label>
            <Textarea
              id="description"
              placeholder="Describe your experience and what services you offer..."
              value={description}
              onChange={(e) => {
                setDescription(e.target.value)
                setErrors((prev) => ({ ...prev, description: '' }))
              }}
              className="h-24 text-base rounded-xl border-input focus:ring-primary resize-none"
            />
            {errors.description && (
              <p className="text-red-600 text-sm">{errors.description}</p>
            )}
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label htmlFor="location" className="text-foreground">
              Service Location
            </Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3.5 w-5 h-5 text-muted-foreground" />
              <Input
                id="location"
                type="text"
                placeholder="City or area name"
                value={location}
                onChange={(e) => {
                  setLocation(e.target.value)
                  setErrors((prev) => ({ ...prev, location: '' }))
                }}
                className="h-12 pl-10 text-base rounded-xl border-input focus:ring-primary"
              />
            </div>
            {errors.location && (
              <p className="text-red-600 text-sm">{errors.location}</p>
            )}
          </div>

          <p className="text-xs text-muted-foreground mt-4">
            Customers will find you based on this location
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
