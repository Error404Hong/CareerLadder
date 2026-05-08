"use client"

import { useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { getStudentProfile, getStudentExperience, getStudentEducation, getStudentSkills, getLanguages, getStudentPerformance } from "@/app/api/user"
import { getBadgesByStudent, getStudentCertifications, getStudentExpPoints } from "@/app/api/rewards"
import { Student } from "@/types/student"
import type { Education } from "@/types/education"
import type { Experience } from "@/types/experience"
import type { Performance } from "@/types/performance"
import type { Skill } from "@/types/skill"
import type { Language } from "@/types/language"
import type { StudentBadge, Certification } from "@/types"

import { toast } from "sonner"
import { Award, File } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent } from "@/components/ui/card"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"

import { ProfileHeader } from "./components/ProfileHeader"
import { FreezeAccountDialog } from "../../components/FreezeAccountDialog"
import { OverviewTab } from "./components/OverviewTab"
import { BackgroundTab } from "./components/BackgroundTab"
import { SkillsTab } from "./components/SkillsTab"
import { PerformanceTab } from "./components/PerformanceTab"
import { ResumeTab } from "./components/ResumeTab"
import { BadgeCard } from "@/app/(main)/achivements/components/BadgeCard"
import { CertificationCard } from "@/app/(main)/achivements/components/CertificationCard"
import { EmptyState } from "@/app/(main)/achivements/components/EmptyState"


