'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Star, MapPin, Clock } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

interface NearbyWorkerCardProps {
    name: string
    skill: string
    rating: number
    experience: number
    distance: number
    availability: 'online' | 'offline'
    completedJobs: number
    postedAt?: string
    location?: string
    onViewProfile: () => void
    onRequestService: () => void
}

export function NearbyWorkerCard({
    name,
    skill,
    rating,
    experience,
    distance,
    availability,
    completedJobs,
    postedAt,
    location,
    onViewProfile,
    onRequestService,
}: NearbyWorkerCardProps) {
    
    // This creates a unique but consistent random image for each worker
    // We use the 'sig' parameter to force a unique image per name
    // Keywords 'worker' and the specific 'skill' help the AI find relevant photos
    const randomImage = () => {
        return `https://source.unsplash.com/random/200x200?worker,${skill.toLowerCase()}&sig=${name.replace(/\s/g, '')}`
    }

    return (
        <Card className="group border-border shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden">
            <CardHeader className="pb-3">
                <div className="flex items-center gap-4">
                    {/* Avatar with Status Ring */}
                    <div className="relative">
                        <div className={`absolute -inset-1 rounded-full blur-sm opacity-25 transition-opacity group-hover:opacity-50 ${
                            availability === 'online' ? 'bg-green-500' : 'bg-gray-400'
                        }`} />
                        <Avatar className="h-16 w-16 border-2 border-background relative">
                            <AvatarImage 
                                src={randomImage()} 
                                alt={name} 
                                className="object-cover transition-transform duration-500 group-hover:scale-110" 
                            />
                            <AvatarFallback className="bg-muted">
                                {name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                        </Avatar>
                        <span className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-background ${
                            availability === 'online' ? 'bg-green-500' : 'bg-gray-400'
                        }`} />
                    </div>

                    <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg font-bold truncate tracking-tight">
                            {name}
                        </CardTitle>
                        <div className="flex flex-wrap items-center gap-2 mt-1">
                            <Badge variant="default" className="bg-primary/10 text-primary border-none hover:bg-primary/20 transition-colors">
                                {skill}
                            </Badge>
                            <span className="text-[11px] text-muted-foreground flex items-center gap-0.5">
                                <MapPin className="w-3 h-3" />
                                {location || 'Nearby'}
                            </span>
                        </div>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="space-y-4">
                {/* Visual Stats Bar */}
                <div className="grid grid-cols-3 gap-2 bg-muted/30 p-3 rounded-xl border border-border/50">
                    <div className="text-center">
                        <p className="text-[10px] uppercase text-muted-foreground font-semibold">Rating</p>
                        <div className="flex items-center justify-center gap-1 mt-0.5">
                            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm font-bold">{rating}</span>
                        </div>
                    </div>
                    <div className="text-center border-x border-border/50">
                        <p className="text-[10px] uppercase text-muted-foreground font-semibold">Exp.</p>
                        <p className="text-sm font-bold mt-0.5">{experience}y</p>
                    </div>
                    <div className="text-center">
                        <p className="text-[10px] uppercase text-muted-foreground font-semibold">Dist.</p>
                        <p className="text-sm font-bold mt-0.5">{distance}km</p>
                    </div>
                </div>

                {/* Footer Info */}
                <div className="flex items-center justify-between text-[11px] text-muted-foreground px-1">
                    <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {postedAt || 'Active recently'}
                    </span>
                    <span className="font-medium text-foreground">{completedJobs} jobs completed</span>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-1">
                    <Button
                        variant="outline"
                        className="flex-1 h-10 text-xs font-semibold rounded-lg"
                        onClick={onViewProfile}
                    >
                        View Profile
                    </Button>
                    <Button
                        className="flex-1 h-10 text-xs font-bold rounded-lg shadow-md active:scale-95 transition-transform"
                        onClick={onRequestService}
                    >
                        Request Now
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}