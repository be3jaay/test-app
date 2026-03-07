'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ChevronLeft } from 'lucide-react'
import {
  Zap,
  Wrench,
  Hammer,
  Wrench as WrenchIcon,
  RotateCcw,
} from 'lucide-react'

const SKILLS = [
  { id: 'electrician', label: 'Electrician', icon: Zap },
  { id: 'plumber', label: 'Plumber', icon: Wrench },
  { id: 'carpenter', label: 'Carpenter', icon: Hammer },
  { id: 'mechanic', label: 'Mechanic', icon: WrenchIcon },
  { id: 'appliance', label: 'Appliance Repair', icon: RotateCcw },
]

interface Step2Props {
  fullName: string
  onNext: (skill: string) => void
  onBack: () => void
}

export function OnboardingStep2({ fullName, onNext, onBack }: Step2Props) {
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null)
  const [error, setError] = useState('')

  const handleNext = () => {
    if (!selectedSkill) {
      setError('Please select a skill category')
      return
    }
    onNext(selectedSkill)
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
          <div className="h-1 flex-1 bg-border rounded-full"></div>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-foreground mb-2">
          What's your skill?
        </h2>
        <p className="text-muted-foreground text-sm mb-6">
          Hi {fullName}! Select the service category you offer
        </p>

        {/* Skill Cards */}
        <div className="space-y-3 mb-6">
          {SKILLS.map((skill) => {
            const IconComponent = skill.icon
            return (
              <Card
                key={skill.id}
                onClick={() => {
                  setSelectedSkill(skill.id)
                  setError('')
                }}
                className={`p-4 cursor-pointer transition border-2 ${
                  selectedSkill === skill.id
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                      selectedSkill === skill.id
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary text-foreground'
                    }`}
                  >
                    <IconComponent className="w-6 h-6" />
                  </div>
                  <span className="font-semibold text-foreground">
                    {skill.label}
                  </span>
                </div>
              </Card>
            )
          })}
        </div>

        {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

        <Button
          onClick={handleNext}
          disabled={!selectedSkill}
          className="w-full h-12 text-base font-semibold bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Continue
        </Button>
      </div>
    </div>
  )
}
