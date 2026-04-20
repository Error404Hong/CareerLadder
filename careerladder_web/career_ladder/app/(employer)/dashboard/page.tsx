"use client"

import { useUser } from "@clerk/nextjs"
import { getUserById, getCompanyReviews as getCompanyReviewsAPI } from "@/app/api/user"
import { getCompanyProjects, getProjectAppByCom, getCompanyReviews } from "@/app/api/project"
import { getJobsByCompany, getAllJobAppByCom } from "@/app/api/job"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Project, ProjectApplication, ProjectReview, Job, JobApplication, CompanyReview } from "@/types"
import { format, parseISO } from "date-fns"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Skeleton } from "@/components/ui/skeleton"
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer,
    PieChart, Pie, Cell, AreaChart, Area, Tooltip,
} from "recharts"
import {
    FolderOpen, Users, Star, TrendingUp, CheckCircle2,
    Clock, Lock, Briefcase, FileText,
} from "lucide-react"

// ─── Status configs ───────────────────────────────────────────────
const PROJECT_STATUS_CFG: Record<string, { label: string; color: string; badgeCls: string }> = {
    open:        { label: "Open",        color: "#2563eb", badgeCls: "bg-blue-100 text-blue-700 border-blue-200" },
    in_progress: { label: "In Progress", color: "#f59e0b", badgeCls: "bg-amber-100 text-amber-700 border-amber-200" },
    completed:   { label: "Completed",   color: "#22c55e", badgeCls: "bg-green-100 text-green-700 border-green-200" },
    closed:      { label: "Closed",      color: "#94a3b8", badgeCls: "bg-slate-100 text-slate-500 border-slate-200" },
}

const JOB_STATUS_CFG: Record<string, { label: string; color: string; badgeCls: string }> = {
    open:   { label: "Open",   color: "#2563eb", badgeCls: "bg-blue-100 text-blue-700 border-blue-200" },
    filled: { label: "Filled", color: "#22c55e", badgeCls: "bg-green-100 text-green-700 border-green-200" },
    closed: { label: "Closed", color: "#94a3b8", badgeCls: "bg-slate-100 text-slate-500 border-slate-200" },
}

const APP_STATUS_COLORS: Record<string, string> = {
    pending:  "#f59e0b",
    accepted: "#22c55e",
    rejected: "#ef4444",
}

// ─── Count-up hook (StrictMode-safe) ─────────────────────────────
function useCountUp(target: number, duration = 1200, delay = 0) {
    const [count, setCount] = useState(0)
    useEffect(() => {
        if (target === 0) return
        let cancelled = false
        const timeout = setTimeout(() => {
            const start = performance.now()
            const tick = (now: number) => {
                if (cancelled) return
                const progress = Math.min((now - start) / duration, 1)
                const eased = 1 - Math.pow(1 - progress, 3)
                setCount(Math.round(eased * target))
                if (progress < 1) requestAnimationFrame(tick)
                else setCount(target)
            }
            requestAnimationFrame(tick)
        }, delay)
        return () => { cancelled = true; clearTimeout(timeout) }
    }, [target, duration, delay])
    return count
}

// ─── Hero stat chip ───────────────────────────────────────────────
function HeroStat({ label, value, sub, delay = 0 }: {
    label: string; value: number; sub?: string; delay?: number
}) {
    const count = useCountUp(value, 1200, delay)
    return (
        <div className="flex flex-col gap-1 opacity-0" style={{ animation: `fadeSlideUp 0.5s ease-out ${delay + 150}ms forwards` }}>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-sky-300/70">{label}</p>
            <p className="text-3xl font-bold text-white font-mono tabular-nums leading-none">{count.toLocaleString()}</p>
            {sub && <p className="text-xs text-sky-200/50 mt-0.5">{sub}</p>}
        </div>
    )
}

