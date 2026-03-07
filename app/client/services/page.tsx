"use client"

import { useRequireAuth } from "@/components/providers/auth-provider"
import { TRole } from "@/services/auth/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import ApiService from "@/services/api-services"
import {
  Search,
  SlidersHorizontal,
  Zap,
  Droplets,
  Paintbrush,
  Wrench,
  Sparkles,
  Car,
  Home,
  Truck,
  Hammer,
  Shirt,
  UtensilsCrossed,
  BookOpen,
  ArrowLeft,
  Loader2,
  ChevronRight,
  Star,
  User,
  X,
  MapPin,
  Calendar,
} from "lucide-react"

type Category = {
  name: string
  icon: React.ComponentType<{ className?: string }>
  color: string
  subcategories: string[]
}

const categories: Category[] = [
  {
    name: "Electrician",
    icon: Zap,
    color: "bg-yellow-50 text-yellow-600",
    subcategories: ["Wiring & rewiring", "Outlet installation", "Light fixture install", "Circuit breaker repair", "Generator setup"],
  },
  {
    name: "Plumber",
    icon: Droplets,
    color: "bg-blue-50 text-blue-600",
    subcategories: ["Pipe repair", "Drain unclogging", "Faucet installation", "Water heater repair", "Toilet repair"],
  },
  {
    name: "Painter",
    icon: Paintbrush,
    color: "bg-purple-50 text-purple-600",
    subcategories: ["Interior painting", "Exterior painting", "Wall texture", "Cabinet refinishing", "Wallpaper install"],
  },
  {
    name: "Handyman",
    icon: Wrench,
    color: "bg-orange-50 text-orange-600",
    subcategories: ["Fix my lightbulb", "Fix my roof", "Door repair", "Window repair", "Furniture assembly"],
  },
  {
    name: "Cleaning",
    icon: Sparkles,
    color: "bg-green-50 text-green-600",
    subcategories: ["Deep cleaning", "Regular cleaning", "Move-in/out cleaning", "Carpet cleaning", "Window cleaning"],
  },
  {
    name: "Rental",
    icon: Car,
    color: "bg-cyan-50 text-cyan-600",
    subcategories: ["Rent a car", "Rent a van", "Rent a room", "Rent equipment", "Rent a bike"],
  },
  {
    name: "Home Repair",
    icon: Home,
    color: "bg-rose-50 text-rose-600",
    subcategories: ["Roof repair", "Flooring", "Drywall repair", "Fence repair", "Gutter cleaning"],
  },
  {
    name: "Moving",
    icon: Truck,
    color: "bg-indigo-50 text-indigo-600",
    subcategories: ["Local moving", "Long distance", "Packing service", "Furniture moving", "Office relocation"],
  },
  {
    name: "Construction",
    icon: Hammer,
    color: "bg-amber-50 text-amber-600",
    subcategories: ["Renovation", "Room addition", "Deck building", "Concrete work", "Demolition"],
  },
  {
    name: "Laundry",
    icon: Shirt,
    color: "bg-pink-50 text-pink-600",
    subcategories: ["Wash & fold", "Dry cleaning", "Ironing", "Stain removal", "Alterations"],
  },
  {
    name: "Catering",
    icon: UtensilsCrossed,
    color: "bg-red-50 text-red-600",
    subcategories: ["Event catering", "Personal chef", "Meal prep", "Baking", "Food delivery"],
  },
  {
    name: "Tutoring",
    icon: BookOpen,
    color: "bg-teal-50 text-teal-600",
    subcategories: ["Math tutoring", "Science tutoring", "Language lessons", "Music lessons", "Test prep"],
  },
]

type AvailableWorker = {
  _id: string
  name: string
  skills: string[]
  serviceDescription?: string
  rating: number
  isAvailable: boolean
}

type Review = {
  _id: string
  rating: number
  comment: string
  clientId?: { name?: string } | string | null
  createdAt: string
}

