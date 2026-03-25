"use client"

import { Meeting } from "@/types"
import { format } from "date-fns"

import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Calendar, Clock, Video, Copy, Briefcase, Building2 } from "lucide-react"



const statusConfig: Record<string, { label: string; className: string }> = {
    scheduled: { label: "Scheduled", className: "bg-blue-100 text-blue-700 border border-blue-200" },
    ongoing: { label: "Ongoing", className: "bg-green-100 text-green-700 border border-green-200" },
    completed: { label: "Completed", className: "bg-slate-100 text-slate-600 border border-slate-200" },
    cancelled: { label: "Cancelled", className: "bg-red-100 text-red-600 border border-red-200" },
}

export function MeetingCard({ meeting }: { meeting: Meeting }) {
    return (
        <Card className="rounded-lg border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="px-5 py-3 flex flex-col gap-4">

                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                    <div className="flex flex-col gap-1">
                        <p className="text-sm font-semibold text-[#0f172a]">{meeting.title}</p>
                        {meeting.reference_title && (
                            <div className="flex items-center gap-1.5 text-xs text-slate-400">
                                <Briefcase size={11} />
                                <span>{meeting.reference_title}</span>
                            </div>
                        )}
                    </div>
                    <span className={`text-[11px] font-medium px-2.5 py-1 rounded-full shrink-0 ${statusConfig[meeting.status]?.className ?? "bg-slate-100 text-slate-500 border border-slate-200"}`}>
                        {statusConfig[meeting.status]?.label ?? meeting.status}
                    </span>
                </div>

                {/* Company */}
                {meeting.company_name && (
                    <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                            <Building2 size={13} className="text-slate-300" />
                        </div>
                        <p className="text-xs font-medium text-[#0f172a]">{meeting.company_name}</p>
                    </div>
                )}

                {/* Date + Time */}
                <div className="flex items-center gap-4 flex-wrap">
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                        <Calendar size={12} className="text-slate-300" />
                        {format(new Date(meeting.scheduled_at), "d MMM yyyy")}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                        <Clock size={12} className="text-slate-300" />
                        {format(new Date(meeting.scheduled_at), "hh:mm a")} · {meeting.duration} mins
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-1">
                    <Button
                        variant="outline"
                        size="sm"
                        className="cursor-pointer flex-1 gap-1.5 text-xs"
                        onClick={() => {
                            navigator.clipboard.writeText(meeting.meeting_url)
                            toast.success("Link copied!")
                        }}
                    >
                        <Copy size={12} /> Copy Link
                    </Button>
                    <a href={meeting.meeting_url} target="_blank" rel="noreferrer" className="flex-1">
                        <Button
                            size="sm"
                            className="cursor-pointer w-full gap-1.5 text-xs"
                            disabled={meeting.status === "cancelled" || meeting.status === "completed"}
                        >
                            <Video size={12} /> Join
                        </Button>
                    </a>
                </div>
            </CardContent>
        </Card>
    )
}