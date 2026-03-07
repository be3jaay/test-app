"use client"

import { useRequireAuth } from "@/components/providers/auth-provider"
import { useAuth } from "@/components/providers/auth-provider"
import { TRole } from "@/services/auth/types"
import { KitaLogo } from "@/components/kita-logo"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import ApiService from "@/services/api-services"
import { toast } from "sonner"
import {
  Clock,
  CheckCircle,
  ArrowRight,
  Search,
  MessageCircle,
  Loader2,
} from "lucide-react"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { ChatbotVoiceAgent } from "@/components/chatbot-voice-agent"

type Job = {
  _id: string
  title?: string
  description: string
  category?: string
  status: string
  workerId?: { name?: string; _id?: string } | string | null
  createdAt: string
}

const statusLabel: Record<string, string> = {
  Pending: "Pending",
  Accepted: "Accepted",
  OnTheWay: "On the way",
  Arrived: "Worker arrived",
  InProgress: "In progress",
  WorkDone: "Work done",
  ClientConfirmed: "Confirmed",
  Completed: "Completed",
  Declined: "Declined",
}

const statusColor: Record<string, string> = {
  Pending: "bg-yellow-100 text-yellow-700",
  Accepted: "bg-blue-100 text-blue-700",
  OnTheWay: "bg-blue-100 text-blue-700",
  Arrived: "bg-blue-100 text-blue-700",
  InProgress: "bg-purple-100 text-purple-700",
  WorkDone: "bg-green-100 text-green-700",
  ClientConfirmed: "bg-green-100 text-green-700",
  Completed: "bg-green-100 text-green-700",
  Declined: "bg-red-100 text-red-700",
}