const mockWorkers: AvailableWorker[] = [
  { _id: "mock-1", name: "Juan Dela Cruz", skills: ["Electrician", "Handyman"], serviceDescription: "10+ years experience in residential wiring", rating: 4.8, isAvailable: true },
  { _id: "mock-2", name: "Maria Santos", skills: ["Plumber"], serviceDescription: "Licensed plumber, available 24/7 for emergencies", rating: 4.9, isAvailable: true },
  { _id: "mock-3", name: "Pedro Reyes", skills: ["Painter", "Handyman"], serviceDescription: "Interior and exterior painting specialist", rating: 4.5, isAvailable: true },
  { _id: "mock-4", name: "Ana Garcia", skills: ["Cleaning"], serviceDescription: "Professional deep cleaning and sanitation", rating: 4.7, isAvailable: true },
  { _id: "mock-5", name: "Carlos Ramos", skills: ["Electrician"], serviceDescription: "Commercial and residential electrical work", rating: 4.6, isAvailable: true },
  { _id: "mock-6", name: "Liza Mercado", skills: ["Catering"], serviceDescription: "Event catering and meal prep services", rating: 4.9, isAvailable: true },
  { _id: "mock-7", name: "Mark Villanueva", skills: ["Construction", "Handyman"], serviceDescription: "Home renovation and general repairs", rating: 4.4, isAvailable: true },
  { _id: "mock-8", name: "Rosa Diaz", skills: ["Tutoring"], serviceDescription: "Math and Science tutor for all levels", rating: 5.0, isAvailable: true },
  { _id: "mock-9", name: "Ben Torres", skills: ["Moving"], serviceDescription: "Local and long-distance moving, packing included", rating: 4.3, isAvailable: true },
  { _id: "mock-10", name: "Jenny Cruz", skills: ["Laundry", "Cleaning"], serviceDescription: "Wash, fold, ironing — pickup and delivery", rating: 4.7, isAvailable: true },
  { _id: "mock-11", name: "Rico Bautista", skills: ["Plumber", "Handyman"], serviceDescription: "Pipe repair, faucet install, general fixes", rating: 4.5, isAvailable: true },
  { _id: "mock-12", name: "Grace Lim", skills: ["Painter"], serviceDescription: "Wallpaper installation and accent walls", rating: 4.8, isAvailable: true },
]

const mockReviews: Record<string, Review[]> = {
  "mock-1": [
    { _id: "r1", rating: 5, comment: "Fixed all the wiring in my house. Very professional!", clientId: { name: "Anna R." }, createdAt: "2025-12-10" },
    { _id: "r2", rating: 5, comment: "Fast and reliable. Highly recommend.", clientId: { name: "Mike L." }, createdAt: "2025-11-28" },
  ],
  "mock-2": [
    { _id: "r3", rating: 5, comment: "Fixed my pipe leak in under an hour. Amazing service.", clientId: { name: "Sarah K." }, createdAt: "2025-12-15" },
  ],
  "mock-3": [
    { _id: "r4", rating: 4, comment: "Good work on the interior painting. Minor touch-ups needed.", clientId: { name: "David C." }, createdAt: "2025-12-01" },
  ],
  "mock-5": [
    { _id: "r5", rating: 5, comment: "Installed new outlets and panel. Clean work.", clientId: { name: "Jose M." }, createdAt: "2025-11-20" },
  ],
}

function matchesCategory(skill: string, categoryName: string): boolean {
  const s = skill.toLowerCase().trim()
  const c = categoryName.toLowerCase().trim()
  return s.includes(c) || c.includes(s)
}

