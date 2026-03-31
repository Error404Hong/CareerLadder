"use client"

import { useParams } from "next/navigation"
import { useState, useEffect } from "react"

import { Training, TrainingRegistration, Student } from "@/types"
import { getProgramById, getProgramRegistration } from "@/app/api/training"
import { getAllStudent } from "@/app/api/user"

import { toast } from "sonner"
import { Users, CalendarDays, MapPin, Clock, Globe, Lock, UserPlus, Video } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"

import { DataTable } from "./data-table"
import { getColumns } from "./columns"
import { InviteDialog } from "./invite-dialog"

const statusConfig: Record<string, { label: string; className: string }> = {
    open: { label: "Open", className: "bg-green-100 text-green-700 border border-green-200" },
    closed: { label: "Closed", className: "bg-red-100 text-red-600 border border-red-200" },
    cancelled: { label: "Cancelled", className: "bg-slate-100 text-slate-500 border border-slate-200" },
}

export default function ViewProgramDetails() {
    const params = useParams();
    const programId = params.programId as string;

    const [isLoading, setIsLoading] = useState(true)
    const [programData, setProgramData] = useState<Training | null>(null);
    const [registration, setRegistration] = useState<TrainingRegistration[]>([]);
    const [students, setStudents] = useState<Student[]>([]);
    const [inviteOpen, setInviteOpen] = useState(false)
    const [isLoadingStudents, setIsLoadingStudents] = useState(false)

    useEffect(() => {
        const fetchProgram = async () => {
            try {
                const fetchRes = await getProgramById(programId);
                const fetchRegistration = await getProgramRegistration(programId);

                if (fetchRes.success && fetchRegistration.success) {
                    setProgramData(fetchRes.data);
                    setRegistration(fetchRegistration.data)
                } else {
                    toast.error("Failed to fetch program details.")
                }
            } catch {
                toast.error("Something went wrong. Please reload page.")
            } finally {
                setIsLoading(false)
            }
        }

        fetchProgram()
    }, [programId])

    const columns = getColumns()

    const handleOpenInvite = async () => {
        setInviteOpen(true)
        if (students.length > 0) return
        setIsLoadingStudents(true)

        try {
            const studentRes = await getAllStudent()
            if (studentRes.success) {
                setStudents(studentRes.data)
            } else {
                toast.error("Failed to fetch student profiles.")
            }
        } finally {
            setIsLoadingStudents(false)
        }
    }

    const handleInviteSuccess = async () => {
        try {
            const fetchRegistration = await getProgramRegistration(programId)
            const fetchRes = await getProgramById(programId)
            if (fetchRegistration.success && fetchRes.success) {
                setRegistration(fetchRegistration.data)
                setProgramData(fetchRes.data)
            }
        } catch {
            toast.error("Failed to refresh registrations.")
        }
    }

    if (isLoading) return (
        <div className="min-h-screen bg-slate-50">
            <div className="max-w-6xl mx-auto px-6 py-6 flex flex-col gap-6">
                <Skeleton className="h-4 w-64 rounded" />
                <div className="flex flex-col gap-5">
                    <Skeleton className="h-32 w-full rounded-lg" />
                    <Skeleton className="h-48 w-full rounded-lg" />
                    <Skeleton className="h-48 w-full rounded-lg" />
                </div>
            </div>
        </div>
    )

    const statusStyle = statusConfig[programData?.status ?? ""] ?? { label: programData?.status ?? "", className: "bg-slate-100 text-slate-500 border border-slate-200" }
    const registrationCount = Number(programData?.registration_count)
    const remainingVacancies = Number(programData?.vacancies ?? 0)
    const totalVacancies = remainingVacancies + registrationCount

    return (
        <>
            <div className="min-h-screen bg-slate-50">
                <div className="max-w-6xl mx-auto px-6 py-6 flex flex-col gap-6">

                    {/* Breadcrumb */}
                    <Breadcrumb>
                        <BreadcrumbList>
                            <BreadcrumbItem>
                                <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                                <BreadcrumbLink href="/training-programs">Training Programs</BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                                <BreadcrumbPage>View Program — {programData?.title}</BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>

                    {/* Header */}
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                        <div>
                            <h1 className="text-xl font-bold tracking-tight">{programData?.title}</h1>
                            <p className="text-sm text-slate-400 mt-1">
                                Created on {new Date(programData?.created_at ?? "").toLocaleDateString("en-MY", { day: "numeric", month: "long", year: "numeric" })}
                            </p>
                        </div>
                        {programData?.meeting_url && programData?.status === "open" && (
                            <a href={programData.meeting_url} target="_blank" rel="noreferrer">
                                <Button className="cursor-pointer gap-1.5">
                                    <Video size={14} /> Join Session
                                </Button>
                            </a>
                        )}
                    </div>

                    {/* Stats Card */}
                    <Card className="rounded-lg border border-slate-200 shadow-sm">
                        <CardContent className="px-6 py-4 flex flex-wrap items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Users size={14} className="text-slate-400" />
                                <span className="text-sm text-slate-400">Registrations</span>
                                <span className="text-sm font-semibold text-[#0f172a]">{registrationCount} / {totalVacancies}</span>
                            </div>
                            <div className="h-4 w-px bg-slate-200 hidden sm:block" />
                            <div className="flex items-center gap-2">
                                <CalendarDays size={14} className="text-slate-400" />
                                <span className="text-sm text-slate-400">Date</span>
                                <span className="text-sm font-semibold text-[#0f172a]">
                                    {new Date(programData?.date ?? "").toLocaleDateString("en-MY", { day: "numeric", month: "short", year: "numeric" })}
                                </span>
                            </div>
                            <div className="h-4 w-px bg-slate-200 hidden sm:block" />
                            <div className="flex items-center gap-2">
                                <Clock size={14} className="text-slate-400" />
                                <span className="text-sm text-slate-400">Duration</span>
                                <span className="text-sm font-semibold text-[#0f172a]">{programData?.duration}</span>
                            </div>
                            <div className="h-4 w-px bg-slate-200 hidden sm:block" />
                            <div className="flex items-center gap-2">
                                <MapPin size={14} className="text-slate-400" />
                                <span className="text-sm text-slate-400">Location</span>
                                <span className="text-sm font-semibold text-[#0f172a]">{programData?.location}</span>
                            </div>
                            <div className="h-4 w-px bg-slate-200 hidden sm:block" />
                            <div className="flex items-center gap-2">
                                {programData?.is_public ? <Globe size={14} className="text-slate-400" /> : <Lock size={14} className="text-slate-400" />}
                                <span className={`text-xs font-medium px-3 py-1 rounded-full ${programData?.is_public ? "bg-blue-100 text-blue-700 border border-blue-200" : "bg-slate-100 text-slate-500 border border-slate-200"}`}>
                                    {programData?.is_public ? "Public" : "Private"}
                                </span>
                            </div>
                            <div className="h-4 w-px bg-slate-200 hidden sm:block" />
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-slate-400">Status</span>
                                <span className={`text-xs font-medium px-3 py-1 rounded-full ${statusStyle.className}`}>
                                    {statusStyle.label}
                                </span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Registrations Table */}
                    <Card className="rounded-lg border border-slate-200 shadow-sm">
                        <CardHeader className="px-5 border-b border-grey-300 flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="text-base font-semibold text-[#0f172a]">Registrations</CardTitle>
                                <CardDescription>
                                    {registrationCount} participant{registrationCount !== 1 ? "s" : ""} registered for this program
                                </CardDescription>
                            </div>
                            {!programData?.is_public && (
                                <Button className="cursor-pointer gap-1.5 shrink-0" onClick={handleOpenInvite}>
                                    <UserPlus size={13} /> Add Participant
                                </Button>
                            )}
                        </CardHeader>
                        <CardContent className="px-6 py-3">
                            {registrationCount === 0 ? (
                                <div className="flex flex-col items-center justify-center py-16 gap-3">
                                    <Users size={32} className="text-slate-200" />
                                    <p className="text-sm font-medium text-slate-400">No registrations yet</p>
                                    <p className="text-xs text-slate-300">Participants will appear here once they register</p>
                                </div>
                            ) : (
                                <DataTable
                                    columns={columns}
                                    data={registration}
                                    searchPlaceholder="Search participants..."
                                />
                            )}
                        </CardContent>
                    </Card>

                </div>
            </div>

            <InviteDialog
                open={inviteOpen}
                onOpenChange={setInviteOpen}
                students={students}
                isLoadingStudents={isLoadingStudents}
                programId={programId}
                onSuccess={handleInviteSuccess}
            />
        </>
    )
}
