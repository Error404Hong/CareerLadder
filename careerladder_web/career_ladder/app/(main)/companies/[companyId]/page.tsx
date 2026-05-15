"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { useUser } from "@clerk/nextjs"
import { toast } from "sonner"

import { CompanyProfile, ProjectReview, Job, Project, CompanyReview } from "@/types"
import { getCompanyProfile, getCompanyReviews as getCReview } from "@/app/api/user"
import { getCompanyReviews, getCompanyProjects } from "@/app/api/project"
import { getJobsByCompany } from "@/app/api/job"

import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MapPin, Users, CalendarDays, Globe, Mail, Star, Building2, Briefcase, FolderKanban } from "lucide-react"

import { AboutTab } from "./components/AboutTab"
import { RatingsTab } from "./components/RatingsTab"
import { JobsTab } from "./components/JobsTab"
import { ProjectsTab } from "./components/ProjectsTab"
import { ReviewDialog } from "./components/ReviewDialog"

function StarRating({ rating, size = 14 }: { rating: number; size?: number }) {
    return (
        <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
                <Star key={star} size={size}
                    className={star <= Math.round(rating) ? "fill-amber-400 text-amber-400" : "fill-slate-200 text-slate-200"}
                />
            ))}
        </div>
    )
}



// ── Page skeleton ──────────────────────────────────────────────────────────────
function PageSkeleton() {
    return (
        <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-8 flex gap-6">
                <Skeleton className="h-20 w-20 rounded-2xl shrink-0" />
                <div className="flex-1 space-y-3">
                    <Skeleton className="h-6 w-56" />
                    <Skeleton className="h-4 w-32 rounded-full" />
                    <div className="flex gap-4 pt-1">
                        <Skeleton className="h-4 w-28" />
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-4 w-20" />
                    </div>
                </div>
            </div>
            <Skeleton className="h-10 w-96 rounded-xl" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-40 w-full rounded-2xl" />)}
            </div>
        </div>
    )
}