export default function UserDetailPage() {
    const params = useParams()
    const studentid = params.id as string

    const [isLoading, setIsLoading] = useState(true)
    const [profile, setProfile] = useState<Student | null>(null)
    const [freezeDialogOpen, setFreezeDialogOpen] = useState(false)
    const [experiences, setExperiences] = useState<Experience[]>([])
    const [educations, setEducations] = useState<Education[]>([])
    const [skills, setSkills] = useState<Skill[]>([])
    const [languages, setLanguages] = useState<Language[]>([])
    const [performances, setPerformances] = useState<Performance[]>([])
    const [studentExp, setStudentExp] = useState(0)
    const [studentBadges, setStudentBadges] = useState<StudentBadge[]>([])
    const [studentCerts, setStudentCerts] = useState<Certification[]>([])

    useEffect(() => {
        const fetchStudentDetails = async () => {
            try {
                const [profileRes, experienceRes, educationRes, skillRes, languageRes, performanceRes, expRes, badgeRes, certRes] = await Promise.all([
                    getStudentProfile(studentid),
                    getStudentExperience(studentid),
                    getStudentEducation(studentid),
                    getStudentSkills(studentid),
                    getLanguages(studentid),
                    getStudentPerformance(studentid),
                    getStudentExpPoints(studentid),
                    getBadgesByStudent(studentid),
                    getStudentCertifications(studentid),
                ])
                if (profileRes.success) setProfile(profileRes.data)
                if (experienceRes.success) setExperiences(experienceRes.data ?? [])
                if (educationRes.success) setEducations(educationRes.data ?? [])
                if (skillRes.success) setSkills(skillRes.data ?? [])
                if (languageRes.success) setLanguages(languageRes.data ?? [])
                if (performanceRes.success) setPerformances(performanceRes.data ?? [])
                if (expRes.success) setStudentExp(expRes.data.experience_points)
                if (badgeRes.success) setStudentBadges(badgeRes.data ?? [])
                if (certRes.success) setStudentCerts(certRes.data ?? [])
            } catch {
                toast.error("Something went wrong. Please try again")
            } finally {
                setIsLoading(false)
            }
        }
        fetchStudentDetails()
    }, [studentid])

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="max-w-6xl mx-auto px-6 py-6 flex flex-col gap-6">

                <Breadcrumb>
                    <BreadcrumbList>
                        <BreadcrumbItem><BreadcrumbLink href="/admin-dashboard">Dashboard</BreadcrumbLink></BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem><BreadcrumbLink href="/users">User Management</BreadcrumbLink></BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem><BreadcrumbPage>Student Profile</BreadcrumbPage></BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>

                {isLoading ? (
                    <div className="flex flex-col gap-4">
                        <Card className="rounded-xl border border-slate-200 shadow-sm">
                            <CardContent className="px-6 py-6">
                                <div className="flex items-center gap-5">
                                    <Skeleton className="w-20 h-20 rounded-full shrink-0" />
                                    <div className="flex flex-col gap-2 flex-1">
                                        <Skeleton className="h-6 w-48 rounded" />
                                        <Skeleton className="h-4 w-64 rounded" />
                                        <Skeleton className="h-4 w-32 rounded" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="rounded-xl border border-slate-200 shadow-sm">
                            <CardContent className="px-6 py-6 flex flex-col gap-3">
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <Skeleton key={i} className="h-10 w-full rounded-lg" />
                                ))}
                            </CardContent>
                        </Card>
                    </div>
                ) : profile ? (
                    <>
                        <ProfileHeader
                            profile={profile}
                            studentExp={studentExp}
                            onFreeze={() => setFreezeDialogOpen(true)}
                            onUnfreeze={() => setFreezeDialogOpen(true)}
                        />

                        <Card className="rounded-xl border border-slate-200 shadow-sm">
                            <CardContent className="px-6 pt-2 pb-6">
                                <Tabs defaultValue="overview">
                                    <TabsList variant="line" className="mb-6 border-b border-slate-100 w-full justify-start rounded-none pb-0">
                                        <TabsTrigger value="overview">Overview</TabsTrigger>
                                        <TabsTrigger value="background">Background</TabsTrigger>
                                        <TabsTrigger value="skills">Skills & Languages</TabsTrigger>
                                        <TabsTrigger value="performance">Performance</TabsTrigger>
                                        <TabsTrigger value="achievements">
                                            Achievements
                                            {(studentBadges.length + studentCerts.length) > 0 && (
                                                <span className="ml-1.5 text-[10px] font-semibold bg-[#0f172a] text-white px-1.5 py-0.5 rounded-full">
                                                    {studentBadges.length + studentCerts.length}
                                                </span>
                                            )}
                                        </TabsTrigger>
                                        {profile.resume && <TabsTrigger value="resume">Resume</TabsTrigger>}
                                    </TabsList>

                                    <TabsContent value="overview">
                                        <OverviewTab profile={profile} />
                                    </TabsContent>

                                    <TabsContent value="background">
                                        <BackgroundTab educations={educations} experiences={experiences} />
                                    </TabsContent>

                                    <TabsContent value="skills">
                                        <SkillsTab skills={skills} languages={languages} />
                                    </TabsContent>

                                    <TabsContent value="performance">
                                        <PerformanceTab performances={performances} />
                                    </TabsContent>

                                    <TabsContent value="achievements">
                                        <div className="flex flex-col gap-6">
                                            <div>
                                                <div className="flex items-center gap-2 mb-3">
                                                    <Award size={14} className="text-[#0f172a]" />
                                                    <p className="text-sm font-semibold text-[#0f172a]">Awarded Badges</p>
                                                    <span className="text-xs text-slate-400">({studentBadges.length})</span>
                                                </div>
                                                {studentBadges.length === 0 ? (
                                                    <div className="bg-slate-50 border border-slate-100 rounded-xl">
                                                        <EmptyState icon={<Award size={24} />} title="No badges earned yet" subtitle="Complete projects to earn recognition badges" />
                                                    </div>
                                                ) : (
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                                        {studentBadges.map(badge => <BadgeCard key={badge.id} badge={badge} />)}
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2 mb-3">
                                                    <File size={14} className="text-[#0f172a]" />
                                                    <p className="text-sm font-semibold text-[#0f172a]">Awarded Certifications</p>
                                                    <span className="text-xs text-slate-400">({studentCerts.length})</span>
                                                </div>
                                                {studentCerts.length === 0 ? (
                                                    <div className="bg-slate-50 border border-slate-100 rounded-xl">
                                                        <EmptyState icon={<File size={24} />} title="No certifications yet" subtitle="Certifications are issued upon successful project completion" />
                                                    </div>
                                                ) : (
                                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                                                        {studentCerts.map(cert => <CertificationCard key={cert.id} cert={cert} />)}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </TabsContent>

                                    {profile.resume && (
                                        <TabsContent value="resume">
                                            <ResumeTab resumeUrl={profile.resume} />
                                        </TabsContent>
                                    )}
                                </Tabs>
                            </CardContent>
                        </Card>
                    </>
                ) : (
                    <Card className="rounded-xl border border-slate-200 shadow-sm">
                        <CardContent className="px-6 py-16 text-center">
                            <p className="text-sm text-slate-400">Student not found</p>
                        </CardContent>
                    </Card>
                )}
            </div>

            {profile && (
                <FreezeAccountDialog
                    open={freezeDialogOpen}
                    name={`${profile.firstName} ${profile.lastName}`}
                    clerkId={profile.clerk_id}
                    isFreezing={Number(profile.status) === 1}
                    onClose={() => setFreezeDialogOpen(false)}
                    onSuccess={(newStatus) => setProfile((prev) => prev ? { ...prev, status: newStatus } : prev)}
                />
            )}
        </div>
    )
}
