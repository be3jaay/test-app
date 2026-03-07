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
      <div className="fixed bottom-20 right-4 z-40">
        <Sheet open={chatbotOpen} onOpenChange={setChatbotOpen}>
          <SheetTrigger asChild>
            <Button size="lg" className="rounded-full w-14 h-14 shadow-lg hover:shadow-xl">
              <MessageCircle className="w-6 h-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-full p-0">
            <ChatbotAgent onClose={() => setChatbotOpen(false)} />
          </SheetContent>
        </Sheet>
      </div>
      <BottomNav role="client" />
    </div>
  )
}
