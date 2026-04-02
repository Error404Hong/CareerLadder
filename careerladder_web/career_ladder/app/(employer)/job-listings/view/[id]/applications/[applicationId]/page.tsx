"use client"

import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { useUser } from "@clerk/nextjs"

import { Application, Job, Meeting } from "@/types"
import { getApplicantsProfile, updateApplicationStatus, getJobById, updateJobStatus, updateJobVacancies } from "@/app/api/job"
import { createNotification } from "@/app/api/notifications"
import { getApplicantMeetingById, updateMeetingStatus } from "@/app/api/meetings"
import { createChannel } from "@/app/api/chat"

import Image from "next/image"
import { MeetingDialog } from "./meeting-dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { MapPin, Briefcase, Link, ExternalLink, DollarSign, Clock, User, Video, Copy, Calendar, CalendarClock, MoreHorizontal, Plus, CalendarSync, MessageSquare, ListCollapse } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { format } from "date-fns"

const notificationConfig: Record<string, { title: string; message: (title: string) => string }> = {
    reviewed: { title: "Application Reviewed", message: (title) => `Your application for the job "${title}" has been reviewed by the company.` },
    shortlisted: { title: "Application Shortlisted", message: (title) => `Congratulations! Your application for the job "${title}" has been shortlisted. Please look out for an upcoming meeting invitation for your interview.` },
    accepted: { title: "Application Accepted", message: (title) => `Congratulations! Your application for the job "${title}" has been accepted.` },
    rejected: { title: "Application Rejected", message: (title) => `Your application for the job "${title}" was not successful this time. Keep trying!` },
}

const allowedTransitions: Record<string, string[]> = {
    pending: ["pending", "reviewed", "shortlisted", "accepted", "rejected"],
    reviewed: ["reviewed", "shortlisted", "accepted", "rejected"],
    shortlisted: ["shortlisted", "accepted", "rejected"],
    accepted: ["accepted"],
    rejected: ["rejected"],
}

const statusConfig: Record<string, { label: string; className: string }> = {
    pending: { label: "Pending", className: "bg-yellow-100 text-yellow-700 border border-yellow-200" },
    reviewed: { label: "Reviewed", className: "bg-blue-100 text-blue-700 border border-blue-200" },
    shortlisted: { label: "Shortlisted", className: "bg-purple-100 text-purple-700 border border-purple-200" },
    accepted: { label: "Accepted", className: "bg-green-100 text-green-700 border border-green-200" },
    rejected: { label: "Rejected", className: "bg-red-100 text-red-600 border border-red-200" },
}

const meetingStatusConfig: Record<string, { label: string; className: string }> = {
    scheduled: { label: "Scheduled", className: "bg-blue-100 text-blue-700 border border-blue-200" },
    reschedule_requested: { label: "Reschedule Requested", className: "bg-yellow-100 text-yellow-700 border border-yellow-200" },
    completed: { label: "Completed", className: "bg-slate-100 text-slate-600 border border-slate-200" },
    cancelled: { label: "Cancelled", className: "bg-red-100 text-red-600 border border-red-200" },
}

