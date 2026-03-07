'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { ChevronLeft, MapPin } from 'lucide-react'

interface Step3Props {
    name: string
    skills: string[]
    onNext: (location: string, serviceDescription: string) => void
    onBack: () => void
}

export function WorkerStep3({
    name,
    skills,
    onNext,
    onBack,
}: Step3Props) {
    const [location, setLocation] = useState('')
    const [serviceDescription, setServiceDescription] = useState('')
    const [errors, setErrors] = useState<Record<string, string>>({})

    const handleNext = () => {
        const newErrors: Record<string, string> = {}

        if (!location.trim()) {
            newErrors.location = 'Please enter your location or service area'
        }
        if (!serviceDescription.trim()) {
            newErrors.serviceDescription = 'Please describe your services'
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors)
            return
        }

        onNext(location, serviceDescription)
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

                {/* Title */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-foreground mb-2">
                        Service Details
                    </h1>
                    <p className="text-muted-foreground text-sm">
                        Tell us more about your services and where you operate
                    </p>
                </div>

                {/* Form */}
                <div className="space-y-4">
                    {/* Location */}
                    <div className="space-y-2">
                        <Label htmlFor="location" className="text-foreground">
                            Service Area / Location
                        </Label>
                        <div className="relative">
                            <MapPin className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                            <Input
                                id="location"
                                type="text"
                                placeholder="e.g., Downtown, ZIP code, or city"
                                value={location}
                                onChange={(e) => {
                                    setLocation(e.target.value)
                                    if (errors.location) setErrors((prev) => ({ ...prev, location: '' }))
                                }}
                                className={`pl-10 ${errors.location ? 'border-red-500' : ''}`}
                            />
                        </div>
                        {errors.location && (
                            <p className="text-red-500 text-sm">{errors.location}</p>
                        )}
                    </div>

                    {/* Service Description */}
                    <div className="space-y-2">
                        <Label htmlFor="description" className="text-foreground">
                            Service Description
                        </Label>
                        <Textarea
                            id="description"
                            placeholder="Describe the services you offer, your experience, and what makes you unique. (e.g., I offer professional electrical work with 10+ years of experience...)"
                            value={serviceDescription}
                            onChange={(e) => {
                                setServiceDescription(e.target.value)
                                if (errors.serviceDescription) setErrors((prev) => ({ ...prev, serviceDescription: '' }))
                            }}
                            rows={5}
                            className={errors.serviceDescription ? 'border-red-500' : ''}
                        />
                        {errors.serviceDescription && (
                            <p className="text-red-500 text-sm">{errors.serviceDescription}</p>
                        )}
                        <p className="text-xs text-muted-foreground">
                            Character count: {serviceDescription.length}
                        </p>
                    </div>

                    {/* Submit Button */}
                    <Button
                        onClick={handleNext}
                        className="w-full mt-6"
                    >
                        Complete Onboarding
                    </Button>
                </div>

                {/* Progress Indicator */}
                <div className="flex justify-center gap-2 mt-8">
                    <div className="w-2 h-2 bg-gray-300 rounded-full" />
                    <div className="w-2 h-2 bg-gray-300 rounded-full" />
                    <div className="w-2 h-2 bg-primary rounded-full" />
                </div>
            </div>
        </div>
    )
}
