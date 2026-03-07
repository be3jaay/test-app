'use client'

import { Button } from '@/components/ui/button'
import { CheckCircle } from 'lucide-react'

interface SuccessProps {
    name: string
    onComplete: () => void
}

export function WorkerSuccess({ name, onComplete }: SuccessProps) {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-background px-4 py-8">
            <div className="w-full max-w-sm text-center">
                {/* Success Icon */}
                <div className="flex justify-center mb-8">
                    <div className="w-20 h-20 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
                    </div>
                </div>

                {/* Title */}
                <h1 className="text-3xl font-bold text-foreground mb-2">
                    Welcome, {name}!
                </h1>

                {/* Message */}
                <p className="text-muted-foreground mb-6 text-sm">
                    Your service provider profile has been created successfully. You can now start accepting service requests from customers in your area.
                </p>

                {/* Next Steps */}
                <div className="bg-muted rounded-lg p-4 mb-8 text-left">
                    <h3 className="font-semibold text-foreground mb-3">What's next?</h3>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                        <li className="flex gap-2">
                            <span className="text-primary font-bold">1.</span>
                            <span>Go to your dashboard to manage your profile</span>
                        </li>
                        <li className="flex gap-2">
                            <span className="text-primary font-bold">2.</span>
                            <span>Add photos and portfolio samples</span>
                        </li>
                        <li className="flex gap-2">
                            <span className="text-primary font-bold">3.</span>
                            <span>Start receiving service requests</span>
                        </li>
                    </ul>
                </div>

                {/* Button */}
                <Button
                    onClick={onComplete}
                    className="w-full"
                    size="lg"
                >
                    Go to Dashboard
                </Button>
            </div>
        </div>
    )
}
