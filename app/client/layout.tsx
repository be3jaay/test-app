"use client"

import { useState } from "react"
import { BottomNav } from "@/components/bottom-nav"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { ChatbotAgent } from "@/components/chatbot-agent"
import { MessageCircle } from "lucide-react"

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const [chatbotOpen, setChatbotOpen] = useState(false)

  return (
    <div className="min-h-svh pb-16">
      {children}
      {/* Denki AI Chatbot FAB */}
      <BottomNav role="client" />
    </div>
  )
}
