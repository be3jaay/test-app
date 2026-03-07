"use client"

import { useRequireAuth } from "@/components/providers/auth-provider"
import { TRole } from "@/services/auth/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useEffect, useState, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import ApiService from "@/services/api-services"
import { Loader2, ArrowLeft, Send } from "lucide-react"

type Message = {
  _id: string
  sender?: string
  senderId: { _id: string; name?: string; role?: string } | string
  content: string
  createdAt: string
}

export default function WorkerChatRoomPage() {
  const { isAuthenticated, isLoading } = useRequireAuth([TRole.WORKER])
  const params = useParams()
  const router = useRouter()
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [text, setText] = useState("")
  const [sending, setSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  const fetchMessages = () => {
    if (!params.jobId) return
    ApiService.getArray<Message>(`/chat/${params.jobId}/messages`)
      .then((res) => setMessages(res))
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    if (!isAuthenticated) return
    fetchMessages()
    const interval = setInterval(fetchMessages, 5000)
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
            const senderRole = typeof msg.senderId === "object" ? msg.senderId?.role : ""
            const isMe = senderRole?.toLowerCase() === "worker" || msg.sender === "Worker" || msg.sender === "worker"
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
