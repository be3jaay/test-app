"use client"

import { useRequireAuth } from "@/components/providers/auth-provider"
import { TRole } from "@/services/auth/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Suspense, useEffect, useState } from "react"
import { useParams, useSearchParams, useRouter } from "next/navigation"
import ApiService from "@/services/api-services"
import { toast } from "sonner"
import {
  Loader2,
  ArrowLeft,
  Star,
  User,
  MapPin,
  CheckCircle,
  Send,
} from "lucide-react"

type WorkerProfile = {
  _id: string
  name: string
  skills: string[]
  serviceDescription?: string
  rating?: number
  isAvailable: boolean
}

function BookingForm() {
  const { isAuthenticated, isLoading } = useRequireAuth([TRole.CLIENT])
  const params = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()

  const category = searchParams.get("category") || ""
  const workerId = params.workerId as string

  const [worker, setWorker] = useState<WorkerProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [description, setDescription] = useState("")
  const [price, setPrice] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    if (!isAuthenticated || !workerId) return

    // Try to fetch worker profile
    if (workerId.startsWith("mock-")) {
      // Mock worker data - we pass name/skills via search params
      setWorker({
        _id: workerId,
        name: searchParams.get("name") || "Worker",
        skills: (searchParams.get("skills") || category).split(","),
        serviceDescription: searchParams.get("desc") || "",
        rating: parseFloat(searchParams.get("rating") || "4.5"),
        isAvailable: true,
      })
      setLoading(false)
    } else {
      ApiService.get<{ data: WorkerProfile }>(`/workers/${workerId}`)
        .then((res) => setWorker(res.data))
        .catch(() => {
          // Fallback with search params
          setWorker({
            _id: workerId,
            name: searchParams.get("name") || "Worker",
            skills: (searchParams.get("skills") || category).split(","),
            serviceDescription: searchParams.get("desc") || "",
            rating: parseFloat(searchParams.get("rating") || "4.5"),
            isAvailable: true,
          })
        })
        .finally(() => setLoading(false))
    }
  }, [isAuthenticated, workerId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!description.trim()) {
      toast.error("Please describe what you need")
      return
    }
    const parsedPrice = parseFloat(price)
    if (!price.trim() || isNaN(parsedPrice) || parsedPrice <= 0) {
      toast.error("Please enter a valid price")
      return
    }
    setSubmitting(true)
    try {
      await ApiService.post("/jobs", {
        description: description.trim(),
        workerId: workerId,
        price: parsedPrice,
      })
      setSubmitted(true)
      toast.success("Booking request sent!")
    } catch {
      toast.error("Failed to send booking request. Try again.")
    } finally {
      setSubmitting(false)
    }
  }

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

  // Success state
  if (submitted) {
    return (
      <div className="max-w-lg mx-auto px-4 py-6">
        <div className="flex flex-col items-center text-center py-12">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-xl font-bold mb-2">Request Sent!</h1>
          <p className="text-sm text-muted-foreground mb-1">
            Your booking request has been sent to{" "}
            <span className="font-medium text-foreground">{worker?.name}</span>.
          </p>
          <p className="text-sm text-muted-foreground mb-6">
            You&apos;ll be notified when they accept. A chat will open automatically.
          </p>
          <div className="flex gap-3 w-full">
            <Button
              variant="outline"
              className="flex-1 rounded-xl"
              onClick={() => router.push("/client/services")}
            >
              Browse More
            </Button>
            <Button
              className="flex-1 rounded-xl"
              onClick={() => router.push("/client/dashboard")}
            >
              Go to Dashboard
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1 text-sm text-muted-foreground mb-4"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </button>

      <h1 className="text-xl font-bold mb-1">Confirm Booking</h1>
      <p className="text-sm text-muted-foreground mb-6">
        Send a request to this worker. They&apos;ll be notified and can accept your booking.
      </p>

      {/* Worker card */}
      {worker && (
        <div className="rounded-2xl border bg-card p-5 mb-6">
          <div className="flex items-center gap-4 mb-3">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <User className="h-7 w-7 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-base">{worker.name}</p>
              <div className="flex items-center gap-2 mt-0.5">
                {worker.rating && (
                  <div className="flex items-center gap-0.5">
                    <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                    <span className="text-xs font-medium">{worker.rating.toFixed(1)}</span>
                  </div>
                )}
                <span className="text-xs text-muted-foreground flex items-center gap-0.5">
                  <MapPin className="h-3 w-3" />
                  Nearby
                </span>
              </div>
            </div>
          </div>

          {/* Skills */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            {worker.skills.map((skill) => (
              <Badge key={skill} variant="secondary" className="rounded-lg text-xs">
                {skill}
              </Badge>
            ))}
          </div>

          {worker.serviceDescription && (
            <p className="text-sm text-muted-foreground">
              {worker.serviceDescription}
            </p>
          )}
        </div>
      )}

      {/* Booking form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-1.5 block">
            What do you need done?
          </label>
          <Textarea
            placeholder="Describe your problem or what service you need in detail..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="rounded-xl min-h-[120px]"
          />
        </div>

        <div>
          <label className="text-sm font-medium mb-1.5 block">
            Budget (₱)
          </label>
          <Input
            type="number"
            min="1"
            step="any"
            placeholder="Enter your budget"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="rounded-xl"
          />
        </div>

        {category && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Category:</span>
            <Badge variant="outline" className="rounded-lg">
              {category}
            </Badge>
          </div>
        )}

        <Button
          type="submit"
          className="w-full rounded-xl h-12"
          disabled={submitting}
        >
          {submitting ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Send className="h-4 w-4 mr-2" />
          )}
          {submitting ? "Sending Request..." : "Send Booking Request"}
        </Button>
      </form>
    </div>
  )
}

export default function ClientBookPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-svh items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      }
    >
      <BookingForm />
    </Suspense>
  )
}
