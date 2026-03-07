"use client"

import { useRequireAuth } from "@/components/providers/auth-provider"
import { TRole } from "@/services/auth/types"
import { useEffect, useState } from "react"
import ApiService from "@/services/api-services"
import { Badge } from "@/components/ui/badge"
import { Loader2, User, Star, MapPin } from "lucide-react"

type WorkerProfile = {
  _id: string
  name: string
  skills: string[]
  serviceDescription?: string
  rating: number
  isAvailable: boolean
}

type Review = {
  _id: string
  rating: number
  comment: string
  clientId?: { name?: string } | string | null
  createdAt: string
}

type UserProfile = {
  _id: string
  email: string
  name?: string | null
  phone?: string | null
  location?: string | null
}

export default function WorkerProfilePage() {
  const { isAuthenticated, isLoading } = useRequireAuth([TRole.WORKER])
  const [worker, setWorker] = useState<WorkerProfile | null>(null)
  const [user, setUser] = useState<UserProfile | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated) return

    Promise.all([
      ApiService.get<{ data: WorkerProfile }>("/workers/profile").catch(() => null),
      ApiService.get<{ data: UserProfile }>("/auth/profile").catch(() => null),
    ]).then(([workerRes, userRes]) => {
      if (workerRes?.data) {
        setWorker(workerRes.data)
        // Fetch reviews for this worker
        ApiService.get<{ data: Review[] }>(`/reviews/worker/${workerRes.data._id}`)
          .then((res) => setReviews(res.data || []))
          .catch(() => {})
      }
      if (userRes?.data) setUser(userRes.data)
      setLoading(false)
    })
  }, [isAuthenticated])

  if (isLoading || !isAuthenticated) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    )
  }

  const name = worker?.name || user?.name || "Worker"
  const rating = worker?.rating || 0

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      <h1 className="text-xl font-bold mb-6">My Profile</h1>

      {/* Profile Card */}
      <div className="flex flex-col items-center mb-6">
        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-3">
          <User className="h-10 w-10 text-primary" />
        </div>
        <p className="font-semibold text-lg">{name}</p>
        <div className="flex items-center gap-1 mt-1">
          <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
          <span className="text-sm font-medium">{rating.toFixed(1)}</span>
          <span className="text-xs text-muted-foreground">
            ({reviews.length} reviews)
          </span>
        </div>
        {user?.location && (
          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
            <MapPin className="h-3 w-3" />
            {user.location}
          </p>
        )}
      </div>

      {/* Skills */}
      {worker?.skills && worker.skills.length > 0 && (
        <section className="mb-6">
          <h2 className="text-sm font-semibold mb-2">Skills</h2>
          <div className="flex flex-wrap gap-2">
            {worker.skills.map((skill) => (
              <Badge key={skill} variant="secondary" className="rounded-lg">
                {skill}
              </Badge>
            ))}
          </div>
        </section>
      )}

      {/* Service Description */}
      {worker?.serviceDescription && (
        <section className="mb-6">
          <h2 className="text-sm font-semibold mb-2">About</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {worker.serviceDescription}
          </p>
        </section>
      )}

      {/* Reviews */}
      <section>
        <h2 className="text-sm font-semibold mb-3">
          Reviews ({reviews.length})
        </h2>
        {reviews.length === 0 ? (
          <div className="rounded-xl border bg-card p-6 text-center">
            <p className="text-sm text-muted-foreground">No reviews yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {reviews.map((review) => {
              const reviewerName =
                typeof review.clientId === "object" && review.clientId?.name
                  ? review.clientId.name
                  : "Client"
              return (
                <div
                  key={review._id}
                  className="rounded-xl border bg-card p-4"
                >
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium">{reviewerName}</p>
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-3 w-3 ${
                            i < review.rating
                              ? "text-amber-500 fill-amber-500"
                              : "text-muted"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  {review.comment && (
                    <p className="text-sm text-muted-foreground">
                      {review.comment}
                    </p>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}
