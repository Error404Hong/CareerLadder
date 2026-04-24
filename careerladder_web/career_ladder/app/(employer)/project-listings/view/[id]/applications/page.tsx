"use client"

import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"

import { getProjectApplicationsById } from "@/app/api/project"
import { Application } from "@/types"
import { ProjectApplication } from "@/types/projectApplication"

import { toast } from "sonner"
import { Users, Sparkles, Loader2 } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"

import { DataTable } from "./data-table"
import { getColumns } from "./columns"

export default function ViewProjectApplications() {
    const router = useRouter()
    const params = useParams()
    const id = params.id as string

    const [isLoading, setIsLoading] = useState(true)
    const [applicationData, setApplicationData] = useState<Application[]>([])
    const [rankingMap, setRankingMap] = useState<Map<string, { score: number; reasoning: string }> | null>(null)
    const [rankLoading, setRankLoading] = useState(false)

    useEffect(() => {
        const getApplications = async () => {
            try {
                const fetchRes = await getProjectApplicationsById(id)
                if (fetchRes.success) {
                    console.log("DATA:", fetchRes.data);
                    setApplicationData(fetchRes.data)
                } else {
                    toast.error("Failed to fetch applications. Please try again")
                }
            } finally {
                setIsLoading(false)
            }
        }
        getApplications()
    }, [id])

    const handleRankCandidates = async () => {
        if (applicationData.length === 0) return
        setRankLoading(true)
        try {
            const projectApps = applicationData as unknown as ProjectApplication[]
            const listing = {
                title: projectApps[0]?.title ?? "",
                description: projectApps[0]?.description ?? "",
                skills_required: projectApps[0]?.skills_required ?? [],
            }
            const candidates = applicationData.map((app, i) => ({
                applicationId: app.id,
                name: `${app.first_name ?? ""} ${app.last_name ?? ""}`,
                major: app.major,
                skills_fulfilled: app.skills_fulfilled ?? [],
                profile_summary: app.profile_summary ?? "",
                cover_letter: app.cover_letter ?? "",
                expected_salary: app.expected_salary,
                availability: app.availability,
                duration: projectApps[i]?.duration,
            }))
            const res = await fetch("/api/ai/rank-candidates", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ listing, candidates }),
            })
            const data = await res.json()
            if (data.success) {
                const map = new Map<string, { score: number; reasoning: string }>()
                data.data.rankings.forEach((r: { applicationId: string; suitabilityScore: number; reasoning: string }) => {
                    map.set(r.applicationId, { score: r.suitabilityScore, reasoning: r.reasoning })
                })
                setRankingMap(map)
            } else {
                toast.error("Failed to rank candidates. Please try again.")
            }
        } catch {
            toast.error("Failed to rank candidates. Please try again.")
        } finally {
            setRankLoading(false)
        }
    }

    const sortedData = rankingMap
        ? [...applicationData].sort((a, b) => {
            const scoreA = rankingMap.get(a.id)?.score ?? 0
            const scoreB = rankingMap.get(b.id)?.score ?? 0
            return scoreB - scoreA
        })
        : applicationData

    const columns = getColumns(
        (application) => router.push(`/project-listings/view/${id}/applications/${application.id}`),
        rankingMap ?? undefined
    )

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="max-w-6xl mx-auto px-6 py-6 flex flex-col gap-6">

                <Breadcrumb>
                    <BreadcrumbList>
                        <BreadcrumbItem>
                            <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbLink href="/project-listings">Project Listings</BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbLink href={`/project-listings/view/${id}`}>View Project</BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbPage>Applications</BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>

                {isLoading ? (
                    <Card className="rounded-lg border border-slate-200 shadow-sm">
                        <CardHeader className="px-5 border-b border-grey-300">
                            <div className="flex flex-col gap-2">
                                <Skeleton className="h-5 w-40 rounded" />
                                <Skeleton className="h-4 w-64 rounded" />
                            </div>
                        </CardHeader>
                        <CardContent className="px-6 py-3">
                            <div className="flex flex-col gap-3 py-4">
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <Skeleton key={i} className="h-12 w-full rounded-xl" />
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    <Card className="rounded-lg border border-slate-200 shadow-sm">
                        <CardHeader className="px-5 border-b border-grey-300 flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="text-base font-semibold text-[#0f172a]">Project Applications</CardTitle>
                                <CardDescription>
                                    {applicationData.length} application{applicationData.length !== 1 ? "s" : ""} received for this project
                                </CardDescription>
                            </div>
                            {applicationData.length > 0 && (
                                <button
                                    onClick={handleRankCandidates}
                                    disabled={rankLoading || isLoading}
                                    className="flex items-center gap-1.5 h-9 px-3 rounded-xl border border-indigo-200 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 text-sm font-medium transition-colors disabled:opacity-60 shrink-0"
                                >
                                    {rankLoading ? <Loader2 size={13} className="animate-spin" /> : <Sparkles size={13} />}
                                    {rankLoading ? "Ranking..." : rankingMap ? "Re-rank" : "Rank Candidates"}
                                </button>
                            )}
                        </CardHeader>
                        <CardContent className="px-6 py-3">
                            <DataTable
                                columns={columns}
                                data={sortedData}
                                searchPlaceholder="Search applicants..."
                                emptyIcon={<Users size={32} className="text-slate-200" />}
                                emptyTitle="No applications yet"
                                emptyDescription="Applications will appear here once candidates start applying"
                            />
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    )
}