// ─── Enhanced stat card ───────────────────────────────────────────
function StatCard({ icon, label, value, sub, accentColor, delay = 0 }: {
    icon: React.ReactNode; label: string; value: string | number
    sub?: string; accentColor: string; delay?: number
}) {
    const numeric = typeof value === "number" ? value : null
    const counted = useCountUp(numeric ?? 0, 1100, delay + 300)
    const display = numeric !== null ? counted : value

    return (
        <div
            className="group relative rounded-2xl bg-white border border-slate-100 shadow-sm overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 opacity-0"
            style={{ animation: `fadeSlideUp 0.45s ease-out ${delay}ms forwards` }}
        >
            <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl" style={{ background: `linear-gradient(90deg, ${accentColor}, ${accentColor}88)` }} />
            <div className="px-5 py-4 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${accentColor}15` }}>
                        <div style={{ color: accentColor }}>{icon}</div>
                    </div>
                    {sub && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full border" style={{ color: accentColor, borderColor: `${accentColor}40`, backgroundColor: `${accentColor}10` }}>
                            {sub}
                        </span>
                    )}
                </div>
                <div>
                    <p className="text-2xl font-bold text-[#0f172a] leading-none font-mono tabular-nums">{display}</p>
                    <p className="text-[11px] font-medium text-slate-400 mt-1.5 uppercase tracking-wide">{label}</p>
                </div>
                <div className="h-px w-full bg-slate-100">
                    <div className="h-px rounded-full w-2/3 transition-all duration-500 group-hover:w-full" style={{ backgroundColor: `${accentColor}50` }} />
                </div>
            </div>
        </div>
    )
}

