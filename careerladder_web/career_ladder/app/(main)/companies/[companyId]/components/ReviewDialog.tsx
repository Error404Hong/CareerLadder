"use client"

import { useForm, Controller } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"

import { writeReview } from "@/app/api/user"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Star } from "lucide-react"

const reviewSchema = z.object({
    rating: z.number().min(1).max(5),
    review_text: z.string().min(10, "Review must be at least 10 characters"),
})
type ReviewFormValues = z.infer<typeof reviewSchema>

interface ReviewDialogProps {
    open: boolean
    onOpenChange: (v: boolean) => void
    companyId: string
    companyName: string
    studentId: string
    onSuccess?: () => void
}

export function ReviewDialog({ open, onOpenChange, companyId, companyName, studentId, onSuccess }: ReviewDialogProps) {
    const { control, register, handleSubmit, reset, formState: { errors } } = useForm<ReviewFormValues>({
        resolver: zodResolver(reviewSchema),
        defaultValues: { rating: 0, review_text: "" },
    })

    const onSubmit = async (values: ReviewFormValues) => {
        try {
            const insertRes = await writeReview(companyId, studentId, values.rating, values.review_text)

            if (insertRes.success && insertRes.message === "duplicated_review") {
                toast.warning("You have already rated this company before")
                reset()
                onOpenChange(false)
            } else if (insertRes.success) {
                toast.success("Review submitted successfully")
                reset()
                onOpenChange(false)
                onSuccess?.()
            } else {
                toast.error("Failed to submit review. Please try again")
            }
        } catch {
            toast.error("Something went wrong. Please try again.")
        }
    }

    return (
        <Dialog open={open} onOpenChange={(v) => { if (!v) reset(); onOpenChange(v) }}>
            <DialogContent className="sm:max-w-xl">
                <DialogHeader>
                    <DialogTitle>Leave a Review for {companyName}</DialogTitle>
                    <DialogDescription>Provide your review and rate your overall experience working with this company.</DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5 pt-1">
                    {/* Star rating picker */}
                    <div className="flex flex-col gap-2">
                        <Label>Rating</Label>
                        <Controller
                            control={control}
                            name="rating"
                            render={({ field }) => (
                                <div className="flex items-center gap-1">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            onClick={() => field.onChange(star)}
                                            className="p-0.5 focus:outline-none"
                                        >
                                            <Star
                                                size={24}
                                                className={star <= field.value
                                                    ? "fill-amber-400 text-amber-400 transition-colors"
                                                    : "fill-slate-200 text-slate-200 hover:fill-amber-200 hover:text-amber-200 transition-colors"
                                                }
                                            />
                                        </button>
                                    ))}
                                    {field.value > 0 && (
                                        <span className="ml-2 text-sm text-slate-500">{field.value} / 5</span>
                                    )}
                                </div>
                            )}
                        />
                        {errors.rating && <p className="text-xs text-red-500">{errors.rating.message}</p>}
                    </div>

                    {/* Review text */}
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="review_text">Your Review</Label>
                        <Textarea
                            id="review_text"
                            placeholder="Share your experience working with this company..."
                            rows={4}
                            {...register("review_text")}
                        />
                        {errors.review_text && <p className="text-xs text-red-500">{errors.review_text.message}</p>}
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => { reset(); onOpenChange(false) }}>
                            Cancel
                        </Button>
                        <Button type="submit">Submit Review</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
