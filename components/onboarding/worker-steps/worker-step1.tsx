'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { User } from 'lucide-react'

interface Step1Props {
    onNext: (name: string, phone: string) => void
}

export function WorkerStep1({ onNext }: Step1Props) {
    const [name, setName] = useState('')
    const [phone, setPhone] = useState('')
    const [errors, setErrors] = useState<Record<string, string>>({})

    const handleNext = () => {
        const newErrors: Record<string, string> = {}

        if (!name.trim()) {
            newErrors.name = 'Please enter your full name'
        }
        if (!phone.trim()) {
            newErrors.phone = 'Please enter your phone number'
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors)
            return
        }

        onNext(name, phone)
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
                    {/* Full Name */}
                    <div className="space-y-2">
                        <Label htmlFor="name" className="text-foreground">
                            Full Name
                        </Label>
                        <Input
                            id="name"
                            type="text"
                            placeholder="John Doe"
                            value={name}
                            onChange={(e) => {
                                setName(e.target.value)
                                if (errors.name) setErrors((prev) => ({ ...prev, name: '' }))
                            }}
                            className={errors.name ? 'border-red-500' : ''}
                        />
                        {errors.name && (
                            <p className="text-red-500 text-sm">{errors.name}</p>
                        )}
                    </div>

                    {/* Phone Number */}
                    <div className="space-y-2">
                        <Label htmlFor="phone" className="text-foreground">
                            Phone Number
                        </Label>
                        <Input
                            id="phone"
                            type="tel"
                            placeholder="+1 (555) 000-0000"
                            value={phone}
                            onChange={(e) => {
                                setPhone(e.target.value)
                                if (errors.phone) setErrors((prev) => ({ ...prev, phone: '' }))
                            }}
                            className={errors.phone ? 'border-red-500' : ''}
                        />
                        {errors.phone && (
                            <p className="text-red-500 text-sm">{errors.phone}</p>
                        )}
                    </div>

                    {/* Next Button */}
                    <Button
                        onClick={handleNext}
                        className="w-full mt-6"
                    >
                        Next
                    </Button>
                </div>

                {/* Progress Indicator */}
                <div className="flex justify-center gap-2 mt-8">
                    <div className="w-2 h-2 bg-primary rounded-full" />
                    <div className="w-2 h-2 bg-gray-300 rounded-full" />
                    <div className="w-2 h-2 bg-gray-300 rounded-full" />
                </div>
            </div>
        </div>
    )
}
