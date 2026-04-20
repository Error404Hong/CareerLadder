import Image from "next/image"
import { Star, FolderOpen } from "lucide-react"
import { ProjectReview } from "@/types/projectReview"

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

export function ProjectReviewsTab({ reviews }: { reviews: ProjectReview[] }) {
    if (reviews.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 gap-2">
                <FolderOpen size={32} className="text-slate-200" />
                <p className="text-sm font-medium text-slate-400">No project reviews yet</p>
                <p className="text-xs text-slate-300">Project reviews appear after students complete projects</p>
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-4">
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
                                <p className="text-xs text-slate-400">{review.email}</p>
                                <p className="text-xs text-slate-400">{new Date(review.created_at).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}</p>
                            </div>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                            <StarRating rating={review.rating} />
                            <span className="text-xs font-semibold text-[#0f172a]">{Number(review.rating).toFixed(1)}<span className="text-slate-300 font-normal"> /5</span></span>
                        </div>
                    </div>
                    {review.review_text && (
                        <div className="rounded-lg bg-slate-50 border border-slate-100 px-4 py-3 border-l-4 border-l-slate-300">
                            <p className="text-sm text-slate-600 leading-relaxed">{review.review_text}</p>
                        </div>
                    )}
                </div>
            ))}
        </div>
    )
}