// ─── Section divider ──────────────────────────────────────────────
function SectionDivider({ icon, title, description, accentColor, delay = 0 }: {
    icon: React.ReactNode; title: string; description: string; accentColor: string; delay?: number
}) {
    return (
        <div className="flex items-center gap-4 opacity-0" style={{ animation: `fadeSlideUp 0.4s ease-out ${delay}ms forwards` }}>
            <div className="w-1 h-9 rounded-full shrink-0" style={{ backgroundColor: accentColor }} />
            <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${accentColor}15`, color: accentColor }}>
                    {icon}
                </div>
                <div>
                    <h2 className="text-base font-bold text-[#0f172a]">{title}</h2>
                    <p className="text-xs text-slate-400">{description}</p>
                </div>
            </div>
            <div className="flex-1 h-px bg-gradient-to-r from-slate-200 to-transparent ml-2" />
        </div>
    )
}

// ─── Chart card wrapper ───────────────────────────────────────────
function ChartCard({ title, description, children, delay = 0 }: {
    title: string; description?: string; children: React.ReactNode; delay?: number
}) {
    return (
        <Card
            className="rounded-2xl border border-slate-100 shadow-sm opacity-0"
            style={{ animation: `fadeSlideUp 0.45s ease-out ${delay}ms forwards` }}
        >
            <CardHeader className="px-5 pt-4 pb-2">
                <CardTitle className="text-sm font-semibold text-[#0f172a]">{title}</CardTitle>
                {description && <CardDescription className="text-xs text-slate-400 mt-0.5">{description}</CardDescription>}
            </CardHeader>
            <CardContent className="px-5 pb-4">{children}</CardContent>
        </Card>
    )
}

// ─── Pulse dot ───────────────────────────────────────────────────
function PulseDot({ color }: { color: string }) {
    return (
        <span className="relative flex h-2 w-2 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: color }} />
            <span className="relative inline-flex rounded-full h-2 w-2" style={{ backgroundColor: color }} />
        </span>
    )
}

// ─── Chart configs ────────────────────────────────────────────────
const countConfig: ChartConfig = { count: { label: "Count" } }
const ratingChartConfig: ChartConfig = { count: { label: "Reviews", color: "#f59e0b" } }

// ─── Main ────────────────────────────────────────────────────────
export default function Dashboard() {
    const router = useRouter()
    const { user } = useUser()
    const [openDialog, setOpenDialog] = useState(false)
    const [isLoading, setIsLoading] = useState(true)

    const [projects, setProjects]           = useState<Project[]>([])
    const [projApps, setProjApps]           = useState<ProjectApplication[]>([])
    const [reviews, setReviews]             = useState<ProjectReview[]>([])
    const [companyReviews, setCompanyReviews] = useState<CompanyReview[]>([])
    const [jobs, setJobs]                   = useState<Job[]>([])
    const [jobApps, setJobApps]             = useState<JobApplication[]>([])

    useEffect(() => {
        if (!user) return
        const load = async () => {
            try {
                const userData = await getUserById(user.id)
                if (userData.data.profile_completed == "0") setOpenDialog(true)
                const [projRes, projAppRes, revRes, cRevRes, jobRes, jobAppRes] = await Promise.all([
                    getCompanyProjects(user.id),
                    getProjectAppByCom(user.id),
                    getCompanyReviews(user.id),
                    getCompanyReviewsAPI(user.id),
                    getJobsByCompany(user.id),
                    getAllJobAppByCom(user.id),
                ])
                if (projRes.success)    setProjects(projRes.data)
                if (projAppRes.success) setProjApps(projAppRes.data)
                if (revRes.success)     setReviews(revRes.data)
                if (cRevRes.success)    setCompanyReviews(cRevRes.data)
                if (jobRes.success)     setJobs(jobRes.data)
                if (jobAppRes.success)  setJobApps(jobAppRes.data)
            } finally {
                setIsLoading(false)
            }
        }
        load()
    }, [user])

    // ── Derived: Projects ─────────────────────────────────────────
    const avgRating      = reviews.length ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : "—"
    const activeProjects = projects.filter(p => p.status === "in_progress").length
    const projectsByStatus = Object.entries(PROJECT_STATUS_CFG).map(([key, cfg]) => ({
        status: cfg.label, count: projects.filter(p => p.status === key).length, fill: cfg.color,
    }))
    const projAppStatusGroups = ["pending", "accepted", "rejected"].map(s => ({
        name: s.charAt(0).toUpperCase() + s.slice(1),
        value: projApps.filter(a => a.application_status === s).length,
        color: APP_STATUS_COLORS[s],
    })).filter(g => g.value > 0)
    const projAppsByMonth: Record<string, number> = {}
    projApps.forEach(a => {
        const m = format(parseISO(a.applied_at), "MMM yy")
        projAppsByMonth[m] = (projAppsByMonth[m] ?? 0) + 1
    })
    const projAppTrend = Object.entries(projAppsByMonth).slice(-6).map(([month, count]) => ({ month, count }))
    const recentProjects = [...projects].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 5)

    // ── Derived: Jobs ─────────────────────────────────────────────
    const avgCompanyRating = companyReviews.length ? (companyReviews.reduce((s, r) => s + r.rating, 0) / companyReviews.length).toFixed(1) : "—"
    const activeJobs = jobs.filter(j => j.status === "open").length
    const jobsByStatus = Object.entries(JOB_STATUS_CFG).map(([key, cfg]) => ({
        status: cfg.label, count: jobs.filter(j => j.status === key).length, fill: cfg.color,
    }))
    const jobAppStatusGroups = ["pending", "accepted", "rejected"].map(s => ({
        name: s.charAt(0).toUpperCase() + s.slice(1),
        value: jobApps.filter(a => a.application_status === s).length,
        color: APP_STATUS_COLORS[s],
    })).filter(g => g.value > 0)
    const jobAppsByMonth: Record<string, number> = {}
    jobApps.forEach(a => {
        const m = format(parseISO(a.applied_at), "MMM yy")
        jobAppsByMonth[m] = (jobAppsByMonth[m] ?? 0) + 1
    })
    const jobAppTrend = Object.entries(jobAppsByMonth).slice(-6).map(([month, count]) => ({ month, count }))
    const recentJobs = [...jobs].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 5)
    const companyRatingDist = [5, 4, 3, 2, 1].map(star => ({
        star: `${star}★`, count: companyReviews.filter(r => r.rating === star).length,
    }))

    const totalApplications = projApps.length + jobApps.length
    const totalActive = activeProjects + activeJobs

    return (
        <>
            <style>{`
                @keyframes fadeSlideUp {
                    from { opacity: 0; transform: translateY(14px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to   { opacity: 1; }
                }
                @keyframes shimmer {
                    0%   { background-position: -200% 0; }
                    100% { background-position: 200% 0; }
                }
            `}</style>

            <div className="min-h-screen bg-slate-50">
                <div className="max-w-6xl mx-auto px-6 py-6 flex flex-col gap-8">

                    {/* ── Hero Banner ── */}
                    <div
                        className="relative rounded-2xl overflow-hidden opacity-0"
                        style={{
                            background: "linear-gradient(135deg, #020d18 0%, #071828 40%, #0c2340 100%)",
                            animation: "fadeIn 0.6s ease-out 0ms forwards",
                        }}
                    >
                        {/* Warm radial glow */}
                        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 65% 90% at 85% 10%, rgba(56,189,248,0.18) 0%, transparent 65%), radial-gradient(ellipse 40% 50% at 15% 80%, rgba(14,165,233,0.10) 0%, transparent 60%)" }} />
                        {/* Dot grid */}
                        <div className="absolute inset-0 pointer-events-none opacity-[0.05]" style={{ backgroundImage: "radial-gradient(circle, #7dd3fc 1px, transparent 1px)", backgroundSize: "22px 22px" }} />
                        {/* Diagonal accent line */}
                        <div className="absolute top-0 right-32 w-px h-full bg-gradient-to-b from-transparent via-sky-400/20 to-transparent pointer-events-none" />

                        <div className="relative px-8 py-7">
                            <div className="flex items-start justify-between gap-4 flex-wrap mb-8">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        {totalActive > 0 && <PulseDot color="#f59e0b" />}
                                        <p className="text-[10px] font-semibold uppercase tracking-widest text-sky-400/60">Employer Console</p>
                                    </div>
                                    <h1 className="text-2xl font-bold text-white tracking-tight">
                                        Welcome back, {user?.firstName ?? "…"} 👋
                                    </h1>
                                    <p className="text-xs text-sky-200/40 mt-1">
                                        {new Date().toLocaleDateString("en-MY", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2 opacity-0" style={{ animation: "fadeIn 0.5s ease-out 600ms forwards" }}>
                                    <div className="text-right">
                                        <p className="text-[10px] text-sky-300/50 uppercase tracking-wider">Platform Activity</p>
                                        <p className="text-xs text-amber-200/70 mt-0.5">{projects.length + jobs.length} total listings</p>
                                    </div>
                                </div>
                            </div>

                            {isLoading ? (
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                                    {Array.from({ length: 4 }).map((_, i) => (
                                        <div key={i} className="flex flex-col gap-2">
                                            <Skeleton className="h-3 w-20 rounded bg-sky-900/40" />
                                            <Skeleton className="h-8 w-12 rounded bg-sky-900/40" />
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                                    <HeroStat label="Total Projects"    value={projects.length}      sub={`${activeProjects} active`}         delay={0} />
                                    <HeroStat label="Total Jobs"        value={jobs.length}          sub={`${activeJobs} open`}               delay={80} />
                                    <HeroStat label="Applications"      value={totalApplications}    sub={`proj + job combined`}              delay={160} />
                                    <HeroStat label="Active Listings"   value={totalActive}          sub={`in progress / open`}               delay={240} />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ═══════════════ PROJECTS SECTION ═══════════════ */}

                    <SectionDivider
                        icon={<FolderOpen size={15} />}
                        title="Projects"
                        description="Overview of your active and completed projects"
                        accentColor="#d97706"
                        delay={350}
                    />

                    {/* Project stat cards */}
                    {isLoading ? (
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-2xl" />)}
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            <StatCard icon={<FolderOpen size={16} />} label="Total Projects"       value={projects.length}  accentColor="#2563eb" delay={400} />
                            <StatCard icon={<Clock size={16} />}      label="Active Projects"      value={activeProjects}   accentColor="#d97706" sub="In progress" delay={450} />
                            <StatCard icon={<Users size={16} />}      label="Project Applications" value={projApps.length}  accentColor="#7c3aed" delay={500} />
                            <StatCard icon={<Star size={16} />}       label="Avg Project Rating"   value={avgRating}        accentColor="#d97706" sub={`${reviews.length} reviews`} delay={550} />
                        </div>
                    )}

                    {/* Project charts */}
                    {isLoading ? (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                            {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-56 rounded-2xl" />)}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                            {/* Projects by status */}
                            <ChartCard title="Projects by Status" description="Breakdown across all project stages" delay={580}>
                                <ChartContainer config={countConfig} className="h-48 w-full">
                                    <BarChart data={projectsByStatus} barSize={32}>
                                        <defs>
                                            {projectsByStatus.map((e, i) => (
                                                <linearGradient key={i} id={`projBar${i}`} x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="0%" stopColor={e.fill} stopOpacity={1} />
                                                    <stop offset="100%" stopColor={e.fill} stopOpacity={0.6} />
                                                </linearGradient>
                                            ))}
                                        </defs>
                                        <CartesianGrid strokeDasharray="4 4" stroke="#f1f5f9" vertical={false} />
                                        <XAxis dataKey="status" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                                        <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} width={20} />
                                        <ChartTooltip content={<ChartTooltipContent />} />
                                        <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                                            {projectsByStatus.map((e, i) => <Cell key={i} fill={`url(#projBar${i})`} />)}
                                        </Bar>
                                    </BarChart>
                                </ChartContainer>
                            </ChartCard>

                            {/* Project application trend */}
                            <ChartCard title="Project Application Trend" description="Monthly project applications received" delay={620}>
                                <ChartContainer config={countConfig} className="h-48 w-full">
                                    <AreaChart data={projAppTrend}>
                                        <defs>
                                            <linearGradient id="projGrad" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%"  stopColor="#d97706" stopOpacity={0.25} />
                                                <stop offset="95%" stopColor="#d97706" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="4 4" stroke="#f1f5f9" vertical={false} />
                                        <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                                        <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} width={20} />
                                        <ChartTooltip content={<ChartTooltipContent />} />
                                        <Area dataKey="count" stroke="#d97706" strokeWidth={2.5} fill="url(#projGrad)" dot={{ r: 3.5, fill: "#d97706", strokeWidth: 0 }} activeDot={{ r: 5.5, fill: "#d97706" }} />
                                    </AreaChart>
                                </ChartContainer>
                                {projAppTrend.length === 0 && <p className="text-xs text-slate-400 text-center -mt-2">No data yet</p>}
                            </ChartCard>

                            {/* App status + recent projects */}
                            <div className="flex flex-col gap-4">
                                <ChartCard title="Project App Status" delay={660}>
                                    <div className="flex items-center gap-3">
                                        {projAppStatusGroups.length === 0 ? (
                                            <p className="text-xs text-slate-400 py-3">No applications yet</p>
                                        ) : (
                                            <>
                                                <ResponsiveContainer width={90} height={90}>
                                                    <PieChart>
                                                        <Pie data={projAppStatusGroups} cx="50%" cy="50%" innerRadius={26} outerRadius={42} dataKey="value" paddingAngle={3} strokeWidth={2} stroke="#f8fafc">
                                                            {projAppStatusGroups.map((e, i) => <Cell key={i} fill={e.color} />)}
                                                        </Pie>
                                                        <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                                                    </PieChart>
                                                </ResponsiveContainer>
                                                <div className="flex flex-col gap-2 flex-1">
                                                    {projAppStatusGroups.map(g => (
                                                        <div key={g.name} className="flex items-center justify-between text-xs">
                                                            <div className="flex items-center gap-1.5">
                                                                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: g.color }} />
                                                                <span className="text-slate-500">{g.name}</span>
                                                            </div>
                                                            <span className="font-semibold text-[#0f172a] font-mono">{g.value}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </ChartCard>

                                <ChartCard title="Recent Projects" delay={700}>
                                    <div className="flex flex-col divide-y divide-slate-50">
                                        {recentProjects.length === 0 ? (
                                            <p className="text-xs text-slate-400 py-3 text-center">No projects yet</p>
                                        ) : recentProjects.map(p => {
                                            const cfg = PROJECT_STATUS_CFG[p.status]
                                            const Icon = p.status === "completed" ? CheckCircle2 : p.status === "closed" ? Lock : p.status === "in_progress" ? TrendingUp : FolderOpen
                                            return (
                                                <div key={p.id} className="flex items-center justify-between gap-2 py-2.5 group cursor-pointer">
                                                    <div className="flex items-center gap-2 min-w-0">
                                                        <Icon size={11} className="shrink-0 transition-transform group-hover:scale-110" style={{ color: cfg?.color }} />
                                                        <span className="text-xs text-slate-600 truncate group-hover:text-[#0f172a] transition-colors">{p.title}</span>
                                                    </div>
                                                    <Badge className={`text-[10px] px-1.5 py-0 border shrink-0 ${cfg?.badgeCls}`}>{cfg?.label}</Badge>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </ChartCard>
                            </div>
                        </div>
                    )}

                    {/* ═══════════════ JOBS SECTION ═══════════════ */}

                    <SectionDivider
                        icon={<Briefcase size={15} />}
                        title="Job Listings"
                        description="Overview of your posted jobs and applicant activity"
                        accentColor="#0891b2"
                        delay={750}
                    />

                    {/* Job stat cards */}
                    {isLoading ? (
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-2xl" />)}
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            <StatCard icon={<Briefcase size={16} />} label="Total Job Listings"  value={jobs.length}       accentColor="#0891b2" delay={800} />
                            <StatCard icon={<Clock size={16} />}     label="Active Listings"     value={activeJobs}        accentColor="#16a34a" sub="Open" delay={840} />
                            <StatCard icon={<FileText size={16} />}  label="Job Applications"    value={jobApps.length}    accentColor="#e11d48" delay={880} />
                            <StatCard icon={<Star size={16} />}      label="Avg Company Rating"  value={avgCompanyRating}  accentColor="#d97706" sub={`${companyReviews.length} reviews`} delay={920} />
                        </div>
                    )}

                    {/* Job charts */}
                    {isLoading ? (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                            {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-56 rounded-2xl" />)}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                            {/* Jobs by status */}
                            <ChartCard title="Jobs by Status" description="Breakdown across all job listing stages" delay={950}>
                                <ChartContainer config={countConfig} className="h-48 w-full">
                                    <BarChart data={jobsByStatus} barSize={36}>
                                        <defs>
                                            {jobsByStatus.map((e, i) => (
                                                <linearGradient key={i} id={`jobBar${i}`} x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="0%" stopColor={e.fill} stopOpacity={1} />
                                                    <stop offset="100%" stopColor={e.fill} stopOpacity={0.6} />
                                                </linearGradient>
                                            ))}
                                        </defs>
                                        <CartesianGrid strokeDasharray="4 4" stroke="#f1f5f9" vertical={false} />
                                        <XAxis dataKey="status" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                                        <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} width={20} />
                                        <ChartTooltip content={<ChartTooltipContent />} />
                                        <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                                            {jobsByStatus.map((e, i) => <Cell key={i} fill={`url(#jobBar${i})`} />)}
                                        </Bar>
                                    </BarChart>
                                </ChartContainer>
                            </ChartCard>

                            {/* Job application trend */}
                            <ChartCard title="Job Application Trend" description="Monthly job applications received" delay={990}>
                                <ChartContainer config={countConfig} className="h-48 w-full">
                                    <AreaChart data={jobAppTrend}>
                                        <defs>
                                            <linearGradient id="jobGrad" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%"  stopColor="#0891b2" stopOpacity={0.25} />
                                                <stop offset="95%" stopColor="#0891b2" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="4 4" stroke="#f1f5f9" vertical={false} />
                                        <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                                        <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} width={20} />
                                        <ChartTooltip content={<ChartTooltipContent />} />
                                        <Area dataKey="count" stroke="#0891b2" strokeWidth={2.5} fill="url(#jobGrad)" dot={{ r: 3.5, fill: "#0891b2", strokeWidth: 0 }} activeDot={{ r: 5.5, fill: "#0891b2" }} />
                                    </AreaChart>
                                </ChartContainer>
                                {jobAppTrend.length === 0 && <p className="text-xs text-slate-400 text-center -mt-2">No data yet</p>}
                            </ChartCard>

                            {/* Job app status + recent jobs */}
                            <div className="flex flex-col gap-4">
                                <ChartCard title="Job App Status" delay={1020}>
                                    <div className="flex items-center gap-3">
                                        {jobAppStatusGroups.length === 0 ? (
                                            <p className="text-xs text-slate-400 py-3">No applications yet</p>
                                        ) : (
                                            <>
                                                <ResponsiveContainer width={90} height={90}>
                                                    <PieChart>
                                                        <Pie data={jobAppStatusGroups} cx="50%" cy="50%" innerRadius={26} outerRadius={42} dataKey="value" paddingAngle={3} strokeWidth={2} stroke="#f8fafc">
                                                            {jobAppStatusGroups.map((e, i) => <Cell key={i} fill={e.color} />)}
                                                        </Pie>
                                                        <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                                                    </PieChart>
                                                </ResponsiveContainer>
                                                <div className="flex flex-col gap-2 flex-1">
                                                    {jobAppStatusGroups.map(g => (
                                                        <div key={g.name} className="flex items-center justify-between text-xs">
                                                            <div className="flex items-center gap-1.5">
                                                                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: g.color }} />
                                                                <span className="text-slate-500">{g.name}</span>
                                                            </div>
                                                            <span className="font-semibold text-[#0f172a] font-mono">{g.value}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </ChartCard>

                                <ChartCard title="Recent Job Listings" delay={1060}>
                                    <div className="flex flex-col divide-y divide-slate-50">
                                        {recentJobs.length === 0 ? (
                                            <p className="text-xs text-slate-400 py-3 text-center">No job listings yet</p>
                                        ) : recentJobs.map(j => {
                                            const cfg = JOB_STATUS_CFG[j.status]
                                            return (
                                                <div key={j.id} className="flex items-center justify-between gap-2 py-2.5 group cursor-pointer">
                                                    <div className="flex items-center gap-2 min-w-0">
                                                        <Briefcase size={11} className="shrink-0 transition-transform group-hover:scale-110" style={{ color: cfg?.color }} />
                                                        <span className="text-xs text-slate-600 truncate group-hover:text-[#0f172a] transition-colors">{j.title}</span>
                                                    </div>
                                                    <Badge className={`text-[10px] px-1.5 py-0 border shrink-0 ${cfg?.badgeCls}`}>{cfg?.label}</Badge>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </ChartCard>
                            </div>
                        </div>
                    )}

                    {/* Rating distribution */}
                    {!isLoading && (
                        <ChartCard title="Company Review Rating Distribution" description="Breakdown of all company reviews left by students" delay={1100}>
                            <ChartContainer config={ratingChartConfig} className="h-40 w-full">
                                <BarChart data={companyRatingDist} layout="vertical" barSize={14}>
                                    <defs>
                                        <linearGradient id="ratingGrad" x1="0" y1="0" x2="1" y2="0">
                                            <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.9} />
                                            <stop offset="100%" stopColor="#fbbf24" stopOpacity={0.7} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="4 4" stroke="#f1f5f9" horizontal={false} />
                                    <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                                    <YAxis type="category" dataKey="star" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} width={28} />
                                    <ChartTooltip content={<ChartTooltipContent />} />
                                    <Bar dataKey="count" fill="url(#ratingGrad)" radius={[0, 6, 6, 0]} />
                                </BarChart>
                            </ChartContainer>
                        </ChartCard>
                    )}

                </div>
            </div>

            {/* Profile completion dialog */}
            <Dialog open={openDialog} onOpenChange={setOpenDialog}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-(--color-navy)">Complete Your Company Profile</DialogTitle>
                        <DialogDescription>
                            Your company profile is incomplete. Provide the necessary details to enhance your visibility.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex justify-end gap-3 mt-4">
                        <button onClick={() => setOpenDialog(false)} className="px-4 py-2 text-sm hover:text-(--color-navy) transition-colors cursor-pointer rounded-lg border-2">
                            Later
                        </button>
                        <button onClick={() => { setOpenDialog(false); router.push("/company-profile") }} className="px-4 py-2 text-sm bg-(--color-navy) hover:bg-(--color-navy-mid) text-white rounded-lg transition-colors shadow-md shadow-blue-200 cursor-pointer">
                            Complete Profile
                        </button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    )
}
