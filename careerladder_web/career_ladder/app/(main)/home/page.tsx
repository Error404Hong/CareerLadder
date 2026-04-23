"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { useUser } from "@clerk/nextjs"
import { format } from "date-fns"
import { Playfair_Display, DM_Mono } from "next/font/google"

import { Job, Project, Training, JobApplication, ProjectApplication } from "@/types"
import { getAllJobs, getJobApplications } from "@/app/api/job"
import { getAllProjects, getProjectApplications } from "@/app/api/project"
import { getAllTraining } from "@/app/api/training"
import { getUserById } from "@/app/api/user"
import { AIRecommendationPanel } from "./components/AIRecommendationPanel"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { MapPin, DollarSign, Users, Clock, Briefcase, FolderKanban, ArrowUpRight, Building2, ChevronRight, Sparkles } from "lucide-react"

const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair", weight: ["400", "600", "700"] })
const dmMono = DM_Mono({ subsets: ["latin"], variable: "--font-mono", weight: ["400", "500"] })

function getGreeting() {
    const h = new Date().getHours()
    if (h < 12) return "Good morning"
    if (h < 17) return "Good afternoon"
    return "Good evening"
}

function useCountUp(target: number, duration = 1000) {
    const [count, setCount] = useState(0)
    useEffect(() => {
        if (target === 0) return
        const steps = 30
        const inc = target / steps
        let current = 0
        const timer = setInterval(() => {
            current += inc
            if (current >= target) { setCount(target); clearInterval(timer) }
            else setCount(Math.floor(current))
        }, duration / steps)
        return () => clearInterval(timer)
    }, [target, duration])
    return count
}