function WorkerModal({
  worker,
  category,
  reviews,
  loadingReviews,
  onClose,
  onBook,
}: {
  worker: AvailableWorker
  category: string
  reviews: Review[]
  loadingReviews: boolean
  onClose: () => void
  onBook: () => void
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center pb-16 sm:pb-0">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-background rounded-t-3xl sm:rounded-3xl max-h-[80svh] overflow-y-auto">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-muted flex items-center justify-center"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="p-6">
          {/* Profile header */}
          <div className="flex flex-col items-center text-center mb-6">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-3">
              <User className="h-10 w-10 text-primary" />
            </div>
            <h2 className="text-xl font-bold">{worker.name}</h2>
            <div className="flex items-center gap-1 mt-1">
              <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
              <span className="text-sm font-medium">{worker.rating.toFixed(1)}</span>
              <span className="text-xs text-muted-foreground">
                ({reviews.length} {reviews.length === 1 ? "review" : "reviews"})
              </span>
            </div>
            <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
              <MapPin className="h-3 w-3" />
              Nearby
            </div>
          </div>

          {/* Skills */}
          <div className="mb-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2">Skills</p>
            <div className="flex flex-wrap gap-1.5">
              {worker.skills.map((skill) => (
                <Badge key={skill} variant="secondary" className="rounded-lg text-xs">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>

          {/* About */}
          {worker.serviceDescription && (
            <div className="mb-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2">About</p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {worker.serviceDescription}
              </p>
            </div>
          )}

          {/* Reviews */}
          <div className="mb-6">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2">
              Reviews
            </p>
            {loadingReviews ? (
              <div className="flex justify-center py-4">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              </div>
            ) : reviews.length === 0 ? (
              <p className="text-sm text-muted-foreground">No reviews yet</p>
            ) : (
              <div className="space-y-3">
                {reviews.slice(0, 5).map((review) => {
                  const name =
                    typeof review.clientId === "object" && review.clientId?.name
                      ? review.clientId.name
                      : "Client"
                  return (
                    <div key={review._id} className="rounded-xl border bg-card p-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium">{name}</span>
                        <div className="flex items-center gap-0.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`h-3 w-3 ${
                                i < review.rating
                                  ? "text-amber-500 fill-amber-500"
                                  : "text-muted"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      {review.comment && (
                        <p className="text-xs text-muted-foreground">{review.comment}</p>
                      )}
                      <p className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1">
                        <Calendar className="h-2.5 w-2.5" />
                        {new Date(review.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pb-4">
            <Button
              variant="outline"
              className="flex-1 rounded-xl"
              onClick={onClose}
            >
              Close
            </Button>
            <Button
              className="flex-1 rounded-xl"
              onClick={onBook}
            >
              Book Service
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ClientServicesPage() {
  const { isAuthenticated, isLoading } = useRequireAuth([TRole.CLIENT])
  const router = useRouter()
  const [search, setSearch] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [workers, setWorkers] = useState<AvailableWorker[]>([])
  const [loadingWorkers, setLoadingWorkers] = useState(false)

  // Modal state
  const [selectedWorker, setSelectedWorker] = useState<AvailableWorker | null>(null)
  const [workerReviews, setWorkerReviews] = useState<Review[]>([])
  const [loadingReviews, setLoadingReviews] = useState(false)

  useEffect(() => {
    if (!selectedCategory || !isAuthenticated) {
      setWorkers([])
      return
    }
    setLoadingWorkers(true)
    ApiService.get<{ data: AvailableWorker[] }>("/workers")
      .then((res) => {
        const apiWorkers = res.data || []
        const allWorkers = [...apiWorkers, ...mockWorkers]
        const seen = new Set<string>()
        const unique = allWorkers.filter((w) => {
          if (seen.has(w._id)) return false
          seen.add(w._id)
          return true
        })
        const matching = unique.filter(
          (w) =>
            w.isAvailable !== false &&
            w.skills.some((s) => matchesCategory(s, selectedCategory.name))
        )
        setWorkers(matching)
      })
      .catch(() => {
        const matching = mockWorkers.filter(
          (w) =>
            w.isAvailable &&
            w.skills.some((s) => matchesCategory(s, selectedCategory.name))
        )
        setWorkers(matching)
      })
      .finally(() => setLoadingWorkers(false))
  }, [selectedCategory, isAuthenticated])

  const handleWorkerClick = (worker: AvailableWorker) => {
    setSelectedWorker(worker)
    setWorkerReviews([])
    setLoadingReviews(true)

    // Try API first, fall back to mock
    if (worker._id.startsWith("mock-")) {
      setWorkerReviews(mockReviews[worker._id] || [])
      setLoadingReviews(false)
    } else {
      ApiService.get<{ data: Review[] }>(`/reviews/worker/${worker._id}`)
        .then((res) => setWorkerReviews(res.data || []))
        .catch(() => setWorkerReviews([]))
        .finally(() => setLoadingReviews(false))
    }
  }

  const handleBook = () => {
    if (!selectedWorker || !selectedCategory) return
    const params = new URLSearchParams({
      category: selectedCategory.name,
      name: selectedWorker.name,
      skills: selectedWorker.skills.join(","),
      rating: selectedWorker.rating.toString(),
    })
    if (selectedWorker.serviceDescription) {
      params.set("desc", selectedWorker.serviceDescription)
    }
    router.push(`/client/book/${selectedWorker._id}?${params.toString()}`)
  }

  if (isLoading || !isAuthenticated) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    )
  }

  const filteredCategories = categories.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.subcategories.some((s) => s.toLowerCase().includes(search.toLowerCase()))
  )

  if (selectedCategory) {
    const filteredSubs = selectedCategory.subcategories.filter((s) =>
      s.toLowerCase().includes(search.toLowerCase())
    )
    const Icon = selectedCategory.icon

    return (
      <div className="max-w-lg mx-auto px-4 py-6">
        <button
          onClick={() => setSelectedCategory(null)}
          className="flex items-center gap-1 text-sm text-muted-foreground mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to categories
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${selectedCategory.color}`}>
            <Icon className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold">{selectedCategory.name}</h1>
            <p className="text-sm text-muted-foreground">{filteredSubs.length} services</p>
          </div>
        </div>

        {/* Available Workers */}
        {loadingWorkers ? (
          <div className="flex justify-center py-4 mb-4">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          </div>
        ) : workers.length > 0 && (
          <div className="mb-6">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">
              Available workers
            </p>
            <div className="space-y-2">
              {workers.map((w) => (
                <button
                  key={w._id}
                  onClick={() => handleWorkerClick(w)}
                  className="w-full text-left"
                >
                  <div className="flex items-center gap-3 rounded-xl border bg-card p-4 hover:border-primary/30 transition-colors border-primary/10 bg-primary/[0.02]">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{w.name}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {w.serviceDescription || w.skills.join(", ")}
                      </p>
                    </div>
                    <div className="flex items-center gap-0.5 shrink-0">
                      <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
                      <span className="text-xs font-medium">{w.rating.toFixed(1)}</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Subcategories */}
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">
          Services
        </p>
        <div className="space-y-2">
          {filteredSubs.map((sub) => (
            <a
              key={sub}
              href={`/client/post?category=${encodeURIComponent(selectedCategory.name)}&service=${encodeURIComponent(sub)}`}
            >
              <div className="flex items-center justify-between rounded-xl border bg-card p-4 hover:border-primary/30 transition-colors">
                <span className="text-sm font-medium">{sub}</span>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </a>
          ))}
        </div>

        {/* Worker Profile Modal */}
        {selectedWorker && (
          <WorkerModal
            worker={selectedWorker}
            category={selectedCategory.name}
            reviews={workerReviews}
            loadingReviews={loadingReviews}
            onClose={() => setSelectedWorker(null)}
            onBook={handleBook}
          />
        )}
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      <h1 className="text-xl font-bold mb-4">Services</h1>

      {/* Search + Filter */}
      <div className="flex gap-2 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search services..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 rounded-xl"
          />
        </div>
        <Button
          variant="outline"
          size="icon"
          className="rounded-xl shrink-0"
          onClick={() => setShowFilters(!showFilters)}
        >
          <SlidersHorizontal className="h-4 w-4" />
        </Button>
      </div>

      {showFilters && (
        <div className="rounded-xl border bg-card p-4 mb-4">
          <p className="text-sm text-muted-foreground">
            Filters coming soon — for now, use search to find what you need.
          </p>
        </div>
      )}

      {/* Categories Grid */}
      <div className="grid grid-cols-3 gap-3">
        {filteredCategories.map((cat) => {
          const Icon = cat.icon
          return (
            <button
              key={cat.name}
              onClick={() => setSelectedCategory(cat)}
              className="flex flex-col items-center gap-2 py-4 rounded-2xl bg-card border hover:border-primary/30 transition-colors"
            >
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${cat.color}`}>
                <Icon className="h-5 w-5" />
              </div>
              <span className="text-xs font-medium">{cat.name}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
