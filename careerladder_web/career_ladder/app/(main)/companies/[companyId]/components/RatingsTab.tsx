import { format } from "date-fns"
import { ProjectReview, CompanyReview } from "@/types"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Star, MessageSquareText, FolderKanban, Building2 } from "lucide-react"

function StarRating({ rating, size = 14 }: { rating: number; size?: number }) {
    return (
        <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
                <Star
                    key={star}
                    size={size}
                    className={star <= Math.round(rating) ? "fill-amber-400 text-amber-400" : "fill-slate-200 text-slate-200"}
                />
            ))}
        </div>
    )
}

function RatingBar({ label, count, total }: { label: string; count: number; total: number }) {
    const pct = total === 0 ? 0 : Math.round((count / total) * 100)
    return (
        <div className="flex items-center gap-3 text-xs">
            <span className="text-slate-500 w-10 shrink-0 text-right">{label}</span>
            <div className="flex-1 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                <div className="bg-amber-400 h-1.5 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
            </div>
            <span className="text-slate-400 w-5 shrink-0">{count}</span>
        </div>
    )
}

function ReviewCard({ review }: { review: ProjectReview | CompanyReview }) {
    const initials = `${review.first_name[0]}${review.last_name[0]}`.toUpperCase()
    const formattedDate = format(new Date(review.created_at), "MMM d, yyyy")

    return (
        <Card className="rounded-xl border-none shadow-none" style={{ backgroundColor: "var(--color-navy-light)" }}>
            <CardContent className="px-4 py-1 flex flex-col gap-3">
                <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <Avatar className="w-9 h-9">
                            <AvatarImage src={review.profile_image} alt={review.first_name} />
                            <AvatarFallback className="text-xs font-semibold bg-white/10 text-white">{initials}</AvatarFallback>
                        </Avatar>
                        <div>
                            <p className="text-sm font-semibold text-white leading-tight">{review.first_name} {review.last_name}</p>
                            {"email" in review && <p className="text-xs text-slate-400">{review.email}</p>}
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
                    <Star size={10} className="fill-amber-400 text-amber-400" />
                    {review.rating} / 5
                </span>
            </CardContent>
        </Card>
    )
}

function SummaryCard({ reviewList }: { reviewList: (ProjectReview | CompanyReview)[] }) {
    const avg = reviewList.length ? reviewList.reduce((sum, r) => sum + r.rating, 0) / reviewList.length : 0
    const ratingCounts = [5, 4, 3, 2, 1].map((star) => ({
        star,
        count: reviewList.filter((r) => r.rating === star).length,
    }))

    return (
        <Card className="rounded-2xl border border-slate-200 shadow-none">
            <CardContent className="px-6 py-5 flex flex-col sm:flex-row items-center gap-6 sm:gap-8">
                <div className="flex flex-col items-center gap-1 shrink-0">
                    <span className="text-5xl font-bold text-slate-800 leading-none">{avg.toFixed(1)}</span>
                    <StarRating rating={Math.round(avg)} size={16} />
                    <span className="text-xs text-slate-400 mt-0.5">
                        {reviewList.length} {reviewList.length === 1 ? "review" : "reviews"}
                    </span>
                </div>
                <Separator orientation="horizontal" className="block sm:hidden w-full" />
                <Separator orientation="vertical" className="hidden sm:block self-stretch h-auto" />
                <div className="flex-1 flex flex-col gap-2 w-full">
                    {ratingCounts.map(({ star, count }) => (
                        <RatingBar key={star} label={`${star} ★`} count={count} total={reviewList.length} />
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}

function EmptyState({ label }: { label: string }) {
    return (
        <div className="bg-white rounded-2xl border border-slate-200 flex flex-col items-center justify-center gap-3 py-16">
            <MessageSquareText size={28} className="text-slate-200" />
            <p className="text-sm text-slate-400">{label}</p>
        </div>
    )
}

interface RatingsTabProps {
    reviews: ProjectReview[]
    creviews: CompanyReview[]
}

export function RatingsTab({ reviews, creviews }: RatingsTabProps) {
    return (
        <Tabs defaultValue="company" orientation="vertical">
            {/* Vertical tab list */}
            <TabsList className="flex flex-col h-auto w-48 shrink-0 gap-1 bg-white rounded-lg border border-slate-200 p-2 mb-5">
                <TabsTrigger
                    value="company"
                    className="w-full justify-start gap-2 px-3 py-2.5 text-sm data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-600 data-[state=active]:shadow-none"
                >
                    <Building2 size={14} /> Company Reviews
                </TabsTrigger>
                <TabsTrigger
                    value="project"
                    className="w-full justify-start gap-2 px-3 py-2.5 text-sm data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-600 data-[state=active]:shadow-none"
                >
                    <FolderKanban size={14} /> Project Reviews
                </TabsTrigger>
            </TabsList>

            {/* Tab content — full width */}
            <TabsContent value="company" className="mt-0">
                {creviews.length === 0 ? (
                    <EmptyState label="No company reviews yet." />
                ) : (
                    <div className="flex flex-col gap-5">
                        <SummaryCard reviewList={creviews} />
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {creviews.map((r) => <ReviewCard key={r.id} review={r} />)}
                        </div>
                    </div>
                )}
            </TabsContent>

            <TabsContent value="project" className="mt-0">
                {reviews.length === 0 ? (
                    <EmptyState label="No project reviews yet." />
                ) : (
                    <div className="flex flex-col gap-5">
                        <SummaryCard reviewList={reviews} />
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {reviews.map((r) => <ReviewCard key={r.id} review={r} />)}
                        </div>
                    </div>
                )}
            </TabsContent>
        </Tabs>
    )
}
