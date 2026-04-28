"use client"

import { useUser } from "@clerk/nextjs"
import { useState, useEffect } from "react"
import { StudentBadge, Certification } from "@/types"
import { getStudentCertifications, getStudentExpPoints, getBadgesByStudent } from "@/app/api/rewards"
import { toast } from "sonner"
import { Award, File } from "lucide-react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"

import { ExpBanner } from "./components/ExpBanner"
import { BadgeCard } from "./components/BadgeCard"
import { CertificationCard } from "./components/CertificationCard"
import { EmptyState } from "./components/EmptyState"

export default function MyAchivements() {
    const { user } = useUser()
    const [isLoading, setIsLoading] = useState(true)
    const [studentCerts, setStudentCerts] = useState<Certification[]>([])
    const [studentBadges, setStudentBadges] = useState<StudentBadge[]>([])
    const [studentExp, setStudentExp] = useState(0)

    useEffect(() => {
        if (!user) return

        const fetchStudentAchivements = async () => {
            try {
                const [certRes, expRes, badgeRes] = await Promise.all([
                    getStudentCertifications(user.id),
                    getStudentExpPoints(user.id),
                    getBadgesByStudent(user.id)
                ])

                if (certRes.success) setStudentCerts(certRes.data)
                if (expRes.success) setStudentExp(expRes.data.experience_points)
                if (badgeRes.success) setStudentBadges(badgeRes.data)
            } catch {
                toast.error("Something went wrong. Please try again.")
            } finally {
                setIsLoading(false)
            }
        }

        fetchStudentAchivements()
    }, [user])

    return (
        <div className="min-h-screen bg-slate-100">
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
                                <BreadcrumbPage>My Achievements</BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>

                    <div>
                        <h1 className="text-xl font-bold text-[#0f172a]">My Achievements</h1>
                        <p className="text-sm text-slate-400 mt-1">Track your achievements, earn badges, and celebrate your progress</p>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-6">
                <ExpBanner exp={studentExp} isLoading={isLoading} />

                <Tabs defaultValue="badges">
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
                </Tabs>
            </div>
        </div>
    )
}
