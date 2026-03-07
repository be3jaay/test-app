"use client"

import { useRequireAuth } from "@/components/providers/auth-provider"
import { TRole } from "@/services/auth/types"
import { useEffect, useState } from "react"
import ApiService from "@/services/api-services"
import { Loader2, User, Mail, Phone, MapPin } from "lucide-react"

type Profile = {
  _id: string
  email: string
  name?: string | null
  phone?: string | null
  location?: string | null
  role: string
}

export default function ClientProfilePage() {
  const { isAuthenticated, isLoading } = useRequireAuth([TRole.CLIENT])
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated) return
    ApiService.get<{ data: Profile }>("/auth/profile")
      .then((res) => setProfile(res.data))
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
      <h1 className="text-xl font-bold mb-6">My Profile</h1>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : profile ? (
        <div className="space-y-4">
          <div className="flex flex-col items-center mb-6">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-3">
              <User className="h-10 w-10 text-primary" />
            </div>
            <p className="font-semibold text-lg">{profile.name || "No name set"}</p>
            <p className="text-sm text-muted-foreground capitalize">{profile.role}</p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-3 rounded-xl border bg-card p-4">
              <Mail className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Email</p>
                <p className="text-sm font-medium">{profile.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-xl border bg-card p-4">
              <Phone className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Phone</p>
                <p className="text-sm font-medium">{profile.phone || "Not set"}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-xl border bg-card p-4">
              <MapPin className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Location</p>
                <p className="text-sm font-medium">{profile.location || "Not set"}</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-sm text-muted-foreground">Could not load profile</p>
        </div>
      )}
    </div>
  )
}
