"use client"

import { useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { getStudentProfile, getStudentExperience, getStudentEducation, getStudentSkills, getLanguages, getStudentPerformance } from "@/app/api/user"
import { Student } from "@/types/student"
import type { Education } from "@/types/education"
import type { Experience } from "@/types/experience"
import type { Performance } from "@/types/performance"
import type { Skill } from "@/types/skill"
import type { Language } from "@/types/language"

import { toast } from "sonner"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent } from "@/components/ui/card"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"

import { ProfileHeader } from "./components/ProfileHeader"
import { OverviewTab } from "./components/OverviewTab"
import { BackgroundTab } from "./components/BackgroundTab"
import { SkillsTab } from "./components/SkillsTab"
import { PerformanceTab } from "./components/PerformanceTab"
import { ResumeTab } from "./components/ResumeTab"


export default function UserDetailPage() {
    const params = useParams()
    const studentid = params.id as string

    const [isLoading, setIsLoading] = useState(true)
    const [profile, setProfile] = useState<Student | null>(null)
    const [experiences, setExperiences] = useState<Experience[]>([])
    const [educations, setEducations] = useState<Education[]>([])
    const [skills, setSkills] = useState<Skill[]>([])
    const [languages, setLanguages] = useState<Language[]>([])
    const [performances, setPerformances] = useState<Performance[]>([])

    useEffect(() => {
        const fetchStudentDetails = async () => {
            try {
                const [profileRes, experienceRes, educationRes, skillRes, languageRes, performanceRes] = await Promise.all([
                    getStudentProfile(studentid),
                    getStudentExperience(studentid),
                    getStudentEducation(studentid),
                    getStudentSkills(studentid),
                    getLanguages(studentid),
                    getStudentPerformance(studentid),
                ])
                if (profileRes.success) setProfile(profileRes.data)
                if (experienceRes.success) setExperiences(experienceRes.data ?? [])
                if (educationRes.success) setEducations(educationRes.data ?? [])
                if (skillRes.success) setSkills(skillRes.data ?? [])
                if (languageRes.success) setLanguages(languageRes.data ?? [])
                if (performanceRes.success) setPerformances(performanceRes.data ?? [])
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
                        <ProfileHeader profile={profile} />

                        <Card className="rounded-xl border border-slate-200 shadow-sm">
                            <CardContent className="px-6 pt-2 pb-6">
                                <Tabs defaultValue="overview">
                                    <TabsList variant="line" className="mb-6 border-b border-slate-100 w-full justify-start rounded-none pb-0">
                                        <TabsTrigger value="overview">Overview</TabsTrigger>
                                        <TabsTrigger value="background">Background</TabsTrigger>
                                        <TabsTrigger value="skills">Skills & Languages</TabsTrigger>
                                        <TabsTrigger value="performance">Performance</TabsTrigger>
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
        </div>
    )
}
