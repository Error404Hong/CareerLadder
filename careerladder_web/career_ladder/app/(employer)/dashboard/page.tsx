"use client"

import { useUser } from "@clerk/nextjs";
import { getUserById } from "@/app/api/user";
import { getCompanyProjects, getProjectAppByCom, getCompanyReviews } from "@/app/api/project";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Project, ProjectApplication, ProjectReview } from "@/types";
import { format, parseISO } from "date-fns";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer,
    PieChart, Pie, Cell, AreaChart, Area, Tooltip
} from "recharts"
import {
    FolderOpen, Users, Star, ClipboardList,
    TrendingUp, CheckCircle2, Clock, Lock
} from "lucide-react"

// ─── Helpers ─────────────────────────────────────────────────────────────────

const STATUS_CFG: Record<string, { label: string; color: string; badgeCls: string }> = {
    open: { label: "Open", color: "#2563eb", badgeCls: "bg-blue-100 text-blue-700 border-blue-200" },
    in_progress: { label: "In Progress", color: "#f59e0b", badgeCls: "bg-amber-100 text-amber-700 border-amber-200" },
    completed: { label: "Completed", color: "#22c55e", badgeCls: "bg-green-100 text-green-700 border-green-200" },
    closed: { label: "Closed", color: "#94a3b8", badgeCls: "bg-slate-100 text-slate-500 border-slate-200" },
}