export default function ApplicationDetails() {
    const params = useParams()
    const router = useRouter()
    const { user } = useUser()
    const id = params.id as string
    const applicationId = params.applicationId as string

    const [isLoading, setIsLoading] = useState(true)
    const [jobData, setJobData] = useState<Job | null>(null);
    const [application, setApplication] = useState<Application | null>(null)
    const [isUpdating, setIsUpdating] = useState(false)
    const [selectedStatus, setSelectedStatus] = useState<string>("")
    const [meetingDialogOpen, setMeetingDialogOpen] = useState(false)
    const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null)
    const [meetings, setMeetings] = useState<Meeting[]>([])

    const fetchMeetings = async (clerkId?: string) => {
        const cid = clerkId ?? application?.clerk_id
        if (!cid) return
        try {
            const res = await getApplicantMeetingById(id, "job", cid)
            if (res.success) {
                setMeetings(Array.isArray(res.data) ? res.data : res.data ? [res.data] : [])
            }
        } catch {
            // silently fail
        }
    }

    useEffect(() => {
        const getApplication = async () => {
            try {
                const fetchRes = await getApplicantsProfile(applicationId)
                const jobRes = await getJobById(id);
                if (fetchRes.success && jobRes.success) {
                    setJobData(jobRes.data);
                    setApplication(fetchRes.data)
                    setSelectedStatus(fetchRes.data.status)
                    fetchMeetings(fetchRes.data.clerk_id)
                } else {
                    toast.error("Failed to fetch application")
                }
            } finally {
                setIsLoading(false)
            }
        }

        getApplication()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [applicationId, id])

    const handleMessage = async () => {
        if (!user || !application) return
        try {
            await createChannel(user.id, application.clerk_id)
            router.push("/messages")
        } catch {
            toast.error("Failed to open chat")
        }
    }

    const handleCancelMeeting = async (meetingId: string) => {
        const res = await updateMeetingStatus(meetingId, "cancelled")
        if (res.success) {
            setMeetings(prev => prev.map(m => m.id === meetingId ? { ...m, status: "cancelled" } : m))
            toast.success("Meeting cancelled")
        } else {
            toast.error("Failed to cancel meeting")
        }
    }

    const handleUpdateStatus = async () => {
        if (!selectedStatus || selectedStatus === application?.status) return
        setIsUpdating(true)

        try {
            const res = await updateApplicationStatus(applicationId, selectedStatus)
            if (res.success) {
                setApplication(prev => prev ? { ...prev, status: selectedStatus } : prev)
                toast.success("Application status updated successfully");

                const notifCfg = notificationConfig[selectedStatus]
                if (notifCfg && application?.clerk_id) {
                    await createNotification(
                        application.clerk_id,
                        `job_${selectedStatus}`,
                        notifCfg.title,
                        notifCfg.message(jobData?.title ?? ""),
                        "job",
                        id,
                    )
                }

                if (selectedStatus === "shortlisted") {
                    setMeetingDialogOpen(true);
                }

                if (selectedStatus === "accepted") {
                    const updVacancy = await updateJobVacancies(id);

                    if (!updVacancy.success) {
                        toast.error("Status updated but failed to update vacancies");
                        return
                    } else {
                        setJobData(prev => prev ? { ...prev, vacancies: updVacancy.data.vacancies } : prev)
                    }

                    if (updVacancy.data.vacancies === 0) {
                        const updStatus = await updateJobStatus(id, "closed");
                        if (updStatus.success) {
                            setJobData(prev => prev ? { ...prev, status: "closed" } : prev);
                        }
                    }
                }

            } else {
                toast.error("Failed to update status")
            }
        } finally {
            setIsUpdating(false)
        }
    }

    if (isLoading) return (
        <div className="min-h-screen bg-slate-50">
            <div className="max-w-6xl mx-auto px-6 py-6 flex flex-col gap-6">
                <Skeleton className="h-4 w-64 rounded" />
                <Skeleton className="h-32 w-full rounded-lg" />
                <Skeleton className="h-10 w-72 rounded" />
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                    <div className="lg:col-span-2 flex flex-col gap-5">
                        <Skeleton className="h-48 w-full rounded-lg" />
                        <Skeleton className="h-32 w-full rounded-lg" />
                        <Skeleton className="h-32 w-full rounded-lg" />
                    </div>
                    <div className="flex flex-col gap-5">
                        <Skeleton className="h-48 w-full rounded-lg" />
                        <Skeleton className="h-32 w-full rounded-lg" />
                    </div>
                </div>
            </div>
        </div>
    )

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
                                <BreadcrumbLink href="/job-listings">Job Listings</BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                                <BreadcrumbLink href={`/job-listings/view/${id}`}>View Job</BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                                <BreadcrumbLink href={`/job-listings/view/${id}/applications`}>Applications</BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                                <BreadcrumbPage>Application Details</BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>

                    {/* Job Info Banner */}
                    <div className="bg-white rounded-lg border border-slate-200 shadow-sm px-6 py-5">
                        <div className="flex items-start justify-between gap-4 flex-wrap">
                            <div className="flex flex-col gap-1">
                                <p className="text-xs text-slate-400 uppercase tracking-widest">Position</p>
                                <p className="text-lg font-bold text-[#0f172a]">{jobData?.title}</p>
                                <div className="flex items-center gap-2 flex-wrap mt-1">
                                    <span className="text-xs text-slate-500 capitalize bg-slate-100 px-2 py-0.5 rounded-full">{jobData?.employment_type}</span>
                                    <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">{jobData?.location}</span>
                                    <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">{jobData?.is_remote ? "Remote" : "On-site"}</span>
                                    <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${jobData?.status === "open" ? "bg-green-100 text-green-700 border border-green-200" : "bg-red-100 text-red-600 border border-red-200"}`}>
                                        {jobData?.status === "open" ? "Open" : "Closed"}
                                    </span>
                                </div>
                            </div>
                            <div className="flex items-center gap-6 flex-wrap">
                                <div className="flex flex-col gap-1">
                                    <p className="text-[11px] text-slate-400 uppercase tracking-widest">Salary Range</p>
                                    <p className="text-sm font-semibold text-[#0f172a]">
                                        RM {Number(jobData?.salary_min).toLocaleString()} — RM {Number(jobData?.salary_max).toLocaleString()}
                                    </p>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <p className="text-[11px] text-slate-400 uppercase tracking-widest">Vacancies</p>
                                    <p className="text-sm font-semibold text-[#0f172a]">{jobData?.vacancies} open</p>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <p className="text-[11px] text-slate-400 uppercase tracking-widest">Skills Required</p>
                                    <div className="flex flex-wrap gap-1">
                                        {jobData?.skills_required.map((skill) => (
                                            <Badge key={skill} variant="secondary" className="text-[11px] px-2 py-0.5">{skill}</Badge>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Applicant Hero Card */}
                    <Card className="rounded-lg border border-slate-200 shadow-sm overflow-hidden p-0">
                        <div className="h-16 bg-[#0f172a] relative">
                            <div className="absolute -bottom-10 -right-10 w-32 h-32 rounded-full bg-[#2563eb]/10" />
                        </div>
                        <CardContent className="px-6 pb-5">
                            <div className="flex items-end justify-between -mt-8 mb-4 flex-wrap gap-4">
                                <div className="flex items-end gap-4">
                                    <div className="w-16 h-16 rounded-full border-4 border-white bg-slate-100 shadow-md flex items-center justify-center shrink-0 relative z-10 overflow-hidden">
                                        {application?.image_url ? (
                                            <Image src={application.image_url} alt="profile" height={100} width={100} className="rounded-full" />
                                        ) : (
                                            <User size={24} className="text-slate-300" />
                                        )}
                                    </div>
                                    <div className="pb-1">
                                        <h1 className="text-xl font-bold text-[#0f172a]">{application?.first_name} {application?.last_name}</h1>
                                        <p className="text-sm text-slate-400">{application?.email}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 pb-1">
                                    <span className={`text-xs font-medium px-3 py-1.5 rounded-full ${statusConfig[application?.status ?? ""]?.className ?? "bg-slate-100 text-slate-500 border border-slate-200"}`}>
                                        {statusConfig[application?.status ?? ""]?.label ?? application?.status}
                                    </span>
                                    <p className="text-xs text-slate-400">
                                        Applied {new Date(application?.applied_at ?? "").toLocaleDateString("en-MY", { day: "numeric", month: "short", year: "numeric" })}
                                    </p>
                                    <Button size="sm" className="cursor-pointer gap-1.5 text-xs" onClick={handleMessage}>
                                        <MessageSquare size={13} /> Message
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Tabs */}
                    <Tabs defaultValue="details">
                        <TabsList className="mb-4" variant="line">
                            <TabsTrigger value="details" className="rounded-md data-[state=active]:bg-white data-[state=active]:text-[#0f172a] data-[state=active]:shadow-sm text-slate-500 cursor-pointer">
                                <ListCollapse /> Application Details
                            </TabsTrigger>
                            <TabsTrigger value="meetings" className="gap-2 rounded-md data-[state=active]:bg-white data-[state=active]:text-[#0f172a] data-[state=active]:shadow-sm text-slate-500 cursor-pointer">
                                <Video /> Meetings
                                <Badge className="ml-1 text-[11px] bg-blue-50 text-blue-600 border border-blue-100 rounded-full px-2 py-0">{meetings.length}</Badge>
                            </TabsTrigger>
                        </TabsList>

                        {/* Tab 1: Application Details */}
                        <TabsContent value="details">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

                                {/* Left */}
                                <div className="lg:col-span-2 flex flex-col gap-5">
                                    <Card className="rounded-lg border border-slate-200 shadow-sm">
                                        <CardHeader className="px-5 border-b border-slate-200">
                                            <CardTitle className="text-base font-semibold text-[#0f172a]">Profile Summary</CardTitle>
                                        </CardHeader>
                                        <CardContent className="px-6 py-3">
                                            <p className="text-sm text-slate-500 leading-relaxed">
                                                {application?.profile_summary ?? "No profile summary provided."}
                                            </p>
                                        </CardContent>
                                    </Card>

                                    <Card className="rounded-lg border border-slate-200 shadow-sm">
                                        <CardHeader className="px-5 border-b border-slate-200">
                                            <CardTitle className="text-base font-semibold text-[#0f172a]">Cover Letter</CardTitle>
                                        </CardHeader>
                                        <CardContent className="px-6 py-3">
                                            {application?.cover_letter ? (
                                                <p className="text-sm text-slate-500 leading-relaxed whitespace-pre-line">{application.cover_letter}</p>
                                            ) : (
                                                <p className="text-sm text-slate-400 italic">No cover letter provided.</p>
                                            )}
                                        </CardContent>
                                    </Card>

                                    <Card className="rounded-lg border border-slate-200 shadow-sm">
                                        <CardHeader className="px-5 border-b border-slate-200">
                                            <CardTitle className="text-base font-semibold text-[#0f172a]">Matched Skills</CardTitle>
                                            <CardDescription>Skills the applicant has that match the job requirements</CardDescription>
                                        </CardHeader>
                                        <CardContent className="px-6 py-3">
                                            {application?.skills_fulfilled?.length ? (
                                                <div className="flex flex-wrap gap-2">
                                                    {application.skills_fulfilled.map((skill) => (
                                                        <Badge key={skill} variant="secondary" className="px-3 py-1.5 text-sm">{skill}</Badge>
                                                    ))}
                                                </div>
                                            ) : (
                                                <p className="text-sm text-slate-400 italic">No matched skills.</p>
                                            )}
                                        </CardContent>
                                    </Card>
                                </div>

                                {/* Right */}
                                <div className="flex flex-col gap-5">
                                    <Card className="rounded-lg border border-slate-200 shadow-sm">
                                        <CardHeader className="px-5 border-b border-slate-200">
                                            <CardTitle className="text-base font-semibold text-[#0f172a]">Overview</CardTitle>
                                        </CardHeader>
                                        <CardContent className="px-6 py-3 flex flex-col gap-3">
                                            <div className="flex items-center gap-2 text-sm text-slate-500">
                                                <MapPin size={13} className="text-slate-300 shrink-0" />
                                                {application?.location ?? "—"}
                                            </div>
                                            <Separator />
                                            <div className="flex items-center gap-2 text-sm text-slate-500">
                                                <Briefcase size={13} className="text-slate-300 shrink-0" />
                                                {application?.major ?? "—"}
                                            </div>
                                            <Separator />
                                            <div className="flex items-center gap-2 text-sm text-slate-500">
                                                <DollarSign size={13} className="text-slate-300 shrink-0" />
                                                RM {Number(application?.expected_salary).toLocaleString()} expected
                                            </div>
                                            <Separator />
                                            <div className="flex items-center gap-2 text-sm text-slate-500">
                                                <Clock size={13} className="text-slate-300 shrink-0" />
                                                {application?.availability ?? "—"}
                                            </div>
                                            {application?.linkedin_url && (
                                                <>
                                                    <Separator />
                                                    <a
                                                        href={application.linkedin_url.startsWith("http") ? application.linkedin_url : `https://${application.linkedin_url}`}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="flex items-center gap-2 text-sm text-[#2563eb] hover:underline"
                                                    >
                                                        <Link size={13} className="shrink-0" />
                                                        LinkedIn Profile
                                                        <ExternalLink size={11} />
                                                    </a>
                                                </>
                                            )}
                                            {application?.resume_url && (
                                                <>
                                                    <Separator />
                                                    <a href={application.resume_url} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm text-[#2563eb] hover:underline">
                                                        <Link size={13} className="shrink-0" />
                                                        Resume
                                                        <ExternalLink size={11} />
                                                    </a>
                                                </>
                                            )}
                                        </CardContent>
                                    </Card>

                                    <Card className="rounded-lg border border-slate-200 shadow-sm">
                                        <CardHeader className="px-5 border-b border-slate-200">
                                            <CardTitle className="text-base font-semibold text-[#0f172a]">Update Status</CardTitle>
                                            <CardDescription>Change the application status</CardDescription>
                                        </CardHeader>
                                        <CardContent className="px-6 py-3 flex flex-col gap-3">
                                            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                                                <SelectTrigger className="w-full">
                                                    <SelectValue placeholder="Select status" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {(["pending", "reviewed", "shortlisted", "accepted", "rejected"] as const).map((s) => {
                                                        const allowed = allowedTransitions[application?.status ?? "pending"] ?? []
                                                        return (
                                                            <SelectItem key={s} value={s} disabled={!allowed.includes(s)}>
                                                                {statusConfig[s].label}
                                                            </SelectItem>
                                                        )
                                                    })}
                                                </SelectContent>
                                            </Select>
                                            <Button
                                                className="cursor-pointer w-full"
                                                disabled={isUpdating || selectedStatus === application?.status}
                                                onClick={handleUpdateStatus}
                                            >
                                                {isUpdating ? "Updating..." : "Update Status"}
                                            </Button>
                                        </CardContent>
                                    </Card>
                                </div>
                            </div>
                        </TabsContent>

                        {/* Tab 2: Meetings */}
                        <TabsContent value="meetings">
                            <div className="flex items-center justify-between mb-4">
                                <p className="text-sm text-slate-500">{meetings.length} meeting{meetings.length !== 1 ? "s" : ""} scheduled</p>
                                <Button
                                    size="sm"
                                    className="cursor-pointer gap-1.5 text-xs"
                                    onClick={() => setMeetingDialogOpen(true)}
                                >
                                    <Plus size={13} /> Schedule New Meeting
                                </Button>
                            </div>

                            {meetings.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
                                    <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">
                                        <CalendarClock size={20} className="text-slate-400" />
                                    </div>
                                    <p className="text-sm font-medium text-slate-500">No meetings scheduled</p>
                                    <p className="text-xs text-slate-400">Meetings will appear here once scheduled with this applicant.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {meetings.map(m => {
                                        const cfg = meetingStatusConfig[m.status] ?? { label: m.status, className: "bg-slate-100 text-slate-500 border border-slate-200" }
                                        return (
                                            <Card key={m.id} className="rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-shadow relative">
                                                <CardContent className="px-5 pt-5 pb-4 flex flex-col gap-4">

                                                    {/* Header */}
                                                    <div className="flex items-start justify-between gap-3">
                                                        <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                                                            <p className="text-sm font-semibold text-[#0f172a] leading-snug">{m.title}</p>
                                                            <span className={`text-[11px] font-medium px-2.5 py-1 rounded-full w-fit ${cfg.className}`}>
                                                                {cfg.label}
                                                            </span>
                                                        </div>
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <button className="cursor-pointer text-slate-400 hover:text-[#0f172a] transition-colors p-0.5 rounded shrink-0">
                                                                    <MoreHorizontal size={16} />
                                                                </button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end" className="w-58">
                                                                {m.status === "reschedule_requested" && (
                                                                    <DropdownMenuItem
                                                                        className="cursor-pointer gap-2 text-sm"
                                                                        onClick={() => { setSelectedMeeting(m); setMeetingDialogOpen(true) }}
                                                                    >
                                                                        <CalendarSync size={13} /> Schedule Reschedule
                                                                    </DropdownMenuItem>
                                                                )}
                                                                <DropdownMenuSeparator />
                                                                <DropdownMenuItem
                                                                    className="cursor-pointer gap-2 text-sm text-red-500 focus:text-red-500"
                                                                    onClick={() => handleCancelMeeting(m.id)}
                                                                >
                                                                    Cancel Meeting
                                                                </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </div>

                                                    {/* Date + Time */}
                                                    {m.scheduled_at && !isNaN(new Date(m.scheduled_at).getTime()) && (
                                                        <div className="flex flex-col gap-1.5">
                                                            <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                                                <Calendar size={12} className="text-slate-300 shrink-0" />
                                                                {format(new Date(m.scheduled_at), "EEEE, d MMMM yyyy")}
                                                            </div>
                                                            <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                                                <Clock size={12} className="text-slate-300 shrink-0" />
                                                                {format(new Date(m.scheduled_at), "hh:mm a")} · {m.duration} mins
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Actions */}
                                                    <div className="flex items-center gap-2 pt-1">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="cursor-pointer flex-1 gap-1.5 text-xs"
                                                            onClick={() => { navigator.clipboard.writeText(m.meeting_url); toast.success("Link copied!") }}
                                                        >
                                                            <Copy size={12} /> Copy Link
                                                        </Button>
                                                        {m.status === "scheduled" ? (
                                                            <a href={m.meeting_url} target="_blank" rel="noreferrer" className="flex-1">
                                                                <Button size="sm" className="cursor-pointer w-full gap-1.5 text-xs">
                                                                    <Video size={12} /> Join
                                                                </Button>
                                                            </a>
                                                        ) : (
                                                            <Button size="sm" className="flex-1 gap-1.5 text-xs" disabled>
                                                                <Video size={12} /> Join
                                                            </Button>
                                                        )}
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        )
                                    })}
                                </div>
                            )}
                        </TabsContent>
                    </Tabs>
                </div>
            </div>

            <MeetingDialog
                open={meetingDialogOpen}
                onOpenChange={(val) => {
                    setMeetingDialogOpen(val)
                    if (!val) { setSelectedMeeting(null); fetchMeetings() }
                }}
                application={application}
                job={jobData}
                existingMeeting={selectedMeeting}
            />
        </>
    )
}
