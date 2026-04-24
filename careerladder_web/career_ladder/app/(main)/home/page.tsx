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
    ArrowUpRight, Building2, ChevronRight, Sparkles, BookOpen, CheckCircle2
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
            iconWrap: "bg-blue-50 border border-blue-100",
            iconColor: "text-blue-600",
        },
        project: {
            label: "Project",
            icon: FolderKanban,
            badge: "bg-indigo-50 text-indigo-700 border-indigo-200",
            iconWrap: "bg-indigo-50 border border-indigo-100",
            iconColor: "text-indigo-600",
        },
        training: {
            label: "Training",
            icon: BookOpen,
            badge: "bg-green-50 text-green-700 border-green-200",
            iconWrap: "bg-green-50 border border-green-100",
            iconColor: "text-green-600",
        },
    }

    return (
        <div className={`${playfair.variable} ${dmMono.variable} min-h-screen bg-slate-50`}>
            <style>{`
                @keyframes fadeUp {
                    from { opacity: 0; transform: translateY(16px); }
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
                .fade-up       { animation: fadeUp 0.5s ease both; }
                .s1 { animation-delay: 0.05s; }
                .s2 { animation-delay: 0.10s; }
                .s3 { animation-delay: 0.14s; }
                .s4 { animation-delay: 0.18s; }
                .s5 { animation-delay: 0.22s; }
                .s6 { animation-delay: 0.26s; }
                .s7 { animation-delay: 0.30s; }
                .row-item { transition: transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease; }
                .row-item:hover { transform: translateX(3px); }
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
                @keyframes breath-glow {
                    0%, 100% { transform: scale(1);    opacity: 1; }
                    50%       { transform: scale(1.14); opacity: 0.45; }
                }
                @keyframes breath-ring1 {
                    0%, 100% { transform: scale(1);    opacity: 0.55; }
                    50%       { transform: scale(1.08); opacity: 0.2; }
                }
                @keyframes breath-ring2 {
                    0%, 100% { transform: scale(1);    opacity: 0.65; }
                    50%       { transform: scale(1.05); opacity: 0.3; }
                }
                @keyframes breath-ring3 {
                    0%, 100% { transform: scale(1);    opacity: 0.75; }
                    50%       { transform: scale(1.03); opacity: 0.45; }
                }
                @keyframes breath-center {
                    0%, 100% { transform: scale(1);    box-shadow: 0 0 32px rgba(99,102,241,0.45), 0 0 72px rgba(99,102,241,0.15); }
                    50%       { transform: scale(0.95); box-shadow: 0 0 52px rgba(99,102,241,0.65), 0 0 100px rgba(99,102,241,0.25); }
                }
            `}</style>

            {/* ── Hero ── */}
            <div className="relative overflow-hidden bg-white border-b border-slate-200">
                <div className="absolute inset-0 opacity-[0.035]" style={{
                    backgroundImage: `linear-gradient(#93c5fd 1px, transparent 1px), linear-gradient(90deg, #93c5fd 1px, transparent 1px)`,
                    backgroundSize: "52px 52px"
                }} />
                <div className="absolute -top-40 -right-40 w-md h-md rounded-full opacity-[0.15]" style={{
                    background: "radial-gradient(circle, #bfdbfe 0%, transparent 65%)"
                }} />

                <div className="relative max-w-7xl mx-auto px-6 pt-10 pb-9">
                    {/* Date */}
                    <div className={`${mounted ? "fade-up" : "opacity-0"} flex items-center gap-2 mb-5`}>
                        <span className="relative live-dot w-2 h-2 rounded-full bg-green-400 inline-block" />
                        <span className="font-mono text-[11px] text-slate-400 uppercase tracking-widest">{today}</span>
                    </div>

                    {/* Headline + Indigo Breath */}
                    <div className={`${mounted ? "fade-up s1" : "opacity-0"} mb-2 flex items-start justify-between gap-8`}>
                        {/* Left: text */}
                        <div>
                            <h1 className="font-playfair text-4xl sm:text-5xl font-semibold text-slate-800 leading-tight">
                                {getGreeting()},&nbsp;<span className="text-blue-600">{firstName}.</span>
                            </h1>
                            <p className="mt-3 text-sm text-slate-500 max-w-xl leading-relaxed">
                                Explore open jobs, projects, and training programs — all in one place. Your next opportunity is listed below.
                            </p>
                        </div>

                        {/* Right: Indigo Breath */}
                        <div className="hidden md:flex relative items-center justify-center shrink-0 w-48 h-48">
                            {/* Glow backdrop */}
                            <div className="absolute inset-0 rounded-full" style={{
                                background: "radial-gradient(circle at center, rgba(99,102,241,0.13) 0%, transparent 68%)",
                                animation: "breath-glow 4s ease-in-out infinite"
                            }} />
                            {/* Ring 1 — outermost */}
                            <div className="absolute rounded-full border border-indigo-200/50" style={{
                                inset: "4px",
                                animation: "breath-ring1 4s ease-in-out infinite"
                            }} />
                            {/* Ring 2 */}
                            <div className="absolute rounded-full border border-indigo-300/55" style={{
                                inset: "22px",
                                animation: "breath-ring2 4s ease-in-out infinite 0.8s"
                            }} />
                            {/* Ring 3 */}
                            <div className="absolute rounded-full border border-indigo-400/60" style={{
                                inset: "40px",
                                animation: "breath-ring3 4s ease-in-out infinite 1.6s"
                            }} />
                            {/* Center orb */}
                            <div className="relative z-10 w-20 h-20 rounded-full bg-indigo-600 flex flex-col items-center justify-center" style={{
                                animation: "breath-center 4s ease-in-out infinite 2s"
                            }}>
                                <p className="font-mono text-2xl font-bold text-white leading-none">
                                    {isLoading ? "—" : jobs.length + projects.length + openTrainings.length}
                                </p>
                                <p className="text-[9px] text-indigo-200 mt-1 tracking-widest uppercase">open</p>
                            </div>
                            {/* Orbital dots */}
                            <div className="absolute w-1.5 h-1.5 rounded-full bg-indigo-400/70" style={{ top: "14px", left: "50%", transform: "translateX(-50%)" }} />
                            <div className="absolute w-1 h-1 rounded-full bg-indigo-300/60" style={{ bottom: "18px", right: "32px" }} />
                            <div className="absolute w-1 h-1 rounded-full bg-indigo-500/55" style={{ left: "18px", top: "58%" }} />
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
                                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border ${activeFilter === pill.key
                                    ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                                    : "bg-white text-slate-500 border-slate-200 hover:border-slate-300 hover:text-slate-700"
                                    }`}
                            >
                                {pill.label}
                                {!isLoading && (
                                    <span className={`font-mono text-[11px] px-1.5 py-0.5 rounded-full ${activeFilter === pill.key
                                        ? "bg-white/20 text-white"
                                        : "bg-slate-100 text-slate-500"
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
                    <div className="flex-1 min-w-0 flex flex-col gap-5">

                        {/* AI Picks */}
                        {(aiLoading || (!aiLoading && aiPicks.length > 0)) && (
                            <div className={`${mounted ? "fade-up s2" : "opacity-0"}`}>
                                <div className="flex items-center gap-2 mb-3">
                                    <Sparkles size={13} className="text-indigo-500" />
                                    <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wide">AI Picks for You</span>
                                </div>
                                {aiLoading ? (
                                    <div className="flex flex-col gap-2.5">
                                        {[0, 1].map(i => <div key={i} className="skeleton-shimmer rounded-2xl h-18" />)}
                                    </div>
                                ) : (
                                    <div className="flex flex-col gap-2">
                                        {aiPicks.map((item, idx) => {
                                            const cfg = typeConfig[item.type]
                                            const Icon = cfg.icon
                                            return (
                                                <div
                                                    key={item.id}
                                                    onClick={() => router.push(getItemPath(item))}
                                                    className={`row-item ${mounted ? `fade-up s${Math.min(idx + 3, 6)}` : "opacity-0"} group bg-white border-2 border-indigo-200 hover:border-indigo-400 hover:shadow-md hover:shadow-indigo-100/60 rounded-2xl cursor-pointer p-4`}
                                                >
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center shrink-0">
                                                            <Icon size={15} className="text-indigo-600" />
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
                                                                    <span key={tag} className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 border border-slate-200 capitalize">
                                                                        {tag}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        </div>
                                                        <button
                                                            className="shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
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
                        <div className="flex items-center justify-between">
                            <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
                                {activeFilter === "all" ? "Featured Opportunities" :
                                    activeFilter === "jobs" ? "Featured Jobs" :
                                        activeFilter === "projects" ? "Featured Projects" :
                                            "Training Programs"}
                            </h2>
                            <button
                                onClick={() => router.push(activeFilter === "all" || activeFilter === "jobs" ? "/jobs" : `/${activeFilter}`)}
                                className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 transition-colors"
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
                            <div className="flex flex-col items-center justify-center py-20 gap-3">
                                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">
                                    <Briefcase size={20} className="text-slate-300" />
                                </div>
                                <p className="text-sm text-slate-400">No opportunities found.</p>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-2">
                                {displayItems.map((item, idx) => {
                                    const cfg = typeConfig[item.type]
                                    const Icon = cfg.icon
                                    return (
                                        <div
                                            key={item.id}
                                            onClick={() => router.push(getItemPath(item))}
                                            className={`row-item ${mounted ? `fade-up s${Math.min(idx + 1, 6)}` : "opacity-0"} group relative bg-white border border-slate-200 hover:border-slate-300 hover:shadow-md hover:shadow-slate-100 rounded-2xl cursor-pointer p-5 overflow-hidden`}
                                        >
                                            <div className="flex items-center gap-4">
                                                {/* Icon */}
                                                <div className={`w-10 h-10 rounded-xl ${cfg.iconWrap} flex items-center justify-center shrink-0`}>
                                                    <Icon size={15} className={cfg.iconColor} />
                                                </div>

                                                {/* Content */}
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="text-sm font-semibold text-slate-800 group-hover:text-slate-900 truncate mb-0.5">
                                                        {item.title}
                                                    </h3>
                                                    {item.company_name && (
                                                        <p className="text-xs text-slate-400 flex items-center gap-1 mb-2">
                                                            <Building2 size={10} /> {item.company_name}
                                                        </p>
                                                    )}
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
                                                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-900 text-white hover:bg-slate-700 transition-colors"
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
                                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-slate-200 text-xs text-slate-400 hover:text-blue-600 hover:border-blue-300 bg-white transition-all"
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
                                    {[
                                        { label: "Pending", count: appStatusCounts.pending, dot: "bg-yellow-400", text: "text-yellow-600" },
                                        { label: "Shortlisted", count: appStatusCounts.shortlisted, dot: "bg-purple-400", text: "text-purple-600" },
                                        { label: "Accepted", count: appStatusCounts.accepted, dot: "bg-green-400", text: "text-green-600" },
                                        { label: "Rejected", count: appStatusCounts.rejected, dot: "bg-red-400", text: "text-red-500" },
                                    ].map(({ label, count, dot, text }) => (
                                        <div key={label} className="flex items-center gap-3">
                                            <div className={`w-2 h-2 rounded-full ${dot} shrink-0`} />
                                            <span className="text-xs text-slate-500 flex-1">{label}</span>
                                            <span className={`font-mono text-xs font-medium ${text}`}>{count}</span>
                                        </div>
                                    ))}
                                    <div className="mt-1 pt-2.5 border-t border-slate-100 flex items-center justify-between">
                                        <span className="text-xs text-slate-400">Total</span>
                                        <span className="font-mono text-xs font-medium text-slate-700">{appStatusCounts.total}</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Quick links */}
                        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                            <h3 className="font-mono text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-3">Quick Access</h3>
                            <div className="flex flex-col gap-1">
                                {[
                                    { label: "Browse All Jobs", path: "/jobs", hover: "hover:text-blue-600 hover:bg-blue-50 hover:border-blue-200" },
                                    { label: "Browse All Projects", path: "/projects", hover: "hover:text-indigo-600 hover:bg-indigo-50 hover:border-indigo-200" },
                                    { label: "Browse Training", path: "/training", hover: "hover:text-green-600 hover:bg-green-50 hover:border-green-200" },
                                    { label: "My Applications", path: "/applications", hover: "hover:text-slate-700 hover:bg-slate-50 hover:border-slate-200" },
                                    { label: "My Profile", path: "/profile", hover: "hover:text-slate-700 hover:bg-slate-50 hover:border-slate-200" },
                                ].map(({ label, path, hover }) => (
                                    <button
                                        key={path}
                                        onClick={() => router.push(path)}
                                        className={`flex items-center justify-between px-3 py-2 rounded-lg border border-transparent ${hover} text-slate-400 text-xs transition-all`}
                                    >
                                        {label}
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
