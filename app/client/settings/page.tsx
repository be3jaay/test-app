"use client"

import { useRequireAuth, useAuth } from "@/components/providers/auth-provider"
import { TRole } from "@/services/auth/types"
import { Button } from "@/components/ui/button"
import { Loader2, LogOut, User, Bell, Shield, HelpCircle } from "lucide-react"
import Link from "next/link"

export default function ClientSettingsPage() {
  const { isAuthenticated, isLoading } = useRequireAuth([TRole.CLIENT])
  const { logout } = useAuth()

  if (isLoading || !isAuthenticated) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    )
  }

  const menuItems = [
    { label: "Profile", icon: User, href: "/client/profile" },
    { label: "Notifications", icon: Bell, href: "#" },
    { label: "Privacy & Security", icon: Shield, href: "#" },
    { label: "Help & Support", icon: HelpCircle, href: "#" },
  ]

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      <h1 className="text-xl font-bold mb-6">Settings</h1>

      <div className="space-y-1 mb-8">
        {menuItems.map((item) => {
          const Icon = item.icon
          return (
            <Link key={item.label} href={item.href}>
              <div className="flex items-center gap-3 rounded-xl p-3 hover:bg-muted transition-colors">
                <Icon className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm font-medium">{item.label}</span>
              </div>
            </Link>
          )
        })}
      </div>

      <Button
        variant="destructive"
        className="w-full rounded-xl"
        onClick={logout}
      >
        <LogOut className="h-4 w-4 mr-2" />
        Log out
      </Button>
    </div>
  )
}
