'use client'

import { MapPin } from 'lucide-react'

interface ClientHeaderProps {
  name: string
  location: string
  onFindWorkers?: () => void
}

export function ClientHeader({ location }: ClientHeaderProps) {
  return (
    <header className="flex items-center justify-between py-3 px-1">
      <div className="flex items-center gap-2 text-muted-foreground text-sm min-w-0">
        <MapPin className="w-4 h-4 shrink-0 text-primary" />
        <span className="truncate">{location}</span>
      </div>
    </header>
  )
}
