"use client"

import { useRequireAuth } from "@/components/providers/auth-provider"
import { TRole } from "@/services/auth/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import ApiService from "@/services/api-services"
import { toast } from "sonner"
import { Loader2, Send, CheckCircle } from "lucide-react"

type WorkerProfile = {
  _id: string
  name: string
  skills: string[]
  serviceDescription?: string
  isAvailable: boolean
}

export default function WorkerPostPage() {
  const { isAuthenticated, isLoading } = useRequireAuth([TRole.WORKER])
  const router = useRouter()

  const [profile, setProfile] = useState<WorkerProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedSkill, setSelectedSkill] = useState("")
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [price, setPrice] = useState("")
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!isAuthenticated) return
    ApiService.get<{ data: WorkerProfile }>("/workers/profile")
      .then((res) => {
        setProfile(res.data)
        if (res.data?.skills?.length > 0) {
          setSelectedSkill(res.data.skills[0])
        }
      })
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

  if (loading) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!profile || !profile.skills || profile.skills.length === 0) {
    return (
      <div className="max-w-lg mx-auto px-4 py-6">
        <h1 className="text-xl font-bold mb-2">Post a Service</h1>
        <div className="rounded-xl border bg-card p-6 text-center">
          <p className="text-sm text-muted-foreground mb-2">
            You need to set up your skills in your profile before posting a service.
          </p>
          <Button
            variant="outline"
            className="rounded-xl"
            onClick={() => router.push("/worker/profile")}
          >
            Go to Profile
          </Button>
        </div>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedSkill || !title.trim() || !description.trim()) {
      toast.error("Please fill in all required fields")
      return
    }
    setSubmitting(true)
    try {
      await ApiService.put("/workers/profile", {
        serviceDescription: description.trim(),
        isAvailable: true,
      })
      toast.success("Service posted! Clients can now find you.")
      router.push("/worker/dashboard")
    } catch {
      toast.error("Failed to post service. Try again.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      <h1 className="text-xl font-bold mb-1">Post a Service</h1>
      <p className="text-sm text-muted-foreground mb-6">
        Let clients know you're available. Pick one of your skills and describe what you offer.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Skill selection from profile */}
        <div>
          <label className="text-sm font-medium mb-2 block">Your skill</label>
          <div className="flex flex-wrap gap-2">
            {profile.skills.map((skill) => (
              <button
                key={skill}
                type="button"
                onClick={() => setSelectedSkill(skill)}
                className="focus:outline-none"
              >
                <Badge
                  variant={selectedSkill === skill ? "default" : "outline"}
                  className="rounded-lg px-3 py-1.5 text-sm cursor-pointer"
                >
                  {selectedSkill === skill && (
                    <CheckCircle className="h-3 w-3 mr-1" />
                  )}
                  {skill}
                </Badge>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-sm font-medium mb-1.5 block">Service title</label>
          <Input
            placeholder={`e.g. Professional ${selectedSkill || "service"}`}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="rounded-xl"
          />
        </div>

        <div>
          <label className="text-sm font-medium mb-1.5 block">Description</label>
          <Textarea
            placeholder="Describe what you offer, your experience, and what clients can expect..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="rounded-xl min-h-[120px]"
          />
        </div>

        <div>
          <label className="text-sm font-medium mb-1.5 block">
            Starting price (optional)
          </label>
          <Input
            type="number"
            placeholder="e.g. 500"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="rounded-xl"
          />
        </div>

        <Button
          type="submit"
          className="w-full rounded-xl h-12"
          disabled={submitting}
        >
          {submitting ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Send className="h-4 w-4 mr-2" />
          )}
          {submitting ? "Posting..." : "Post Service"}
        </Button>
      </form>
    </div>
  )
}
