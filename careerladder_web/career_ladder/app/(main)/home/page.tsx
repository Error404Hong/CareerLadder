"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { useUser } from "@clerk/nextjs"
import { format } from "date-fns"
import { Playfair_Display, DM_Mono } from "next/font/google"

import { getUserById } from "@/app/api/user"
import { getAllTraining } from "@/app/api/training"
import { getAllJobs, getJobApplications } from "@/app/api/job"
import { useRecommendations } from "@/hooks/useRecommendations"
import { getAllProjects, getProjectApplications } from "@/app/api/project"
import { Job, Project, Training, JobApplication, ProjectApplication } from "@/types"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
    MapPin, Users, Briefcase, FolderKanban,
    ArrowUpRight, Building2, ChevronRight, Sparkles, BookOpen, CheckCircle2, UserCircle
} from "lucide-react"

const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair", weight: ["400", "600", "700"] })
const dmMono = DM_Mono({ subsets: ["latin"], variable: "--font-mono", weight: ["400", "500"] })

function getGreeting() {
    const h = new Date().getHours()
    if (h < 12) return "Good morning"
    if (h < 17) return "Good afternoon"
    return "Good evening"
}

type FilterType = "all" | "jobs" | "projects" | "training"

type ListItem = {
    id: string
    type: "job" | "project" | "training"
    title: string
    company_name?: string
    description: string
    tags: string[]
    salary?: string
    allowance?: number
    vacancies?: number
    location?: string
    aiPick?: boolean
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
    const [activeFilter, setActiveFilter] = useState<FilterType>("all")
    const [mounted, setMounted] = useState(false)

    const { recommendations, isLoading: aiLoading } = useRecommendations(jobs, projects, trainings)

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
            } finally {
                setIsLoading(false)
            }
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

    const openTrainings = useMemo(() => trainings.filter(t => t.status === "open"), [trainings])

    const allListItems = useMemo((): ListItem[] => {
        const aiJobIds = recommendations?.recommendedJobIds ?? []
        const aiProjectIds = recommendations?.recommendedProjectIds ?? []
        const aiTrainingIds = recommendations?.recommendedTrainingIds ?? []

        const jobItems: ListItem[] = jobs.slice(0, 6).map(j => ({
            id: j.id,
            type: "job",
            title: j.title,
            company_name: j.company_name,
            description: j.description,
            tags: [j.employment_type, j.is_remote ? "Remote" : "On-site"].filter(Boolean),
            salary: (() => { const mn = Number(j.salary_min), mx = Number(j.salary_max); return (!isNaN(mn) && mn > 0) ? `RM ${mn.toLocaleString()}–${mx.toLocaleString()}` : undefined })(),
            vacancies: j.vacancies,
            location: j.location,
            aiPick: aiJobIds.includes(j.id),
        }))

        const projectItems: ListItem[] = projects.slice(0, 6).map(p => ({
            id: p.id,
            type: "project",
            title: p.title,
            company_name: p.company_name,
            description: p.description,
            tags: [p.duration].filter(Boolean),
            allowance: (() => { const a = Number(p.allowance); return (!isNaN(a) && a > 0) ? a : undefined })(),
            vacancies: p.vacancies,
            aiPick: aiProjectIds.includes(p.id),
        }))

        const trainingItems: ListItem[] = openTrainings.slice(0, 6).map(t => ({
            id: t.id,
            type: "training",
            title: t.title,
            company_name: t.company_name,
            description: t.description,
            tags: [t.is_public ? "Public" : "Private", t.duration].filter(Boolean),
            vacancies: t.vacancies,
            location: t.location,
            aiPick: aiTrainingIds.includes(t.id),
        }))

        // interleave all 3 types for "View all"
        const result: ListItem[] = []
        const maxLen = Math.max(jobItems.length, projectItems.length, trainingItems.length)
        for (let i = 0; i < maxLen; i++) {
            if (jobItems[i]) result.push(jobItems[i])
            if (projectItems[i]) result.push(projectItems[i])
            if (trainingItems[i]) result.push(trainingItems[i])
        }
        return result
    }, [jobs, projects, openTrainings, recommendations])

    const displayItems = useMemo(() => {
        if (activeFilter === "all") return allListItems
        if (activeFilter === "jobs") return allListItems.filter(i => i.type === "job")
        if (activeFilter === "projects") return allListItems.filter(i => i.type === "project")
        return allListItems.filter(i => i.type === "training")
    }, [allListItems, activeFilter])

    const aiPicks = useMemo(() => displayItems.filter(i => i.aiPick).slice(0, 3), [displayItems])

    const firstName = user?.firstName ?? "there"
    const today = format(new Date(), "EEEE, MMMM d")

    const getItemPath = (item: ListItem) => {
        if (item.type === "job") return `/jobs?search=${encodeURIComponent(item.title)}`
        if (item.type === "project") return `/projects?search=${encodeURIComponent(item.title)}`
        return `/training`
    }

    const typeConfig = {
        job: {
            label: "Job",
            icon: Briefcase,
            badge: "bg-blue-50 text-blue-700 border-blue-200",
            iconWrap: "bg-blue-50 border border-blue-100 group-hover:bg-blue-100 group-hover:border-blue-200",
            iconColor: "text-blue-600",
            dot: "bg-blue-400",
        },
        project: {
            label: "Project",
            icon: FolderKanban,
            badge: "bg-indigo-50 text-indigo-700 border-indigo-200",
            iconWrap: "bg-indigo-50 border border-indigo-100 group-hover:bg-indigo-100 group-hover:border-indigo-200",
            iconColor: "text-indigo-600",
            dot: "bg-indigo-400",
        },
        training: {
            label: "Training",
            icon: BookOpen,
            badge: "bg-green-50 text-green-700 border-green-200",
            iconWrap: "bg-green-50 border border-green-100 group-hover:bg-green-100 group-hover:border-green-200",
            iconColor: "text-green-600",
            dot: "bg-green-400",
        },
    }

    const openCounts = [
        { label: "Jobs", count: jobs.length, dot: typeConfig.job.dot },
        { label: "Projects", count: projects.length, dot: typeConfig.project.dot },
        { label: "Training", count: openTrainings.length, dot: typeConfig.training.dot },
    ]

    const statusSegments = [
        { label: "Pending", count: appStatusCounts.pending, dot: "bg-yellow-400", text: "text-yellow-600", bar: "bg-yellow-400" },
        { label: "Shortlisted", count: appStatusCounts.shortlisted, dot: "bg-purple-400", text: "text-purple-600", bar: "bg-purple-400" },
        { label: "Accepted", count: appStatusCounts.accepted, dot: "bg-green-400", text: "text-green-600", bar: "bg-green-400" },
        { label: "Rejected", count: appStatusCounts.rejected, dot: "bg-red-400", text: "text-red-500", bar: "bg-red-400" },
    ]

    return (
        <div className={`${playfair.variable} ${dmMono.variable} min-h-screen bg-slate-50`}>
            <style>{`
                @keyframes fadeUp {
                    from { opacity: 0; transform: translateY(14px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                @keyframes shimmer {
                    0%   { background-position: -200% center; }
                    100% { background-position:  200% center; }
                }
                @keyframes pulse-ring {
                    0%   { transform: scale(1);   opacity: 0.45; }
                    100% { transform: scale(1.65); opacity: 0; }
                }
                .fade-up { animation: fadeUp 0.35s cubic-bezier(0.22, 1, 0.36, 1) both; }
                .s1 { animation-delay: 0.04s; }
                .s2 { animation-delay: 0.08s; }
                .s3 { animation-delay: 0.12s; }
                .s4 { animation-delay: 0.16s; }
                .row-item { transition: background-color 0.18s ease; }
                .live-dot::before {
                    content: ''; position: absolute; inset: 0;
                    border-radius: 50%; background: #22c55e;
                    animation: pulse-ring 1.5s ease-out infinite;
                }
                .skeleton-shimmer {
                    background: linear-gradient(90deg, #e2e8f0 25%, #f1f5f9 50%, #e2e8f0 75%);
                    background-size: 200% 100%;
                    animation: shimmer 1.4s infinite;
                }
            `}</style>

            {/* ── Navy masthead ── */}
            <div className="relative overflow-hidden bg-[#0f172a]">
                <div className="absolute inset-0 opacity-[0.04]" style={{
                    backgroundImage: `linear-gradient(#3b82f6 1px, transparent 1px), linear-gradient(90deg, #3b82f6 1px, transparent 1px)`,
                    backgroundSize: "52px 52px"
                }} />
                <div className="absolute -top-32 -right-24 w-150 h-150 rounded-full pointer-events-none" style={{
                    background: "radial-gradient(circle, rgba(37,99,235,0.14) 0%, transparent 62%)"
                }} />

                <div className="relative max-w-7xl mx-auto px-6 pt-10 pb-9">
                    {/* Date */}
                    <div className={`${mounted ? "fade-up" : "opacity-0"} flex items-center gap-2 mb-6`}>
                        <span className="relative live-dot w-2 h-2 rounded-full bg-green-400 inline-block" />
                        <span className="font-mono text-[11px] text-slate-400 uppercase tracking-widest">{today}</span>
                    </div>

                    <div className={`${mounted ? "fade-up s1" : "opacity-0"} mb-2 flex items-start justify-between gap-10`}>
                        {/* Left: greeting */}
                        <div>
                            <h1 className="font-playfair text-4xl sm:text-5xl font-semibold text-white leading-tight">
                                {getGreeting()},&nbsp;<span className="text-blue-400">{firstName}.</span>
                            </h1>
                            <p className="mt-4 text-sm text-slate-400 max-w-xl leading-relaxed">
                                Explore open jobs, projects, and training programs — all in one place. Your next opportunity is listed below.
                            </p>
                        </div>

                        {/* Right: open-now readout */}
                        <div className="hidden md:block shrink-0 w-52 rounded-2xl border border-white/10 bg-white/3 px-5 py-4">
                            <p className="font-mono text-[10px] font-medium text-slate-500 uppercase tracking-widest mb-3">Open now</p>
                            <div className="divide-y divide-white/10">
                                {openCounts.map(({ label, count, dot }) => (
                                    <div key={label} className="flex items-center gap-2.5 py-2">
                                        <span className={`w-1.5 h-1.5 rounded-full ${dot} shrink-0`} />
                                        <span className="text-xs text-slate-300 flex-1">{label}</span>
                                        <span className="font-mono text-sm text-white tabular-nums">
                                            {isLoading ? "—" : count}
                                        </span>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-1 pt-2.5 border-t border-white/15 flex items-center justify-between">
                                <span className="text-xs text-slate-500">Total</span>
                                <span className="font-mono text-sm font-medium text-blue-400 tabular-nums">
                                    {isLoading ? "—" : jobs.length + projects.length + openTrainings.length}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Filter pills */}
                    <div className={`${mounted ? "fade-up s2" : "opacity-0"} mt-7 flex items-center gap-2 flex-wrap`}>
                        {([
                            { key: "all", label: "View all", count: jobs.length + projects.length + openTrainings.length },
                            { key: "jobs", label: "Jobs", count: jobs.length },
                            { key: "projects", label: "Projects", count: projects.length },
                            { key: "training", label: "Training", count: openTrainings.length },
                        ] as { key: FilterType; label: string; count: number }[]).map(pill => (
                            <button
                                key={pill.key}
                                onClick={() => setActiveFilter(pill.key)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 border cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0f172a] ${activeFilter === pill.key
                                    ? "bg-white text-[#0f172a] border-white"
                                    : "bg-transparent text-slate-300 border-white/15 hover:border-white/35 hover:text-white"
                                    }`}
                            >
                                {pill.label}
                                {!isLoading && (
                                    <span className={`font-mono text-[11px] px-1.5 py-0.5 rounded-full tabular-nums ${activeFilter === pill.key
                                        ? "bg-[#0f172a]/10 text-[#0f172a]"
                                        : "bg-white/10 text-slate-400"
                                        }`}>
                                        {pill.count}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── Body ── */}
            <div className="max-w-7xl mx-auto px-6 py-8">
                <div className="flex flex-col lg:flex-row gap-7 items-start">

                    {/* ── Main ── */}
                    <div className="flex-1 min-w-0 flex flex-col gap-6">

                        {/* AI Picks */}
                        {(aiLoading || (!aiLoading && aiPicks.length > 0)) && (
                            <div className={`${mounted ? "fade-up s2" : "opacity-0"} rounded-2xl border border-indigo-100 bg-indigo-50/50 overflow-hidden`}>
                                <div className="flex items-center gap-2 px-5 pt-4 pb-3">
                                    <Sparkles size={13} className="text-indigo-500" />
                                    <span className="font-mono text-[10px] font-semibold text-indigo-600 uppercase tracking-widest">AI Picks for You</span>
                                </div>
                                {aiLoading ? (
                                    <div className="flex flex-col gap-2.5 px-5 pb-4">
                                        {[0, 1].map(i => <div key={i} className="skeleton-shimmer rounded-xl h-16" />)}
                                    </div>
                                ) : (
                                    <div className="divide-y divide-indigo-100/70">
                                        {aiPicks.map(item => {
                                            const cfg = typeConfig[item.type]
                                            const Icon = cfg.icon
                                            return (
                                                <div
                                                    key={item.id}
                                                    onClick={() => router.push(getItemPath(item))}
                                                    className="row-item group cursor-pointer px-5 py-3.5 hover:bg-indigo-100/40"
                                                >
                                                    <div className="flex items-center gap-4">
                                                        <div className={`w-10 h-10 rounded-xl ${cfg.iconWrap} flex items-center justify-center shrink-0 transition-colors duration-200`}>
                                                            <Icon size={15} className={cfg.iconColor} />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-2 flex-wrap mb-0.5">
                                                                <h3 className="text-sm font-semibold text-slate-800 group-hover:text-indigo-700 transition-colors truncate">
                                                                    {item.title}
                                                                </h3>
                                                                <span className="text-[10px] font-semibold bg-indigo-600 text-white px-2 py-0.5 rounded-full shrink-0 leading-relaxed">
                                                                    ✨ AI Pick
                                                                </span>
                                                            </div>
                                                            {item.company_name && (
                                                                <p className="text-xs text-slate-400 flex items-center gap-1 mb-1.5">
                                                                    <Building2 size={10} /> {item.company_name}
                                                                </p>
                                                            )}
                                                            <div className="flex flex-wrap gap-1.5">
                                                                <span className={`text-[11px] px-2 py-0.5 rounded-full border font-medium ${cfg.badge}`}>
                                                                    {cfg.label}
                                                                </span>
                                                                {item.tags.slice(0, 2).map(tag => (
                                                                    <span key={tag} className="text-[11px] px-2 py-0.5 rounded-full bg-white text-slate-500 border border-slate-200 capitalize">
                                                                        {tag}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        </div>
                                                        <button
                                                            className="shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium bg-indigo-600 text-white hover:bg-indigo-700 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2"
                                                            onClick={e => { e.stopPropagation(); router.push(getItemPath(item)) }}
                                                        >
                                                            View <ArrowUpRight size={12} />
                                                        </button>
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Section header */}
                        <div className={`${mounted ? "fade-up s3" : "opacity-0"} flex items-center justify-between`}>
                            <h2 className="font-mono text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
                                {activeFilter === "all" ? "Featured Opportunities" :
                                    activeFilter === "jobs" ? "Featured Jobs" :
                                        activeFilter === "projects" ? "Featured Projects" :
                                            "Training Programs"}
                            </h2>
                            <button
                                onClick={() => router.push(activeFilter === "all" || activeFilter === "jobs" ? "/jobs" : `/${activeFilter}`)}
                                className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 rounded"
                            >
                                View all <ChevronRight size={13} />
                            </button>
                        </div>

                        {/* Listings */}
                        {isLoading ? (
                            <div className="flex flex-col gap-3">
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <div key={i} className="skeleton-shimmer rounded-2xl h-21" />
                                ))}
                            </div>
                        ) : displayItems.length === 0 ? (
                            <div className="bg-white border border-slate-200 rounded-2xl flex flex-col items-center justify-center py-16 gap-3">
                                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">
                                    <Briefcase size={20} className="text-slate-300" />
                                </div>
                                <p className="text-sm text-slate-400">No opportunities match this filter.</p>
                                {activeFilter !== "all" && (
                                    <button
                                        onClick={() => setActiveFilter("all")}
                                        className="text-xs font-medium text-blue-600 hover:text-blue-700 border border-slate-200 hover:border-blue-300 rounded-lg px-3 py-1.5 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2"
                                    >
                                        View all opportunities
                                    </button>
                                )}
                            </div>
                        ) : (
                            <div className={`${mounted ? "fade-up s4" : "opacity-0"} bg-white border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-100`}>
                                {displayItems.map(item => {
                                    const cfg = typeConfig[item.type]
                                    const Icon = cfg.icon
                                    return (
                                        <div
                                            key={item.id}
                                            onClick={() => router.push(getItemPath(item))}
                                            className="row-item group cursor-pointer px-5 py-4 hover:bg-slate-50/80"
                                        >
                                            <div className="flex items-center gap-4">
                                                {/* Icon */}
                                                <div className={`w-10 h-10 rounded-xl ${cfg.iconWrap} flex items-center justify-center shrink-0 transition-colors duration-200`}>
                                                    <Icon size={15} className={cfg.iconColor} />
                                                </div>

                                                {/* Content */}
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="text-sm font-semibold text-slate-800 group-hover:text-slate-900 truncate mb-0.5">
                                                        {item.title}
                                                    </h3>
                                                    <div className="flex items-center gap-2 mb-2 min-w-0">
                                                        {item.company_name && (
                                                            <p className="text-xs text-slate-400 flex items-center gap-1 shrink-0">
                                                                <Building2 size={10} /> {item.company_name}
                                                            </p>
                                                        )}
                                                        {item.description && (
                                                            <p className="hidden sm:block text-xs text-slate-400 truncate min-w-0">
                                                                {item.company_name ? "· " : ""}{item.description}
                                                            </p>
                                                        )}
                                                    </div>
                                                    <div className="flex flex-wrap gap-1.5">
                                                        <span className={`text-[11px] px-2 py-0.5 rounded-full border font-medium ${cfg.badge}`}>
                                                            {cfg.label}
                                                        </span>
                                                        {item.tags.slice(0, 2).map(tag => (
                                                            <span key={tag} className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 border border-slate-200 capitalize">
                                                                {tag}
                                                            </span>
                                                        ))}
                                                        {item.location && (
                                                            <span className="hidden sm:flex text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-400 border border-slate-200 items-center gap-1">
                                                                <MapPin size={9} /> {item.location}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Right */}
                                                <div className="shrink-0 flex flex-col items-end gap-2 min-w-22">
                                                    {item.salary && (
                                                        <span className="font-mono text-xs font-medium text-emerald-600 text-right">
                                                            {item.salary}
                                                        </span>
                                                    )}
                                                    {item.allowance && item.allowance > 0 ? (
                                                        <span className="font-mono text-xs font-medium text-emerald-600">
                                                            RM {item.allowance.toLocaleString()}/mo
                                                        </span>
                                                    ) : null}
                                                    {item.vacancies && (
                                                        <span className="flex items-center gap-1 text-[11px] text-slate-400">
                                                            <Users size={9} /> {item.vacancies} spot{item.vacancies !== 1 ? "s" : ""}
                                                        </span>
                                                    )}
                                                    <button
                                                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-[#0f172a] text-white hover:bg-[#1e293b] transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2"
                                                        onClick={e => { e.stopPropagation(); router.push(getItemPath(item)) }}
                                                    >
                                                        Apply <ArrowUpRight size={11} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        )}

                        {/* View more */}
                        {!isLoading && displayItems.length >= 6 && (
                            <button
                                onClick={() => router.push(activeFilter === "all" || activeFilter === "jobs" ? "/jobs" : `/${activeFilter}`)}
                                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-slate-200 text-xs text-slate-400 hover:text-blue-600 hover:border-blue-300 bg-white transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2"
                            >
                                View more opportunities <ArrowUpRight size={12} />
                            </button>
                        )}
                    </div>

                    {/* ── Sidebar ── */}
                    <div className={`${mounted ? "fade-up s3" : "opacity-0"} w-full lg:w-60 shrink-0 flex flex-col gap-4 lg:sticky lg:top-6`}>

                        {/* Application status */}
                        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                            <h3 className="font-mono text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-4">My Applications</h3>
                            {appsLoading ? (
                                <div className="space-y-2">
                                    {Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton-shimmer h-6 rounded-lg" />)}
                                </div>
                            ) : appStatusCounts.total === 0 ? (
                                <p className="text-xs text-slate-400 text-center py-4">No applications yet.</p>
                            ) : (
                                <div className="flex flex-col gap-2.5">
                                    {/* Distribution bar */}
                                    <div className="flex h-1.5 rounded-full overflow-hidden bg-slate-100 mb-1.5">
                                        {statusSegments.filter(s => s.count > 0).map(({ label, count, bar }) => (
                                            <div
                                                key={label}
                                                className={bar}
                                                style={{ width: `${(count / appStatusCounts.total) * 100}%` }}
                                            />
                                        ))}
                                    </div>
                                    {statusSegments.map(({ label, count, dot, text }) => (
                                        <div key={label} className="flex items-center gap-3">
                                            <div className={`w-2 h-2 rounded-full ${dot} shrink-0`} />
                                            <span className="text-xs text-slate-500 flex-1">{label}</span>
                                            <span className={`font-mono text-xs font-medium tabular-nums ${text}`}>{count}</span>
                                        </div>
                                    ))}
                                    <div className="mt-1 pt-2.5 border-t border-slate-100 flex items-center justify-between">
                                        <span className="text-xs text-slate-400">Total</span>
                                        <span className="font-mono text-xs font-medium text-slate-700 tabular-nums">{appStatusCounts.total}</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Quick links */}
                        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                            <h3 className="font-mono text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-3">Quick Access</h3>
                            <div className="flex flex-col gap-1">
                                {[
                                    { label: "Browse All Jobs", path: "/jobs", icon: Briefcase, hover: "hover:text-blue-600 hover:bg-blue-50 hover:border-blue-200" },
                                    { label: "Browse All Projects", path: "/projects", icon: FolderKanban, hover: "hover:text-indigo-600 hover:bg-indigo-50 hover:border-indigo-200" },
                                    { label: "Browse Training", path: "/training", icon: BookOpen, hover: "hover:text-green-600 hover:bg-green-50 hover:border-green-200" },
                                    { label: "My Applications", path: "/applications", icon: CheckCircle2, hover: "hover:text-slate-700 hover:bg-slate-50 hover:border-slate-200" },
                                    { label: "My Profile", path: "/profile", icon: UserCircle, hover: "hover:text-slate-700 hover:bg-slate-50 hover:border-slate-200" },
                                ].map(({ label, path, icon: LinkIcon, hover }) => (
                                    <button
                                        key={path}
                                        onClick={() => router.push(path)}
                                        className={`flex items-center gap-2.5 px-3 py-2 rounded-lg border border-transparent ${hover} text-slate-400 text-xs transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400`}
                                    >
                                        <LinkIcon size={13} className="shrink-0" />
                                        <span className="flex-1 text-left">{label}</span>
                                        <ChevronRight size={12} />
                                    </button>
                                ))}
                            </div>
                        </div>
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
                            className="px-4 py-2 text-sm text-slate-500 hover:text-slate-700 transition-colors cursor-pointer rounded-lg border border-slate-200 hover:border-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2"
                        >
                            Later
                        </button>
                        <button
                            onClick={() => { setOpenDialog(false); router.push("/profile") }}
                            className="px-4 py-2 text-sm bg-[#0f172a] hover:bg-[#1e293b] text-white rounded-lg transition-colors shadow-sm cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2"
                        >
                            Complete Profile
                        </button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