export default function HomePage() {
    const router = useRouter()
    const { user } = useUser()

    const [jobs, setJobs] = useState<(Job & { company_name?: string })[]>([])
    const [projects, setProjects] = useState<(Project & { company_name?: string })[]>([])
    const [trainings, setTrainings] = useState<Training[]>([])
    const [jobApps, setJobApps] = useState<JobApplication[]>([])
    const [projectApps, setProjectApps] = useState<ProjectApplication[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [appsLoading, setAppsLoading] = useState(true)
    const [openDialog, setOpenDialog] = useState(false)
    const [activeTab, setActiveTab] = useState<"jobs" | "projects">("jobs")
    const [mounted, setMounted] = useState(false)

    const totalOpportunities = useCountUp(jobs.length + projects.length, 1200)

    useEffect(() => { setMounted(true) }, [])

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
                const [jobsRes, projectsRes, trainingsRes] = await Promise.all([getAllJobs(), getAllProjects(), getAllTraining()])
                if (jobsRes.success) setJobs((jobsRes.data as (Job & { company_name?: string })[]).filter(j => j.status?.toLowerCase() === "open"))
                if (projectsRes.success) setProjects((projectsRes.data as (Project & { company_name?: string })[]).filter(p => p.status?.toLowerCase() === "open"))
                if (trainingsRes.success) setTrainings(trainingsRes.data as Training[])
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

    const appStatusCounts = useMemo(() => {
        const all = [...jobApps, ...projectApps]
        return {
            pending: all.filter(a => a.application_status === "pending").length,
            shortlisted: all.filter(a => a.application_status === "shortlisted").length,
            accepted: all.filter(a => a.application_status === "accepted").length,
            rejected: all.filter(a => a.application_status === "rejected").length,
            total: all.length,
        }
    }, [jobApps, projectApps])

    const displayJobs = jobs.slice(0, 6)
    const displayProjects = projects.slice(0, 6)
    const firstName = user?.firstName ?? "there"
    const today = format(new Date(), "EEEE, MMMM d")

    return (
        <div className={`${playfair.variable} ${dmMono.variable} min-h-screen bg-slate-50`}>
            <style>{`
                @keyframes fadeUp {
                    from { opacity: 0; transform: translateY(18px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes shimmer {
                    0% { background-position: -200% center; }
                    100% { background-position: 200% center; }
                }
                @keyframes pulse-ring {
                    0% { transform: scale(1); opacity: 0.4; }
                    100% { transform: scale(1.6); opacity: 0; }
                }
                .fade-up { animation: fadeUp 0.5s ease both; }
                .card-stagger-1 { animation-delay: 0.05s; }
                .card-stagger-2 { animation-delay: 0.10s; }
                .card-stagger-3 { animation-delay: 0.15s; }
                .card-stagger-4 { animation-delay: 0.20s; }
                .card-stagger-5 { animation-delay: 0.25s; }
                .card-stagger-6 { animation-delay: 0.30s; }
                .job-card:hover { transform: translateY(-2px); }
                .job-card { transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease; }
                .live-dot::before {
                    content: '';
                    position: absolute;
                    inset: 0;
                    border-radius: 50%;
                    background: #22c55e;
                    animation: pulse-ring 1.5s ease-out infinite;
                }
                .skeleton-shimmer {
                    background: linear-gradient(90deg, #e2e8f0 25%, #f1f5f9 50%, #e2e8f0 75%);
                    background-size: 200% 100%;
                    animation: shimmer 1.4s infinite;
                }
            `}</style>

            {/* ── Hero Header ── */}
            <div className="relative overflow-hidden border-b border-slate-200 bg-white">
                {/* Background grid decoration */}
                <div className="absolute inset-0 opacity-[0.04]" style={{
                    backgroundImage: `linear-gradient(#93c5fd 1px, transparent 1px), linear-gradient(90deg, #93c5fd 1px, transparent 1px)`,
                    backgroundSize: "48px 48px"
                }} />
                {/* Gradient orb */}
                <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full opacity-20" style={{
                    background: "radial-gradient(circle, #bfdbfe 0%, transparent 70%)"
                }} />

                <div className="relative max-w-7xl mx-auto px-6 py-8">
                    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
                        {/* Left: greeting */}
                        <div className={`fade-up ${mounted ? "" : "opacity-0"}`}>
                            <div className="flex items-center gap-2 mb-3">
                                <span className="relative live-dot w-2 h-2 rounded-full bg-green-400 inline-block" />
                                <span className="font-[family-name:var(--font-mono)] text-[11px] text-slate-400 uppercase tracking-widest">
                                    {today}
                                </span>
                            </div>
                            <h1 className="font-[family-name:var(--font-playfair)] text-3xl sm:text-4xl font-semibold text-slate-800 leading-tight">
                                {getGreeting()},<br />
                                <span className="text-blue-600">{firstName}.</span>
                            </h1>
                            <p className="mt-2 text-sm text-slate-500 max-w-md">
                                Your next opportunity is waiting. Explore what&apos;s open today.
                            </p>
                        </div>

                        {/* Right: stat pills */}
                        <div className={`fade-up card-stagger-2 flex flex-wrap gap-3 ${mounted ? "" : "opacity-0"}`}>
                            <button
                                onClick={() => { setActiveTab("jobs"); router.push("/jobs") }}
                                className="group flex items-center gap-3 bg-blue-50 border border-blue-200 hover:border-blue-300 hover:bg-blue-100/70 rounded-xl px-4 py-3 transition-all"
                            >
                                <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                                    <Briefcase size={14} className="text-blue-600" />
                                </div>
                                <div className="text-left">
                                    <p className="font-[family-name:var(--font-mono)] text-xl font-medium text-slate-800 leading-none">{isLoading ? "—" : jobs.length}</p>
                                    <p className="text-[11px] text-slate-500 mt-0.5">Open Jobs</p>
                                </div>
                                <ArrowUpRight size={13} className="text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity ml-1" />
                            </button>

                            <button
                                onClick={() => { setActiveTab("projects"); router.push("/projects") }}
                                className="group flex items-center gap-3 bg-violet-50 border border-violet-200 hover:border-violet-300 hover:bg-violet-100/70 rounded-xl px-4 py-3 transition-all"
                            >
                                <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center">
                                    <FolderKanban size={14} className="text-violet-600" />
                                </div>
                                <div className="text-left">
                                    <p className="font-[family-name:var(--font-mono)] text-xl font-medium text-slate-800 leading-none">{isLoading ? "—" : projects.length}</p>
                                    <p className="text-[11px] text-slate-500 mt-0.5">Open Projects</p>
                                </div>
                                <ArrowUpRight size={13} className="text-violet-500 opacity-0 group-hover:opacity-100 transition-opacity ml-1" />
                            </button>

                            <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
                                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                                    <Sparkles size={14} className="text-slate-500" />
                                </div>
                                <div className="text-left">
                                    <p className="font-[family-name:var(--font-mono)] text-xl font-medium text-slate-800 leading-none">{appsLoading ? "—" : appStatusCounts.total}</p>
                                    <p className="text-[11px] text-slate-500 mt-0.5">My Applications</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Body ── */}
            <div className="max-w-7xl mx-auto px-6 py-7">
                <div className="flex flex-col lg:flex-row gap-7 items-start">

                    {/* ── Main Content ── */}
                    <div className="flex-1 min-w-0 flex flex-col gap-6">

                        {/* Tab switcher */}
                        <div className={`fade-up card-stagger-1 ${mounted ? "" : "opacity-0"} flex items-center gap-1 bg-white border border-slate-200 rounded-xl p-1 w-fit shadow-sm`}>
                            {(["jobs", "projects"] as const).map(tab => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${activeTab === tab
                                        ? tab === "jobs"
                                            ? "bg-blue-50 text-blue-700 border border-blue-200"
                                            : "bg-violet-50 text-violet-700 border border-violet-200"
                                        : "text-slate-400 hover:text-slate-600"
                                    }`}
                                >
                                    {tab === "jobs" ? <Briefcase size={13} /> : <FolderKanban size={13} />}
                                    {tab === "jobs" ? "Jobs" : "Projects"}
                                    <span className={`font-[family-name:var(--font-mono)] text-[11px] px-1.5 py-0.5 rounded-md ${activeTab === tab
                                        ? tab === "jobs" ? "bg-blue-100 text-blue-600" : "bg-violet-100 text-violet-600"
                                        : "bg-slate-100 text-slate-400"
                                    }`}>
                                        {tab === "jobs" ? jobs.length : projects.length}
                                    </span>
                                </button>
                            ))}
                        </div>

                        {/* Jobs tab */}
                        {activeTab === "jobs" && (
                            <section>
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-sm font-semibold text-slate-500 tracking-wide uppercase">
                                        Featured Jobs
                                    </h2>
                                    <button
                                        onClick={() => router.push("/jobs")}
                                        className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 transition-colors"
                                    >
                                        View all <ChevronRight size={13} />
                                    </button>
                                </div>

                                {isLoading ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {Array.from({ length: 4 }).map((_, i) => (
                                            <div key={i} className="skeleton-shimmer rounded-2xl h-40" />
                                        ))}
                                    </div>
                                ) : displayJobs.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-20 gap-3">
                                        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">
                                            <Briefcase size={20} className="text-slate-400" />
                                        </div>
                                        <p className="text-sm text-slate-500">No open jobs at the moment.</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {displayJobs.map((job, i) => (
                                            <div
                                                key={job.id}
                                                onClick={() => router.push(`/jobs?search=${encodeURIComponent(job.title)}`)}
                                                className={`job-card fade-up card-stagger-${Math.min(i + 1, 6)} ${mounted ? "" : "opacity-0"} group relative bg-white border border-slate-200 hover:border-blue-300 hover:shadow-lg hover:shadow-blue-100 rounded-2xl cursor-pointer overflow-hidden`}
                                            >
                                                {/* Top accent line */}
                                                <div className="absolute top-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-blue-400/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                                                <div className="p-5 flex flex-col gap-3">
                                                    {/* Header */}
                                                    <div className="flex items-start justify-between gap-3">
                                                        <div className="flex-1 min-w-0">
                                                            <h3 className="text-sm font-semibold text-slate-800 leading-snug group-hover:text-blue-700 transition-colors line-clamp-1">
                                                                {job.title}
                                                            </h3>
                                                            {job.company_name && (
                                                                <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                                                                    <Building2 size={10} /> {job.company_name}
                                                                </p>
                                                            )}
                                                        </div>
                                                        <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0 group-hover:bg-blue-100 transition-colors">
                                                            <Briefcase size={14} className="text-blue-600" />
                                                        </div>
                                                    </div>

                                                    <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">{job.description}</p>

                                                    {/* Tags */}
                                                    {job.skills_required?.length > 0 && (
                                                        <div className="flex flex-wrap gap-1.5">
                                                            {job.skills_required.slice(0, 3).map(skill => (
                                                                <span key={skill} className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-slate-500">
                                                                    {skill}
                                                                </span>
                                                            ))}
                                                            {job.skills_required.length > 3 && (
                                                                <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-400">
                                                                    +{job.skills_required.length - 3}
                                                                </span>
                                                            )}
                                                        </div>
                                                    )}

                                                    {/* Footer */}
                                                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 pt-2 border-t border-slate-100">
                                                        {job.location && (
                                                            <span className="flex items-center gap-1 text-xs text-slate-400">
                                                                <MapPin size={10} /> {job.location}
                                                            </span>
                                                        )}
                                                        {(() => {
                                                            const min = parseInt(job.salary_min), max = parseInt(job.salary_max)
                                                            return (!isNaN(min) && min > 0) ? (
                                                                <span className="flex items-center gap-1 text-xs font-medium text-emerald-600 font-[family-name:var(--font-mono)]">
                                                                    <DollarSign size={10} /> RM {min.toLocaleString()}–{max.toLocaleString()}
                                                                </span>
                                                            ) : null
                                                        })()}
                                                        <span className="ml-auto flex items-center gap-1 text-xs text-slate-400">
                                                            <Users size={10} /> {job.vacancies} spot{job.vacancies !== 1 ? "s" : ""}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {!isLoading && jobs.length > 6 && (
                                    <button
                                        onClick={() => router.push("/jobs")}
                                        className="mt-4 w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-slate-200 text-xs text-slate-400 hover:text-blue-600 hover:border-blue-300 bg-white transition-all"
                                    >
                                        +{jobs.length - 6} more jobs <ArrowUpRight size={12} />
                                    </button>
                                )}
                            </section>
                        )}

                        {/* Projects tab */}
                        {activeTab === "projects" && (
                            <section>
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-sm font-semibold text-slate-500 tracking-wide uppercase">
                                        Featured Projects
                                    </h2>
                                    <button
                                        onClick={() => router.push("/projects")}
                                        className="flex items-center gap-1 text-xs text-violet-600 hover:text-violet-700 transition-colors"
                                    >
                                        View all <ChevronRight size={13} />
                                    </button>
                                </div>

                                {isLoading ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {Array.from({ length: 4 }).map((_, i) => (
                                            <div key={i} className="skeleton-shimmer rounded-2xl h-40" />
                                        ))}
                                    </div>
                                ) : displayProjects.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-20 gap-3">
                                        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">
                                            <FolderKanban size={20} className="text-slate-400" />
                                        </div>
                                        <p className="text-sm text-slate-500">No open projects at the moment.</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {displayProjects.map((project, i) => (
                                            <div
                                                key={project.id}
                                                onClick={() => router.push(`/projects?search=${encodeURIComponent(project.title)}`)}
                                                className={`job-card fade-up card-stagger-${Math.min(i + 1, 6)} ${mounted ? "" : "opacity-0"} group relative bg-white border border-slate-200 hover:border-violet-300 hover:shadow-lg hover:shadow-violet-100 rounded-2xl cursor-pointer overflow-hidden`}
                                            >
                                                <div className="absolute top-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-violet-400/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                                                <div className="p-5 flex flex-col gap-3">
                                                    <div className="flex items-start justify-between gap-3">
                                                        <div className="flex-1 min-w-0">
                                                            <h3 className="text-sm font-semibold text-slate-800 leading-snug group-hover:text-violet-700 transition-colors line-clamp-1">
                                                                {project.title}
                                                            </h3>
                                                            {project.company_name && (
                                                                <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                                                                    <Building2 size={10} /> {project.company_name}
                                                                </p>
                                                            )}
                                                        </div>
                                                        <div className="w-9 h-9 rounded-xl bg-violet-50 border border-violet-100 flex items-center justify-center shrink-0 group-hover:bg-violet-100 transition-colors">
                                                            <FolderKanban size={14} className="text-violet-600" />
                                                        </div>
                                                    </div>

                                                    <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">{project.description}</p>

                                                    {project.skills_required?.length > 0 && (
                                                        <div className="flex flex-wrap gap-1.5">
                                                            {project.skills_required.slice(0, 3).map(skill => (
                                                                <span key={skill} className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-slate-500">
                                                                    {skill}
                                                                </span>
                                                            ))}
                                                            {project.skills_required.length > 3 && (
                                                                <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-400">
                                                                    +{project.skills_required.length - 3}
                                                                </span>
                                                            )}
                                                        </div>
                                                    )}

                                                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 pt-2 border-t border-slate-100">
                                                        {(() => {
                                                            const a = parseFloat(project.allowance)
                                                            return (!isNaN(a) && a > 0) ? (
                                                                <span className="flex items-center gap-1 text-xs font-medium text-emerald-600 font-[family-name:var(--font-mono)]">
                                                                    <DollarSign size={10} /> RM {a.toLocaleString()}/mo
                                                                </span>
                                                            ) : null
                                                        })()}
                                                        {project.start_date && project.end_date && (
                                                            <span className="flex items-center gap-1 text-xs text-slate-400">
                                                                <Clock size={10} />
                                                                {format(new Date(project.start_date), "MMM d")} – {format(new Date(project.end_date), "MMM d, yyyy")}
                                                            </span>
                                                        )}
                                                        <span className="ml-auto flex items-center gap-1 text-xs text-slate-400">
                                                            <Users size={10} /> {project.vacancies} spot{project.vacancies !== 1 ? "s" : ""}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {!isLoading && projects.length > 6 && (
                                    <button
                                        onClick={() => router.push("/projects")}
                                        className="mt-4 w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-slate-200 text-xs text-slate-400 hover:text-violet-600 hover:border-violet-300 bg-white transition-all"
                                    >
                                        +{projects.length - 6} more projects <ArrowUpRight size={12} />
                                    </button>
                                )}
                            </section>
                        )}
                    </div>

                    {/* ── Sidebar ── */}
                    <div className={`fade-up card-stagger-3 ${mounted ? "" : "opacity-0"} w-full lg:w-64 shrink-0 flex flex-col gap-4 lg:sticky lg:top-6`}>

                        {/* Application status */}
                        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4">My Applications</h3>
                            {appsLoading ? (
                                <div className="space-y-2">
                                    {Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton-shimmer h-6 rounded-lg" />)}
                                </div>
                            ) : appStatusCounts.total === 0 ? (
                                <p className="text-xs text-slate-400 text-center py-4">No applications yet.</p>
                            ) : (
                                <div className="flex flex-col gap-2.5">
                                    {[
                                        { label: "Pending", count: appStatusCounts.pending, color: "bg-yellow-400", text: "text-yellow-600" },
                                        { label: "Shortlisted", count: appStatusCounts.shortlisted, color: "bg-purple-400", text: "text-purple-600" },
                                        { label: "Accepted", count: appStatusCounts.accepted, color: "bg-green-400", text: "text-green-600" },
                                        { label: "Rejected", count: appStatusCounts.rejected, color: "bg-red-400", text: "text-red-500" },
                                    ].map(({ label, count, color, text }) => (
                                        <div key={label} className="flex items-center gap-3">
                                            <div className={`w-2 h-2 rounded-full ${color} shrink-0`} />
                                            <span className="text-xs text-slate-500 flex-1">{label}</span>
                                            <span className={`font-[family-name:var(--font-mono)] text-xs font-medium ${text}`}>{count}</span>
                                        </div>
                                    ))}
                                    <div className="mt-1 pt-2.5 border-t border-slate-100 flex items-center justify-between">
                                        <span className="text-xs text-slate-400">Total</span>
                                        <span className="font-[family-name:var(--font-mono)] text-xs font-medium text-slate-700">{appStatusCounts.total}</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Quick links */}
                        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">Quick Access</h3>
                            <div className="flex flex-col gap-1.5">
                                {[
                                    { label: "Browse All Jobs", path: "/jobs", color: "hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50" },
                                    { label: "Browse All Projects", path: "/projects", color: "hover:text-violet-600 hover:border-violet-200 hover:bg-violet-50" },
                                    { label: "My Applications", path: "/applications", color: "hover:text-slate-700 hover:border-slate-200 hover:bg-slate-50" },
                                    { label: "My Profile", path: "/profile", color: "hover:text-slate-700 hover:border-slate-200 hover:bg-slate-50" },
                                ].map(({ label, path, color }) => (
                                    <button
                                        key={path}
                                        onClick={() => router.push(path)}
                                        className={`flex items-center justify-between px-3 py-2 rounded-lg border border-transparent ${color} text-slate-400 text-xs transition-all`}
                                    >
                                        {label}
                                        <ChevronRight size={12} />
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Opportunity counter */}
                        {!isLoading && (
                            <div className="relative bg-gradient-to-br from-blue-50 to-violet-50 border border-slate-200 rounded-2xl p-5 overflow-hidden shadow-sm">
                                <div className="absolute -bottom-4 -right-4 w-20 h-20 rounded-full opacity-30" style={{ background: "radial-gradient(circle, #bfdbfe, transparent)" }} />
                                <p className="text-[11px] text-slate-400 uppercase tracking-widest mb-1">Opportunities</p>
                                <p className="font-[family-name:var(--font-playfair)] text-4xl font-semibold text-slate-800">{totalOpportunities}</p>
                                <p className="text-xs text-slate-400 mt-1">available right now</p>
                            </div>
                        )}

                        {/* AI Recommendations */}
                        <AIRecommendationPanel
                            jobs={jobs}
                            projects={projects}
                            trainings={trainings}
                        />
                    </div>
                </div>
            </div>

            {/* ── Profile completion dialog ── */}
            <Dialog open={openDialog} onOpenChange={setOpenDialog}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-slate-800">Complete your profile</DialogTitle>
                        <DialogDescription className="text-slate-500">
                            Your profile is incomplete. Fill in your details to get matched with the best opportunities.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex justify-end gap-3 mt-4">
                        <button
                            onClick={() => setOpenDialog(false)}
                            className="px-4 py-2 text-sm text-slate-500 hover:text-slate-700 transition-colors cursor-pointer rounded-lg border border-slate-200 hover:border-slate-300"
                        >
                            Later
                        </button>
                        <button
                            onClick={() => { setOpenDialog(false); router.push("/profile") }}
                            className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors shadow-lg shadow-blue-500/20 cursor-pointer"
                        >
                            Complete Profile
                        </button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
