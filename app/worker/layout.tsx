"use client"

import { BottomNav } from "@/components/bottom-nav"

export default function WorkerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-svh pb-16">
      {children}
      <BottomNav role="worker" />
    </div>
  )
}
