"use client"

import { useUser } from "@clerk/nextjs";
import { getUserById } from "@/app/api/user";
import { getCompanyProjects, getProjectAppByCom, getCompanyReviews } from "@/app/api/project";
import { getJobsByCompany, getAllJobAppByCom } from "@/app/api/job";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Project, ProjectApplication, ProjectReview, Job, JobApplication } from "@/types";
import { format, parseISO } from "date-fns";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer,
    PieChart, Pie, Cell, AreaChart, Area, Tooltip
} from "recharts"
import {
    FolderOpen, Users, Star,
    TrendingUp, CheckCircle2, Clock, Lock, Briefcase, FileText
} from "lucide-react"

// ─── Helpers ─────────────────────────────────────────────────────────────────

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

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({ icon, label, value, sub, color, borderColor }: {
    icon: React.ReactNode; label: string; value: string | number; sub?: string; color: string; borderColor: string
}) {
    return (
        <Card className="rounded-sm bg-white border border-slate-100 shadow-sm overflow-hidden relative">
            <div className="h-1 w-full absolute top-0 left-0" style={{ backgroundColor: borderColor }} />
            <CardContent className="px-5 py-1.5 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center justify-center w-10 h-10 rounded-xl shrink-0" style={{ backgroundColor: `${color}15` }}>
                        <div style={{ color }}>{icon}</div>
                    </div>
                    {sub && (
                        <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full" style={{ backgroundColor: `${color}12`, color }}>
                            {sub}
                        </span>
                    )}
                </div>
                <div className="flex flex-col gap-0.5">
                    <span className="text-3xl font-extrabold text-slate-800 leading-none tracking-tight">{value}</span>
                    <span className="text-xs font-medium text-slate-400 mt-1 uppercase tracking-wide">{label}</span>
                </div>
                <div className="h-0.5 w-full rounded-full bg-slate-100">
                    <div className="h-0.5 rounded-full w-2/3" style={{ backgroundColor: `${borderColor}60` }} />
                </div>
            </CardContent>
        </Card>
    )
}

// ─── Section Label ────────────────────────────────────────────────────────────

