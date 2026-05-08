"use client"

import { Training } from "@/types"
import { getAllTraining } from "@/app/api/training"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

import { toast } from "sonner"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { BookOpen, CheckCircle2, XCircle, Users, FileDown } from "lucide-react"
import { generatePDFReport } from "@/lib/generate-report"
import { DataTable } from "./data-table"
import { getTrainingColumns } from "./training-columns"
import { DeleteProgramDialog } from "./components/DeleteProgramDialog"

function StatCard({
    icon: Icon, label, value, iconClass, iconBg,
}: {
    icon: React.ElementType; label: string; value: number | string; iconClass: string; iconBg: string
}) {
    return (
        <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${iconBg}`}>
                <Icon size={18} className={iconClass} />
            </div>
            <div>
                <p className="text-xs text-slate-400 font-medium">{label}</p>
                <p className="text-2xl font-bold text-[#0f172a] leading-tight">{value}</p>
            </div>
        </div>
    )
}

export default function ProgramManagementPage() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(true)
    const [trainings, setTrainings] = useState<Training[]>([])
    const [deletingProgram, setDeletingProgram] = useState<Training | null>(null)

    useEffect(() => {
        const fetchAllTraining = async () => {
            try {
                const fetchRes = await getAllTraining()
                if (fetchRes.success) {
                    console.log("TRAINING: ", fetchRes.data);
                    setTrainings(fetchRes.data ?? [])
                }
                else toast.error("Failed to fetch training programs. Please try again.")
            } catch {
                toast.error("Something went wrong. Please try again")
            } finally {
                setIsLoading(false)
            }
        }
        fetchAllTraining()
    }, [])

    const trainingColumns = getTrainingColumns(
        (id) => router.push(`/program-management/${id}`),
        (program) => setDeletingProgram(program)
    )

    const openPrograms = trainings.filter((t) => t.status === "open").length
    const completedPrograms = trainings.filter((t) => t.status === "completed").length

    const handleGenerateReport = () => {
        generatePDFReport({
            title: "Training Programs Report",
            subtitle: "All training programs across companies",
            stats: [
                { label: "Total Programs", value: trainings.length },
                { label: "Open", value: openPrograms },
                { label: "Completed", value: completedPrograms },
            ],
            tables: [{
                head: ["Title", "Company", "Mode / Location", "Date", "Duration", "Status", "Registrations"],
                body: trainings.map(t => [
                    t.title,
                    t.company_name ?? "—",
                    t.meeting_url ? "Online" : (t.location || "—"),
                    t.date ? new Date(t.date).toLocaleDateString("en-MY") : "—",
                    t.duration,
                    t.status.charAt(0).toUpperCase() + t.status.slice(1),
                    t.registration_count ?? 0,
                ]),
            }],
        })
    }

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="max-w-6xl mx-auto px-6 py-6 flex flex-col gap-6">

                <Breadcrumb>
                    <BreadcrumbList>
                        <BreadcrumbItem>
                            <BreadcrumbLink href="/admin-dashboard">Dashboard</BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbPage>Training Program Management</BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>

                {isLoading ? (
                    <>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            {Array.from({ length: 4 }).map((_, i) => (
                                <div key={i} className="rounded-xl border border-slate-200 bg-white px-5 py-4 flex items-center gap-4">
                                    <Skeleton className="w-10 h-10 rounded-lg shrink-0" />
                                    <div className="flex flex-col gap-1.5 flex-1">
                                        <Skeleton className="h-3 w-16 rounded" />
                                        <Skeleton className="h-6 w-10 rounded" />
                                    </div>
                                </div>
                            ))}
                        </div>
                        <Card className="rounded-lg border border-slate-200 shadow-sm">
                            <CardHeader className="px-5 border-b border-slate-200">
                                <div className="flex flex-col gap-2">
                                    <Skeleton className="h-6 w-32 rounded" />
                                    <Skeleton className="h-4 w-64 rounded" />
                                </div>
                            </CardHeader>
                            <CardContent className="px-5 py-3">
                                <div className="flex flex-col gap-3 py-4">
                                    {Array.from({ length: 5 }).map((_, i) => (
                                        <Skeleton key={i} className="h-12 w-full rounded-xl" />
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </>
                ) : (
                    <>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                            <StatCard icon={BookOpen} label="Total Programs" value={trainings.length} iconBg="bg-blue-50" iconClass="text-[#2563eb]" />
                            <StatCard icon={CheckCircle2} label="Open" value={openPrograms} iconBg="bg-green-50" iconClass="text-green-600" />
                            <StatCard icon={XCircle} label="Completed" value={completedPrograms} iconBg="bg-slate-100" iconClass="text-slate-500" />
                        </div>

                        <Card className="rounded-lg border border-slate-200 shadow-sm">
                            <CardHeader className="px-5 border-b border-slate-100">
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <CardTitle className="text-xl font-bold">Training Programs</CardTitle>
                                        <CardDescription>View and monitor all training programs across companies</CardDescription>
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="gap-1.5 shrink-0 cursor-pointer"
                                        onClick={handleGenerateReport}
                                        disabled={trainings.length === 0}
                                    >
                                        <FileDown size={14} />
                                        Export PDF
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="px-5 py-4">
                                <DataTable
                                    columns={trainingColumns}
                                    data={trainings}
                                    searchPlaceholder="Search programs..."
                                    emptyTitle="No training programs found"
                                    emptyIcon={<BookOpen size={32} className="text-slate-200" />}
                                />
                            </CardContent>
                        </Card>
                    </>
                )}
            </div>

            <DeleteProgramDialog
                program={deletingProgram}
                onClose={() => setDeletingProgram(null)}
                onDeleted={(id) => setTrainings((prev) => prev.filter((t) => t.id !== id))}
            />
        </div>
    )
}
