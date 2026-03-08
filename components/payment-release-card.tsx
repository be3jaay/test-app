"use client"

import { useRef, useState, useCallback, useEffect } from "react"
import { CheckCircle, Lock, Unlock, Loader2 } from "lucide-react"

interface PaymentReleaseCardProps {
  jobTitle: string
  amount: number
  /** "client" can slide to release; "worker" sees read-only status */
  role: "client" | "worker"
  /** Whether payment has already been released */
  released: boolean
  /** Called when the client completes the slide */
  onRelease?: () => void | Promise<void>
  releasing?: boolean
}

const SLIDER_WIDTH = 56 // thumb width in px
const THRESHOLD = 0.85 // must drag 85% to release

export function PaymentReleaseCard({
  jobTitle,
  amount,
  role,
  released,
  onRelease,
  releasing,
}: PaymentReleaseCardProps) {
  const trackRef = useRef<HTMLDivElement>(null)
  const [dragX, setDragX] = useState(0)
  const [dragging, setDragging] = useState(false)
  const startXRef = useRef(0)
  const trackWidthRef = useRef(0)

  // Reset drag position when releasing finishes
  useEffect(() => {
    if (!releasing && !released) setDragX(0)
  }, [releasing, released])

  const getMaxX = useCallback(() => {
    return trackWidthRef.current - SLIDER_WIDTH
  }, [])

  const handlePointerDown = (e: React.PointerEvent) => {
    if (released || releasing || role !== "client") return
    e.preventDefault()
    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
    const rect = trackRef.current?.getBoundingClientRect()
    if (rect) trackWidthRef.current = rect.width
    startXRef.current = e.clientX - dragX
    setDragging(true)
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragging) return
    const newX = Math.max(0, Math.min(e.clientX - startXRef.current, getMaxX()))
    setDragX(newX)
  }

  const handlePointerUp = () => {
    if (!dragging) return
    setDragging(false)
    const maxX = getMaxX()
    if (maxX > 0 && dragX / maxX >= THRESHOLD) {
      setDragX(maxX)
      onRelease?.()
    } else {
      setDragX(0)
    }
  }

  const progress = trackWidthRef.current > 0 ? dragX / (trackWidthRef.current - SLIDER_WIDTH) : 0

  if (released) {
    return (
      <div className="rounded-2xl border-2 border-green-200 bg-green-50 p-5 space-y-3">
        <div className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-green-600" />
          <p className="font-semibold text-green-700 text-sm">Payment Released</p>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-xs text-green-600">{jobTitle}</p>
          <p className="font-bold text-green-700">₱{amount.toLocaleString()}</p>
        </div>
        <p className="text-xs text-green-600/70 text-center">
          {role === "client"
            ? "You have released the payment. Thank you!"
            : "The client has released payment for this job. 🎉"}
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Lock className="h-4 w-4 text-primary" />
        <p className="font-semibold text-sm">Payment Escrow</p>
      </div>

      {/* Job + Amount */}
      <div className="rounded-xl bg-card border p-3 flex items-center justify-between">
        <div>
          <p className="text-xs text-muted-foreground">Service</p>
          <p className="text-sm font-medium">{jobTitle}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground">Amount</p>
          <p className="text-lg font-bold text-primary">₱{amount.toLocaleString()}</p>
        </div>
      </div>

      {/* Slider or Status */}
      {role === "client" ? (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground text-center">
            Slide to release payment to worker
          </p>
          <div
            ref={trackRef}
            className="relative h-14 rounded-full bg-muted/50 border-2 border-primary/10 overflow-hidden select-none touch-none"
          >
            {/* Fill */}
            <div
              className="absolute inset-y-0 left-0 bg-primary/10 rounded-full transition-none"
              style={{ width: `${dragX + SLIDER_WIDTH}px` }}
            />

            {/* Label */}
            <div
              className="absolute inset-0 flex items-center justify-center pointer-events-none transition-opacity"
              style={{ opacity: 1 - progress }}
            >
              <span className="text-xs font-medium text-muted-foreground">
                {releasing ? "Releasing..." : "Slide to release →"}
              </span>
            </div>

            {/* Thumb */}
            <div
              className={`absolute top-1 bottom-1 left-1 w-12 rounded-full flex items-center justify-center transition-colors ${
                releasing
                  ? "bg-primary/70"
                  : dragging
                    ? "bg-primary shadow-lg"
                    : "bg-primary/90 hover:bg-primary"
              }`}
              style={{
                transform: `translateX(${dragX}px)`,
                transition: dragging ? "none" : "transform 0.3s ease",
                cursor: releasing ? "wait" : "grab",
              }}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
            >
              {releasing ? (
                <Loader2 className="h-5 w-5 text-primary-foreground animate-spin" />
              ) : (
                <Unlock className="h-5 w-5 text-primary-foreground" />
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-xl bg-amber-50 border border-amber-200 p-3 text-center">
          <p className="text-xs text-amber-700 font-medium">
            ⏳ Awaiting client to release payment
          </p>
          <p className="text-[10px] text-amber-600/70 mt-1">
            The client needs to confirm and release the escrowed funds.
          </p>
        </div>
      )}

      {/* Footer */}
      <p className="text-[10px] text-muted-foreground text-center">
        Funds are held securely until both parties agree.
      </p>
    </div>
  )
}
