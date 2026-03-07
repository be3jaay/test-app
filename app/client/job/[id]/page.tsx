"use client"

import { useRequireAuth } from "@/components/providers/auth-provider"
import { TRole } from "@/services/auth/types"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import ApiService from "@/services/api-services"
import { toast } from "sonner"
import { Loader2, ArrowLeft, MessageCircle, CheckCircle, XCircle } from "lucide-react"
import Link from "next/link"

type Job = {
  _id: string
  title?: string
  description: string
  category?: string
  status: string
  workerId?: { name?: string; _id?: string } | string | null
  createdAt: string
  aiSummary?: string
}

const statusLabel: Record<string, string> = {
  Pending: "Pending",
  Accepted: "Accepted",
  OnTheWay: "Worker on the way",
  Arrived: "Worker arrived",
  InProgress: "In progress — confirm when done",
  ClientConfirmed: "Confirmed",
  Completed: "Completed",
  Declined: "Declined",
  Cancelled: "Cancelled",
}

export default function ClientJobDetailPage() {
  const { isAuthenticated, isLoading } = useRequireAuth([TRole.CLIENT])
  const params = useParams()
  const router = useRouter()
  const [job, setJob] = useState<Job | null>(null)
  const [loading, setLoading] = useState(true)
  const [confirming, setConfirming] = useState(false)
  const [cancelling, setCancelling] = useState(false)

  const fetchJob = () => {
    if (!params.id) return
    ApiService.get<{ data: Job }>(`/jobs/${params.id}`)
      .then((res) => setJob((res as any).data || res))
      .catch(() => toast.error("Failed to load job"))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    if (!isAuthenticated || !params.id) return
    fetchJob()
    const interval = setInterval(fetchJob, 10000)
    return () => clearInterval(interval)
  }, [isAuthenticated, params.id])

  const handleCancel = async () => {
    if (!job) return
    setCancelling(true)
    try {
      await ApiService.patch(`/jobs/${job._id}/cancel`, {})
      toast.success("Request cancelled")
      setJob({ ...job, status: "Cancelled" })
    } catch {
      toast.error("Failed to cancel request")
    } finally {
      setCancelling(false)
    }
  }

  const handleConfirm = async () => {
    if (!job) return
    setConfirming(true)
    try {
      await ApiService.patch(`/jobs/${job._id}/client-confirm`, {})
      toast.success("Job confirmed!")
      setJob({ ...job, status: "ClientConfirmed" })
    } catch {
      toast.error("Failed to confirm job")
    } finally {
      setConfirming(false)
    }
  }

  if (isLoading || !isAuthenticated) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
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

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : !job ? (
        <div className="text-center py-12">
          <p className="text-sm text-muted-foreground">Job not found</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <h1 className="text-xl font-bold">
              {job.title || "Service Request"}
            </h1>
            {job.category && (
              <p className="text-sm text-muted-foreground">{job.category}</p>
            )}
          </div>

          <div className="rounded-xl border bg-card p-4">
            <p className="text-xs text-muted-foreground mb-1">Status</p>
            <p className="font-medium text-sm">
              {statusLabel[job.status] || job.status}
            </p>
          </div>

          <div className="rounded-xl border bg-card p-4">
            <p className="text-xs text-muted-foreground mb-1">Description</p>
            <p className="text-sm leading-relaxed">{job.description}</p>
          </div>

          {job.aiSummary && (
            <div className="rounded-xl border bg-card p-4">
              <p className="text-xs text-muted-foreground mb-1">AI Summary</p>
              <p className="text-sm leading-relaxed">{job.aiSummary}</p>
            </div>
          )}

          {job.workerId && typeof job.workerId === "object" && (
            <div className="rounded-xl border bg-card p-4">
              <p className="text-xs text-muted-foreground mb-1">Worker</p>
              <p className="text-sm font-medium">
                {job.workerId.name || "Assigned worker"}
              </p>
            </div>
          )}

          <div className="flex gap-3">
            {job.status !== "Pending" && job.status !== "Declined" && (
              <Link href={`/client/chats/${job._id}`} className="flex-1">
                <Button variant="outline" className="w-full rounded-xl">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Chat
                </Button>
              </Link>
            )}

            {job.status === "InProgress" && (
              <Button
                className="flex-1 rounded-xl"
                onClick={handleConfirm}
                disabled={confirming}
              >
                {confirming ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <CheckCircle className="h-4 w-4 mr-2" />
                )}
                Confirm Done
              </Button>
            )}

            {job.status === "Pending" && (
              <Button
                variant="destructive"
                className="flex-1 rounded-xl"
                onClick={handleCancel}
                disabled={cancelling}
              >
                {cancelling ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <XCircle className="h-4 w-4 mr-2" />
                )}
                Cancel Request
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
