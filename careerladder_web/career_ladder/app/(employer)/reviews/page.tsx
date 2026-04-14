"use client"

import { useUser } from "@clerk/nextjs"
import { useEffect, useState } from "react"

import { ProjectReview } from "@/types"
import { getCompanyReviews } from "@/app/api/project"

import { toast } from "sonner"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Star, MessageSquareText } from "lucide-react"
import { format } from "date-fns"

function StarRating({ rating, size = 14 }: { rating: number; size?: number }) {
    return (
        <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
                <Star
                    key={star}
                    size={size}
                    className={star <= rating ? "fill-amber-400 text-amber-400" : "text-slate-500"}
                />
            ))}
        </div>
    )
}

function ReviewCard({ review }: { review: ProjectReview }) {
    const initials = `${review.first_name[0]}${review.last_name[0]}`.toUpperCase()
    const formattedDate = format(new Date(review.created_at), "MMM d, yyyy")

    return (
        <Card className="rounded-lg border-none shadow-none" style={{ backgroundColor: "var(--color-navy-light)" }}>
            <CardContent className="px-4 py-3 flex flex-col gap-2.5">
                <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <Avatar className="w-9 h-9">
                            <AvatarImage src={review.profile_image} alt={review.first_name} />
                            <AvatarFallback className="text-xs font-semibold bg-white/10 text-white">
                                {initials}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                            <span className="text-sm font-semibold text-white">
                                {review.first_name} {review.last_name}
                            </span>
                            <span className="text-xs text-slate-400">{review.email}</span>
                        </div>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                        <StarRating rating={review.rating} />
                        <span className="text-xs text-slate-400">{formattedDate}</span>
                    </div>
                </div>

                <div className="border-t border-white/10" />

                <p className="text-sm text-slate-300 leading-relaxed">{review.review_text}</p>

                <span className="inline-flex items-center gap-1 self-start text-xs font-medium px-2 py-0.5 rounded-full bg-amber-400/10 text-amber-400 border border-amber-400/20">
                    <Star size={11} className="fill-amber-400 text-amber-400" />
                    {review.rating} / 5
                </span>
            </CardContent>
        </Card>
    )
}

function RatingBar({ label, count, total }: { label: string; count: number; total: number }) {
    const pct = total === 0 ? 0 : Math.round((count / total) * 100)
    return (
        <div className="flex items-center gap-3 text-xs">
            <span className="text-slate-500 w-10 shrink-0 text-right">{label}</span>
            <div className="flex-1 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                <div className="bg-amber-400 h-1.5 rounded-full transition-all duration-300" style={{ width: `${pct}%` }} />
            </div>
            <span className="text-slate-400 w-6 shrink-0">{count}</span>
        </div>
    )
}

export default function ReviewsPage() {
    const { user } = useUser();
    const [reviews, setReviews] = useState<ProjectReview[]>([]);

    useEffect(() => {
        if (!user) return;

        const getAllReviews = async () => {
            try {
                const fetchRes = await getCompanyReviews(user.id);
                if (fetchRes.success) {
                    setReviews(fetchRes.data);
                } else {
                    toast.error("Failed to fetch company reviews.")
                }
            } catch {
                toast.error("Something went wrong. Please try again")
            }
        }

        getAllReviews()
    }, [user])

    const avgRating = reviews.length
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : 0

    const ratingCounts = [5, 4, 3, 2, 1].map((star) => ({
        star,
        count: reviews.filter((r) => r.rating === star).length,
    }))

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="max-w-6xl mx-auto px-6 py-6">
                <div className="flex items-center justify-between gap-4">
                    <Breadcrumb>
                        <BreadcrumbList>
                            <BreadcrumbItem>
                                <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                                <BreadcrumbPage>View All Reviews</BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>
                </div>

                <div className="max-w-6xl mx-auto pb-8 mt-6">

                    {/* Page heading */}
                    <div className="mb-6">
                        <h1 className="text-xl font-bold text-slate-800">Student Reviews</h1>
                        <p className="text-sm text-slate-400 mt-1">
                            All feedback submitted by students who have worked on your projects.
                        </p>
                    </div>

                    {reviews.length === 0 ? (
                        <Card className="rounded-sm border border-slate-100 shadow-none">
                            <CardContent className="flex flex-col items-center justify-center gap-3 py-24 text-center">
                                <div className="flex items-center justify-center w-14 h-14 rounded-full bg-slate-100">
                                    <MessageSquareText size={24} className="text-slate-400" />
                                </div>
                                <div className="flex flex-col gap-1">
                                    <p className="text-sm font-semibold text-slate-700">No reviews yet</p>
                                    <p className="text-xs text-slate-400 max-w-xs">
                                        Students will be able to leave feedback once a project is marked as completed.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="flex flex-col gap-6">

                            {/* Summary card */}
                            <Card className="rounded-sm border border-slate-200 shadow-md">
                                <CardContent className="px-6 py-5 flex flex-col sm:flex-row items-center gap-6 sm:gap-8">
                                    {/* Big average */}
                                    <div className="flex flex-col items-center gap-1 shrink-0">
                                        <span className="text-5xl font-bold text-slate-800 leading-none">
                                            {avgRating.toFixed(1)}
                                        </span>
                                        <StarRating rating={Math.round(avgRating)} size={16} />
                                        <span className="text-xs text-slate-400 mt-0.5">
                                            {reviews.length} {reviews.length === 1 ? "review" : "reviews"}
                                        </span>
                                    </div>

                                    <Separator orientation="horizontal" className="block sm:hidden w-full" />
                                    <Separator orientation="vertical" className="hidden sm:block self-stretch h-auto" />

                                    {/* Rating breakdown */}
                                    <div className="flex-1 flex flex-col gap-2">
                                        {ratingCounts.map(({ star, count }) => (
                                            <RatingBar
                                                key={star}
                                                label={`${star} ★`}
                                                count={count}
                                                total={reviews.length}
                                            />
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Review list */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {reviews.map((review) => (
                                    <ReviewCard key={review.id} review={review} />
                                ))}
                            </div>

                        </div>
                    )}

                </div>
            </div>
        </div>
    )
}
