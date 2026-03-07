'use client'

import { useState } from 'react'
import { WorkerStep1 } from './worker-steps/worker-step1'
import { WorkerStep2 } from './worker-steps/worker-step2'
import { WorkerStep3 } from './worker-steps/worker-step3'
import { WorkerSuccess } from './worker-steps/worker-success'
import services from '@/services/services'

type Step = 'step1' | 'step2' | 'step3' | 'success'

interface OnboardingData {
  name: string
  phone: string
  skills: string[]
  location: string
  serviceDescription: string
}

export function WorkerOnboarding() {
  const [currentStep, setCurrentStep] = useState<Step>('step1')
  const [data, setData] = useState<Partial<OnboardingData>>({})

  const handleStep1Next = (name: string, phone: string) => {
    setData((prev) => ({ ...prev, name, phone }))
    setCurrentStep('step2')
  }

  const handleStep2Next = (skills: string[]) => {
    setData((prev) => ({ ...prev, skills }))
    setCurrentStep('step3')
  }

  const handleStep3Next = async (location: string, serviceDescription: string) => {
    setData((prev) => ({ ...prev, location, serviceDescription }))
    const payload = {
      name: data.name || '',
      phone: data.phone || '',
      skills: data.skills || [],
      location,
      serviceDescription,
    }

    await services.postOnboarding(payload)
    
    console.log('Onboarding completed - Payload:', payload)
    // TODO: Send payload to your backend API
    setCurrentStep('success')
  }

  const handleBack = () => {
    if (currentStep === 'step2') {
      setCurrentStep('step1')
    } else if (currentStep === 'step3') {
      setCurrentStep('step2')
    }
  }

  const handleSuccess = () => {
    // Redirect to dashboard or home page
    console.log('Redirecting to worker dashboard...')
  }

  return (
    <>
      {currentStep === 'step1' && (
        <WorkerStep1 onNext={handleStep1Next} />
      )}
      {currentStep === 'step2' && (
        <WorkerStep2
          name={data.name || ''}
          onNext={handleStep2Next}
          onBack={handleBack}
        />
      )}
      {currentStep === 'step3' && (
        <WorkerStep3
          name={data.name || ''}
          skills={data.skills || []}
          onNext={handleStep3Next}
          onBack={handleBack}
        />
      )}
      {currentStep === 'success' && (
        <WorkerSuccess
          name={data.name || ''}
          onComplete={handleSuccess}
        />
      )}
    </>
  )
}