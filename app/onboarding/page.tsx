'use client'

import { useState } from 'react'
import { OnboardingStep1 } from '@/components/onboarding-step1'
import { OnboardingStep2 } from '@/components/onboarding-step2'
import { OnboardingStep3 } from '@/components/onboarding-step3'
import { OnboardingStep4 } from '@/components/onboarding-step4'
import { OnboardingSuccess } from '@/components/onboarding-success'

type Step = 'step1' | 'step2' | 'step3' | 'step4' | 'success'

interface OnboardingData {
  fullName: string
  skill: string
  description: string
  location: string
  availability: { online: boolean; offline: boolean }
}

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState<Step>('step1')
  const [data, setData] = useState<Partial<OnboardingData>>({})

  const handleStep1Next = (fullName: string) => {
    setData((prev) => ({ ...prev, fullName }))
    setCurrentStep('step2')
  }

  const handleStep2Next = (skill: string) => {
    setData((prev) => ({ ...prev, skill }))
    setCurrentStep('step3')
  }

  const handleStep3Next = (description: string, location: string) => {
    setData((prev) => ({ ...prev, description, location }))
    setCurrentStep('step4')
  }

  const handleStep4Submit = (availability: {
    online: boolean
    offline: boolean
  }) => {
    setData((prev) => ({ ...prev, availability }))
    // Here you would typically send the data to your backend
    console.log('Onboarding completed:', { ...data, availability })
    setCurrentStep('success')
  }

  const handleBack = () => {
    if (currentStep === 'step2') {
      setCurrentStep('step1')
    } else if (currentStep === 'step3') {
      setCurrentStep('step2')
    } else if (currentStep === 'step4') {
      setCurrentStep('step3')
    }
  }

  const handleSuccess = () => {
    // Redirect to dashboard or home page
    console.log('Redirecting to dashboard...')
  }

  return (
    <>
      {currentStep === 'step1' && (
        <OnboardingStep1 onNext={handleStep1Next} />
      )}
      {currentStep === 'step2' && (
        <OnboardingStep2
          fullName={data.fullName || ''}
          onNext={handleStep2Next}
          onBack={handleBack}
        />
      )}
      {currentStep === 'step3' && (
        <OnboardingStep3
          fullName={data.fullName || ''}
          skill={data.skill || ''}
          onNext={handleStep3Next}
          onBack={handleBack}
        />
      )}
      {currentStep === 'step4' && (
        <OnboardingStep4
          fullName={data.fullName || ''}
          onSubmit={handleStep4Submit}
          onBack={handleBack}
        />
      )}
      {currentStep === 'success' && (
        <OnboardingSuccess
          fullName={data.fullName || ''}
          onComplete={handleSuccess}
        />
      )}
    </>
  )
}
