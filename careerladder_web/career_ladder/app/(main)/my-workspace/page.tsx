"use client"

import { useUser } from "@clerk/nextjs"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

import { ProjectApplication } from "@/types"
import { getProjectApplications } from "@/app/api/project"

import { toast } from "sonner"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Briefcase, Clock, Wallet, Calendar, Layers } from "lucide-react"

export default function MyWorkspace() {
    const { user } = useUser()
    const router = useRouter()

    const [projects, setProjects] = useState<ProjectApplication[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!user) return

        const getUserProjects = async () => {
            try {
                const res = await getProjectApplications(user.id)
                if (res.success) {
                    const accepted: ProjectApplication[] = res.data.filter(
                        (p: ProjectApplication) => p.application_status === "accepted"
                    )
                    console.log("Accepted: ", accepted)
                    setProjects(accepted)
                } else {
                    toast.error("Failed to fetch projects.")
                }
            } catch {
                toast.error("Something went wrong. Please try again.")
            } finally {
                setLoading(false)
            }
        }

        getUserProjects()
    }, [user])

    return (
        <div className="min-h-screen bg-slate-100 flex flex-col">
            {/* Header */}
            <div className="bg-white border-b border-slate-100">
                <div className="max-w-7xl mx-auto px-6 py-6">
                    <Breadcrumb className="mb-4">
                        <BreadcrumbList>
                            <BreadcrumbItem>
                                <BreadcrumbLink href="/home">Home</BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                                <BreadcrumbPage>My Workspace</BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>
                    <h1 className="text-xl font-bold">My Workspace</h1>
                    <p className="text-sm text-slate-400 mt-1">
                        Your hub for collaborating with companies, building projects, and gaining real experience.
                    </p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto w-full px-6 py-8">
                {loading ? (
                    <p className="text-sm text-slate-400">Loading projects...</p>
                ) : projects.length === 0 ? (
                    <p className="text-sm text-slate-400">You have no active projects.</p>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {projects.map((p) => (
                            <Card key={p.listing_id} className="group rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-slate-200 transition-all duration-300 overflow-hidden flex flex-col">
                                <CardContent className="p-0 flex flex-col flex-1">
                                    <div className="h-1 w-full bg-linear-to-r from-[#0f172a] to-[#2563eb]" />
                                    <div className="p-5 flex flex-col flex-1">
                                        {/* Icon + Status */}
                                        <div className="flex items-start justify-between gap-3 mb-3">
                                            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                                                <Briefcase size={16} className="text-slate-400" />
                                            </div>
                                            <Badge className="text-[11px] bg-green-100 text-green-700 border border-green-100 rounded-full px-2.5 py-1 shrink-0">
                                                {p.project_status.toUpperCase()}
                                            </Badge>
                                        </div>

                                        {/* Title */}
                                        <h3 className="font-bold text-[#0f172a] text-sm leading-snug mb-2.5">{p.title}</h3>

                                        {/* Skills */}
                                        <div className="flex flex-wrap gap-1.5 mb-4 min-h-6">
                                            {p.skills_fulfilled?.slice(0, 3).map((skill) => (
                                                <span key={skill} className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 border border-slate-200">
                                                    {skill}
                                                </span>
                                            ))}
                                            {p.skills_fulfilled?.length > 3 && (
                                                <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-400">
                                                    +{p.skills_fulfilled.length - 3} more
                                                </span>
                                            )}
                                        </div>

                                        {/* Meta */}
                                        <div className="grid grid-cols-2 gap-2 mb-4">
                                            <div className="flex items-center gap-1.5 text-xs text-slate-400">
                                                <Clock size={11} className="shrink-0" />
                                                <span>{p.duration}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5 text-xs text-slate-400">
                                                <Wallet size={11} className="shrink-0" />
                                                <span>RM {p.allowance}/mo</span>
                                            </div>
                                            <div className="flex items-center gap-1.5 text-xs text-slate-400">
                                                <Calendar size={11} className="shrink-0" />
                                                <span>{new Date(p.start_date).toLocaleDateString("en-MY", { month: "short", year: "numeric" })}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5 text-xs text-slate-400">
                                                <Layers size={11} className="shrink-0" />
                                                <span>{p.duration}</span>
                                            </div>
                                        </div>

                                        {/* Button */}
                                        <div className="mt-auto">
                                            <Button
                                                className="w-full text-sm py-2.5 rounded-lg cursor-pointer"
                                                onClick={() => router.push(`/my-workspace/${p.listing_id}`)}
                                            >
                                                Open Workspace
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
