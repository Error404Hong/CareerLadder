"use client"

import { useUser } from "@clerk/nextjs"
import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { StudentBadge, Certification } from "@/types"
import { Performance } from "@/types/performance"
import { getStudentCertifications, getStudentExpPoints, getBadgesByStudent } from "@/app/api/rewards"
import { getStudentPerformance } from "@/app/api/user"
import { toast } from "sonner"
import { Award, File, Star, MessageSquare } from "lucide-react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"

import { ExpBanner } from "./components/ExpBanner"
import { BadgeCard } from "./components/BadgeCard"
import { CertificationCard } from "./components/CertificationCard"
import { EmptyState } from "./components/EmptyState"

function ReviewCard({ p }: { p: Performance }) {
    const initials = p.company_name?.slice(0, 2).toUpperCase() ?? "CO"
    const metrics = [
        { label: "Communication", val: p.communication },
        { label: "Teamwork", val: p.teamwork },
        { label: "Technical", val: p.technical_skills },
        { label: "Problem Solving", val: p.problem_solving },
        { label: "Professionalism", val: p.professionalism },
    ]
    return (
        <div className="bg-white border border-slate-100 rounded-xl p-5 flex flex-col gap-4 shadow-sm hover:shadow-md transition-shadow">
            {/* Header */}
            <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#0f172a] text-white text-xs font-bold flex items-center justify-center shrink-0">
                        {initials}
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-[#0f172a] leading-tight">{p.company_name}</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">Performance Review</p>
                    </div>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                    <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map(i => (
                            <Star key={i} size={13} className={i <= Math.round(p.overall_rating) ? "fill-amber-400 text-amber-400" : "text-slate-200 fill-slate-200"} />
                        ))}
                    </div>
                    <span className="text-xs font-bold text-[#0f172a]">{p.overall_rating.toFixed(1)} <span className="text-slate-400 font-normal">/ 5</span></span>
                </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-2 gap-1.5">
                {metrics.map(m => (
                    <div key={m.label} className="flex items-center justify-between bg-slate-50 rounded-lg px-2.5 py-1.5">
                        <span className="text-[10px] text-slate-400">{m.label}</span>
                        <div className="flex items-center gap-1">
                            <div className="w-10 h-1 bg-slate-200 rounded-full overflow-hidden">
                                <div className="h-full bg-[#0f172a] rounded-full" style={{ width: `${(m.val / 5) * 100}%` }} />
                            </div>
                            <span className="text-[10px] font-semibold text-[#0f172a] w-4 text-right">{m.val}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Comment */}
            {p.comments && (
                <div className="bg-slate-50 rounded-lg px-3 py-2.5 border-l-2 border-slate-200">
                    <p className="text-[11px] text-slate-500 italic leading-relaxed">&ldquo;{p.comments}&rdquo;</p>
                </div>
            )}
        </div>
    )
}

function ReviewSkeleton() {
    return (
        <div className="bg-white border border-slate-100 rounded-xl p-5 animate-pulse">
            <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-slate-100 shrink-0" />
                <div className="flex-1">
                    <div className="h-4 bg-slate-100 rounded w-3/4 mb-2" />
                    <div className="h-3 bg-slate-100 rounded w-1/3" />
                </div>
                <div className="w-16 h-6 bg-slate-100 rounded" />
            </div>
            <div className="grid grid-cols-2 gap-1.5 mb-4">
                {[1, 2, 3, 4].map(i => <div key={i} className="h-7 bg-slate-100 rounded-lg" />)}
            </div>
            <div className="h-10 bg-slate-100 rounded-lg" />
        </div>
    )
}

function MyAchivementsContent() {
    const { user } = useUser()
    const searchParams = useSearchParams()
    const defaultTab = searchParams.get("tab") ?? "badges"

    const [isLoading, setIsLoading] = useState(true)
    const [studentCerts, setStudentCerts] = useState<Certification[]>([])
    const [studentBadges, setStudentBadges] = useState<StudentBadge[]>([])
    const [studentExp, setStudentExp] = useState(0)
    const [performances, setPerformances] = useState<Performance[]>([])

    useEffect(() => {
        if (!user) return

        const fetchStudentAchivements = async () => {
            try {
                const [certRes, expRes, badgeRes, perfRes] = await Promise.all([
                    getStudentCertifications(user.id),
                    getStudentExpPoints(user.id),
                    getBadgesByStudent(user.id),
                    getStudentPerformance(user.id),
                ])

                if (certRes.success) setStudentCerts(certRes.data)
                if (expRes.success) setStudentExp(expRes.data.experience_points)
                if (badgeRes.success) setStudentBadges(badgeRes.data)
                if (perfRes.success) setPerformances(perfRes.data)
            } catch {
                toast.error("Something went wrong. Please try again.")
            } finally {
                setIsLoading(false)
            }
        }

        fetchStudentAchivements()
    }, [user])

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header */}
            <div className="bg-white border-b border-slate-100">
                <div className="max-w-7xl mx-auto px-6 py-6">
                    <Breadcrumb className="mb-4">
                        <BreadcrumbList>
                            <BreadcrumbItem>
                                <BreadcrumbLink href="/home">Home</BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                                <BreadcrumbPage>My Achievements &amp; Reviews</BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>

                    <div>
                        <h1 className="text-xl font-bold text-[#0f172a]">My Achievements &amp; Reviews</h1>
                        <p className="text-sm text-slate-400 mt-1">Track your achievements, earn badges, and view your employer reviews</p>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-6">
                <ExpBanner exp={studentExp} isLoading={isLoading} />

                <Tabs defaultValue={defaultTab}>
                    <TabsList variant="line">
                        <TabsTrigger value="badges" className="cursor-pointer">
                            <Award size={14} />
                            Awarded Badges
                            {studentBadges.length > 0 && (
                                <span className="ml-1.5 text-[10px] font-semibold bg-[#0f172a] text-white px-1.5 py-0.5 rounded-full">
                                    {studentBadges.length}
                                </span>
                            )}
                        </TabsTrigger>
                        <TabsTrigger value="certifications" className="cursor-pointer">
                            <File size={14} />
                            Awarded Certifications
                            {studentCerts.length > 0 && (
                                <span className="ml-1.5 text-[10px] font-semibold bg-[#0f172a] text-white px-1.5 py-0.5 rounded-full">
                                    {studentCerts.length}
                                </span>
                            )}
                        </TabsTrigger>
                        <TabsTrigger value="reviews" className="cursor-pointer">
                            <MessageSquare size={14} />
                            My Reviews
                            {performances.length > 0 && (
                                <span className="ml-1.5 text-[10px] font-semibold bg-[#0f172a] text-white px-1.5 py-0.5 rounded-full">
                                    {performances.length}
                                </span>
                            )}
                        </TabsTrigger>
                    </TabsList>

                    {/* Badges Tab */}
                    <TabsContent value="badges" className="mt-6">
                        {isLoading ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="bg-white border border-slate-100 rounded-xl p-5 animate-pulse">
                                        <div className="flex gap-3 mb-3">
                                            <div className="w-12 h-12 rounded-xl bg-slate-100" />
                                            <div className="flex-1">
                                                <div className="h-4 bg-slate-100 rounded w-3/4 mb-2" />
                                                <div className="h-3 bg-slate-100 rounded w-1/2" />
                                            </div>
                                        </div>
                                        <div className="h-3 bg-slate-100 rounded w-full mb-2" />
                                        <div className="h-3 bg-slate-100 rounded w-2/3" />
                                    </div>
                                ))}
                            </div>
                        ) : studentBadges.length === 0 ? (
                            <div className="bg-white border border-slate-100 rounded-xl">
                                <EmptyState
                                    icon={<Award size={28} />}
                                    title="No badges earned yet"
                                    subtitle="Complete projects to earn recognition badges from employers"
                                />
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {studentBadges.map(badge => (
                                    <BadgeCard key={badge.id} badge={badge} />
                                ))}
                            </div>
                        )}
                    </TabsContent>

                    {/* Certifications Tab */}
                    <TabsContent value="certifications" className="mt-6">
                        {isLoading ? (
                            <div className="flex flex-col gap-4">
                                {[1, 2].map(i => (
                                    <div key={i} className="bg-white border border-slate-100 rounded-xl p-5 animate-pulse">
                                        <div className="flex gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-slate-100" />
                                            <div className="flex-1">
                                                <div className="h-4 bg-slate-100 rounded w-2/3 mb-2" />
                                                <div className="h-3 bg-slate-100 rounded w-1/3" />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : studentCerts.length === 0 ? (
                            <div className="bg-white border border-slate-100 rounded-xl">
                                <EmptyState
                                    icon={<File size={28} />}
                                    title="No certifications yet"
                                    subtitle="Certifications are issued upon successful project completion"
                                />
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                                {studentCerts.map(cert => (
                                    <CertificationCard key={cert.id} cert={cert} />
                                ))}
                            </div>
                        )}
                    </TabsContent>

                    {/* Reviews Tab */}
                    <TabsContent value="reviews" className="mt-6">
                        {isLoading ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {[1, 2, 3].map(i => <ReviewSkeleton key={i} />)}
                            </div>
                        ) : performances.length === 0 ? (
                            <div className="bg-white border border-slate-100 rounded-xl">
                                <EmptyState
                                    icon={<MessageSquare size={28} />}
                                    title="No reviews yet"
                                    subtitle="Employer reviews will appear here after you complete a project"
                                />
                            </div>
                        ) : (
                            <>
                                {/* Summary bar */}
                                {(() => {
                                    const avg = performances.reduce((sum, p) => sum + p.overall_rating, 0) / performances.length
                                    return (
                                        <div className="flex items-center gap-4 bg-white border border-slate-100 rounded-xl px-5 py-4 mb-5 shadow-sm">
                                            <div className="flex items-baseline gap-1.5">
                                                <span className="text-3xl font-bold text-[#0f172a]">{avg.toFixed(1)}</span>
                                                <span className="text-sm text-slate-400">/ 5</span>
                                            </div>
                                            <div className="w-px h-8 bg-slate-100" />
                                            <div>
                                                <div className="flex gap-0.5 mb-1">
                                                    {[1, 2, 3, 4, 5].map(i => (
                                                        <Star key={i} size={14} className={i <= Math.round(avg) ? "fill-amber-400 text-amber-400" : "text-slate-200 fill-slate-200"} />
                                                    ))}
                                                </div>
                                                <p className="text-xs text-slate-400">{performances.length} employer review{performances.length !== 1 ? "s" : ""}</p>
                                            </div>
                                        </div>
                                    )
                                })()}
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {performances.map((p, i) => (
                                        <ReviewCard key={i} p={p} />
                                    ))}
                                </div>
                            </>
                        )}
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    )
}

export default function MyAchivements() {
    return (
        <Suspense>
            <MyAchivementsContent />
        </Suspense>
    )
}