// ── Main page ──────────────────────────────────────────────────────────────────
export default function CompanyProfilePage() {
    const { companyId } = useParams<{ companyId: string }>()
    const { user } = useUser()

    const [profile, setProfile] = useState<CompanyProfile | null>(null)
    const [reviews, setReviews] = useState<ProjectReview[]>([])
    const [jobs, setJobs] = useState<Job[]>([])
    const [projects, setProjects] = useState<Project[]>([])
    const [companyReviews, setCompanyreviews] = useState<CompanyReview[]>([]);
    const [isLoading, setIsLoading] = useState(true)
    const [reviewOpen, setReviewOpen] = useState(false)

    useEffect(() => {
        if (!companyId) return

        const fetchData = async () => {
            try {
                const [profileRes, reviewsRes, jobsRes, projectsRes, cReviews] = await Promise.all([
                    getCompanyProfile(companyId),
                    getCompanyReviews(companyId),
                    getJobsByCompany(companyId),
                    getCompanyProjects(companyId),
                    getCReview(companyId)
                ])

                if (profileRes.success) setProfile(profileRes.data)
                else toast.error("Failed to load company profile.")

                if (reviewsRes.success) setReviews(reviewsRes.data)
                if (jobsRes.success) setJobs(jobsRes.data)
                if (projectsRes.success) setProjects(projectsRes.data)
                if (cReviews.success) setCompanyreviews(cReviews.data)
            } catch {
                toast.error("Something went wrong. Please try again.")
            } finally {
                setIsLoading(false)
            }
        }

        fetchData()
    }, [companyId])

    const initials = profile?.company_name
        .split(" ")
        .map((w) => w[0])
        .slice(0, 2)
        .join("")
        .toUpperCase() ?? ""

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header bar */}
            <div className="bg-white border-b border-slate-100">
                <div className="max-w-7xl mx-auto px-6 py-6">
                    <Breadcrumb>
                        <BreadcrumbList>
                            <BreadcrumbItem><BreadcrumbLink href="/home">Home</BreadcrumbLink></BreadcrumbItem>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem><BreadcrumbLink href="/companies">Companies</BreadcrumbLink></BreadcrumbItem>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                                <BreadcrumbPage>{profile?.company_name ?? "Profile"}</BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>
                </div>
            </div>

            {/* Body */}
            <div className="max-w-7xl mx-auto px-6 py-8">
                {isLoading ? (
                    <PageSkeleton />
                ) : !profile ? (
                    <div className="flex flex-col items-center justify-center py-32 gap-3">
                        <Building2 size={36} className="text-slate-200" />
                        <p className="text-sm text-slate-400">Company not found.</p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-6">

                        {/* ── Hero card ── */}
                        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                            <div className="h-1.5 w-full bg-linear-to-r from-blue-500 to-indigo-500" />
                            <div className="p-8">
                                {/* Top row: avatar + info | review block */}
                                <div className="flex flex-col sm:flex-row items-start justify-between gap-6">
                                    {/* Left: avatar + name */}
                                    <div className="flex items-start gap-5">
                                        <Avatar className="h-20 w-20 rounded-2xl border border-slate-100 shrink-0 shadow-sm">
                                            <AvatarImage src={profile.image_url} alt={profile.company_name} className="object-cover" />
                                            <AvatarFallback className="rounded-2xl bg-indigo-50 text-indigo-600 font-bold text-xl">
                                                {initials}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <div className="flex flex-wrap items-center gap-2.5">
                                                <h1 className="text-2xl font-bold text-slate-800">{profile.company_name}</h1>
                                                <Badge className="bg-indigo-50 text-indigo-600 border-0 rounded-full font-normal text-xs px-3">
                                                    {profile.industry}
                                                </Badge>
                                            </div>
                                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-2.5">
                                                {profile.location && (
                                                    <span className="flex items-center gap-1.5 text-sm text-slate-500">
                                                        <MapPin size={13} className="text-slate-400" />{profile.location}
                                                    </span>
                                                )}
                                                {profile.company_size && (
                                                    <span className="flex items-center gap-1.5 text-sm text-slate-500">
                                                        <Users size={13} className="text-slate-400" />{profile.company_size} employees
                                                    </span>
                                                )}
                                                {profile.founded_year && (
                                                    <span className="flex items-center gap-1.5 text-sm text-slate-500">
                                                        <CalendarDays size={13} className="text-slate-400" />Founded {profile.founded_year}
                                                    </span>
                                                )}
                                                {profile.email && (
                                                    <span className="flex items-center gap-1.5 text-sm text-slate-500">
                                                        <Mail size={13} className="text-slate-400" />{profile.email}
                                                    </span>
                                                )}
                                                {profile.website && (
                                                    <a href={profile.website} target="_blank" rel="noopener noreferrer"
                                                        className="flex items-center gap-1.5 text-sm text-indigo-500 hover:text-indigo-700 transition-colors">
                                                        <Globe size={13} />{profile.website}
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right: rating + write review */}
                                    <div className="flex flex-col items-end gap-3 shrink-0">
                                        <Button size="sm" className="gap-1.5" onClick={() => setReviewOpen(true)}>
                                            Write a Review
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* ── Tabs ── */}
                        <Tabs defaultValue="about">
                            <TabsList variant="line">
                                <TabsTrigger value="about" className="flex items-center gap-1.5">
                                    <Building2 size={14} /> About
                                </TabsTrigger>
                                <TabsTrigger value="ratings" className="flex items-center gap-1.5">
                                    <Star size={14} /> Ratings
                                </TabsTrigger>
                                <TabsTrigger value="jobs" className="flex items-center gap-1.5">
                                    <Briefcase size={14} /> Job Opportunities
                                </TabsTrigger>
                                <TabsTrigger value="projects" className="flex items-center gap-1.5">
                                    <FolderKanban size={14} /> Projects
                                </TabsTrigger>
                            </TabsList>

                            <div className="mt-5">
                                <TabsContent value="about" className="mt-0">
                                    <AboutTab profile={profile} />
                                </TabsContent>
                                <TabsContent value="ratings" className="mt-0">
                                    <RatingsTab reviews={reviews} creviews={companyReviews} />
                                </TabsContent>
                                <TabsContent value="jobs" className="mt-0">
                                    <JobsTab jobs={jobs} />
                                </TabsContent>
                                <TabsContent value="projects" className="mt-0">
                                    <ProjectsTab projects={projects} />
                                </TabsContent>
                            </div>
                        </Tabs>

                    </div>
                )}
            </div>

            {profile && user && (
                <ReviewDialog
                    open={reviewOpen}
                    onOpenChange={setReviewOpen}
                    companyId={companyId}
                    companyName={profile.company_name}
                    studentId={user.id}
                    onSuccess={async () => {
                        const res = await getCReview(companyId)
                        if (res.success) setCompanyreviews(res.data)
                    }}
                />
            )}
        </div>
    )
}
