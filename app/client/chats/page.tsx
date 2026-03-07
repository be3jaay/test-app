"use client"

import { useRequireAuth } from "@/components/providers/auth-provider"
import { TRole } from "@/services/auth/types"
import { useEffect, useState } from "react"
import ApiService from "@/services/api-services"
import Link from "next/link"
import { Loader2, MessageCircle } from "lucide-react"

type Job = {
  _id: string
  title?: string
  description: string
  status: string
  workerId?: { name?: string; _id?: string } | string | null
  createdAt: string
}

export default function ClientChatsPage() {
  const { isAuthenticated, isLoading } = useRequireAuth([TRole.CLIENT])
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated) return
    ApiService.getArray<Job>("/jobs/client")
      .then((res) => {
        const accepted = res.filter(
          (j) => j.status !== "Pending" && j.status !== "Declined"
        )
        setJobs(accepted)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [isAuthenticated])

  if (isLoading || !isAuthenticated) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      <h1 className="text-xl font-bold mb-4">Chats</h1>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : jobs.length === 0 ? (
        <div className="rounded-xl border bg-card p-8 text-center">
          <MessageCircle className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">No chats yet</p>
          <p className="text-xs text-muted-foreground mt-1">
            Chats will appear once a worker accepts your request.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {jobs.map((job) => {
            const workerName =
              typeof job.workerId === "object" && job.workerId?.name
                ? job.workerId.name
                : "Worker"
            return (
              <Link key={job._id} href={`/client/chats/${job._id}`}>
                <div className="flex items-center gap-3 rounded-xl border bg-card p-4 hover:border-primary/30 transition-colors">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <MessageCircle className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">
                      {job.title || job.description.slice(0, 40)}
                    </p>
                    <p className="text-xs text-muted-foreground">{workerName}</p>
                  </div>
                  <span className="text-xs text-muted-foreground shrink-0">
                    {job.status}
                  </span>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