function SectionLabel({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
    return (
        <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-2">
                <div className="text-slate-400">{icon}</div>
                <div>
                    <p className="text-sm font-semibold text-slate-700">{title}</p>
                    <p className="text-xs text-slate-400">{description}</p>
                </div>
            </div>
        </div>
    )
}

// ─── Main ────────────────────────────────────────────────────────────────────

export default function Dashboard() {
    const router = useRouter();
    const { user } = useUser();
    const [openDialog, setOpenDialog] = useState(false);

    const [projects, setProjects]         = useState<Project[]>([]);
    const [projApps, setProjApps]         = useState<ProjectApplication[]>([]);
    const [reviews, setReviews]           = useState<ProjectReview[]>([]);
    const [jobs, setJobs]                 = useState<Job[]>([]);
    const [jobApps, setJobApps]           = useState<JobApplication[]>([]);

    useEffect(() => {
        if (!user) return;

        const load = async () => {
            const userData = await getUserById(user.id);
            if (userData.data.profile_completed == '0') setOpenDialog(true);

            const [projRes, projAppRes, revRes, jobRes, jobAppRes] = await Promise.all([
                getCompanyProjects(user.id),
                getProjectAppByCom(user.id),
                getCompanyReviews(user.id),
                getJobsByCompany(user.id),
                getAllJobAppByCom(user.id),
            ]);

            if (projRes.success)    setProjects(projRes.data);
            if (projAppRes.success) setProjApps(projAppRes.data);
            if (revRes.success)     setReviews(revRes.data);
            if (jobRes.success)     setJobs(jobRes.data);
            if (jobAppRes.success)  setJobApps(jobAppRes.data);
        };

        load();
    }, [user]);

    // ── Derived: Projects ─────────────────────────────────────────────────────

    const avgRating = reviews.length
        ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : "—"

    const activeProjects = projects.filter(p => p.status === "in_progress").length

    const projectsByStatus = Object.entries(PROJECT_STATUS_CFG).map(([key, cfg]) => ({
        status: cfg.label,
        count: projects.filter(p => p.status === key).length,
        fill: cfg.color,
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

    const ratingDist = [5, 4, 3, 2, 1].map(star => ({
        star: `${star}★`,
        count: reviews.filter(r => r.rating === star).length,
    }))

    const recentProjects = [...projects]
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 5)

    // ── Derived: Jobs ─────────────────────────────────────────────────────────

    const activeJobs = jobs.filter(j => j.status === "open").length

    const jobsByStatus = Object.entries(JOB_STATUS_CFG).map(([key, cfg]) => ({
        status: cfg.label,
        count: jobs.filter(j => j.status === key).length,
        fill: cfg.color,
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

    const recentJobs = [...jobs]
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 5)

    // ── Chart configs ─────────────────────────────────────────────────────────

    const countConfig: ChartConfig = { count: { label: "Count" } }
    const ratingChartConfig: ChartConfig = { count: { label: "Reviews", color: "#f59e0b" } }

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col gap-8">

                {/* Heading */}
                <div>
                    <h1 className="text-xl font-bold text-slate-800">Welcome back, {user?.firstName} 👋</h1>
                    <p className="text-sm text-slate-400 mt-1">
                        Here&apos;s a full overview of your projects, job listings, applications, and student feedback.
                    </p>
                </div>

                {/* ── Projects Section ── */}
                <div className="flex flex-col gap-4">
                    <SectionLabel icon={<FolderOpen size={16} />} title="Projects" description="Overview of your active and completed projects" />

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <StatCard icon={<FolderOpen size={18} />} label="Total Projects"       value={projects.length}  color="#2563eb" borderColor="#2563eb" />
                        <StatCard icon={<Clock size={18} />}      label="Active Projects"      value={activeProjects}   color="#d97706" borderColor="#d97706" sub="In progress" />
                        <StatCard icon={<Users size={18} />}      label="Project Applications" value={projApps.length}  color="#7c3aed" borderColor="#7c3aed" />
                        <StatCard icon={<Star size={18} />}       label="Average Rating"       value={avgRating}        color="#d97706" borderColor="#f59e0b" sub={`${reviews.length} reviews`} />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                        {/* Projects by status */}
                        <Card className="rounded-sm border border-slate-100 shadow-sm">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-semibold text-slate-700">Projects by Status</CardTitle>
                                <CardDescription className="text-xs text-slate-400">Breakdown across all project stages</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ChartContainer config={countConfig} className="h-48 w-full">
                                    <BarChart data={projectsByStatus} barSize={32}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                                        <XAxis dataKey="status" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                                        <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} width={20} />
                                        <ChartTooltip content={<ChartTooltipContent />} />
                                        <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                                            {projectsByStatus.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                                        </Bar>
                                    </BarChart>
                                </ChartContainer>
                            </CardContent>
                        </Card>

                        {/* Project application trend */}
                        <Card className="rounded-sm border border-slate-100 shadow-sm">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-semibold text-slate-700">Project Application Trend</CardTitle>
                                <CardDescription className="text-xs text-slate-400">Monthly project applications received</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ChartContainer config={countConfig} className="h-48 w-full">
                                    <AreaChart data={projAppTrend}>
                                        <defs>
                                            <linearGradient id="projGrad" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%"  stopColor="#2563eb" stopOpacity={0.15} />
                                                <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                                        <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                                        <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} width={20} />
                                        <ChartTooltip content={<ChartTooltipContent />} />
                                        <Area dataKey="count" stroke="#2563eb" strokeWidth={2} fill="url(#projGrad)" dot={{ r: 3, fill: "#2563eb" }} />
                                    </AreaChart>
                                </ChartContainer>
                                {projAppTrend.length === 0 && <p className="text-xs text-slate-400 text-center -mt-2">No data yet</p>}
                            </CardContent>
                        </Card>

                        {/* Project app status donut + recent projects */}
                        <div className="flex flex-col gap-4">
                            <Card className="rounded-sm border border-slate-100 shadow-sm flex-1">
                                <CardHeader className="pb-1">
                                    <CardTitle className="text-sm font-semibold text-slate-700">Project App Status</CardTitle>
                                </CardHeader>
                                <CardContent className="flex items-center gap-4">
                                    {projAppStatusGroups.length === 0 ? (
                                        <p className="text-xs text-slate-400 py-4">No applications yet</p>
                                    ) : (
                                        <>
                                            <ResponsiveContainer width={100} height={100}>
                                                <PieChart>
                                                    <Pie data={projAppStatusGroups} cx="50%" cy="50%" innerRadius={28} outerRadius={45} dataKey="value" paddingAngle={3}>
                                                        {projAppStatusGroups.map((e, i) => <Cell key={i} fill={e.color} />)}
                                                    </Pie>
                                                    <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                                                </PieChart>
                                            </ResponsiveContainer>
                                            <div className="flex flex-col gap-1.5 flex-1">
                                                {projAppStatusGroups.map(g => (
                                                    <div key={g.name} className="flex items-center justify-between text-xs">
                                                        <div className="flex items-center gap-1.5">
                                                            <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: g.color }} />
                                                            <span className="text-slate-500">{g.name}</span>
                                                        </div>
                                                        <span className="font-semibold text-slate-700">{g.value}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </>
                                    )}
                                </CardContent>
                            </Card>

                            <Card className="rounded-sm border border-slate-100 shadow-sm flex-1">
                                <CardHeader className="pb-1">
                                    <CardTitle className="text-sm font-semibold text-slate-700">Recent Projects</CardTitle>
                                </CardHeader>
                                <CardContent className="flex flex-col divide-y divide-slate-50">
                                    {recentProjects.length === 0 ? (
                                        <p className="text-xs text-slate-400 py-4 text-center">No projects yet</p>
                                    ) : recentProjects.map(p => {
                                        const cfg = PROJECT_STATUS_CFG[p.status]
                                        const Icon = p.status === "completed" ? CheckCircle2 : p.status === "closed" ? Lock : p.status === "in_progress" ? TrendingUp : FolderOpen
                                        return (
                                            <div key={p.id} className="flex items-center justify-between gap-2 py-2">
                                                <div className="flex items-center gap-1.5 min-w-0">
                                                    <Icon size={12} className="shrink-0" style={{ color: cfg?.color }} />
                                                    <span className="text-xs text-slate-700 truncate">{p.title}</span>
                                                </div>
                                                <Badge className={`text-[10px] px-1.5 py-0 border shrink-0 ${cfg?.badgeCls}`}>{cfg?.label}</Badge>
                                            </div>
                                        )
                                    })}
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>

                {/* ── Job Listings Section ── */}
                <div className="flex flex-col gap-4">
                    <SectionLabel icon={<Briefcase size={16} />} title="Job Listings" description="Overview of your posted jobs and applicant activity" />

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <StatCard icon={<Briefcase size={18} />} label="Total Job Listings"  value={jobs.length}     color="#0891b2" borderColor="#0891b2" />
                        <StatCard icon={<Clock size={18} />}     label="Active Listings"     value={activeJobs}      color="#16a34a" borderColor="#16a34a" sub="Open" />
                        <StatCard icon={<FileText size={18} />}  label="Job Applications"    value={jobApps.length}  color="#e11d48" borderColor="#e11d48" />
                        <StatCard icon={<Star size={18} />}      label="Average Rating"      value={avgRating}       color="#d97706" borderColor="#f59e0b" sub={`${reviews.length} reviews`} />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                        {/* Jobs by status */}
                        <Card className="rounded-sm border border-slate-100 shadow-sm">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-semibold text-slate-700">Jobs by Status</CardTitle>
                                <CardDescription className="text-xs text-slate-400">Breakdown across all job listing stages</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ChartContainer config={countConfig} className="h-48 w-full">
                                    <BarChart data={jobsByStatus} barSize={36}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                                        <XAxis dataKey="status" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                                        <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} width={20} />
                                        <ChartTooltip content={<ChartTooltipContent />} />
                                        <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                                            {jobsByStatus.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                                        </Bar>
                                    </BarChart>
                                </ChartContainer>
                            </CardContent>
                        </Card>

                        {/* Job application trend */}
                        <Card className="rounded-sm border border-slate-100 shadow-sm">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-semibold text-slate-700">Job Application Trend</CardTitle>
                                <CardDescription className="text-xs text-slate-400">Monthly job applications received</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ChartContainer config={countConfig} className="h-48 w-full">
                                    <AreaChart data={jobAppTrend}>
                                        <defs>
                                            <linearGradient id="jobGrad" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%"  stopColor="#0891b2" stopOpacity={0.15} />
                                                <stop offset="95%" stopColor="#0891b2" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                                        <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                                        <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} width={20} />
                                        <ChartTooltip content={<ChartTooltipContent />} />
                                        <Area dataKey="count" stroke="#0891b2" strokeWidth={2} fill="url(#jobGrad)" dot={{ r: 3, fill: "#0891b2" }} />
                                    </AreaChart>
                                </ChartContainer>
                                {jobAppTrend.length === 0 && <p className="text-xs text-slate-400 text-center -mt-2">No data yet</p>}
                            </CardContent>
                        </Card>

                        {/* Job app status donut + recent jobs */}
                        <div className="flex flex-col gap-4">
                            <Card className="rounded-sm border border-slate-100 shadow-sm flex-1">
                                <CardHeader className="pb-1">
                                    <CardTitle className="text-sm font-semibold text-slate-700">Job App Status</CardTitle>
                                </CardHeader>
                                <CardContent className="flex items-center gap-4">
                                    {jobAppStatusGroups.length === 0 ? (
                                        <p className="text-xs text-slate-400 py-4">No applications yet</p>
                                    ) : (
                                        <>
                                            <ResponsiveContainer width={100} height={100}>
                                                <PieChart>
                                                    <Pie data={jobAppStatusGroups} cx="50%" cy="50%" innerRadius={28} outerRadius={45} dataKey="value" paddingAngle={3}>
                                                        {jobAppStatusGroups.map((e, i) => <Cell key={i} fill={e.color} />)}
                                                    </Pie>
                                                    <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                                                </PieChart>
                                            </ResponsiveContainer>
                                            <div className="flex flex-col gap-1.5 flex-1">
                                                {jobAppStatusGroups.map(g => (
                                                    <div key={g.name} className="flex items-center justify-between text-xs">
                                                        <div className="flex items-center gap-1.5">
                                                            <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: g.color }} />
                                                            <span className="text-slate-500">{g.name}</span>
                                                        </div>
                                                        <span className="font-semibold text-slate-700">{g.value}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </>
                                    )}
                                </CardContent>
                            </Card>

                            <Card className="rounded-sm border border-slate-100 shadow-sm flex-1">
                                <CardHeader className="pb-1">
                                    <CardTitle className="text-sm font-semibold text-slate-700">Recent Job Listings</CardTitle>
                                </CardHeader>
                                <CardContent className="flex flex-col divide-y divide-slate-50">
                                    {recentJobs.length === 0 ? (
                                        <p className="text-xs text-slate-400 py-4 text-center">No job listings yet</p>
                                    ) : recentJobs.map(j => {
                                        const cfg = JOB_STATUS_CFG[j.status]
                                        return (
                                            <div key={j.id} className="flex items-center justify-between gap-2 py-2">
                                                <div className="flex items-center gap-1.5 min-w-0">
                                                    <Briefcase size={12} className="shrink-0" style={{ color: cfg?.color }} />
                                                    <span className="text-xs text-slate-700 truncate">{j.title}</span>
                                                </div>
                                                <Badge className={`text-[10px] px-1.5 py-0 border shrink-0 ${cfg?.badgeCls}`}>{cfg?.label}</Badge>
                                            </div>
                                        )
                                    })}
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    {/* Rating distribution — full width bottom */}
                    <Card className="rounded-sm border border-slate-100 shadow-sm">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-semibold text-slate-700">Student Review Rating Distribution</CardTitle>
                            <CardDescription className="text-xs text-slate-400">Breakdown of all project reviews left by students</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ChartContainer config={ratingChartConfig} className="h-40 w-full">
                                <BarChart data={ratingDist} layout="vertical" barSize={14}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                                    <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                                    <YAxis type="category" dataKey="star" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} width={28} />
                                    <ChartTooltip content={<ChartTooltipContent />} />
                                    <Bar dataKey="count" fill="#f59e0b" radius={[0, 4, 4, 0]} />
                                </BarChart>
                            </ChartContainer>
                        </CardContent>
                    </Card>
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
                        <button onClick={() => { setOpenDialog(false); router.push(`/company-profile`) }} className="px-4 py-2 text-sm bg-(--color-navy) hover:bg-(--color-navy-mid) text-white rounded-lg transition-colors shadow-md shadow-blue-200 cursor-pointer">
                            Complete Profile
                        </button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}