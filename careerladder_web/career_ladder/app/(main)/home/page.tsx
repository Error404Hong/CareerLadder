"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { useUser } from "@clerk/nextjs"
import { format } from "date-fns"

import { Job, Project, JobApplication, ProjectApplication } from "@/types"
import { getAllJobs, getJobApplications } from "@/app/api/job"
import { getAllProjects, getProjectApplications } from "@/app/api/project"
import { getUserById } from "@/app/api/user"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Briefcase, FolderKanban, ArrowRight, TrendingUp } from "lucide-react"

import { JobCard } from "./components/JobCard"
import { ProjectCard } from "./components/ProjectCard"
import { CardSkeletonGrid } from "./components/CardSkeletonGrid"
import { EmptyState } from "./components/EmptyState"
import { SectionHeader } from "./components/SectionHeader"
import { ApplicationStatusCard, STATUS_COLORS } from "./components/ApplicationStatusCard"
import { AIRecommendationPanel } from "./components/AIRecommendationPanel"

function getGreeting() {
    const h = new Date().getHours()
    if (h < 12) return "Good morning"
    if (h < 17) return "Good afternoon"
    return "Good evening"
}

export default function HomePage() {
    const router = useRouter()
    const { user } = useUser()

    const [jobs, setJobs] = useState<(Job & { company_name?: string })[]>([])
    const [projects, setProjects] = useState<(Project & { company_name?: string })[]>([])
    const [jobApps, setJobApps] = useState<JobApplication[]>([])
    const [projectApps, setProjectApps] = useState<ProjectApplication[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [appsLoading, setAppsLoading] = useState(true)
    const [openDialog, setOpenDialog] = useState(false)

    useEffect(() => {
        if (!user) return
        const init = async () => {
            try {
                const userData = await getUserById(user.id)
                if (userData.data?.profile_completed === "0") setOpenDialog(true)
            } catch { /* silent */ }
        }
        init()
    }, [user])

    useEffect(() => {
        const fetchListings = async () => {
            try {
                const [jobsRes, projectsRes] = await Promise.all([getAllJobs(), getAllProjects()])
                if (jobsRes.success) setJobs((jobsRes.data as (Job & { company_name?: string })[]).filter(j => j.status?.toLowerCase() === "open"))
                if (projectsRes.success) setProjects((projectsRes.data as (Project & { company_name?: string })[]).filter(p => p.status?.toLowerCase() === "open"))
            } catch { /* silent */ }
            finally { setIsLoading(false) }
        }
        fetchListings()
    }, [])

    useEffect(() => {
        if (!user) return
        const fetchApps = async () => {
            try {
                const [jobAppsRes, projAppsRes] = await Promise.all([
                    getJobApplications(user.id),
                    getProjectApplications(user.id),
                ])
                if (jobAppsRes.success) setJobApps(jobAppsRes.data)
                if (projAppsRes.success) setProjectApps(projAppsRes.data)
            } catch { /* silent */ }
            finally { setAppsLoading(false) }
        }
        fetchApps()
    }, [user])

    const chartData = useMemo(() => {
        const all = [
            ...jobApps.map(a => a.application_status),
            ...projectApps.map(a => a.application_status),
        ]
        const counts: Record<string, number> = {}
        all.forEach(s => { counts[s] = (counts[s] ?? 0) + 1 })
        return Object.entries(counts).map(([status, count]) => ({
            status,
            count,
            fill: STATUS_COLORS[status.toLowerCase()] ?? "#94a3b8",
        }))
    }, [jobApps, projectApps])

    const displayJobs = jobs.slice(0, 6)
    const displayProjects = projects.slice(0, 6)
    const firstName = user?.firstName ?? "there"
    const today = format(new Date(), "EEEE, MMMM d")

    return (
        <div className="min-h-screen bg-slate-100">
            {/* ── Header ── */}
            <div className="bg-white border-b border-slate-100">
                <div className="max-w-7xl mx-auto px-6 py-6">
                    <div className="flex items-end justify-between">
                        <div>
                            <p className="text-xs text-slate-400 mb-0.5">{today}</p>
                            <h1 className="text-xl font-bold text-slate-800">
                                {getGreeting()}, {firstName}!
                            </h1>
                            <p className="text-sm text-slate-400 mt-0.5">
                                Explore the latest job openings and project opportunities that match your skills and interests.
                            </p>
                        </div>
                        <div className="hidden sm:flex items-center gap-2 bg-indigo-50 border border-indigo-100 px-3 py-1.5 rounded-full">
                            <TrendingUp size={13} className="text-indigo-400" />
                            <span className="text-xs font-medium text-indigo-600">
                                {jobs.length + projects.length} open opportunities
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Body ── */}
            <div className="max-w-7xl mx-auto px-6 py-8">
                <div className="flex flex-col lg:flex-row gap-6 items-start">

                    {/* ── Left: main content ── */}
                    <div className="flex-1 min-w-0 flex flex-col gap-8">

                        {/* Jobs */}
                        <section className="flex flex-col gap-4">
                            <SectionHeader title="Open Jobs" count={jobs.length} onViewAll={() => router.push("/jobs")} />
                            {isLoading ? <CardSkeletonGrid /> : displayJobs.length === 0
                                ? <EmptyState icon={Briefcase} label="No open jobs at the moment." />
                                : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {displayJobs.map(job => <JobCard key={job.id} job={job} onClick={() => router.push(`/jobs?search=${encodeURIComponent(job.title)}`)} />)}
                                    </div>
                                )}
                            {!isLoading && jobs.length > 6 && (
                                <button onClick={() => router.push("/jobs")} className="self-center text-xs font-semibold text-indigo-500 hover:text-indigo-700 flex items-center gap-1 transition-colors">
                                    +{jobs.length - 6} more jobs <ArrowRight size={12} />
                                </button>
                            )}
                        </section>

                        {/* Projects */}
                        <section className="flex flex-col gap-4">
                            <SectionHeader title="Open Projects" count={projects.length} onViewAll={() => router.push("/projects")} />
                            {isLoading ? <CardSkeletonGrid /> : displayProjects.length === 0
                                ? <EmptyState icon={FolderKanban} label="No open projects at the moment." />
                                : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {displayProjects.map(project => <ProjectCard key={project.id} project={project} onClick={() => router.push(`/projects?search=${encodeURIComponent(project.title)}`)} />)}
                                    </div>
                                )}
                            {!isLoading && projects.length > 6 && (
                                <button onClick={() => router.push("/projects")} className="self-center text-xs font-semibold text-indigo-500 hover:text-indigo-700 flex items-center gap-1 transition-colors">
                                    +{projects.length - 6} more projects <ArrowRight size={12} />
                                </button>
                            )}
                        </section>
                    </div>

                    {/* ── Right: sidebar ── */}
                    <div className="w-full lg:w-72 shrink-0 flex flex-col gap-4 lg:sticky lg:top-6">
                        <ApplicationStatusCard
                            isLoading={appsLoading}
                            chartData={chartData}
                            total={jobApps.length + projectApps.length}
                        />
                        <AIRecommendationPanel />
                    </div>
                </div>
            </div>

            {/* ── Profile completion dialog ── */}
            <Dialog open={openDialog} onOpenChange={setOpenDialog}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-(--color-navy)">Complete your profile</DialogTitle>
                        <DialogDescription>
                            Your profile is incomplete. Fill in your details to get matched with the best opportunities.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex justify-end gap-3 mt-4">
                        <button onClick={() => setOpenDialog(false)}
                            className="px-4 py-2 text-sm text-slate-500 hover:text-(--color-navy) transition-colors cursor-pointer rounded-lg border-2">
                            Later
                        </button>
                        <button onClick={() => { setOpenDialog(false); router.push("/profile") }}
                            className="px-4 py-2 text-sm bg-(--color-navy) hover:bg-(--color-navy-mid) text-white rounded-lg transition-colors shadow-md shadow-blue-200 cursor-pointer">
                            Complete Profile
                        </button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
