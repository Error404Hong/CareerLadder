"use client"

import { useUser } from "@clerk/nextjs"
import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { toast } from "sonner"

import { Job, Meeting } from "@/types"
import { type JobApplication } from "../../columns/jobColumns"
import { getJobById, getJobApplications } from "@/app/api/job"
import { getApplicantMeetingById } from "@/app/api/meetings"
import { MeetingCard } from "@/app/(main)/my-meetings/MeetingCard"

import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { MapPin, Briefcase, CalendarDays, DollarSign, Video } from "lucide-react"

const statusConfig: Record<string, { label: string; className: string }> = {
    pending: { label: "Pending", className: "bg-yellow-100 text-yellow-600 border border-yellow-100" },
    reviewed: { label: "Reviewed", className: "bg-blue-100 text-blue-600 border border-blue-100" },
    shortlisted: { label: "Shortlisted", className: "bg-purple-100 text-purple-600 border border-purple-100" },
    accepted: { label: "Accepted", className: "bg-green-100 text-green-600 border border-green-100" },
    rejected: { label: "Rejected", className: "bg-red-100 text-red-500 border border-red-100" },
}

export default function ViewJobApplicationDetails() {
    const { user } = useUser()
    const params = useParams()
    const jobId = params.id as string

    const [isLoading, setIsLoading] = useState(true)
    const [job, setJob] = useState<Job | null>(null)
    const [application, setApplication] = useState<JobApplication | null>(null)
    const [meetings, setMeetings] = useState<Meeting[]>([])

    useEffect(() => {
        if (!user) return

        const fetchDetails = async () => {
            try {
                const [jobRes, appsRes] = await Promise.all([
                    getJobById(jobId),
                    getJobApplications(user.id),
                ])

                if (jobRes.success) setJob(jobRes.data)
                else toast.error("Failed to fetch job details")

                if (appsRes.success) {
                    const found = (appsRes.data as JobApplication[]).find(a => a.listing_id === jobId)
                    if (found) setApplication(found)
                }

                try {
                    const meetingRes = await getApplicantMeetingById(jobId, "job", user.id)
                    const data = meetingRes?.data
                    if (Array.isArray(data)) setMeetings(data)
                    else if (data) setMeetings([data])
                } catch {
                    // no meeting yet — that's fine
                }
            } catch {
                toast.error("Something went wrong. Please try again.")
            } finally {
                setIsLoading(false)
            }
        }

        fetchDetails()
    }, [jobId, user])

    if (isLoading) return (
        <div className="min-h-screen bg-slate-50">
            <div className="max-w-6xl mx-auto px-6 py-6 flex flex-col gap-5">
                <Skeleton className="h-4 w-48 rounded" />
                <Skeleton className="h-20 w-full rounded-xl" />
                <div className="grid grid-cols-5 gap-5">
                    <div className="col-span-2 flex flex-col gap-5">
                        <Skeleton className="h-32 w-full rounded-xl" />
                        <Skeleton className="h-52 w-full rounded-xl" />
                    </div>
                    <div className="col-span-3 flex flex-col gap-4">
                        <Skeleton className="h-44 w-full rounded-xl" />
                        <Skeleton className="h-44 w-full rounded-xl" />
                    </div>
                </div>
            </div>
        </div>
    )

    const status = application?.application_status ?? ""
    const statusCfg = statusConfig[status] ?? { label: status, className: "bg-slate-100 text-slate-500 border border-slate-200" }

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="bg-white border-b border-slate-100">
                <div className="max-w-6xl mx-auto px-6 py-6">
                    <Breadcrumb className="mb-4">
                        <BreadcrumbList>
                            <BreadcrumbItem><BreadcrumbLink href="/home">Home</BreadcrumbLink></BreadcrumbItem>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem><BreadcrumbLink href="/applications">Applications</BreadcrumbLink></BreadcrumbItem>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem><BreadcrumbLink href="/applications">Track Application Status</BreadcrumbLink></BreadcrumbItem>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem><BreadcrumbPage>{job?.title ?? "Job Details"}</BreadcrumbPage></BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>

                    <div className="flex items-start justify-between gap-4 flex-wrap">
                        <div className="flex flex-col gap-1">
                            <h1 className="text-xl font-bold">{job?.title}</h1>
                            <p className="text-sm text-slate-400">{application?.company_name}</p>
                        </div>
                        <span className={`text-xs font-medium px-3 py-1.5 rounded-full ${statusCfg.className}`}>
                            {statusCfg.label}
                        </span>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-6 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

                    {/* Left (40%) — Status + Job Details */}
                    <div className="lg:col-span-2 flex flex-col gap-5">

                        {/* Application Status */}
                        <Card className="rounded-2xl border border-slate-200 shadow-sm">
                            <CardHeader>
                                <CardTitle className="text-base font-semibold text-[#0f172a]">Application Status</CardTitle>
                            </CardHeader>
                            <Separator />
                            <CardContent className="flex flex-col gap-3">
                                <div className="flex items-center gap-2 text-xs text-slate-400">
                                    <CalendarDays size={12} />
                                    Applied {application?.applied_at
                                        ? new Date(application.applied_at).toLocaleDateString("en-MY", { day: "numeric", month: "short", year: "numeric" })
                                        : "—"}
                                </div>
                                {status === "shortlisted" && (
                                    <p className="text-xs text-purple-600 bg-purple-100 border border-purple-100 px-3 py-2 rounded-lg leading-relaxed">
                                        You&apos;ve been shortlisted! Please check your meeting for the scheduled interview.
                                    </p>
                                )}
                                {status === "accepted" && (
                                    <p className="text-xs text-green-600 bg-green-100 border border-green-100 px-3 py-2 rounded-lg leading-relaxed">
                                        Congratulations! Your application has been accepted.
                                    </p>
                                )}
                                {status === "rejected" && (
                                    <p className="text-xs text-red-500 bg-red-100 border border-red-100 px-3 py-2 rounded-lg leading-relaxed">
                                        Your application was not successful this time. Keep trying!
                                    </p>
                                )}
                            </CardContent>
                        </Card>

                        {/* Job Details */}
                        <Card className="rounded-2xl border border-slate-200 shadow-sm">
                            <CardHeader>
                                <CardTitle className="text-base font-semibold text-[#0f172a]">Job Details</CardTitle>
                            </CardHeader>
                            <Separator />
                            <CardContent className="flex flex-col gap-4">
                                <div className="flex flex-wrap gap-2">
                                    <span className="inline-flex items-center gap-1.5 text-xs text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full capitalize">
                                        <Briefcase size={11} /> {job?.employment_type}
                                    </span>
                                    <span className="inline-flex items-center gap-1.5 text-xs text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
                                        <MapPin size={11} /> {job?.location}
                                    </span>
                                    <span className="inline-flex items-center gap-1.5 text-xs text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
                                        {job?.is_remote ? "Remote" : "On-site"}
                                    </span>
                                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${job?.status === "open" ? "bg-green-50 text-green-600 border border-green-100" : "bg-red-50 text-red-500 border border-red-100"}`}>
                                        {job?.status === "open" ? "Open" : "Closed"}
                                    </span>
                                </div>

                                <div className="flex flex-col gap-3">
                                    <div>
                                        <p className="text-[11px] text-slate-400 uppercase tracking-widest">Job Position</p>
                                        <div className="flex items-center gap-1.5 text-sm text-slate-600 font-medium">
                                            <Briefcase size={13} className="text-slate-400" />
                                            {job?.title}
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-[11px] text-slate-400 uppercase tracking-widest">Salary Range</p>
                                        <div className="flex items-center gap-1.5 text-sm text-slate-600 font-medium">
                                            <DollarSign size={13} className="text-slate-400" />
                                            RM {Number(job?.salary_min).toLocaleString()} — RM {Number(job?.salary_max).toLocaleString()} /mo
                                        </div>
                                    </div>

                                </div>

                                {job?.description && (
                                    <>
                                        <Separator />
                                        <div className="flex flex-col gap-1.5">
                                            <p className="text-[11px] text-slate-400 uppercase tracking-widest">Description</p>
                                            <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">{job.description}</p>
                                        </div>
                                    </>
                                )}

                                {job?.requirements && (
                                    <>
                                        <Separator />
                                        <div className="flex flex-col gap-1.5">
                                            <p className="text-[11px] text-slate-400 uppercase tracking-widest">Requirements</p>
                                            <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">{job.requirements}</p>
                                        </div>
                                    </>
                                )}

                                {job?.skills_required?.length ? (
                                    <>
                                        <Separator />
                                        <div className="flex flex-col gap-2">
                                            <p className="text-[11px] text-slate-400 uppercase tracking-widest">Skills Required</p>
                                            <div className="flex flex-wrap gap-1.5">
                                                {job.skills_required.map(skill => (
                                                    <Badge key={skill} variant="secondary" className="text-xs px-2.5 py-1">{skill}</Badge>
                                                ))}
                                            </div>
                                        </div>
                                    </>
                                ) : null}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right (60%) — Meetings */}
                    <div className="lg:col-span-3">
                        <Card className="rounded-2xl border border-slate-200 shadow-sm">
                            <CardHeader className="flex flex-row items-center justify-between">
                                <CardTitle className="text-base font-semibold text-[#0f172a]">Interview Meetings</CardTitle>
                                {meetings.length > 0 && (
                                    <span className="text-xs text-slate-400">{meetings.length} meeting{meetings.length !== 1 ? "s" : ""}</span>
                                )}
                            </CardHeader>
                            <Separator />
                            <CardContent className="flex flex-col gap-3 pt-4">
                                {meetings.length > 0 ? (
                                    meetings.map(meeting => (
                                        <MeetingCard key={meeting.id} meeting={meeting} />
                                    ))
                                ) : (
                                    <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
                                        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">
                                            <Video size={20} className="text-slate-300" />
                                        </div>
                                        <p className="text-sm font-medium text-slate-400">No meetings scheduled</p>
                                        <p className="text-xs text-slate-300">A meeting will appear here once the company schedules one.</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                </div>
            </div>
        </div>
    )
}
