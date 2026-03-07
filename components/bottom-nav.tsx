"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Search, PlusCircle, MessageCircle, Settings, Briefcase } from "lucide-react"
import { cn } from "@/lib/utils"

type NavItem = {
  label: string
  href: string
  icon: React.ComponentType<{ className?: string }>
}

const clientNav: NavItem[] = [
  { label: "Home", href: "/client/dashboard", icon: Home },
  { label: "Services", href: "/client/services", icon: Search },
  { label: "Post", href: "/client/post", icon: PlusCircle },
  { label: "Chats", href: "/client/chats", icon: MessageCircle },
  { label: "Settings", href: "/client/settings", icon: Settings },
]

const workerNav: NavItem[] = [
  { label: "Home", href: "/worker/dashboard", icon: Home },
  { label: "Jobs", href: "/worker/jobs", icon: Briefcase },
  { label: "Post", href: "/worker/post", icon: PlusCircle },
  { label: "Chats", href: "/worker/chats", icon: MessageCircle },
  { label: "Settings", href: "/worker/settings", icon: Settings },
]

export function BottomNav({ role }: { role: "client" | "worker" }) {
  const pathname = usePathname()
  const items = role === "client" ? clientNav : workerNav

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex max-w-lg items-center justify-around px-2 py-2">
        {items.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl text-xs transition-colors",
                isActive
                  ? "text-primary font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className={cn("h-5 w-5", isActive && "text-primary")} />
              {item.label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