const APP_STATUS_COLORS: Record<string, string> = {
    pending: "#f59e0b",
    accepted: "#22c55e",
    rejected: "#ef4444",
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({ icon, label, value, sub, color, borderColor }: {
    icon: React.ReactNode; label: string; value: string | number; sub?: string; color: string; borderColor: string
}) {
    return (
        <Card className="rounded-sm bg-white border border-slate-100 shadow-sm overflow-hidden relative">
            {/* Top accent bar */}
            <div className="h-1 w-full absolute top-0 left-0" style={{ backgroundColor: borderColor }} />

            <CardContent className="px-5 py-1.5 flex flex-col gap-4">
                {/* Icon + sub pill row */}
                <div className="flex items-center justify-between">
                    <div
                        className="flex items-center justify-center w-10 h-10 rounded-xl shrink-0"
                        style={{ backgroundColor: `${color}15` }}
                    >
                        <div style={{ color }}>{icon}</div>
                    </div>
                    {sub && (
                        <span
                            className="text-[11px] font-semibold px-2.5 py-1 rounded-full"
                            style={{ backgroundColor: `${color}12`, color }}
                        >
                            {sub}
                        </span>
                    )}
                </div>

                {/* Value + label */}
                <div className="flex flex-col gap-0.5">
                    <span className="text-3xl font-extrabold text-slate-800 leading-none tracking-tight">{value}</span>
                    <span className="text-xs font-medium text-slate-400 mt-1 uppercase tracking-wide">{label}</span>
                </div>

                {/* Bottom colored progress line */}
                <div className="h-0.5 w-full rounded-full bg-slate-100">
                    <div className="h-0.5 rounded-full w-2/3" style={{ backgroundColor: `${borderColor}60` }} />
                </div>
            </CardContent>
        </Card>
    )
}

// ─── Main ────────────────────────────────────────────────────────────────────

export default function Dashboard() {
    const router = useRouter();
    const { user } = useUser();
    const [openDialog, setOpenDialog] = useState(false);

    const [projects, setProjects] = useState<Project[]>([]);
    const [applications, setApplications] = useState<ProjectApplication[]>([]);
    const [reviews, setReviews] = useState<ProjectReview[]>([]);

    useEffect(() => {
        if (!user) return;

        const load = async () => {
            const userData = await getUserById(user.id);
            if (userData.data.profile_completed == '0') setOpenDialog(true);

            const [projRes, appRes, revRes] = await Promise.all([
                getCompanyProjects(user.id),
                getProjectAppByCom(user.id),
                getCompanyReviews(user.id),
            ]);

            if (projRes.success) setProjects(projRes.data);
            if (appRes.success) setApplications(appRes.data);
            if (revRes.success) setReviews(revRes.data);
        };

        load();
    }, [user]);

    // ── Derived data ──────────────────────────────────────────────────────────

    const avgRating = reviews.length
        ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
        : "—"

    const activeProjects = projects.filter(p => p.status === "in_progress").length

    // Projects by status — bar chart
    const projectsByStatus = Object.entries(STATUS_CFG).map(([key, cfg]) => ({
        status: cfg.label,
        count: projects.filter(p => p.status === key).length,
        fill: cfg.color,
    }))

    // Applications by status — pie chart
    const appStatusGroups = ["pending", "accepted", "rejected"].map(s => ({
        name: s.charAt(0).toUpperCase() + s.slice(1),
        value: applications.filter(a => a.application_status === s).length,
        color: APP_STATUS_COLORS[s],
    })).filter(g => g.value > 0)

    // Applications over time — area chart (last 6 months)
    const appsByMonth: Record<string, number> = {}
    applications.forEach(a => {
        const m = format(parseISO(a.applied_at), "MMM yyyy")
        appsByMonth[m] = (appsByMonth[m] ?? 0) + 1
    })
    const appTrend = Object.entries(appsByMonth)
        .slice(-6)
        .map(([month, count]) => ({ month, count }))

    // Rating distribution
    const ratingDist = [5, 4, 3, 2, 1].map(star => ({
        star: `${star}★`,
        count: reviews.filter(r => r.rating === star).length,
    }))

    // Recent projects
    const recentProjects = [...projects]
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 5)

    // Chart configs
    const projectChartConfig: ChartConfig = {
        count: { label: "Projects" },
    }
    const appChartConfig: ChartConfig = {
        count: { label: "Applications" },
    }
    const ratingChartConfig: ChartConfig = {
        count: { label: "Reviews", color: "#f59e0b" },
    }

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col gap-7">

                {/* Heading */}
                <div>
                    <h1 className="text-xl font-bold text-slate-800">
                        Welcome back, {user?.firstName} 👋
                    </h1>
                    <p className="text-sm text-slate-400 mt-1">
                        Here&apos;s an overview of your projects, applications, and student feedback.
                    </p>
                </div>

                {/* Stat cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard icon={<FolderOpen size={18} />} label="Total Projects" value={projects.length} color="#2563eb" borderColor="#2563eb" />
                    <StatCard icon={<Clock size={18} />} label="Active Projects" value={activeProjects} color="#d97706" borderColor="#d97706" sub="In progress" />
                    <StatCard icon={<Users size={18} />} label="Total Applications" value={applications.length} color="#7c3aed" borderColor="#7c3aed" />
                    <StatCard icon={<Star size={18} />} label="Average Rating" value={avgRating} color="#d97706" borderColor="#f59e0b" sub={`${reviews.length} reviews`} />
                </div>

                {/* Row 1: Projects by status + Applications over time */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

                    {/* Projects by status */}
                    <Card className="rounded-sm border border-slate-100 shadow-sm">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-semibold text-slate-700">Projects by Status</CardTitle>
                            <CardDescription className="text-xs text-slate-400">Breakdown across all project stages</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ChartContainer config={projectChartConfig} className="h-52 w-full">
                                <BarChart data={projectsByStatus} barSize={36}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                                    <XAxis dataKey="status" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                                    <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} width={24} />
                                    <ChartTooltip content={<ChartTooltipContent />} />
                                    <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                                        {projectsByStatus.map((entry, i) => (
                                            <Cell key={i} fill={entry.fill} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ChartContainer>
                        </CardContent>
                    </Card>

                    {/* Applications over time */}
                    <Card className="rounded-sm border border-slate-100 shadow-sm">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-semibold text-slate-700">Application Trend</CardTitle>
                            <CardDescription className="text-xs text-slate-400">Monthly applications received</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ChartContainer config={appChartConfig} className="h-52 w-full">
                                <AreaChart data={appTrend}>
                                    <defs>
                                        <linearGradient id="appGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#2563eb" stopOpacity={0.15} />
                                            <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                                    <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} width={24} />
                                    <ChartTooltip content={<ChartTooltipContent />} />
                                    <Area dataKey="count" stroke="#2563eb" strokeWidth={2} fill="url(#appGrad)" dot={{ r: 3, fill: "#2563eb" }} />
                                </AreaChart>
                            </ChartContainer>
                            {appTrend.length === 0 && (
                                <p className="text-xs text-slate-400 text-center mt-2">No application data yet</p>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Row 2: Application status pie + Rating distribution + Recent projects */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

                    {/* Application status donut */}
                    <Card className="rounded-sm border border-slate-100 shadow-sm">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-semibold text-slate-700">Application Status</CardTitle>
                            <CardDescription className="text-xs text-slate-400">Distribution by outcome</CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-col items-center gap-4">
                            {appStatusGroups.length === 0 ? (
                                <div className="flex flex-col items-center gap-2 py-8 text-center">
                                    <ClipboardList size={22} className="text-slate-300" />
                                    <p className="text-xs text-slate-400">No applications yet</p>
                                </div>
                            ) : (
                                <>
                                    <ResponsiveContainer width="100%" height={160}>
                                        <PieChart>
                                            <Pie data={appStatusGroups} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value" paddingAngle={3}>
                                                {appStatusGroups.map((entry, i) => (
                                                    <Cell key={i} fill={entry.color} />
                                                ))}
                                            </Pie>
                                            <Tooltip formatter={(v, n) => [v, n]} contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                    <div className="flex flex-col gap-1.5 w-full">
                                        {appStatusGroups.map((g) => (
                                            <div key={g.name} className="flex items-center justify-between text-xs">
                                                <div className="flex items-center gap-1.5">
                                                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: g.color }} />
                                                    <span className="text-slate-600">{g.name}</span>
                                                </div>
                                                <span className="font-medium text-slate-700">{g.value}</span>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}
                        </CardContent>
                    </Card>

                    {/* Rating distribution */}
                    <Card className="rounded-sm border border-slate-100 shadow-sm">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-semibold text-slate-700">Rating Distribution</CardTitle>
                            <CardDescription className="text-xs text-slate-400">Student review breakdown</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ChartContainer config={ratingChartConfig} className="h-48 w-full">
                                <BarChart data={ratingDist} layout="vertical" barSize={16}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                                    <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                                    <YAxis type="category" dataKey="star" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} width={28} />
                                    <ChartTooltip content={<ChartTooltipContent />} />
                                    <Bar dataKey="count" fill="#f59e0b" radius={[0, 4, 4, 0]} />
                                </BarChart>
                            </ChartContainer>
                        </CardContent>
                    </Card>

                    {/* Recent projects */}
                    <Card className="rounded-sm border border-slate-100 shadow-sm">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-semibold text-slate-700">Recent Projects</CardTitle>
                            <CardDescription className="text-xs text-slate-400">Last 5 created</CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-0 divide-y divide-slate-50">
                            {recentProjects.length === 0 ? (
                                <p className="text-xs text-slate-400 py-6 text-center">No projects yet</p>
                            ) : recentProjects.map((p) => {
                                const cfg = STATUS_CFG[p.status]
                                const StatusIcon = p.status === "completed" ? CheckCircle2 : p.status === "closed" ? Lock : p.status === "in_progress" ? TrendingUp : FolderOpen
                                return (
                                    <div key={p.id} className="flex items-center justify-between gap-3 py-2.5">
                                        <div className="flex items-center gap-2 min-w-0">
                                            <StatusIcon size={14} className="shrink-0" style={{ color: cfg?.color }} />
                                            <span className="text-xs text-slate-700 font-medium truncate">{p.title}</span>
                                        </div>
                                        <Badge className={`text-[10px] px-1.5 py-0 border shrink-0 ${cfg?.badgeCls}`}>
                                            {cfg?.label}
                                        </Badge>
                                    </div>
                                )
                            })}
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
                        <button
                            onClick={() => setOpenDialog(false)}
                            className="px-4 py-2 text-sm hover:text-(--color-navy) transition-colors cursor-pointer rounded-lg border-2"
                        >
                            Later
                        </button>
                        <button
                            onClick={() => { setOpenDialog(false); router.push(`/company-profile`) }}
                            className="px-4 py-2 text-sm bg-(--color-navy) hover:bg-(--color-navy-mid) text-white rounded-lg transition-colors shadow-md shadow-blue-200 cursor-pointer"
                        >
                            Complete Profile
                        </button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
