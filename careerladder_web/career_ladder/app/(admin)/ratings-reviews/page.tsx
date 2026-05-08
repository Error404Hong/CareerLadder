"use client"

import { CompanyReview, ProjectReview } from "@/types"
import { getAllCompanyReviews, deleteCompanyReview } from "@/app/api/user"
import { getAllProjectReviews, deleteProjectReview } from "@/app/api/project"
import { useEffect, useState } from "react"

import Image from "next/image"
import { toast } from "sonner"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Star, MessageSquare, Trash2, Building2, FolderKanban, FileDown } from "lucide-react"
import { generatePDFReport } from "@/lib/generate-report"

import { DeleteReviewDialog } from "./components/DeleteReviewDialog"

function StarRating({ rating }: { rating: number }) {
    return (
        <div className="flex items-center gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
                <Star
                    key={i}
                    size={13}
                    className={i < rating ? "fill-amber-400 text-amber-400" : "text-slate-200 fill-slate-200"}
                />
            ))}
        </div>
    )
}

function ReviewSkeleton() {
    return (
        <div className="flex flex-col gap-3 py-2">
            {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-start gap-4 rounded-xl border border-slate-200 px-4 py-4">
                    <Skeleton className="w-10 h-10 rounded-full shrink-0" />
                    <div className="flex-1 flex flex-col gap-2">
                        <Skeleton className="h-4 w-36 rounded" />
                        <Skeleton className="h-3 w-24 rounded" />
                        <Skeleton className="h-12 w-full rounded" />
                    </div>
                    <Skeleton className="h-8 w-20 rounded" />
                </div>
            ))}
        </div>
    )
}

