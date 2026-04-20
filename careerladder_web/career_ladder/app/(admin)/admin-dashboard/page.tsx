"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Job, Project, Training, CompanyReview, ProjectReview, Student, CompanyProfile } from "@/types"
import { getAllJobs } from "@/app/api/job"
import { getAllProjects, getAllProjectReviews } from "@/app/api/project"
import { getAllTraining } from "@/app/api/training"
import { getAllStudent, getAllCompany, getAllCompanyReviews } from "@/app/api/user"

import {
    AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
    CartesianGrid, XAxis, YAxis,
} from "recharts"
import {
    ChartContainer, ChartTooltip, ChartTooltipContent,
    ChartLegend, ChartLegendContent,
} from "@/components/ui/chart"
import type { ChartConfig } from "@/components/ui/chart"

import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
    Users, Briefcase, FolderKanban, BookOpen,
    TrendingUp, ArrowRight, CreditCard, MessageSquare,
} from "lucide-react"

// ─── Count-up hook ────────────────────────────────────────────────
function useCountUp(target: number, duration = 1400, delay = 0) {
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

// ─── Helpers ──────────────────────────────────────────────────────
const getMonthKey = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`

const getLast6Months = () => {
    const result = []
    for (let i = 5; i >= 0; i--) {
        const d = new Date()
        d.setDate(1)
        d.setMonth(d.getMonth() - i)
        result.push({
            key: getMonthKey(d),
            label: d.toLocaleDateString("en-MY", { month: "short" }),
        })
    }
    return result
}

// ─── Hero stat ────────────────────────────────────────────────────
function HeroStat({
    label, value, sub, delay = 0
}: { label: string; value: number; sub?: string; delay?: number }) {
    const displayed = useCountUp(value, 1400, delay)
    return (
        <div
            className="flex flex-col gap-1 opacity-0"
            style={{ animation: `fadeSlideUp 0.5s ease-out ${delay + 200}ms forwards` }}
        >
            <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">{label}</p>
            <p className="text-3xl font-bold text-white font-mono tabular-nums leading-none">{displayed.toLocaleString()}</p>
            {sub && <p className="text-xs text-slate-400">{sub}</p>}
        </div>
    )
}

// ─── Quick access card ────────────────────────────────────────────
function QuickCard({
    href, icon: Icon, label, count, color, delay = 0
}: { href: string; icon: React.ElementType; label: string; count?: number; color: string; delay?: number }) {
    return (
        <Link href={href}
            className="group flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3.5 shadow-sm hover:border-slate-300 hover:shadow-md transition-all duration-200 opacity-0"
            style={{ animation: `fadeSlideUp 0.5s ease-out ${delay}ms forwards` }}
        >
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${color}`}>
                <Icon size={16} />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[#0f172a] truncate">{label}</p>
                {count !== undefined && <p className="text-xs text-slate-400">{count} total</p>}
            </div>
            <ArrowRight size={14} className="text-slate-300 group-hover:text-slate-500 group-hover:translate-x-0.5 transition-all duration-150 shrink-0" />
        </Link>
    )
}

// ─── Chart configs ────────────────────────────────────────────────
const trendConfig: ChartConfig = {
    jobs:     { label: "Jobs",     color: "#2563eb" },
    projects: { label: "Projects", color: "#7c3aed" },
    training: { label: "Training", color: "#10b981" },
}

const userConfig: ChartConfig = {
    students:  { label: "Students",  color: "#2563eb" },
    companies: { label: "Companies", color: "#f59e0b" },
}

const statusConfig: ChartConfig = {
    active:   { label: "Active",   color: "#2563eb" },
    inactive: { label: "Inactive", color: "#e2e8f0" },
}

