"use client"

import { useRequireAuth, useAuth } from "@/components/providers/auth-provider"
import { TRole } from "@/services/auth/types"
import { KitaLogo } from "@/components/kita-logo"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import Link from "next/link"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import ApiService from "@/services/api-services"
import { toast } from "sonner"
import {
  CheckCircle,
  ArrowRight,
  Briefcase,
  Loader2,
  MapPin,
  Navigation,
  Flag,
  Bell,
  XCircle,
} from "lucide-react"

type Job = {
  _id: string
  title?: string
  description: string
  category?: string
  status: string
  clientId?: { name?: string } | string | null
  createdAt: string
}

const statusSteps = [
  { key: "Accepted", label: "Accepted", next: "OnTheWay" },
  { key: "OnTheWay", label: "On the way", next: "Arrived" },
  { key: "Arrived", label: "I'm here", next: "InProgress" },
  { key: "InProgress", label: "In progress", next: "WorkDone" },
  { key: "WorkDone", label: "Job Done", next: null },
]

const stepIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  Accepted: Briefcase,
  OnTheWay: Navigation,
  Arrived: MapPin,
  InProgress: Loader2,
  WorkDone: Flag,
}

export default function WorkerDashboardPage() {
  const { isAuthenticated, isLoading } = useRequireAuth([TRole.WORKER])
  const { logout } = useAuth()
  const router = useRouter()
  const [jobs, setJobs] = useState<Job[]>([])
  const [pendingJobs, setPendingJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)
  const [accepting, setAccepting] = useState<string | null>(null)
  const [requestModalOpen, setRequestModalOpen] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState<Job | null>(null)

  const fetchJobs = () => {
    ApiService.getArray<Job>("/jobs/worker")
      .then((all) => {
        setJobs(all)
        const pending = all.filter((j) => j.status === "Pending")
        setPendingJobs(pending)
        if (pending.length > 0 && !selectedRequest) {
          setSelectedRequest(pending[0])
          setRequestModalOpen(true)
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    if (!isAuthenticated) return
    fetchJobs()
    const interval = setInterval(fetchJobs, 15000)
    return () => clearInterval(interval)
  }, [isAuthenticated])

  const handleAccept = async (jobId: string) => {
    setAccepting(jobId)
    try {
      await ApiService.patch(`/jobs/${jobId}/respond`, { action: "accept" })
      toast.success("Job accepted! Chat is now open.", {
        action: {
          label: "Open Chat",
          onClick: () => router.push(`/worker/chats/${jobId}`),
        },
      })
      setRequestModalOpen(false)
      setSelectedRequest(null)
      fetchJobs()
      setTimeout(() => {
        router.push(`/worker/chats/${jobId}`)
      }, 1500)
    } catch {
      toast.error("Failed to accept job")
    } finally {
      setAccepting(null)
    }
  }

  const handleDecline = async (jobId: string) => {
    setAccepting(jobId)
    try {
      await ApiService.patch(`/jobs/${jobId}/respond`, { action: "decline" })
      toast.success("Job declined")
      const remaining = pendingJobs.filter((j) => j._id !== jobId)
      if (remaining.length > 0) {
        setSelectedRequest(remaining[0])
      } else {
        setRequestModalOpen(false)
        setSelectedRequest(null)
      }
      fetchJobs()
    } catch {
      toast.error("Failed to decline job")
    } finally {
      setAccepting(null)
    }
  }

  if (isLoading || !isAuthenticated) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    )
  }

  const activeJobs = jobs.filter(
    (j) => !["Completed", "Declined", "ClientConfirmed", "Pending"].includes(j.status)
  )
  const completedJobs = jobs.filter((j) =>
    ["Completed", "ClientConfirmed"].includes(j.status)
  )

  const handleAdvanceStatus = async (jobId: string, nextStatus: string) => {
    setUpdating(jobId)
    try {
      await ApiService.patch(`/jobs/${jobId}/status`, { status: nextStatus })
      toast.success(`Status updated`)
      fetchJobs()
    } catch {
      toast.error("Failed to update status")
    } finally {
      setUpdating(null)
    }
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <KitaLogo className="h-8 w-8" />
          <span className="font-bold text-lg">Kita</span>
        </div>
        <button onClick={logout} className="text-sm text-muted-foreground">
          Log out
        </button>
      </div>

      {/* CTA */}
      <div className="rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/10 p-5 mb-6">
        <p className="font-semibold text-lg mb-1">Looking to service?</p>
        <p className="text-sm text-muted-foreground mb-4">
          Browse available jobs and find work that matches your skills.
        </p>
        <Link href="/worker/jobs">
          <Button className="rounded-xl">
            <Briefcase className="h-4 w-4 mr-2" />
            Find Jobs
          </Button>
        </Link>
      </div>

      {/* Pending Requests Banner */}
      {pendingJobs.length > 0 && (
        <button
          onClick={() => {
            setSelectedRequest(pendingJobs[0])
            setRequestModalOpen(true)
          }}
          className="w-full rounded-xl border-2 border-amber-200 bg-amber-50/50 p-4 mb-6 flex items-center justify-between hover:border-amber-300 transition-colors"
        >
          <div className="flex items-center gap-3">
            <Bell className="h-5 w-5 text-amber-500" />
            <div className="text-left">
              <p className="font-semibold text-sm">New Job Request</p>
              <p className="text-xs text-muted-foreground">Tap to review</p>
            </div>
          </div>
          <Badge variant="secondary" className="bg-amber-100 text-amber-700">
            {pendingJobs.length}
          </Badge>
        </button>
      )}

      {/* Active Jobs */}
      <section className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold flex items-center gap-2">
            <Briefcase className="h-4 w-4 text-primary" />
            Active Jobs
          </h2>
          {activeJobs.length > 0 && (
            <Badge variant="secondary" className="text-xs">
              {activeJobs.length}
            </Badge>
          )}
        </div>
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : activeJobs.length === 0 ? (
          <div className="rounded-xl border bg-card p-6 text-center">
            <p className="text-sm text-muted-foreground">No active jobs</p>
            <Link href="/worker/jobs">
              <Button variant="link" size="sm" className="mt-2">
                Browse available jobs <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {activeJobs.map((job) => {
              const currentStepIdx = statusSteps.findIndex(
                (s) => s.key === job.status
              )
              const currentStep =
                currentStepIdx >= 0 ? statusSteps[currentStepIdx] : null
              const StepIcon = stepIcons[job.status] || Briefcase

              return (
                <div key={job._id} className="rounded-xl border bg-card p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-medium text-sm">
                        {job.title || job.description.slice(0, 50)}
                      </p>
                      {job.category && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {job.category}
                        </p>
                      )}
                    </div>
                    <StepIcon className="h-4 w-4 text-primary shrink-0" />
                  </div>

                  {/* Status progress bar */}
                  <div className="flex items-center gap-1 mb-3">
                    {statusSteps.map((step, i) => (
                      <div
                        key={step.key}
                        className={`h-1.5 flex-1 rounded-full ${
                          i <= currentStepIdx ? "bg-primary" : "bg-muted"
                        }`}
                      />
                    ))}
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">
                      {currentStep?.label || job.status}
                    </p>
                    {currentStep?.next && (
                      <Button
                        size="sm"
                        className="rounded-lg text-xs h-8"
                        disabled={updating === job._id}
                        onClick={() =>
                          handleAdvanceStatus(job._id, currentStep.next!)
                        }
                      >
                        {updating === job._id && (
                          <Loader2 className="h-3 w-3 animate-spin mr-1" />
                        )}
                        {currentStep.next === "OnTheWay"
                          ? "On the way"
                          : currentStep.next === "Arrived"
                            ? "I'm here"
                            : currentStep.next === "InProgress"
                              ? "Start work"
                              : "Job Done"}
                      </Button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>

      {/* Recent Services Done */}
      <section>
        <h2 className="font-semibold flex items-center gap-2 mb-3">
          <CheckCircle className="h-4 w-4 text-green-600" />
          Recent Services Done
        </h2>
        {completedJobs.length === 0 ? (
          <div className="rounded-xl border bg-card p-6 text-center">
            <p className="text-sm text-muted-foreground">
              No completed services yet
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {completedJobs.slice(0, 5).map((job) => (
              <div key={job._id} className="rounded-xl border bg-card p-4">
                <p className="font-medium text-sm">
                  {job.title || job.description.slice(0, 40)}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {job.category || "Service"} &middot; Completed
                </p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Job Request Modal */}
      <Dialog open={requestModalOpen} onOpenChange={(open) => {
        setRequestModalOpen(open)
        if (!open) setSelectedRequest(null)
      }}>
        <DialogContent className="max-w-sm mx-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-amber-500" />
              New Job Request
            </DialogTitle>
          </DialogHeader>
          {selectedRequest && (() => {
            const clientName =
              typeof selectedRequest.clientId === "object" && selectedRequest.clientId?.name
                ? selectedRequest.clientId.name
                : "Client"
            return (
              <div className="space-y-4">
                <div>
                  <p className="font-semibold text-base">
                    {selectedRequest.title || selectedRequest.description.slice(0, 50)}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {selectedRequest.category || "General"} &middot; from {clientName}
                  </p>
                </div>

                <div className="rounded-xl bg-muted/50 p-3">
                  <p className="text-xs text-muted-foreground mb-1">Description</p>
                  <p className="text-sm leading-relaxed">{selectedRequest.description}</p>
                </div>

                <div className="flex gap-3 pt-2">
                  <Button
                    variant="outline"
                    className="flex-1 rounded-xl h-11"
                    disabled={accepting === selectedRequest._id}
                    onClick={() => handleDecline(selectedRequest._id)}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Decline
                  </Button>
                  <Button
                    className="flex-1 rounded-xl h-11"
                    disabled={accepting === selectedRequest._id}
                    onClick={() => handleAccept(selectedRequest._id)}
                  >
                    {accepting === selectedRequest._id ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <CheckCircle className="h-4 w-4 mr-2" />
                    )}
                    Accept Job
                  </Button>
                </div>

                {pendingJobs.length > 1 && (
                  <p className="text-xs text-center text-muted-foreground">
                    +{pendingJobs.length - 1} more request{pendingJobs.length > 2 ? "s" : ""}
                  </p>
                )}
              </div>
            )
          })()}
        </DialogContent>
      </Dialog>
    </div>
  )
}
