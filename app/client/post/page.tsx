"use client"

import { useRequireAuth } from "@/components/providers/auth-provider"
import { TRole } from "@/services/auth/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Suspense, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import ApiService from "@/services/api-services"
import { toast } from "sonner"
import { Loader2, Send } from "lucide-react"

function PostRequestForm() {
  const { isAuthenticated, isLoading } = useRequireAuth([TRole.CLIENT])
  const searchParams = useSearchParams()
  const router = useRouter()

  const [title, setTitle] = useState(searchParams.get("service") || "")
  const [category, setCategory] = useState(searchParams.get("category") || "")
  const [description, setDescription] = useState("")
  const [submitting, setSubmitting] = useState(false)

  if (isLoading || !isAuthenticated) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !description.trim()) {
      toast.error("Please fill in all fields")
      return
    }
    setSubmitting(true)
    try {
      await ApiService.post("/jobs/matchmaking", {
        title: title.trim(),
        category: category.trim(),
        description: description.trim(),
      })
      toast.success("Request posted successfully!")
      router.push("/client/dashboard")
    } catch {
      toast.error("Failed to post request. Try again.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      <h1 className="text-xl font-bold mb-1">Post a Request</h1>
      <p className="text-sm text-muted-foreground mb-6">
        Describe what you need and we'll match you with the right professional.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-1.5 block">Service title</label>
          <Input
            placeholder="e.g. Fix my leaking faucet"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="rounded-xl"
          />
        </div>

        <div>
          <label className="text-sm font-medium mb-1.5 block">Category</label>
          <Input
            placeholder="e.g. Plumber, Electrician, Cleaning"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="rounded-xl"
          />
        </div>

        <div>
          <label className="text-sm font-medium mb-1.5 block">Description</label>
          <Textarea
            placeholder="Describe your problem in detail..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="rounded-xl min-h-[120px]"
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
          {submitting ? "Posting..." : "Post Request"}
        </Button>
      </form>
    </div>
  )
}

export default function ClientPostPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-svh items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      }
    >
      <PostRequestForm />
    </Suspense>
  )
}
