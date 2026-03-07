'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Star, MapPin, Briefcase, Award } from 'lucide-react'

interface WorkerProfileModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    worker: {
        name: string
        skill: string
        experience: number
        description: string
        location: string
        rating: number
        completedJobs: number
    } | null
    onRequestService: () => void
}

export function WorkerProfileModal({
    open,
    onOpenChange,
    worker,
    onRequestService,
}: WorkerProfileModalProps) {
    if (!worker) return null

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="text-2xl">{worker.name}</DialogTitle>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Skill Badge and Location */}
                    <div className="flex items-center justify-between">
                        <Badge variant="secondary" className="text-base px-3 py-1">
                            {worker.skill}
                        </Badge>
                        <div className="flex items-center gap-1 text-muted-foreground">
                            <MapPin className="w-4 h-4" />
                            <span>{worker.location}</span>
                        </div>
                    </div>

                    {/* Rating */}
                    <div className="space-y-2">
                        <h3 className="font-semibold text-foreground">Rating & Reviews</h3>
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1">
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <Star
                                        key={i}
                                        className={`w-5 h-5 ${i < Math.floor(worker.rating)
                                                ? 'fill-yellow-400 text-yellow-400'
                                                : 'text-gray-300'
                                            }`}
                                    />
                                ))}
                            </div>
                            <span className="text-lg font-semibold text-foreground">{worker.rating}</span>
                            <span className="text-muted-foreground">({worker.completedJobs} completed jobs)</span>
                        </div>
                    </div>

                    {/* Experience */}
                    <div className="space-y-2">
                        <h3 className="font-semibold text-foreground flex items-center gap-2">
                            <Award className="w-4 h-4" />
                            Experience
                        </h3>
                        <p className="text-foreground">{worker.experience} years in {worker.skill}</p>
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <h3 className="font-semibold text-foreground flex items-center gap-2">
                            <Briefcase className="w-4 h-4" />
                            About
                        </h3>
                        <p className="text-muted-foreground leading-relaxed">
                            {worker.description}
                        </p>
                    </div>

                    {/* Action Button */}
                    <div className="flex gap-3 pt-4">
                        <Button
                            variant="outline"
                            className="flex-1"
                            onClick={() => onOpenChange(false)}
                        >
                            Close
                        </Button>
                        <Button
                            className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
                            onClick={() => {
                                onRequestService()
                                onOpenChange(false)
                            }}
                        >
                            Request Service
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
