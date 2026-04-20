import Image from "next/image"
import { Star, MessageSquare } from "lucide-react"
import { CompanyReview } from "@/types/companyReview"

function StarRating({ rating }: { rating: number }) {
    return (
        <div className="flex items-center gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
                <Star
                    key={i}
                    size={13}
                    className={i < Math.round(rating) ? "text-amber-400 fill-amber-400" : "text-slate-200 fill-slate-200"}
                />
            ))}
        </div>
    )
}

export function ReviewsTab({ reviews }: { reviews: CompanyReview[] }) {
    if (reviews.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 gap-2">
                <MessageSquare size={32} className="text-slate-200" />
                <p className="text-sm font-medium text-slate-400">No reviews yet</p>
                <p className="text-xs text-slate-300">Reviews appear after students complete a project with this company</p>
            </div>
        )
    }

    const avgRating = reviews.reduce((sum, r) => sum + Number(r.rating), 0) / reviews.length

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-5 py-4">
                <div className="text-4xl font-bold text-[#0f172a]">{avgRating.toFixed(1)}</div>
                <div>
                    <StarRating rating={avgRating} />
                    <p className="text-xs text-slate-400 mt-1">{reviews.length} {reviews.length === 1 ? "review" : "reviews"}</p>
                </div>
            </div>

            {reviews.map((review) => (
                <div key={review.id} className="rounded-xl border border-slate-200 bg-white px-5 py-4">
                    <div className="flex items-center justify-between gap-3 mb-3">
                        <div className="flex items-center gap-3">
                            {review.profile_image ? (
                                <Image
                                    src={review.profile_image}
                                    alt={`${review.first_name} ${review.last_name}`}
                                    width={36}
                                    height={36}
                                    className="w-9 h-9 rounded-full object-cover border border-slate-200"
                                />
                            ) : (
                                <div className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center text-sm font-semibold text-slate-500">
                                    {review.first_name?.[0]}{review.last_name?.[0]}
                                </div>
                            )}
                            <div>
                                <p className="text-sm font-semibold text-[#0f172a]">{review.first_name} {review.last_name}</p>
                                <p className="text-xs text-slate-400">{new Date(review.created_at).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}</p>
                            </div>
                        </div>
                        <StarRating rating={review.rating} />
                    </div>
                    {review.review_text && (
                        <p className="text-sm text-slate-600 leading-relaxed">{review.review_text}</p>
                    )}
                </div>
            ))}
        </div>
    )
}