export default function ClientDashboardPage() {
  const { isAuthenticated, isLoading } = useRequireAuth([TRole.CLIENT])
  const { logout } = useAuth()
  const router = useRouter()
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const prevPendingIds = useRef<Set<string>>(new Set())
  const [chatbotOpen, setChatbotOpen] = useState(false)
  const [wakeStatus, setWakeStatus] = useState<'idle' | 'listening' | 'blocked' | 'unsupported'>('idle')
  const wakeRecognitionRef = useRef<any>(null)

  useEffect(() => {
    const shouldOpenVoiceSheet = window.localStorage.getItem('denki_v') === 'true'
    if (shouldOpenVoiceSheet) {
      setChatbotOpen(true)
    }
  }, [])

  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition

    if (!SpeechRecognition) {
      setWakeStatus('unsupported')
      return
    }

    if (chatbotOpen) {
      wakeRecognitionRef.current?.stop()
      setWakeStatus('idle')
      return
    }

    let cancelled = false
    const recognition = new SpeechRecognition()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = 'en-US'

    recognition.onresult = (event: any) => {
      let transcript = ''
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript
      }

      if (/\bdenki\b/i.test(transcript)) {
        setChatbotOpen(true)
      }
    }

    recognition.onerror = (event: any) => {
      if (event?.error === 'not-allowed' || event?.error === 'service-not-allowed') {
        setWakeStatus('blocked')
        return
      }

      if (cancelled || chatbotOpen) return

      setTimeout(() => {
        try {
          recognition.start()
          setWakeStatus('listening')
        } catch {
          // Retry is best-effort; browser may still be settling.
        }
      }, 500)
    }

    recognition.onend = () => {
      if (cancelled || chatbotOpen) return
      try {
        recognition.start()
        setWakeStatus('listening')
      } catch {
        // Avoid crashing if the browser rejects rapid restarts.
      }
    }

    wakeRecognitionRef.current = recognition

    const startWakeListener = async () => {
      try {
        if (navigator.mediaDevices?.getUserMedia) {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
          stream.getTracks().forEach((track) => track.stop())
        }
      } catch {
        setWakeStatus('blocked')
        return
      }

      if (cancelled || chatbotOpen) return

      try {
        recognition.start()
        setWakeStatus('listening')
      } catch {
        // Ignore duplicate start errors while browser state settles.
      }
    }

    void startWakeListener()

    return () => {
      cancelled = true
      recognition.stop()
    }
  }, [chatbotOpen])

  const fetchJobs = () => {
    ApiService.getArray<Job>("/jobs/client")
      .then((newJobs) => {
        setJobs(newJobs)

        newJobs.forEach((job) => {
          if (
            prevPendingIds.current.has(job._id) &&
            job.status === "Accepted"
          ) {
            const workerName =
              typeof job.workerId === "object" && job.workerId?.name
                ? job.workerId.name
                : "A worker"
            toast.success(`${workerName} accepted your request!`, {
              action: {
                label: "Open Chat",
                onClick: () => router.push(`/client/chats/${job._id}`),
              },
            })
          }
        })

        prevPendingIds.current = new Set(
          newJobs.filter((j) => j.status === "Pending").map((j) => j._id)
        )
      })
      .catch(() => { })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    if (!isAuthenticated) return
    fetchJobs()
    const interval = setInterval(fetchJobs, 10000)
    return () => clearInterval(interval)
  }, [isAuthenticated])

  if (isLoading || !isAuthenticated) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    )
  }

  const activeJobs = jobs.filter(
    (j) => !["Completed", "Declined", "ClientConfirmed"].includes(j.status)
  )
  const recentJobs = jobs.filter((j) =>
    ["Completed", "ClientConfirmed"].includes(j.status)
  )

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <KitaLogo className="h-8 w-8" />
          <span className="font-bold text-lg">Kita</span>
        </div>
        <button onClick={logout} className="text-sm text-muted-foreground">
          Log out
        </button>
      </div>

      <div className="rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/10 p-5 mb-6">
        <p className="font-semibold text-lg mb-1">Do you need any service right now?</p>
        <p className="text-sm text-muted-foreground mb-4">
          Browse our marketplace and find a professional near you.
        </p>
        <Link href="/client/services">
          <Button className="rounded-xl">
            <Search className="h-4 w-4 mr-2" />
            Browse Services
          </Button>
        </Link>
      </div>

      <section className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" />
            Pending Requests
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
            <p className="text-sm text-muted-foreground">No active requests</p>
            <Link href="/client/post">
              <Button variant="link" size="sm" className="mt-2">
                Post a request <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {activeJobs.map((job) => {
              const isPending = job.status === "Pending"
              const href = isPending ? `/client/job/${job._id}` : `/client/chats/${job._id}`
              const workerName =
                typeof job.workerId === "object" && job.workerId?.name
                  ? job.workerId.name
                  : null
              return (
                <Link key={job._id} href={href}>
                  <div className="rounded-xl border bg-card p-4 hover:border-primary/30 transition-colors">
                    <div className="flex items-start justify-between mb-2">
                      <p className="font-medium text-sm">
                        {job.title || job.description.slice(0, 50)}
                      </p>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor[job.status] || "bg-muted"}`}>
                        {statusLabel[job.status] || job.status}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      {job.category && (
                        <p className="text-xs text-muted-foreground">{job.category}</p>
                      )}
                      {!isPending && (
                        <span className="text-xs text-primary flex items-center gap-1">
                          <MessageCircle className="h-3 w-3" />
                          {workerName ? `Chat with ${workerName}` : "Open chat"}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </section>

      <div className="fixed bottom-24 right-6 z-40">
        <Sheet open={chatbotOpen} onOpenChange={(open) => open && setChatbotOpen(true)}>
          <Button
            size="lg"
            className="rounded-full w-14 h-14 shadow-lg hover:shadow-xl"
            onClick={() => setChatbotOpen(true)}
          >
            <MessageCircle className="w-6 h-6" />
          </Button>
          <SheetContent
            side="right"
            className="w-full p-0 data-[state=open]:duration-700 data-[state=closed]:duration-400 data-[state=open]:ease-out"
            onEscapeKeyDown={(event) => event.preventDefault()}
            onPointerDownOutside={(event) => event.preventDefault()}
          >
            <ChatbotVoiceAgent onClose={() => setChatbotOpen(false)} />
          </SheetContent>
        </Sheet>
      </div>

      {wakeStatus !== 'idle' && (
        <div className="fixed bottom-2 right-6 z-30 text-xs text-muted-foreground">
          Wake listener: {wakeStatus}
        </div>
      )}
      <section>
        <h2 className="font-semibold flex items-center gap-2 mb-3">
          <CheckCircle className="h-4 w-4 text-green-600" />
          Recent Services
        </h2>
        {recentJobs.length === 0 ? (
          <div className="rounded-xl border bg-card p-6 text-center">
            <p className="text-sm text-muted-foreground">No completed services yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentJobs.slice(0, 5).map((job) => {
              const workerName =
                typeof job.workerId === "object" && job.workerId?.name
                  ? job.workerId.name
                  : "Worker"
              return (
                <div key={job._id} className="rounded-xl border bg-card p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">{job.title || job.description.slice(0, 40)}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">by {workerName}</p>
                  </div>
                  <Link href="/client/chats">
                    <Button variant="outline" size="sm" className="rounded-lg text-xs">
                      <MessageCircle className="h-3 w-3 mr-1" />
                      Contact again
                    </Button>
                  </Link>
                </div>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}
