"use client"

import { useRequireAuth } from "@/components/providers/auth-provider"
import { TRole } from "@/services/auth/types"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import ApiService from "@/services/api-services"
import { toast } from "sonner"
import {
  Loader2,
  Briefcase,
  Search,
  CheckCircle,
  Clock,
  MapPin,
} from "lucide-react"

type Job = {
  _id: string
  title?: string
  description: string
  category?: string
  status: string
  clientId?: { name?: string; location?: string } | string | null
  createdAt: string
}

type Tab = "my-jobs" | "find-jobs"

const statusColor: Record<string, string> = {
  Pending: "bg-yellow-100 text-yellow-700",
  Accepted: "bg-blue-100 text-blue-700",
  OnTheWay: "bg-blue-100 text-blue-700",
  Arrived: "bg-blue-100 text-blue-700",
  InProgress: "bg-purple-100 text-purple-700",
  WorkDone: "bg-green-100 text-green-700",
  ClientConfirmed: "bg-green-100 text-green-700",
  Completed: "bg-green-100 text-green-700",
  Cancelled: "bg-red-100 text-red-700",
}

const statusLabel: Record<string, string> = {
  Pending: "Pending",
  Accepted: "Accepted",
  OnTheWay: "On the way",
  Arrived: "Arrived",
  InProgress: "In progress",
  WorkDone: "Work done",
  ClientConfirmed: "Confirmed",
  Completed: "Completed",
  Cancelled: "Cancelled",
}

export default function WorkerJobsPage() {
  const { isAuthenticated, isLoading } = useRequireAuth([TRole.WORKER])
  const router = useRouter()
  const [tab, setTab] = useState<Tab>("my-jobs")
  const [myJobs, setMyJobs] = useState<Job[]>([])
  const [availableJobs, setAvailableJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [claiming, setClaiming] = useState<string | null>(null)

  useEffect(() => {
    if (!isAuthenticated) return
    setLoading(true)
    if (tab === "my-jobs") {
      ApiService.getArray<Job>("/jobs/worker")
        .then((res) => setMyJobs(res))
        .catch(() => {})
        .finally(() => setLoading(false))
    } else {
      ApiService.getArray<Job>("/jobs/available")
        .then((res) => setAvailableJobs(res))
        .catch(() => {})
        .finally(() => setLoading(false))
    }
  }, [isAuthenticated, tab])

  const handleClaim = async (jobId: string) => {
    setClaiming(jobId)
    try {
      await ApiService.patch(`/jobs/${jobId}/claim`, {})
      toast.success("Job accepted! Chat is now open.", {
        action: {
          label: "Open Chat",
          onClick: () => router.push(`/worker/chats/${jobId}`),
        },
      })
      setAvailableJobs((prev) => prev.filter((j) => j._id !== jobId))
      setTimeout(() => {
        router.push(`/worker/chats/${jobId}`)
      }, 1500)
    } catch {
      toast.error("Failed to accept job")
    } finally {
      setClaiming(null)
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
      <h1 className="text-xl font-bold mb-4">Jobs</h1>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setTab("my-jobs")}
          className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors ${
            tab === "my-jobs"
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground"
          }`}
        >
          <Briefcase className="h-4 w-4 inline mr-1.5" />
          My Jobs
        </button>
        <button
          onClick={() => setTab("find-jobs")}
          className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors ${
            tab === "find-jobs"
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground"
          }`}
        >
          <Search className="h-4 w-4 inline mr-1.5" />
          Look for Jobs
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : tab === "my-jobs" ? (
        <>
          {myJobs.length === 0 ? (
            <div className="rounded-xl border bg-card p-8 text-center">
              <Briefcase className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No jobs yet</p>
              <button
                onClick={() => setTab("find-jobs")}
                className="text-sm text-primary mt-2 underline"
              >
                Browse available jobs
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {myJobs.map((job) => {
                const isActive = !["Completed", "ClientConfirmed", "Declined"].includes(job.status)
                return (
                  <div
                    key={job._id}
                    className="rounded-xl border bg-card p-4"
                  >
                    <div className="flex items-start justify-between mb-1">
                      <p className="font-medium text-sm">
                        {job.title || job.description.slice(0, 50)}
                      </p>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor[job.status] || "bg-muted"}`}
                      >
                        {statusLabel[job.status] || job.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      {job.category && <span>{job.category}</span>}
                      {isActive && (
                        <Badge variant="outline" className="text-xs">
                          <Clock className="h-3 w-3 mr-0.5" />
                          Active
                        </Badge>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </>
      ) : (
        <>
          {availableJobs.length === 0 ? (
            <div className="rounded-xl border bg-card p-8 text-center">
              <Search className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">
                No available jobs right now
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Check back later for new job posts.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {availableJobs.map((job) => {
                const clientName =
                  typeof job.clientId === "object" && job.clientId?.name
                    ? job.clientId.name
                    : "Client"
                return (
                  <div
                    key={job._id}
                    className="rounded-xl border bg-card p-4"
                  >
                    <p className="font-medium text-sm mb-1">
                      {job.title || job.description.slice(0, 50)}
                    </p>
                    <p className="text-xs text-muted-foreground mb-0.5">
                      {job.category || "General"} &middot; Posted by {clientName}
                    </p>
                    <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                      {job.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        Nearby
                      </span>
                      <Button
                        size="sm"
                        className="rounded-lg text-xs h-8"
                        disabled={claiming === job._id}
                        onClick={() => handleClaim(job._id)}
                      >
                        {claiming === job._id ? (
                          <Loader2 className="h-3 w-3 animate-spin mr-1" />
                        ) : (
                          <CheckCircle className="h-3 w-3 mr-1" />
                        )}
                        Accept Job
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </>
      )}
    </div>
  )
}
