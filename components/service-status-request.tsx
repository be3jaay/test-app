'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Clock, CheckCircle, AlertCircle } from 'lucide-react'

interface ServiceRequestStatusProps {
  workerName: string
  service: string
  distance: number
  status: 'pending' | 'accepted' | 'completed'
  requestedAt: string
  acceptedAt?: string
  onCancelRequest: () => void
  onMarkComplete?: () => void
}

export function ServiceRequestStatus({
  workerName,
  service,
  distance,
  status,
  requestedAt,
  acceptedAt,
  onCancelRequest,
  onMarkComplete,
}: ServiceRequestStatusProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      case 'accepted':
        return 'bg-green-100 text-green-800 border-green-300'
      case 'completed':
        return 'bg-blue-100 text-blue-800 border-blue-300'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-5 h-5" />
      case 'accepted':
        return <CheckCircle className="w-5 h-5" />
      case 'completed':
        return <CheckCircle className="w-5 h-5" />
      default:
        return <AlertCircle className="w-5 h-5" />
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Waiting for response'
      case 'accepted':
        return 'Accepted - Worker on the way'
      case 'completed':
        return 'Service Completed'
      default:
        return 'Unknown'
    }
  }

  return (
    <Card className="border-border shadow-sm bg-secondary/20">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Service Request Sent</CardTitle>
          <Badge className={getStatusColor(status)} variant="outline">
            <span className="flex items-center gap-1">
              {getStatusIcon(status)}
              {getStatusLabel(status)}
            </span>
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Request Details */}
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Worker:</span>
            <span className="font-semibold text-foreground">{workerName}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Service:</span>
            <span className="font-semibold text-foreground">{service}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Distance:</span>
            <span className="font-semibold text-foreground">{distance} km</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Requested:</span>
            <span className="font-semibold text-foreground">{requestedAt}</span>
          </div>
          {acceptedAt && (
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Accepted:</span>
              <span className="font-semibold text-foreground">{acceptedAt}</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-4">
          {status !== 'completed' && (
            <Button
              variant="outline"
              className="flex-1"
              onClick={onCancelRequest}
            >
              Cancel Request
            </Button>
          )}
          {status === 'accepted' && (
            <Button
              className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={onMarkComplete}
            >
              Mark as Completed
            </Button>
          )}
          {status === 'completed' && (
            <div className="w-full text-center py-2 text-green-600 font-semibold">
              Service completed!
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
