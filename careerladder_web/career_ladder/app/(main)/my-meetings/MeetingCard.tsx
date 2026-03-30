"use client"

import { Meeting } from "@/types"
import { format } from "date-fns"
import Image from "next/image"

import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Calendar, Clock, Video, Copy, Briefcase, Building2, MoreHorizontal, Calendar1, Mail } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useState } from "react"
import { createNotification } from "@/app/api/notifications"
import { updateMeetingStatus } from "@/app/api/meetings"


const statusConfig: Record<string, { label: string; className: string }> = {
    scheduled: { label: "Scheduled", className: "bg-blue-100 text-blue-700 border border-blue-200" },
    reschedule_requested: { label: "Reschedule Requested", className: "bg-yellow-100 text-yellow-700 border border-yellow-200" },
    completed: { label: "Completed", className: "bg-slate-100 text-slate-600 border border-slate-200" },
    cancelled: { label: "Cancelled", className: "bg-red-100 text-red-600 border border-red-200" },
}

export function MeetingCard({ meeting }: { meeting: Meeting }) {
    const [status, setStatus] = useState(meeting.status)

    const handleRescheduleRequest = async () => {
        try {
            if (status === "reschedule_requested") {
                toast.warning("Your request was already submitted earlier")
            } else {
                const notifyCompany = await createNotification(
                    meeting.company_id,
                    "meeting_reschedule_request",
                    "Meeting Reschedule Requested",
                    `A student has requested to reschedule the meeting "${meeting.title}"${meeting.scheduled_at && !isNaN(new Date(meeting.scheduled_at).getTime()) ? ` scheduled on ${format(new Date(meeting.scheduled_at), "d MMM yyyy, hh:mm a")}` : ""}.`,
                    meeting.reference_type,
                    meeting.reference_id,
                )

                const updStatus = await updateMeetingStatus(meeting.id, "reschedule_requested");

                if (notifyCompany.success && updStatus.success) {
                    setStatus("reschedule_requested")
                    toast.success("Reschedule request sent to the company.")
                }
            }

        } catch {
            toast.error("Failed to send reschedule request. Please try again.")
        }
    }

    return (
        <Card className="rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="px-5 py-4 flex flex-col gap-3.5">
                {/* Header row */}
                <div className="flex items-start justify-between gap-4">
                    <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                        <p className="text-base font-semibold text-[#0f172a] leading-snug">{meeting.title}</p>
                        {meeting.reference_title && (
                            <div className="flex items-center gap-1.5 text-xs text-slate-400">
                                <Briefcase size={12} className="shrink-0" />
                                <span className="truncate">{meeting.reference_title}</span>
                            </div>
                        )}
                        <div className="flex items-center gap-1.5 mt-0.5">
                            <span className={`text-[11px] font-medium px-2.5 py-1 rounded-full ${statusConfig[status]?.className ?? "bg-slate-100 text-slate-500 border border-slate-200"}`}>
                                {statusConfig[status]?.label ?? status}
                            </span>
                            <Badge className={`text-[11px] px-2.5 py-1 rounded-full capitalize font-normal ${meeting.reference_type === "job" ? "bg-blue-100 text-blue-600 border border-blue-100" : "bg-violet-100 text-violet-600 border border-violet-100"}`}>
                                {meeting.reference_type}
                            </Badge>
                        </div>
                    </div>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button className="cursor-pointer text-slate-400 hover:text-[#0f172a] transition-colors p-1 rounded-lg hover:bg-slate-100 shrink-0">
                                <MoreHorizontal size={16} />
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-52">
                            <DropdownMenuItem className="cursor-pointer gap-2 text-sm" onClick={handleRescheduleRequest}>
                                <Calendar1 size={13} /> Request Reschedule
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                <Separator />

                {/* Company */}
                {meeting.company_name && (
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 overflow-hidden border border-slate-200">
                            {meeting.company_logo_url ? (
                                <Image src={meeting.company_logo_url} alt={meeting.company_name} width={32} height={32} className="object-cover w-full h-full" />
                            ) : (
                                <Building2 size={14} className="text-slate-300" />
                            )}
                        </div>
                        <div className="flex flex-col gap-0.5">
                            <p className="text-xs font-medium text-[#0f172a]">{meeting.company_name}</p>
                            {meeting.company_email && (
                                <div className="flex items-center gap-1 text-[11px] text-slate-400">
                                    <Mail size={10} className="shrink-0" />
                                    <span>{meeting.company_email}</span>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Date + Time */}
                {meeting.scheduled_at && !isNaN(new Date(meeting.scheduled_at).getTime()) && (
                    <div className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                            <Calendar size={12} className="text-slate-400 shrink-0" />
                            {format(new Date(meeting.scheduled_at), "EEEE, d MMMM yyyy")}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                            <Clock size={12} className="text-slate-400 shrink-0" />
                            {format(new Date(meeting.scheduled_at), "hh:mm a")}
                            <span className="text-slate-400">·</span>
                            <span>{meeting.duration} mins</span>
                        </div>
                    </div>
                )}

                <Separator />

                {/* Actions */}
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        className="cursor-pointer flex-1 gap-1.5 p-4.5"
                        onClick={() => {
                            navigator.clipboard.writeText(meeting.meeting_url)
                            toast.success("Link copied!")
                        }}
                    >
                        <Copy size={13} /> Copy Link
                    </Button>
                    {status === "scheduled" ? (
                        <a href={meeting.meeting_url} target="_blank" rel="noreferrer" className="flex-1">
                            <Button size="sm" className="cursor-pointer w-full gap-1.5 p-4.5">
                                <Video size={13} /> Join Meeting
                            </Button>
                        </a>
                    ) : (
                        <Button size="sm" className="flex-1 gap-1.5 p-4.5" disabled>
                            <Video size={13} /> Join Meeting
                        </Button>
                    )}
                </div>

            </CardContent>
        </Card>
    )
}
