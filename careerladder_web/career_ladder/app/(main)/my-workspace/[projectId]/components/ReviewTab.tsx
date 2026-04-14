"use client"

import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Star, CheckCircle2 } from "lucide-react"

import { Card, CardContent, CardHeader, CardDescription, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"

export const reviewFormSchema = z.object({
    rating: z.number().min(1, "Rating min must be at least 1").max(5, "Rating min must be at max 5"),
    review_text: z.string().min(5, "Please describe your overall experience in detail"),
})

export type ReviewFormValues = z.infer<typeof reviewFormSchema>

type ReviewTabProps = {
    reviewCount: number
    onSubmit: (values: ReviewFormValues) => Promise<void>
}

export function ReviewTab({ reviewCount, onSubmit }: ReviewTabProps) {
    const form = useForm<ReviewFormValues>({
        resolver: zodResolver(reviewFormSchema),
        defaultValues: {
            rating: 1,
            review_text: "",
        },
    })

    return (
        <Card className="mt-2 p-4 rounded-sm border-none shadow-none">
            <CardHeader className="px-0 pt-0">
                <CardTitle className="font-semibold text-lg">Rate Your Project Experience</CardTitle>
                <CardDescription>
                    Share your feedback and rate your overall experience with this project.
                </CardDescription>
            </CardHeader>
            <Separator />

            <CardContent className="px-0 pt-4 flex flex-col gap-3">
                {reviewCount >= 1 ? (
                    <div className="flex flex-col items-center justify-center gap-4 py-14 text-center">
                        <div className="flex items-center justify-center w-16 h-16 rounded-full bg-green-100">
                            <CheckCircle2 className="text-green-500" size={36} />
                        </div>
                        <div className="flex flex-col gap-1">
                            <p className="text-base font-semibold text-slate-800">Review Already Submitted</p>
                            <p className="text-sm text-slate-400 max-w-sm">
                                You&apos;ve already shared your feedback for this project. Thank you for your response!
                            </p>
                        </div>
                    </div>
                ) : (
                    <form onSubmit={form.handleSubmit(onSubmit)} className="w-full flex flex-col gap-7" id="reviewForm">

                        {/* Star Rating */}
                        <div className="rounded-xl bg-amber-50 border border-amber-100 p-5">
                            <Field>
                                <FieldLabel className="text-sm font-semibold text-slate-700 mb-3">Overall Rating</FieldLabel>
                                <Controller
                                    control={form.control}
                                    name="rating"
                                    render={({ field }) => {
                                        const labels: Record<number, string> = {
                                            1: "Poor", 2: "Fair", 3: "Good", 4: "Very Good", 5: "Excellent",
                                        }
                                        return (
                                            <div className="flex flex-col gap-3">
                                                <div className="flex items-center gap-1.5">
                                                    {[1, 2, 3, 4, 5].map((star) => (
                                                        <button
                                                            key={star}
                                                            type="button"
                                                            onClick={() => field.onChange(star)}
                                                            className="cursor-pointer p-1 transition-all hover:scale-110 active:scale-95"
                                                        >
                                                            <Star
                                                                size={36}
                                                                className={star <= field.value
                                                                    ? "fill-amber-400 text-amber-400"
                                                                    : "text-slate-200 hover:text-amber-300 transition-colors"
                                                                }
                                                            />
                                                        </button>
                                                    ))}
                                                    <div className="ml-3 flex flex-col justify-center">
                                                        <span className="text-sm font-semibold text-slate-700">{labels[field.value]}</span>
                                                        <span className="text-xs text-slate-400">{field.value} out of 5</span>
                                                    </div>
                                                </div>
                                                <div className="w-58 bg-amber-100 rounded-full h-1.5 overflow-hidden">
                                                    <div
                                                        className="bg-amber-400 h-1.5 rounded-full transition-all duration-300"
                                                        style={{ width: `${(field.value / 5) * 100}%` }}
                                                    />
                                                </div>
                                            </div>
                                        )
                                    }}
                                />
                                <FieldError errors={[form.formState.errors.rating]} />
                            </Field>
                        </div>

                        {/* Review Text */}
                        <Field>
                            <FieldLabel className="text-sm font-semibold text-slate-700 mb-2">Your Experience</FieldLabel>
                            <Controller
                                control={form.control}
                                name="review_text"
                                render={({ field, fieldState }) => (
                                    <div className="flex flex-col gap-1.5">
                                        <Textarea
                                            {...field}
                                            aria-invalid={fieldState.invalid}
                                            placeholder="Describe what you learned, how the team collaborated, and any feedback for the employer..."
                                            className="min-h-36 resize-none"
                                            maxLength={1000}
                                        />
                                        <div className="flex items-center justify-between">
                                            <p className="text-xs text-slate-400">Minimum 5 characters required</p>
                                            <p className={`text-xs ${field.value.length > 900 ? "text-amber-500 font-medium" : "text-slate-400"}`}>
                                                {field.value.length} / 1000
                                            </p>
                                        </div>
                                    </div>
                                )}
                            />
                            <FieldError errors={[form.formState.errors.review_text]} />
                        </Field>

                        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                            <p className="text-xs text-slate-400">Your review will be visible to the employer after submission.</p>
                            <Button type="submit" form="reviewForm" className="cursor-pointer gap-1.5 shrink-0">
                                Submit Review
                            </Button>
                        </div>

                    </form>
                )}
            </CardContent>
        </Card>
    )
}
