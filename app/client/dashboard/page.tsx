'use client'

import { ClientHeader } from '@/components/client-header'
import { NearbyWorkerCard } from '@/components/nearby-worker-card'
import { RatingModal } from '@/components/rating-modal'
import { ServiceHistory } from '@/components/service-history'
import { ServiceRequestStatus } from '@/components/service-status-request'
import { WorkerProfileModal } from '@/components/worker-profile-modal'
import { WorkerSearchFilter } from '@/components/worker-search-filter'
import { AvailableWorker, mockAvailableWorkers, mockClientProfile, mockCompletedServices, mockServiceRequests, ServiceRequest } from '@/lib/mock-data'
import { useState, useMemo } from 'react'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ChatbotAgent } from '@/components/chatbot-agent'

const DATE_FILTER_MAP: Record<string, (postedAt?: string) => boolean> = {
  any: () => true,
  today: (p) => !p ? true : /just now|hours ago|today/i.test(p),
  week: (p) => !p ? true : /just now|hours ago|yesterday|day ago|days ago|week/i.test(p),
  month: () => true,
}

export default function ClientDashboard() {
  const [client] = useState(mockClientProfile)
  const [workers, setWorkers] = useState<AvailableWorker[]>(mockAvailableWorkers)
  const [selectedWorker, setSelectedWorker] = useState<AvailableWorker | null>(null)
  const [profileModalOpen, setProfileModalOpen] = useState(false)
  const [serviceRequests, setServiceRequests] = useState<ServiceRequest[]>(mockServiceRequests)
  const [ratingModalOpen, setRatingModalOpen] = useState(false)
  const [completedServices, setCompletedServices] = useState(mockCompletedServices)
  const [chatbotOpen, setChatbotOpen] = useState(false)

  // Filter state: search, category, distance, date, location
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All Skills')
  const [distance, setDistance] = useState(100)
  const [dateFilter, setDateFilter] = useState('any')
  const [locationFilter, setLocationFilter] = useState('')

  const filteredWorkers = useMemo(() => {
    return workers.filter((worker) => {
      const matchSearch =
        !search ||
        worker.skill.toLowerCase().includes(search.toLowerCase()) ||
        worker.name.toLowerCase().includes(search.toLowerCase())
      const matchCategory = category === 'All Skills' || worker.skill === category
      const matchDistance = worker.distance <= distance
      const matchDate = DATE_FILTER_MAP[dateFilter]?.(worker.postedAt) ?? true
      const matchLocation =
        !locationFilter ||
        (worker.location?.toLowerCase().includes(locationFilter.toLowerCase()) ?? false)
      return matchSearch && matchCategory && matchDistance && matchDate && matchLocation
    })
  }, [workers, search, category, distance, dateFilter, locationFilter])

  const handleSearchChange = (value: string) => setSearch(value)
  const handleCategoryChange = (value: string) => setCategory(value)
  const handleDistanceChange = (value: number) => setDistance(value)
  const handleDateChange = (value: string) => setDateFilter(value)
  const handleLocationChange = (value: string) => setLocationFilter(value)

  const handleViewProfile = (worker: AvailableWorker) => {
    setSelectedWorker(worker)
    setProfileModalOpen(true)
  }

  const handleRequestService = (worker: AvailableWorker) => {
    const newRequest: ServiceRequest = {
      id: `req-${Date.now()}`,
      workerId: worker.id,
      workerName: worker.name,
      service: worker.skill,
      status: 'pending',
      requestedAt: 'Just now',
    }
    setServiceRequests([newRequest, ...serviceRequests])
  }

  const handleCancelRequest = (requestId: string) => {
    setServiceRequests(serviceRequests.filter((req) => req.id !== requestId))
  }

  const handleAcceptedRequest = (requestId: string) => {
    setServiceRequests(
      serviceRequests.map((req) =>
        req.id === requestId
          ? { ...req, status: 'accepted', acceptedAt: 'Just now' }
          : req
      )
    )
  }

  const handleCompleteService = (requestId: string) => {
    setServiceRequests(
      serviceRequests.map((req) =>
        req.id === requestId ? { ...req, status: 'completed' } : req
      )
    )
    setRatingModalOpen(true)
  }

  const handleSubmitRating = (rating: number, comment: string) => {
    const activeRequest = serviceRequests.find((req) => req.status === 'completed')
    if (activeRequest) {
      setCompletedServices([
        {
          id: `comp-${Date.now()}`,
          workerName: activeRequest.workerName,
          skill: activeRequest.service,
          serviceDate: 'Just now',
          rating,
          comment,
        },
        ...completedServices,
      ])
    }
  }

  const activeRequest = serviceRequests.length > 0 ? serviceRequests[0] : null

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-4 md:py-6">
        {/* Minimal header - location only */}
        <ClientHeader
          name={client.name}
          location={client.location}
        />

        {/* 1) Search bar - first thing on the page */}
        {/* 2) Filters: service, date, location, distance */}
        <section className="mb-5">
          <WorkerSearchFilter
            onSearchChange={handleSearchChange}
            onCategoryChange={handleCategoryChange}
            onDistanceChange={handleDistanceChange}
            onDateChange={handleDateChange}
            onLocationChange={handleLocationChange}
          />
        </section>

        {/* 3) Service cards - posted by skilled workers */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground">
            Services ({filteredWorkers.length})
          </h2>
          {filteredWorkers.length === 0 ? (
            <div className="text-center py-10 rounded-xl bg-muted/30 border border-border">
              <p className="text-muted-foreground">No services match your filters.</p>
              <p className="text-sm text-muted-foreground mt-1">Try changing search or filters.</p>
            </div>
          ) : (
            <div className="grid gap-3 sm:gap-4 grid-cols-1">
              {filteredWorkers.map((worker) => (
                <NearbyWorkerCard
                  key={worker.id}
                  name={worker.name}
                  skill={worker.skill}
                  rating={worker.rating}
                  experience={worker.experience}
                  distance={worker.distance}
                  availability={worker.availability}
                  completedJobs={worker.completedJobs}
                  postedAt={worker.postedAt}
                  location={worker.location}
                  onViewProfile={() => handleViewProfile(worker)}
                  onRequestService={() => handleRequestService(worker)}
                />
              ))}
            </div>
          )}
        </section>

        {/* Active request - compact, below cards on mobile */}
        {activeRequest && (
          <section className="mt-6">
            <ServiceRequestStatus
              workerName={activeRequest.workerName}
              service={activeRequest.service}
              distance={2.5}
              status={activeRequest.status as 'pending' | 'accepted' | 'completed'}
              requestedAt={activeRequest.requestedAt}
              acceptedAt={activeRequest.acceptedAt}
              onCancelRequest={() => handleCancelRequest(activeRequest.id)}
              onMarkComplete={() => handleCompleteService(activeRequest.id)}
            />
          </section>
        )}

        {/* Service history - full width on mobile below content, sidebar on lg */}
        <section className="mt-8 lg:mt-10">
          <ServiceHistory services={completedServices} />
        </section>
      </div>

      {/* Chatbot */}
      <div className="fixed bottom-6 right-6 z-40">
        <Sheet open={chatbotOpen} onOpenChange={setChatbotOpen}>
          <SheetTrigger asChild>
            <Button
              size="lg"
              className="rounded-full w-14 h-14 shadow-lg hover:shadow-xl"
            >
              <MessageCircle className="w-6 h-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-full p-0">
            <ChatbotAgent />
          </SheetContent>
        </Sheet>
      </div>

      <WorkerProfileModal
        open={profileModalOpen}
        onOpenChange={setProfileModalOpen}
        worker={
          selectedWorker
            ? {
                name: selectedWorker.name,
                skill: selectedWorker.skill,
                experience: selectedWorker.experience,
                description: selectedWorker.description,
                location: client.location,
                rating: selectedWorker.rating,
                completedJobs: selectedWorker.completedJobs,
              }
            : null
        }
        onRequestService={() => {
          if (selectedWorker) {
            handleRequestService(selectedWorker)
            setProfileModalOpen(false)
          }
        }}
      />

      <RatingModal
        open={ratingModalOpen}
        onOpenChange={setRatingModalOpen}
        workerName={activeRequest?.workerName || 'Worker'}
        onSubmitRating={handleSubmitRating}
      />
    </main>
  )
}