// ─── Main Page ────────────────────────────────────────────────────
export default function AdminDashboard() {
    const [isLoading, setIsLoading] = useState(true)
    const [jobs, setJobs] = useState<Job[]>([])
    const [projects, setProjects] = useState<Project[]>([])
    const [trainings, setTrainings] = useState<Training[]>([])
    const [students, setStudents] = useState<Student[]>([])
    const [companies, setCompanies] = useState<CompanyProfile[]>([])
    const [companyReviews, setCompanyReviews] = useState<CompanyReview[]>([])
    const [projectReviews, setProjectReviews] = useState<ProjectReview[]>([])

    useEffect(() => {
        Promise.allSettled([
            getAllJobs(),
            getAllProjects(),
            getAllTraining(),
            getAllStudent(),
            getAllCompany(),
            getAllCompanyReviews(),
            getAllProjectReviews(),
        ]).then(([jobRes, projRes, trainRes, stuRes, compRes, compRevRes, projRevRes]) => {
            if (jobRes.status === "fulfilled" && jobRes.value.success) setJobs(jobRes.value.data ?? [])
            if (projRes.status === "fulfilled" && projRes.value.success) setProjects(projRes.value.data ?? [])
            if (trainRes.status === "fulfilled" && trainRes.value.success) setTrainings(trainRes.value.data ?? [])
            if (stuRes.status === "fulfilled" && stuRes.value.success) setStudents(stuRes.value.data ?? [])
            if (compRes.status === "fulfilled" && compRes.value.success) setCompanies(compRes.value.data ?? [])
            if (compRevRes.status === "fulfilled" && compRevRes.value.success) setCompanyReviews(compRevRes.value.data ?? [])
            if (projRevRes.status === "fulfilled" && projRevRes.value.success) setProjectReviews(projRevRes.value.data ?? [])
        }).finally(() => setIsLoading(false))
    }, [])

    // ── Derived stats ──
    const totalUsers   = students.length + companies.length
    const openJobs     = jobs.filter(j => j.status === "open").length
    const openProjects = projects.filter(p => p.status === "open" || p.status === "in_progress").length
    const allReviews   = [...companyReviews, ...projectReviews]
    const avgRating    = allReviews.length
        ? allReviews.reduce((s, r) => s + r.rating, 0) / allReviews.length
        : 0

    // ── Monthly trend (last 6 months) ──
    const months = getLast6Months()
    const trendData = months.map(m => ({
        month: m.label,
        jobs:     jobs.filter(j => getMonthKey(new Date(j.created_at)) === m.key).length,
        projects: projects.filter(p => getMonthKey(new Date(p.created_at)) === m.key).length,
        training: trainings.filter(t => getMonthKey(new Date(t.created_at)) === m.key).length,
    }))

    // ── User distribution ──
    const userDistData = [
        { name: "students",  value: students.length },
        { name: "companies", value: companies.length },
    ]

    // ── Status distribution ──
    const statusData = [
        {
            category: "Jobs",
            active:   openJobs,
            inactive: jobs.length - openJobs,
        },
        {
            category: "Projects",
            active:   openProjects,
            inactive: projects.length - openProjects,
        },
        {
            category: "Training",
            active:   trainings.filter(t => t.status === "open").length,
            inactive: trainings.filter(t => t.status !== "open").length,
        },
    ]

    return (
        <>
            <style>{`
                @keyframes fadeSlideUp {
                    from { opacity: 0; transform: translateY(16px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to   { opacity: 1; }
                }
            `}</style>

            <div className="min-h-screen bg-slate-50">
                <div className="max-w-6xl mx-auto px-6 py-6 flex flex-col gap-6">

                    {/* ── Hero Banner ── */}
                    <div
                        className="relative rounded-2xl overflow-hidden bg-[#0f172a] px-8 py-7 opacity-0"
                        style={{ animation: "fadeIn 0.6s ease-out 0ms forwards" }}
                    >
                        {/* Radial gradient overlay */}
                        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 70% 80% at 90% 10%, rgba(37,99,235,0.25) 0%, transparent 65%), radial-gradient(ellipse 50% 60% at 10% 90%, rgba(124,58,237,0.12) 0%, transparent 60%)" }} />
                        {/* Dot grid pattern */}
                        <div className="absolute inset-0 pointer-events-none opacity-[0.06]" style={{ backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)", backgroundSize: "24px 24px" }} />

                        <div className="relative">
                            <div className="flex items-start justify-between gap-4 flex-wrap mb-8">
                                <div>
                                    <p className="text-xs text-slate-400 uppercase tracking-widest font-medium mb-1">Admin Console</p>
                                    <h1 className="text-2xl font-bold text-white tracking-tight">Platform Overview</h1>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-slate-500 font-medium">
                                        {new Date().toLocaleDateString("en-MY", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                                    </p>
                                </div>
                            </div>

                            {isLoading ? (
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                                    {Array.from({ length: 4 }).map((_, i) => (
                                        <div key={i} className="flex flex-col gap-2">
                                            <Skeleton className="h-3 w-20 rounded bg-slate-700" />
                                            <Skeleton className="h-8 w-12 rounded bg-slate-700" />
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                                    <HeroStat label="Total Users"       value={totalUsers}          sub={`${students.length} students · ${companies.length} companies`} delay={0} />
                                    <HeroStat label="Active Listings"   value={openJobs + openProjects} sub={`${openJobs} jobs · ${openProjects} projects`}           delay={80} />
                                    <HeroStat label="Training Programs" value={trainings.length}    sub={`${trainings.filter(t => t.status === "open").length} open`}  delay={160} />
                                    <HeroStat label="Reviews"           value={allReviews.length}   sub={`${avgRating.toFixed(1)} ★ avg rating`}                       delay={240} />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ── Monthly Trend Chart ── */}
                    <Card
                        className="rounded-2xl border border-slate-200 shadow-sm opacity-0"
                        style={{ animation: "fadeSlideUp 0.5s ease-out 300ms forwards" }}
                    >
                        <CardHeader className="px-6 pt-5 pb-2">
                            <div className="flex items-center gap-2">
                                <TrendingUp size={16} className="text-[#2563eb]" />
                                <CardTitle className="text-base font-bold text-[#0f172a]">Platform Activity</CardTitle>
                            </div>
                            <CardDescription className="text-xs mt-0.5">New listings posted per month — last 6 months</CardDescription>
                        </CardHeader>
                        <CardContent className="px-6 pb-5">
                            {isLoading ? (
                                <Skeleton className="h-56 w-full rounded-xl" />
                            ) : (
                                <ChartContainer config={trendConfig} className="h-56 w-full">
                                    <AreaChart data={trendData} margin={{ top: 8, right: 4, bottom: 0, left: -16 }}>
                                        <defs>
                                            <linearGradient id="gJobs" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%"  stopColor="#2563eb" stopOpacity={0.25} />
                                                <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                                            </linearGradient>
                                            <linearGradient id="gProjects" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%"  stopColor="#7c3aed" stopOpacity={0.2} />
                                                <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                                            </linearGradient>
                                            <linearGradient id="gTraining" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%"  stopColor="#10b981" stopOpacity={0.2} />
                                                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid vertical={false} strokeDasharray="4 4" stroke="#f1f5f9" />
                                        <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                                        <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} allowDecimals={false} />
                                        <ChartTooltip content={<ChartTooltipContent />} />
                                        <ChartLegend content={<ChartLegendContent />} />
                                        <Area type="monotone" dataKey="jobs"     stroke="#2563eb" strokeWidth={2} fill="url(#gJobs)"     dot={{ r: 3, fill: "#2563eb", strokeWidth: 0 }} activeDot={{ r: 5 }} />
                                        <Area type="monotone" dataKey="projects" stroke="#7c3aed" strokeWidth={2} fill="url(#gProjects)" dot={{ r: 3, fill: "#7c3aed", strokeWidth: 0 }} activeDot={{ r: 5 }} />
                                        <Area type="monotone" dataKey="training" stroke="#10b981" strokeWidth={2} fill="url(#gTraining)" dot={{ r: 3, fill: "#10b981", strokeWidth: 0 }} activeDot={{ r: 5 }} />
                                    </AreaChart>
                                </ChartContainer>
                            )}
                        </CardContent>
                    </Card>

                    {/* ── Two charts row ── */}
                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

                        {/* Status Distribution — bar */}
                        <Card
                            className="lg:col-span-3 rounded-2xl border border-slate-200 shadow-sm opacity-0"
                            style={{ animation: "fadeSlideUp 0.5s ease-out 420ms forwards" }}
                        >
                            <CardHeader className="px-6 pt-5 pb-2">
                                <CardTitle className="text-base font-bold text-[#0f172a]">Content Status</CardTitle>
                                <CardDescription className="text-xs mt-0.5">Active vs inactive listings by category</CardDescription>
                            </CardHeader>
                            <CardContent className="px-6 pb-5">
                                {isLoading ? (
                                    <Skeleton className="h-44 w-full rounded-xl" />
                                ) : (
                                    <ChartContainer config={statusConfig} className="h-44 w-full">
                                        <BarChart data={statusData} layout="vertical" margin={{ top: 0, right: 8, bottom: 0, left: 8 }} barSize={18}>
                                            <CartesianGrid horizontal={false} strokeDasharray="4 4" stroke="#f1f5f9" />
                                            <XAxis type="number" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} allowDecimals={false} />
                                            <YAxis type="category" dataKey="category" tick={{ fontSize: 12, fill: "#64748b", fontWeight: 500 }} axisLine={false} tickLine={false} width={64} />
                                            <ChartTooltip content={<ChartTooltipContent />} />
                                            <ChartLegend content={<ChartLegendContent />} />
                                            <Bar dataKey="active"   stackId="a" fill="#2563eb" radius={[0, 0, 0, 0]} />
                                            <Bar dataKey="inactive" stackId="a" fill="#e2e8f0" radius={[4, 4, 4, 4]} />
                                        </BarChart>
                                    </ChartContainer>
                                )}
                            </CardContent>
                        </Card>

                        {/* User Distribution — donut */}
                        <Card
                            className="lg:col-span-2 rounded-2xl border border-slate-200 shadow-sm opacity-0"
                            style={{ animation: "fadeSlideUp 0.5s ease-out 500ms forwards" }}
                        >
                            <CardHeader className="px-6 pt-5 pb-2">
                                <CardTitle className="text-base font-bold text-[#0f172a]">User Distribution</CardTitle>
                                <CardDescription className="text-xs mt-0.5">Students vs companies</CardDescription>
                            </CardHeader>
                            <CardContent className="px-6 pb-4">
                                {isLoading ? (
                                    <Skeleton className="h-44 w-full rounded-xl" />
                                ) : (
                                    <div className="flex flex-col items-center">
                                        <ChartContainer config={userConfig} className="h-36 w-full">
                                            <PieChart>
                                                <Pie
                                                    data={userDistData}
                                                    dataKey="value"
                                                    nameKey="name"
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius={48}
                                                    outerRadius={68}
                                                    strokeWidth={2}
                                                    stroke="#f8fafc"
                                                >
                                                    <Cell fill="#2563eb" />
                                                    <Cell fill="#f59e0b" />
                                                </Pie>
                                                <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                                            </PieChart>
                                        </ChartContainer>
                                        <div className="flex items-center gap-6 mt-1">
                                            <div className="flex items-center gap-1.5">
                                                <div className="w-2.5 h-2.5 rounded-sm bg-[#2563eb]" />
                                                <span className="text-xs text-slate-500">Students <span className="font-semibold text-[#0f172a]">{students.length}</span></span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <div className="w-2.5 h-2.5 rounded-sm bg-[#f59e0b]" />
                                                <span className="text-xs text-slate-500">Companies <span className="font-semibold text-[#0f172a]">{companies.length}</span></span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* ── Quick Access ── */}
                    <div
                        className="opacity-0"
                        style={{ animation: "fadeSlideUp 0.5s ease-out 580ms forwards" }}
                    >
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">Quick Access</p>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                            <QuickCard href="/users"              icon={Users}        label="Users"           count={totalUsers}          color="bg-blue-50 text-[#2563eb]"   delay={600} />
                            <QuickCard href="/job-management"     icon={Briefcase}    label="Jobs"            count={jobs.length}         color="bg-sky-50 text-sky-600"      delay={640} />
                            <QuickCard href="/project-management" icon={FolderKanban} label="Projects"        count={projects.length}     color="bg-violet-50 text-violet-600" delay={680} />
                            <QuickCard href="/program-management" icon={BookOpen}     label="Training"        count={trainings.length}    color="bg-emerald-50 text-emerald-600" delay={720} />
                            <QuickCard href="/ratings-reviews"    icon={MessageSquare} label="Reviews"        count={allReviews.length}   color="bg-amber-50 text-amber-600"  delay={760} />
                            <QuickCard href="/admin-dashboard/credits" icon={CreditCard} label="Credits"      color="bg-rose-50 text-rose-500"  delay={800} />
                        </div>
                    </div>

                </div>
            </div>
        </>
    )
}
