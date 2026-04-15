"use client"

import { CompanyProfile } from "@/types"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { MapPin, Users, Star, CalendarDays, ExternalLink, ArrowRight } from "lucide-react"
import { useRouter } from "next/navigation"

interface CompanyCardProps {
    company: CompanyProfile
}

function StarRating({ rating }: { rating: number }) {
    return (
        <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
                <Star
                    key={star}
                    size={13}
                    className={
                        star <= Math.round(rating)
                            ? "fill-amber-400 text-amber-400"
                            : "fill-slate-200 text-slate-200"
                    }
                />
            ))}
        </div>
    )
}

export function CompanyCard({ company }: CompanyCardProps) {
    const router = useRouter()
    const rating = parseFloat(company.avg_rating) || 0
    const reviewCount = parseInt(company.review_count) || 0
    const initials = company.company_name
        .split(" ")
        .map((w) => w[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()

    return (
        <div
            className="group cursor-pointer"
            onClick={() => router.push(`/companies/${company.company_id}`)}
        >
            <div className="bg-white rounded-2xl border border-slate-200 hover:border-indigo-200 hover:shadow-lg transition-all duration-200 flex flex-col overflow-hidden h-full">
                {/* Top accent */}
                <div className="h-1 w-full bg-linear-to-r from-blue-500 to-indigo-500" />

                <div className="p-6 flex flex-col flex-1 gap-5">
                    {/* Header row */}
                    <div className="flex items-start gap-4">
                        <Avatar className="h-14 w-14 rounded-xl border border-slate-100 shrink-0">
                            <AvatarImage src={company.image_url} alt={company.company_name} className="object-cover" />
                            <AvatarFallback className="rounded-xl bg-indigo-50 text-indigo-600 font-semibold text-sm">
                                {initials}
                            </AvatarFallback>
                        </Avatar>

                        <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-slate-800 text-sm leading-snug group-hover:text-indigo-600 transition-colors line-clamp-2">
                                {company.company_name}
                            </h3>
                            <Badge
                                variant="secondary"
                                className="mt-1.5 text-xs px-2 py-0 rounded-full bg-indigo-50 text-indigo-600 border-0 font-normal"
                            >
                                {company.industry}
                            </Badge>
                        </div>
                    </div>

                    {/* Description */}
                    <p className="text-xs text-slate-500 leading-relaxed line-clamp-3 flex-1">
                        {company.description || "No description provided."}
                    </p>

                    {/* Meta info */}
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                            <MapPin size={12} className="text-slate-400 shrink-0" />
                            <span className="truncate">{company.location || "—"}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                            <Users size={12} className="text-slate-400 shrink-0" />
                            <span>{company.company_size ? `${company.company_size} employees` : "—"}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                            <CalendarDays size={12} className="text-slate-400 shrink-0" />
                            <span>Founded {company.founded_year || "—"}</span>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                        <div className="flex items-center gap-2">
                            <StarRating rating={rating} />
                            <span className="text-xs font-semibold text-slate-700">
                                {rating > 0 ? rating.toFixed(1) : "—"}
                            </span>
                            <span className="text-xs text-slate-400">
                                ({reviewCount})
                            </span>
                        </div>

                        <div className="flex items-center gap-2">
                            {company.website && (
                                <a
                                    href={company.website}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={(e) => e.stopPropagation()}
                                    className="text-slate-400 hover:text-indigo-500 transition-colors"
                                >
                                    <ExternalLink size={13} />
                                </a>
                            )}
                            <span className="flex items-center gap-1 text-xs text-indigo-500 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                                View <ArrowRight size={11} />
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
