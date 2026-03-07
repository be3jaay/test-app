'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Star } from 'lucide-react'

interface Service {
  id: string
  workerName: string
  skill: string
  serviceDate: string
  rating?: number
  comment?: string
}

interface ServiceHistoryProps {
  services: Service[]
}

export function ServiceHistory({ services }: ServiceHistoryProps) {
  return (
    <Card className="border-border shadow-sm">
      <CardHeader>
        <CardTitle>Recent Service History</CardTitle>
      </CardHeader>
      <CardContent>
        {services.length === 0 ? (
          <p className="text-muted-foreground text-center py-6">
            No completed services yet. Start by requesting a service!
          </p>
        ) : (
          <div className="space-y-4">
            {services.map((service) => (
              <div
                key={service.id}
                className="flex items-start justify-between p-4 border border-border rounded-lg hover:bg-secondary/20 transition-colors"
              >
                <div className="flex-1">
                  <h4 className="font-semibold text-foreground mb-1">
                    {service.skill}
                  </h4>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm text-muted-foreground">
                      Worker: <span className="font-medium text-foreground">{service.workerName}</span>
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      {service.serviceDate}
                    </span>
                    {service.rating && (
                      <div className="flex items-center gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3 h-3 ${
                              i < service.rating!
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                        <span className="text-xs font-semibold text-foreground ml-1">
                          {service.rating}
                        </span>
                      </div>
                    )}
                  </div>
                  {service.comment && (
                    <p className="text-sm text-muted-foreground mt-2 italic">
                      "{service.comment}"
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