function ReviewCard({
    avatar, name, targetName, targetLabel, targetIcon: TargetIcon, rating, text, date, onDelete,
}: {
    avatar: string | null
    name: string
    targetName: string
    targetLabel: string
    targetIcon: React.ElementType
    rating: number
    text: string
    date: string
    onDelete: () => void
}) {
    return (
        <div className="flex items-start gap-4 rounded-xl border border-slate-200 bg-white px-4 py-4 hover:border-slate-300 transition-colors">
            {avatar ? (
                <Image src={avatar} alt={name} width={40} height={40} className="w-10 h-10 rounded-full object-cover border border-slate-200 shrink-0 mt-0.5" />
            ) : (
                <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-sm font-bold text-slate-500 shrink-0 mt-0.5">
                    {name[0]}
                </div>
            )}

            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-semibold text-[#0f172a]">{name}</p>
                    <span className="text-slate-300 text-xs">·</span>
                    <div className="flex items-center gap-1 text-xs text-slate-400">
                        <TargetIcon size={11} />
                        <span className="font-medium text-slate-600">{targetName}</span>
                        <span className="text-slate-300">({targetLabel})</span>
                    </div>
                </div>
                <div className="flex items-center gap-2 mt-1">
                    <StarRating rating={rating} />
                    <span className="text-xs text-slate-400">{new Date(date).toLocaleDateString("en-MY", { day: "numeric", month: "short", year: "numeric" })}</span>
                </div>
                <p className="text-sm text-slate-500 mt-2 leading-relaxed line-clamp-3">{text}</p>
            </div>

            <Button
                size="sm"
                variant="ghost"
                onClick={onDelete}
                className="shrink-0 h-8 w-8 p-0 text-slate-400 hover:text-red-500 hover:bg-red-50 cursor-pointer"
            >
                <Trash2 size={14} />
            </Button>
        </div>
    )
}

export default function RatingsReviewsPage() {
    const [isLoading, setIsLoading] = useState(true)
    const [companyReviews, setCompanyReviews] = useState<CompanyReview[]>([])
    const [projectReviews, setProjectReviews] = useState<ProjectReview[]>([])
    const [deletingId, setDeletingId] = useState<string | null>(null)
    const [deletingName, setDeletingName] = useState("")
    const [deletingStudentId, setDeletingStudentId] = useState("")
    const [deletingTargetName, setDeletingTargetName] = useState("")
    const [deleteType, setDeleteType] = useState<"company" | "project">("company")

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                const [companyRes, projectRes] = await Promise.all([
                    getAllCompanyReviews(),
                    getAllProjectReviews(),
                ])
                if (companyRes.success) setCompanyReviews(companyRes.data ?? [])
                if (projectRes.success) setProjectReviews(projectRes.data ?? [])
            } catch {
                toast.error("Failed to fetch reviews. Please try again.")
            } finally {
                setIsLoading(false)
            }
        }
        fetchReviews()
    }, [])

    const openDeleteDialog = (id: string, name: string, studentId: string, targetName: string, type: "company" | "project") => {
        setDeletingId(id)
        setDeletingName(name)
        setDeletingStudentId(studentId)
        setDeletingTargetName(targetName)
        setDeleteType(type)
    }

    const handleDeleted = (id: string) => {
        if (deleteType === "company") {
            setCompanyReviews((prev) => prev.filter((r) => r.id !== id))
        } else {
            setProjectReviews((prev) => prev.filter((r) => r.id !== id))
        }
    }

    const handleConfirmDelete = async (id: string) => {
        if (deleteType === "company") {
            const res = await deleteCompanyReview(id)
            if (!res.success) throw new Error("Delete failed")
        } else {
            const res = await deleteProjectReview(id)
            if (!res.success) throw new Error("Delete failed")
        }
    }

    const avgCompanyRating = companyReviews.length
        ? (companyReviews.reduce((sum, r) => sum + r.rating, 0) / companyReviews.length).toFixed(1)
        : "—"

    const avgProjectRating = projectReviews.length
        ? (projectReviews.reduce((sum, r) => sum + r.rating, 0) / projectReviews.length).toFixed(1)
        : "—"

    const handleGenerateReport = () => {
        generatePDFReport({
            title: "Ratings & Reviews Report",
            subtitle: "All company and project reviews",
            stats: [
                { label: "Company Reviews", value: companyReviews.length },
                { label: "Avg Company Rating", value: avgCompanyRating },
                { label: "Project Reviews", value: projectReviews.length },
                { label: "Avg Project Rating", value: avgProjectRating },
            ],
            tables: [
                {
                    title: "Company Reviews",
                    head: ["Reviewer", "Company", "Rating", "Date", "Review"],
                    body: companyReviews.map(r => [
                        `${r.first_name} ${r.last_name}`,
                        r.company_name ?? "—",
                        `${r.rating} / 5`,
                        new Date(r.created_at).toLocaleDateString("en-MY"),
                        r.review_text.length > 80 ? r.review_text.slice(0, 77) + "..." : r.review_text,
                    ]),
                },
                {
                    title: "Project Reviews",
                    head: ["Reviewer", "Project", "Company", "Rating", "Date", "Review"],
                    body: projectReviews.map(r => [
                        `${r.first_name} ${r.last_name}`,
                        r.project_title ?? "—",
                        r.company_name ?? "—",
                        `${r.rating} / 5`,
                        new Date(r.created_at).toLocaleDateString("en-MY"),
                        r.review_text.length > 60 ? r.review_text.slice(0, 57) + "..." : r.review_text,
                    ]),
                },
            ],
        })
    }

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="max-w-5xl mx-auto px-6 py-6 flex flex-col gap-6">

                <Breadcrumb>
                    <BreadcrumbList>
                        <BreadcrumbItem><BreadcrumbLink href="/admin-dashboard">Dashboard</BreadcrumbLink></BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem><BreadcrumbPage>Ratings & Reviews</BreadcrumbPage></BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>

                {/* Summary stat cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {[
                        { label: "Company Reviews", value: isLoading ? "—" : companyReviews.length, icon: Building2, iconBg: "bg-blue-50", iconClass: "text-[#2563eb]" },
                        { label: "Avg Company Rating", value: isLoading ? "—" : avgCompanyRating, icon: Star, iconBg: "bg-amber-50", iconClass: "text-amber-500" },
                        { label: "Project Reviews", value: isLoading ? "—" : projectReviews.length, icon: FolderKanban, iconBg: "bg-violet-50", iconClass: "text-violet-600" },
                        { label: "Avg Project Rating", value: isLoading ? "—" : avgProjectRating, icon: Star, iconBg: "bg-amber-50", iconClass: "text-amber-500" },
                    ].map(({ label, value, icon: Icon, iconBg, iconClass }) => (
                        <div key={label} className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${iconBg}`}>
                                <Icon size={18} className={iconClass} />
                            </div>
                            <div>
                                <p className="text-xs text-slate-400 font-medium">{label}</p>
                                {isLoading ? (
                                    <Skeleton className="h-6 w-10 rounded mt-0.5" />
                                ) : (
                                    <p className="text-2xl font-bold text-[#0f172a] leading-tight">{value}</p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                <Card className="rounded-lg border border-slate-200 shadow-sm">
                    <CardHeader className="px-5 border-b border-slate-100">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <CardTitle className="text-xl font-bold">Review Moderation</CardTitle>
                                <CardDescription>Monitor and remove reviews that violate platform policies</CardDescription>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                className="gap-1.5 shrink-0 cursor-pointer"
                                onClick={handleGenerateReport}
                                disabled={isLoading || (companyReviews.length === 0 && projectReviews.length === 0)}
                            >
                                <FileDown size={14} />
                                Export PDF
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="px-5 py-4">
                        <Tabs defaultValue="company">
                            <TabsList variant="line" className="mb-4">
                                <TabsTrigger value="company">
                                    Company Reviews
                                    {!isLoading && companyReviews.length > 0 && (
                                        <span className="ml-1.5 text-xs bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-full">{companyReviews.length}</span>
                                    )}
                                </TabsTrigger>
                                <TabsTrigger value="project">
                                    Project Reviews
                                    {!isLoading && projectReviews.length > 0 && (
                                        <span className="ml-1.5 text-xs bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-full">{projectReviews.length}</span>
                                    )}
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value="company">
                                {isLoading ? <ReviewSkeleton /> : companyReviews.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-16 gap-2">
                                        <MessageSquare size={28} className="text-slate-200" />
                                        <p className="text-sm font-medium text-slate-400">No company reviews yet</p>
                                    </div>
                                ) : (
                                    <div className="flex flex-col gap-3">
                                        {companyReviews.map((review) => (
                                            <ReviewCard
                                                key={review.id}
                                                avatar={review.profile_image}
                                                name={`${review.first_name} ${review.last_name}`}
                                                targetName={review.company_name ?? "Unknown Company"}
                                                targetLabel="Company"
                                                targetIcon={Building2}
                                                rating={review.rating}
                                                text={review.review_text}
                                                date={review.created_at}
                                                onDelete={() => openDeleteDialog(review.id, `${review.first_name} ${review.last_name}`, review.student_id, review.company_name ?? "the company", "company")}
                                            />
                                        ))}
                                    </div>
                                )}
                            </TabsContent>

                            <TabsContent value="project">
                                {isLoading ? <ReviewSkeleton /> : projectReviews.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-16 gap-2">
                                        <MessageSquare size={28} className="text-slate-200" />
                                        <p className="text-sm font-medium text-slate-400">No project reviews yet</p>
                                    </div>
                                ) : (
                                    <div className="flex flex-col gap-3">
                                        {projectReviews.map((review) => (
                                            <ReviewCard
                                                key={review.id}
                                                avatar={review.profile_image}
                                                name={`${review.first_name} ${review.last_name}`}
                                                targetName={review.project_title ?? "Unknown Project"}
                                                targetLabel={review.company_name ?? "Unknown Company"}
                                                targetIcon={FolderKanban}
                                                rating={review.rating}
                                                text={review.review_text}
                                                date={review.created_at}
                                                onDelete={() => openDeleteDialog(review.id, `${review.first_name} ${review.last_name}`, review.student_id, review.project_title ?? "the project", "project")}
                                            />
                                        ))}
                                    </div>
                                )}
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>
            </div>

            <DeleteReviewDialog
                reviewId={deletingId}
                reviewerName={deletingName}
                studentId={deletingStudentId}
                targetName={deletingTargetName}
                onClose={() => setDeletingId(null)}
                onDeleted={handleDeleted}
                onConfirm={handleConfirmDelete}
            />
        </div>
    )
}
