'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Star } from 'lucide-react'

interface RatingModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    workerName: string
    onSubmitRating: (rating: number, comment: string) => void
}

export function RatingModal({
    open,
    onOpenChange,
    workerName,
    onSubmitRating,
}: RatingModalProps) {
    const [rating, setRating] = useState(0)
    const [comment, setComment] = useState('')
    const [hoverRating, setHoverRating] = useState(0)

    const handleSubmit = () => {
        if (rating > 0) {
            onSubmitRating(rating, comment)
            setRating(0)
            setComment('')
            onOpenChange(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-xl">Rate Your Experience</DialogTitle>
                </DialogHeader>

                <div className="space-y-6">
                    <p className="text-muted-foreground">
                        How would you rate your service with <span className="font-semibold text-foreground">{workerName}</span>?
                    </p>

                    {/* Star Rating */}
                    <div className="flex justify-center gap-2">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setRating(i + 1)}
                                onMouseEnter={() => setHoverRating(i + 1)}
                                onMouseLeave={() => setHoverRating(0)}
                                className="transition-transform hover:scale-110"
                            >
                                <Star
                                    className={`w-10 h-10 ${i < (hoverRating || rating)
                                            ? 'fill-yellow-400 text-yellow-400'
                                            : 'text-gray-300'
                                        }`}
                                />
                            </button>
                        ))}
                    </div>

                    {rating > 0 && (
                        <div className="text-center">
                            <p className="text-lg font-semibold text-foreground">
                                {rating === 1 && 'Poor'}
                                {rating === 2 && 'Fair'}
                                {rating === 3 && 'Good'}
                                {rating === 4 && 'Very Good'}
                                {rating === 5 && 'Excellent'}
                            </p>
                        </div>
                    )}

                    {/* Comment Field */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">
                            Additional Comments (Optional)
                        </label>
                        <Textarea
                            placeholder="Share your experience..."
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            className="min-h-24"
                        />
                    </div>
                </div>

                <DialogFooter className="flex gap-2">
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                    >
                        Cancel
                    </Button>
                    <Button
                        className="bg-primary text-primary-foreground hover:bg-primary/90"
                        onClick={handleSubmit}
                        disabled={rating === 0}
                    >
                        Submit Review
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
