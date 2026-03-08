"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { PhotoUploadCard } from "@/components/photo-upload-card"
import { PaymentReleaseCard } from "@/components/payment-release-card"
import {
  CheckCircle,
  Briefcase,
  Loader2,
  MapPin,
  Navigation,
  Camera,
  MessageCircle,
  ArrowLeft,
  Send,
} from "lucide-react"
import { toast } from "sonner"
import { Input } from "@/components/ui/input"

// ─── Mock data ────────────────────────────────────────────────────────────────

type MockJob = {
  _id: string
  title: string
  category: string
  description: string
  status: string
  clientName: string
  workerName: string
}

const initialMockJobs: MockJob[] = [
  {
    _id: "mock-1",
    title: "Fix leaking kitchen faucet",
    category: "Plumbing",
    description: "Kitchen faucet has been dripping for 2 days. Need urgent repair.",
    status: "Accepted",
    clientName: "Maria Santos",
    workerName: "Juan Cruz",
  },
  {
    _id: "mock-2",
    title: "Aircon cleaning and maintenance",
    category: "HVAC",
    description: "Split-type aircon in the bedroom hasn't been cleaned in 6 months.",
    status: "OnTheWay",
    clientName: "Ana Reyes",
    workerName: "Pedro Garcia",
  },
  {
    _id: "mock-3",
    title: "Electrical outlet installation",
    category: "Electrical",
    description: "Need 2 new outlets installed in the home office area.",
    status: "Arrived",
    clientName: "Carlos Mendoza",
    workerName: "Miguel Torres",
  },
  {
    _id: "mock-4",
    title: "Deep cleaning service",
    category: "Cleaning",
    description: "Full house deep cleaning – 3 bedrooms, 2 bathrooms, kitchen.",
    status: "InProgress",
    clientName: "Sofia Lim",
    workerName: "Rosa Navarro",
  },
  {
    _id: "mock-5",
    title: "Roof gutter repair",
    category: "General Repair",
    description: "Gutter is detached on the left side of the house, causing leaks.",
    status: "ClientConfirmed",
    clientName: "David Tan",
    workerName: "Ernesto Bautista",
  },
]

// ─── Shared constants ─────────────────────────────────────────────────────────

const statusSteps = [
  { key: "Accepted", label: "Accepted", next: "OnTheWay" },
  { key: "OnTheWay", label: "On the way", next: "Arrived" },
  { key: "Arrived", label: "I'm here", next: "InProgress" },
  { key: "InProgress", label: "In progress", next: null },
  { key: "ClientConfirmed", label: "Client confirmed", next: "Completed" },
]

const stepIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  Accepted: Briefcase,
  OnTheWay: Navigation,
  Arrived: MapPin,
  InProgress: Camera,
  ClientConfirmed: CheckCircle,
}

const clientStatusSteps = [
  { key: "Accepted", label: "Accepted" },
  { key: "OnTheWay", label: "On the way" },
  { key: "Arrived", label: "Arrived" },
  { key: "InProgress", label: "In progress" },
  { key: "ClientConfirmed", label: "Confirmed" },
]

const clientStepIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  Accepted: Briefcase,
  OnTheWay: Navigation,
  Arrived: MapPin,
  InProgress: Camera,
  ClientConfirmed: CheckCircle,
}

