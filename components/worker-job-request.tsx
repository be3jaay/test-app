'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { MapPin, Wrench, Timer, Banknote, Navigation } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Job {
    id: string
    problem: string
    location: string
    distance: string
    payment: string
}

export function WorkerJobRequest({
    job,
    onAccept,
    onReject
}: {
    job: Job
    onAccept: (id: string) => void
    onReject: (id: string) => void
}) {
    const INITIAL_TIME = 15
    const [timeLeft, setTimeLeft] = useState(INITIAL_TIME)

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timer)
                    onReject(job.id)
                    return 0
                }
                return prev - 1
            })
        }, 1000)

        return () => clearInterval(timer)
    }, [job.id, onReject])

    const progressValue = (timeLeft / INITIAL_TIME) * 100
    const isUrgent = timeLeft <= 5

    return (
        <div className="flex items-center justify-center min-h-screen bg-muted/40 p-4">
            <Card className="w-full max-w-md overflow-hidden border-none shadow-2xl rounded-3xl bg-background">
                
                {/* Visual Timer Progress Bar */}
                <Progress 
                    value={progressValue} 
                    className={cn(
                        "h-1.5 rounded-none transition-all duration-1000",
                        isUrgent ? "bg-red-100 [&>div]:bg-red-500" : "bg-primary/20"
                    )} 
                />

                <div className="p-8 space-y-8">
                    {/* Header with Countdown Ring */}
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <h2 className="text-2xl font-bold tracking-tight">New Job Found</h2>
                            <p className="text-sm text-muted-foreground font-medium">
                                High match for your profile
                            </p>
                        </div>
                        <div className={cn(
                            "relative flex items-center justify-center w-14 h-14 rounded-full border-4 transition-colors duration-300",
                            isUrgent ? "border-red-500 animate-pulse" : "border-primary/20"
                        )}>
                            <span className={cn(
                                "text-lg font-bold",
                                isUrgent ? "text-red-500" : "text-primary"
                            )}>
                                {timeLeft}s
                            </span>
                        </div>
                    </div>

                    {/* Job Details Grid */}
                    <div className="grid gap-4">
                        <div className="flex items-start gap-4 p-4 rounded-2xl bg-muted/50 border border-border/50">
                            <div className="p-2 rounded-lg bg-primary/10">
                                <Wrench className="w-5 h-5 text-primary" />
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Problem</p>
                                <p className="font-semibold text-lg leading-tight">{job.problem}</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4 p-4 rounded-2xl bg-muted/50 border border-border/50">
                            <div className="p-2 rounded-lg bg-blue-500/10">
                                <MapPin className="w-5 h-5 text-blue-600" />
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Location</p>
                                <p className="font-semibold">{job.location}</p>
                                <div className="flex items-center gap-1.5 text-sm text-blue-600 font-medium">
                                    <Navigation className="w-3.5 h-3.5" />
                                    {job.distance} away
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Payment Highlight */}
                    <div className="relative overflow-hidden rounded-2xl bg-primary/10 border border-primary/20 p-6 text-center text-primary-foreground shadow-lg shadow-primary/20">
                        <div className="relative z-10">
                            <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary opacity-80 mb-1">
                                Estimated Earnings
                            </p>
                            <div className="flex items-center justify-center gap-2 text-4xl font-black text-primary">
                                PHP {job.payment}
                            </div>
                        </div>
                        {/* Decorative background circle */}
                        <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full blur-2xl" />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col gap-3 pt-2">
                        <Button
                            className="w-full h-14 text-lg font-bold rounded-2xl transition-transform active:scale-95 shadow-xl shadow-primary/10"
                            onClick={() => onAccept(job.id)}
                        >
                            Accept Job Request
                        </Button>

                        <Button
                            variant="ghost"
                            className="w-full h-12 text-muted-foreground hover:text-red-500 hover:bg-red-50"
                            onClick={() => onReject(job.id)}
                        >
                            Decline
                        </Button>
                    </div>
                </div>
            </Card>
        </div>
    )
}