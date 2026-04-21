"use client"

import { format } from "date-fns"
import { CalendarDays, Clock, Video, AlignLeft } from "lucide-react"

import { Meeting } from "@/types"
import { cn } from "@/lib/utils"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

type Props = {
    meetings: Meeting[]
}

const statusConfig: Record<string, { label: string; className: string }> = {
    scheduled: { label: "Upcoming", className: "bg-blue-100 text-blue-700 border-blue-200" },
    completed: { label: "Completed", className: "bg-green-100 text-green-700 border-green-200" },
    cancelled: { label: "Cancelled", className: "bg-red-100 text-red-700 border-red-200" },
}

export function TeamMeetingsTab({ meetings }: Props) {
    const sorted = [...meetings].sort(
        (a, b) => new Date(b.scheduled_at).getTime() - new Date(a.scheduled_at).getTime()
    )

    return (
        <Card className="mt-2 p-4 rounded-sm border-none shadow-none">
            <CardHeader className="px-0 pt-0">
                <CardTitle className="font-semibold text-lg">Team Meetings</CardTitle>
                <CardDescription>
                    Overview of internal project meetings scheduled by your project owner.
                </CardDescription>
            </CardHeader>

            <Separator />

            <CardContent className="px-0 pt-4 flex flex-col gap-3">
                {sorted.length === 0 ? (
                    <div className="flex flex-col items-center justify-center gap-2 py-14 text-slate-400">
                        <Video size={32} className="text-slate-300" />
                        <p className="text-sm font-medium text-slate-500">No meetings scheduled yet</p>
                        <p className="text-xs">Your project owner will schedule meetings here.</p>
                    </div>
                ) : (
                    sorted.map((meeting) => {
                        const status = statusConfig[meeting.status] ?? statusConfig["scheduled"]
                        const date = new Date(meeting.scheduled_at)
                        return (
                            <div
                                key={meeting.id}
                                className="flex items-center gap-4 rounded-md px-4 py-3"
                                style={{ backgroundColor: "var(--color-navy-light)" }}
                            >
                                {/* Date block */}
                                <div className="flex flex-col items-center justify-center min-w-13 bg-white/10 rounded-md px-2 py-1.5 text-center shrink-0">
                                    <p className="text-[10px] uppercase tracking-widest text-white/60">{format(date, "MMM")}</p>
                                    <p className="text-xl font-bold text-white leading-none">{format(date, "d")}</p>
                                </div>

                                {/* Details */}
                                <div className="flex flex-col gap-1 flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <p className="text-sm font-semibold text-white truncate">{meeting.title}</p>
                                        <Badge className={cn("text-[10px] px-1.5 py-0 border", status.className)}>
                                            {status.label}
                                        </Badge>
                                    </div>

                                    <div className="flex items-center gap-3 text-xs text-white/80 flex-wrap">
                                        <span className="flex items-center gap-1">
                                            <CalendarDays size={11} />
                                            {format(date, "EEEE, d MMM yyyy")}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Clock size={11} />
                                            {format(date, "h:mm a")} · {meeting.duration} min
                                        </span>
                                    </div>

                                    {meeting.description && (
                                        <p className="flex items-start gap-1 text-xs text-white/80 mt-0.5 line-clamp-1">
                                            <AlignLeft size={11} className="mt-0.5 shrink-0" />
                                            {meeting.description}
                                        </p>
                                    )}
                                </div>

                                {/* Join button */}
                                {meeting.status !== "cancelled" && meeting.status !== "completed" && (() => {
                                    const today = new Date()
                                    const meetingDate = new Date(meeting.scheduled_at)
                                    const isMeetingDay =
                                        today.getFullYear() === meetingDate.getFullYear() &&
                                        today.getMonth() === meetingDate.getMonth() &&
                                        today.getDate() === meetingDate.getDate()

                                    if (isMeetingDay) {
                                        return (
                                            <a href={meeting.meeting_url} target="_blank" rel="noopener noreferrer" className="shrink-0">
                                                <Button size="sm" variant="outline" className="cursor-pointer gap-1.5 bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white">
                                                    <Video size={13} /> Join Meeting
                                                </Button>
                                            </a>
                                        )
                                    }

                                    const tooltipMsg = today > meetingDate
                                        ? "This meeting date has passed."
                                        : `Available on ${format(meetingDate, "d MMM yyyy")}.`

                                    return (
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <span className="shrink-0">
                                                        <Button size="sm" variant="outline" className="gap-1.5 bg-white/10 border-white/20 text-white/40" disabled>
                                                            <Video size={13} /> Join Meeting
                                                        </Button>
                                                    </span>
                                                </TooltipTrigger>
                                                <TooltipContent>{tooltipMsg}</TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    )
                                })()}
                            </div>
                        )
                    })
                )}
            </CardContent>
        </Card>
    )
}