const statusColor: Record<string, string> = {
  Accepted: "bg-blue-100 text-blue-700",
  OnTheWay: "bg-blue-100 text-blue-700",
  Arrived: "bg-blue-100 text-blue-700",
  InProgress: "bg-purple-100 text-purple-700",
  ClientConfirmed: "bg-green-100 text-green-700",
  Completed: "bg-green-100 text-green-700",
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function TestActiveJobsPage() {
  const [jobs, setJobs] = useState<MockJob[]>(initialMockJobs)
  const [workerPhotos, setWorkerPhotos] = useState<Record<string, string>>({})
  const [clientPhotos, setClientPhotos] = useState<Record<string, string>>({})
  const [view, setView] = useState<"worker" | "client" | "chat">("worker")
  const [chatJobId, setChatJobId] = useState<string | null>(null)
  const [chatRole, setChatRole] = useState<"worker" | "client">("worker")
  const [mockMessages, setMockMessages] = useState<{ id: string; from: "worker" | "client" | "system"; text: string }[]>([])
  const [chatInput, setChatInput] = useState("")
  const [releasing, setReleasing] = useState(false)

  const handleAdvanceStatus = (jobId: string, nextStatus: string) => {
    setJobs((prev) =>
      prev.map((j) => (j._id === jobId ? { ...j, status: nextStatus } : j))
    )
    toast.success(`Status updated to ${nextStatus}`)
  }

  const openMockChat = (jobId: string, role: "worker" | "client", autoMessages: { from: "worker" | "client" | "system"; text: string }[]) => {
    setChatJobId(jobId)
    setChatRole(role)
    setMockMessages(autoMessages.map((m, i) => ({ id: `auto-${i}`, ...m })))
    setChatInput("")
    setView("chat")
  }

  const handleClientConfirm = (jobId: string) => {
    setJobs((prev) =>
      prev.map((j) => (j._id === jobId ? { ...j, status: "ClientConfirmed" } : j))
    )
    toast.success("Job confirmed! Both sides redirected to chat...")
    // Open chat as client (auto-redirect simulation)
    openMockChat(jobId, "client", [
      { from: "client", text: "✅ I've confirmed the work is done. Photos uploaded. Please review the payment details." },
      { from: "worker", text: "📸 Work completed! Photos have been submitted for your review." },
    ])
  }

  const handleWorkerChatRedirect = (jobId: string) => {
    toast.success("Worker auto-redirected to chat!")
    openMockChat(jobId, "worker", [
      { from: "worker", text: "📸 Work completed! Photos have been submitted for your review." },
      { from: "client", text: "✅ I've confirmed the work is done. Photos uploaded. Please review the payment details." },
    ])
  }

  const handleReleasePayment = (jobId: string) => {
    setReleasing(true)
    setTimeout(() => {
      setJobs((prev) =>
        prev.map((j) => (j._id === jobId ? { ...j, status: "Completed" } : j))
      )
      setMockMessages((prev) => [
        ...prev,
        { id: `release-${Date.now()}`, from: "client" as const, text: "💰 Payment has been released. Thank you for your great work!" },
      ])
      setReleasing(false)
      toast.success("Payment released successfully!")
    }, 1000)
  }

  const handleSendMockMessage = () => {
    if (!chatInput.trim()) return
    setMockMessages((prev) => [
      ...prev,
      { id: `msg-${Date.now()}`, from: chatRole, text: chatInput.trim() },
    ])
    setChatInput("")
  }

  const handleReset = () => {
    setJobs(initialMockJobs)
    setWorkerPhotos({})
    setClientPhotos({})
    setChatJobId(null)
    setMockMessages([])
    setView("worker")
    toast.info("Mock data reset")
  }

  const activeJobs = jobs.filter(
    (j) => !["Completed", "Declined", "Cancelled", "Pending"].includes(j.status)
  )

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold">Test: Active Jobs Pipeline</h1>
        <Button variant="outline" size="sm" onClick={handleReset}>
          Reset
        </Button>
      </div>

      {/* View toggle */}
      <div className="flex gap-2 mb-6">
        <Button
          variant={view === "worker" ? "default" : "outline"}
          size="sm"
          className="flex-1 rounded-xl"
          onClick={() => setView("worker")}
        >
          Worker View
        </Button>
        <Button
          variant={view === "client" ? "default" : "outline"}
          size="sm"
          className="flex-1 rounded-xl"
          onClick={() => setView("client")}
        >
          Client View
        </Button>
        {chatJobId && (
          <Button
            variant={view === "chat" ? "default" : "outline"}
            size="sm"
            className="flex-1 rounded-xl"
            onClick={() => setView("chat")}
          >
            Chat
          </Button>
        )}
      </div>

      <p className="text-xs text-muted-foreground mb-4">
        Showing {activeJobs.length} mock jobs at different pipeline stages. Use the buttons to advance each job through the pipeline.
      </p>

      {/* ─── WORKER VIEW ─────────────────────────────────────────── */}
      {view === "worker" && (
        <section className="space-y-3">
          <h2 className="font-semibold flex items-center gap-2 mb-2">
            <Briefcase className="h-4 w-4 text-primary" />
            Active Jobs (Worker)
            <Badge variant="secondary" className="text-xs ml-auto">
              {activeJobs.length}
            </Badge>
          </h2>

          {activeJobs.map((job) => {
            const currentStepIdx = statusSteps.findIndex((s) => s.key === job.status)
            const currentStep = currentStepIdx >= 0 ? statusSteps[currentStepIdx] : null
            const StepIcon = stepIcons[job.status] || Briefcase

            return (
              <div key={job._id} className="rounded-xl border bg-card p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-medium text-sm">{job.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {job.category} &middot; Client: {job.clientName}
                    </p>
                  </div>
                  <StepIcon className="h-4 w-4 text-primary shrink-0" />
                </div>

                {/* Status progress bar */}
                <div className="flex gap-1.5 mb-3">
                  {statusSteps.map((step, i) => {
                    const isCurrent = i === currentStepIdx
                    const isActive = i <= currentStepIdx
                    const isLastStep = step.key === "ClientConfirmed" && job.status === "ClientConfirmed"
                    const isFinished = isCurrent && isLastStep
                    const showShimmer = isCurrent && !isFinished
                    const Icon = isFinished ? CheckCircle : (stepIcons[step.key] || Briefcase)
                    return (
                      <div key={step.key} className="flex-1 flex flex-col items-center gap-1">
                        <div
                          className={`h-2 w-full rounded-full ${
                            isFinished ? "bg-green-500" : isActive && !isCurrent ? "bg-primary" : !isActive ? "bg-muted" : ""
                          }`}
                          style={
                            showShimmer
                              ? {
                                  background:
                                    "linear-gradient(90deg, var(--primary) 0%, var(--primary) 30%, color-mix(in srgb, var(--primary), white 40%) 50%, var(--primary) 70%, var(--primary) 100%)",
                                  backgroundSize: "200% 100%",
                                  animation: "progress-shimmer 2s ease-in-out infinite, progress-pulse 2s ease-in-out infinite",
                                }
                              : undefined
                          }
                        />
                        <div
                          className={`flex flex-col items-center gap-0.5 ${
                            isFinished
                              ? "text-green-600"
                              : isCurrent
                                ? "text-primary"
                                : isActive
                                  ? "text-primary/70"
                                  : "text-muted-foreground/50"
                          }`}
                        >
                          <Icon className="h-3 w-3" />
                          <span className={`text-[9px] leading-tight text-center ${isCurrent ? "font-semibold" : "font-normal"}`}>
                            {isFinished ? "Done" : step.label}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Photo upload section for InProgress */}
                {job.status === "InProgress" && (
                  <div className="space-y-3 mb-3">
                    <div className="grid grid-cols-2 gap-3">
                      <PhotoUploadCard
                        label="Upload proof of work"
                        preview={workerPhotos[job._id] || null}
                        onPhotoSelect={(_file, url) =>
                          setWorkerPhotos((prev) => ({ ...prev, [job._id]: url }))
                        }
                      />
                      <PhotoUploadCard
                        label="Client confirmation photo"
                        preview={null}
                        waitingLabel="Waiting for client..."
                      />
                    </div>
                    <p className="text-[10px] text-muted-foreground text-center">
                      Photos: {workerPhotos[job._id] ? "1" : "0"}/2 uploaded
                    </p>
                  </div>
                )}

                <div className="flex items-center justify-end">
                  {job.status === "InProgress" && !workerPhotos[job._id] && (
                    <p className="text-xs text-muted-foreground mr-auto">
                      Upload a photo to proceed
                    </p>
                  )}
                  {job.status === "InProgress" && workerPhotos[job._id] && (
                    <p className="text-xs text-green-600 mr-auto">
                      Photo uploaded — waiting for client
                    </p>
                  )}
                  {job.status === "ClientConfirmed" && (
                    <Button
                      size="sm"
                      className="rounded-lg text-xs h-8"
                      onClick={() => handleWorkerChatRedirect(job._id)}
                    >
                      <MessageCircle className="h-3 w-3 mr-1" />
                      Go to Chat
                    </Button>
                  )}
                  {currentStep?.next && job.status !== "InProgress" && job.status !== "ClientConfirmed" && (
                    <Button
                      size="sm"
                      className="rounded-lg text-xs h-8"
                      onClick={() => handleAdvanceStatus(job._id, currentStep.next!)}
                    >
                      {currentStep.next === "OnTheWay"
                        ? "On the way"
                        : currentStep.next === "Arrived"
                          ? "I'm here"
                          : currentStep.next === "InProgress"
                            ? "Start work"
                            : "Mark Complete"}
                    </Button>
                  )}
                </div>
              </div>
            )
          })}
        </section>
      )}

      {/* ─── CLIENT VIEW ─────────────────────────────────────────── */}
      {view === "client" && (
        <section className="space-y-3">
          <h2 className="font-semibold flex items-center gap-2 mb-2">
            <Briefcase className="h-4 w-4 text-primary" />
            Active Jobs (Client)
            <Badge variant="secondary" className="text-xs ml-auto">
              {activeJobs.length}
            </Badge>
          </h2>

          {activeJobs.map((job) => {
            const currentStepIdx = clientStatusSteps.findIndex((s) => s.key === job.status)

            return (
              <div key={job._id} className="rounded-xl border bg-card p-4 space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-sm">{job.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {job.category} &middot; Worker: {job.workerName}
                    </p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor[job.status] || "bg-muted"}`}>
                    {job.status === "OnTheWay" ? "On the way" : job.status === "ClientConfirmed" ? "Confirmed" : job.status}
                  </span>
                </div>

                <div className="rounded-xl bg-muted/50 p-3">
                  <p className="text-xs text-muted-foreground mb-1">Description</p>
                  <p className="text-sm leading-relaxed">{job.description}</p>
                </div>

                {/* Status Timeline */}
                <div className="flex gap-1.5">
                  {clientStatusSteps.map((step, i) => {
                    const isCurrent = i === currentStepIdx
                    const isActive = i <= currentStepIdx
                    const isConfirmed = step.key === "ClientConfirmed" && job.status === "ClientConfirmed"
                    const showShimmer = isCurrent && !isConfirmed
                    const Icon = isConfirmed ? CheckCircle : (clientStepIcons[step.key] || Briefcase)
                    return (
                      <div key={step.key} className="flex-1 flex flex-col items-center gap-1">
                        <div
                          className={`h-2 w-full rounded-full ${
                            isConfirmed ? "bg-green-500" : isActive && !isCurrent ? "bg-primary" : !isActive ? "bg-muted" : ""
                          }`}
                          style={
                            showShimmer
                              ? {
                                  background:
                                    "linear-gradient(90deg, var(--primary) 0%, var(--primary) 30%, color-mix(in srgb, var(--primary), white 40%) 50%, var(--primary) 70%, var(--primary) 100%)",
                                  backgroundSize: "200% 100%",
                                  animation: "progress-shimmer 2s ease-in-out infinite, progress-pulse 2s ease-in-out infinite",
                                }
                              : undefined
                          }
                        />
                        <div
                          className={`flex flex-col items-center gap-0.5 ${
                            isConfirmed
                              ? "text-green-600"
                              : isCurrent
                                ? "text-primary"
                                : isActive
                                  ? "text-primary/70"
                                  : "text-muted-foreground/50"
                          }`}
                        >
                          <Icon className="h-3 w-3" />
                          <span className={`text-[9px] leading-tight text-center ${isCurrent ? "font-semibold" : "font-normal"}`}>
                            {isConfirmed ? "Done" : step.label}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Photo upload + Confirm for InProgress */}
                {job.status === "InProgress" && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <PhotoUploadCard
                        label="Upload confirmation photo"
                        preview={clientPhotos[job._id] || null}
                        onPhotoSelect={(_file, url) =>
                          setClientPhotos((prev) => ({ ...prev, [job._id]: url }))
                        }
                      />
                      <PhotoUploadCard
                        label="Worker proof of work"
                        preview={null}
                        waitingLabel="Waiting for worker..."
                      />
                    </div>
                    <p className="text-[10px] text-muted-foreground text-center">
                      Photos: {clientPhotos[job._id] ? "1" : "0"}/2 uploaded
                    </p>
                    <Button
                      className="w-full rounded-xl"
                      onClick={() => handleClientConfirm(job._id)}
                      disabled={!clientPhotos[job._id]}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      {clientPhotos[job._id] ? "Confirm Done" : "Upload photo to confirm"}
                    </Button>
                  </div>
                )}

                {/* Chat button for non-InProgress */}
                {job.status === "ClientConfirmed" ? (
                  <div className="flex justify-end">
                    <Button
                      size="sm"
                      className="rounded-lg text-xs"
                      onClick={() => openMockChat(job._id, "client", [
                        { from: "client", text: "✅ I've confirmed the work is done. Photos uploaded. Please review the payment details." },
                      ])}
                    >
                      <MessageCircle className="h-3 w-3 mr-1" />
                      Go to Chat
                    </Button>
                  </div>
                ) : job.status !== "InProgress" && (
                  <div className="flex justify-end">
                    <Button variant="outline" size="sm" className="rounded-lg text-xs">
                      <MessageCircle className="h-3 w-3 mr-1" />
                      Chat
                    </Button>
                  </div>
                )}
              </div>
            )
          })}
        </section>
      )}

      {/* ─── MOCK CHAT VIEW ──────────────────────────────────────── */}
      {view === "chat" && chatJobId && (() => {
        const job = jobs.find((j) => j._id === chatJobId)
        if (!job) return null

        return (
          <section className="flex flex-col h-[70vh] rounded-xl border bg-card overflow-hidden">
            {/* Chat header */}
            <div className="flex items-center gap-3 px-4 py-3 border-b">
              <button onClick={() => setView(chatRole)}>
                <ArrowLeft className="h-5 w-5 text-muted-foreground" />
              </button>
              <div>
                <h2 className="font-semibold text-sm">Chat</h2>
                <p className="text-xs text-muted-foreground">
                  {chatRole === "worker" ? `Client: ${job.clientName}` : `Worker: ${job.workerName}`}
                  {" · "}
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                    {chatRole === "worker" ? "Worker view" : "Client view"}
                  </Badge>
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="ml-auto text-xs"
                onClick={() => {
                  setChatRole(chatRole === "worker" ? "client" : "worker")
                  toast.info(`Switched to ${chatRole === "worker" ? "client" : "worker"} view`)
                }}
              >
                Switch to {chatRole === "worker" ? "Client" : "Worker"}
              </Button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
              {mockMessages.map((msg) => {
                const isMe = msg.from === chatRole
                return (
                  <div
                    key={msg.id}
                    className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm ${
                        isMe
                          ? "bg-primary text-primary-foreground rounded-br-md"
                          : "bg-muted rounded-bl-md"
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Payment Release Card */}
            {(job.status === "ClientConfirmed" || job.status === "Completed") && (
              <div className="px-4 py-3 border-t">
                <PaymentReleaseCard
                  jobTitle={job.title}
                  amount={500}
                  role={chatRole}
                  released={job.status === "Completed"}
                  onRelease={chatRole === "client" ? () => handleReleasePayment(job._id) : undefined}
                  releasing={releasing}
                />
              </div>
            )}

            {/* Chat input */}
            <div className="px-4 py-3 border-t">
              <div className="flex gap-2">
                <Input
                  placeholder="Type a message..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSendMockMessage()}
                  className="rounded-xl"
                />
                <Button
                  size="icon"
                  className="rounded-xl shrink-0"
                  onClick={handleSendMockMessage}
                  disabled={!chatInput.trim()}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </section>
        )
      })()}
    </div>
  )
}
