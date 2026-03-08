"use client"

import { useRequireAuth } from "@/components/providers/auth-provider"
import { TRole } from "@/services/auth/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useEffect, useState, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import ApiService from "@/services/api-services"
import { TokenStorage } from "@/services/token-storage"
import { Loader2, ArrowLeft, Send, Lock, Wallet } from "lucide-react"
import { PaymentReleaseCard } from "@/components/payment-release-card"
import { toast } from "sonner"

type Message = {
  _id: string
  senderId: { _id: string; email?: string } | string
  receiverId: { _id: string; email?: string } | string
  content: string
  createdAt: string
}

export default function ClientChatRoomPage() {
  const { isAuthenticated, isLoading } = useRequireAuth([TRole.CLIENT])
  const params = useParams()
  const router = useRouter()
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [text, setText] = useState("")
  const [sending, setSending] = useState(false)
  const [jobStatus, setJobStatus] = useState<string>("")
  const [jobTitle, setJobTitle] = useState<string>("")
  const [jobPrice, setJobPrice] = useState<number>(0)
  const [paymentStatus, setPaymentStatus] = useState<string>("Unpaid")
  const [releasing, setReleasing] = useState(false)
  const [escrowing, setEscrowing] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  const fetchMessages = () => {
    if (!params.jobId) return
    ApiService.getArray<Message>(`/chat/${params.jobId}/messages`)
      .then((res) => setMessages(res))
      .catch((err) => console.error("Failed to fetch messages:", err))
      .finally(() => setLoading(false))
  }

  const fetchJobStatus = () => {
    if (!params.jobId) return
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ApiService.get<any>(`/jobs/${params.jobId}`)
      .then((res) => {
        const job = res?.data ?? res
        setJobStatus(job.status)
        setJobTitle(job.title || job.description || "Service")
        setJobPrice(job.price || 0)
        setPaymentStatus(job.paymentStatus || "Unpaid")
      })
      .catch((err) => console.error("Failed to fetch job status:", err))
  }

  const handleEscrowPayment = async () => {
    if (!params.jobId) return
    setEscrowing(true)
    try {
      await ApiService.patch(`/jobs/${params.jobId}/escrow`, {})
      await ApiService.post(`/chat/${params.jobId}/messages`, {
        content: "🔒 Payment has been escrowed. Funds are now locked securely.",
      }).catch(() => {})
      setPaymentStatus("Escrowed")
      toast.success("Payment escrowed successfully!")
      fetchMessages()
      fetchJobStatus()
    } catch {
      toast.error("Failed to escrow payment")
    } finally {
      setEscrowing(false)
    }
  }

  const handleReleasePayment = async () => {
    if (!params.jobId) return
    setReleasing(true)
    try {
      await ApiService.patch(`/jobs/${params.jobId}/release`, {})
      await ApiService.post(`/chat/${params.jobId}/messages`, {
        content: "💰 Payment has been released. Thank you for your great work!",
      }).catch(() => {})
      setPaymentStatus("Released")
      toast.success("Payment released successfully!")
      fetchMessages()
      fetchJobStatus()
    } catch {
      toast.error("Failed to release payment")
    } finally {
      setReleasing(false)
    }
  }

  useEffect(() => {
    if (!isAuthenticated) return
    fetchMessages()
    fetchJobStatus()
    const interval = setInterval(() => {
      fetchMessages()
      fetchJobStatus()
    }, 5000)
    return () => clearInterval(interval)
  }, [isAuthenticated, params.jobId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSend = async () => {
    if (!text.trim() || !params.jobId) return
    setSending(true)
    try {
      await ApiService.post(`/chat/${params.jobId}/messages`, {
        content: text.trim(),
      })
      setText("")
      fetchMessages()
    } catch {
    } finally {
      setSending(false)
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
    <div className="flex flex-col h-[calc(100svh-4rem)] max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b">
        <button onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5 text-muted-foreground" />
        </button>
        <h1 className="font-semibold text-sm">Chat</h1>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-sm text-muted-foreground">
              No messages yet. Start the conversation!
            </p>
          </div>
        ) : (
          messages.map((msg) => {
            const senderId = typeof msg.senderId === "object" ? msg.senderId._id : msg.senderId
            const isMe = senderId === TokenStorage.getUserId()
            return (
              <div
                key={msg._id}
                className={`flex ${isMe ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm ${
                    isMe
                      ? "bg-primary text-primary-foreground rounded-br-md"
                      : "bg-muted rounded-bl-md"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            )
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Escrow Payment Button - shown when job is accepted but not yet escrowed */}
      {paymentStatus === "Unpaid" && jobStatus !== "Pending" && jobStatus !== "Cancelled" && jobStatus !== "Declined" && (
        <div className="px-4 py-3 border-t">
          <div className="rounded-2xl border-2 border-amber-200 bg-amber-50 p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-amber-600" />
              <p className="font-semibold text-sm text-amber-700">Escrow Payment</p>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-xs text-amber-600">{jobTitle}</p>
              <p className="font-bold text-amber-700">₱{jobPrice.toLocaleString()}</p>
            </div>
            <p className="text-xs text-amber-600/70 text-center">
              Lock funds in escrow to secure the worker&apos;s service. Funds will be held until you release them.
            </p>
            <Button
              className="w-full rounded-xl"
              onClick={handleEscrowPayment}
              disabled={escrowing}
            >
              {escrowing ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Wallet className="h-4 w-4 mr-2" />
              )}
              {escrowing ? "Escrowing..." : `Escrow ₱${jobPrice.toLocaleString()}`}
            </Button>
          </div>
        </div>
      )}

      {/* Payment Release Card - shown when escrowed and client confirmed */}
      {paymentStatus === "Escrowed" && (jobStatus === "ClientConfirmed" || jobStatus === "Completed") && (
        <div className="px-4 py-3 border-t">
          <PaymentReleaseCard
            jobTitle={jobTitle}
            amount={jobPrice}
            role="client"
            released={false}
            onRelease={handleReleasePayment}
            releasing={releasing}
          />
        </div>
      )}

      {/* Payment Released Card */}
      {paymentStatus === "Released" && (
        <div className="px-4 py-3 border-t">
          <PaymentReleaseCard
            jobTitle={jobTitle}
            amount={jobPrice}
            role="client"
            released={true}
          />
        </div>
      )}

      {/* Escrowed status indicator - shown when escrowed but work not yet confirmed */}
      {paymentStatus === "Escrowed" && jobStatus !== "ClientConfirmed" && jobStatus !== "Completed" && (
        <div className="px-4 py-3 border-t">
          <div className="rounded-2xl border-2 border-blue-200 bg-blue-50 p-4">
            <div className="flex items-center gap-2 mb-1">
              <Lock className="h-4 w-4 text-blue-600" />
              <p className="font-semibold text-sm text-blue-700">Payment Escrowed</p>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-xs text-blue-600">₱{jobPrice.toLocaleString()} locked</p>
              <p className="text-xs text-blue-600/70">Waiting for work to be completed</p>
            </div>
          </div>
        </div>
      )}

      {/* Input */}
      <div className="px-4 py-3 border-t">
        <div className="flex gap-2">
          <Input
            placeholder="Type a message..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
            className="rounded-xl"
          />
          <Button
            size="icon"
            className="rounded-xl shrink-0"
            onClick={handleSend}
            disabled={sending || !text.trim()}
          >
            {sending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
