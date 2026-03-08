"use client"

import { useRef } from "react"
import { Camera, CheckCircle, Clock } from "lucide-react"

interface PhotoUploadCardProps {
  label: string
  preview: string | null
  onPhotoSelect?: (file: File, previewUrl: string) => void
  disabled?: boolean
  /** Read-only placeholder when waiting for the other party */
  waitingLabel?: string
}

export function PhotoUploadCard({
  label,
  preview,
  onPhotoSelect,
  disabled,
  waitingLabel,
}: PhotoUploadCardProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  // Read-only waiting state (no upload ability)
  if (waitingLabel && !preview) {
    return (
      <div className="rounded-xl border-2 border-dashed border-muted-foreground/20 bg-muted/30 p-4 flex flex-col items-center gap-2 text-center">
        <Clock className="h-8 w-8 text-muted-foreground/40" />
        <p className="text-xs text-muted-foreground">{waitingLabel}</p>
      </div>
    )
  }

  const handleClick = () => {
    if (!disabled && onPhotoSelect) {
      inputRef.current?.click()
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && onPhotoSelect) {
      const url = URL.createObjectURL(file)
      onPhotoSelect(file, url)
    }
    // Reset so the same file can be re-selected
    e.target.value = ""
  }

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleChange}
      />
      <button
        type="button"
        onClick={handleClick}
        disabled={disabled || !onPhotoSelect}
        className={`w-full rounded-xl border-2 border-dashed p-4 flex flex-col items-center gap-2 text-center transition-colors ${
          preview
            ? "border-green-400 bg-green-50/50"
            : "border-muted-foreground/30 bg-muted/20 hover:border-primary/40 hover:bg-primary/5"
        } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
      >
        {preview ? (
          <div className="relative">
            <img
              src={preview}
              alt="Uploaded preview"
              className="h-24 w-24 rounded-lg object-cover"
            />
            <div className="absolute -top-1 -right-1 bg-green-500 rounded-full p-0.5">
              <CheckCircle className="h-4 w-4 text-white" />
            </div>
          </div>
        ) : (
          <Camera className="h-8 w-8 text-muted-foreground/50" />
        )}
        <p className="text-xs text-muted-foreground font-medium">{label}</p>
      </button>
    </div>
  )
}
