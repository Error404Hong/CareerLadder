"use client"

import { useState } from "react"
import { format } from "date-fns"
import { CalendarDays, Clock, Plus, Video, AlignLeft } from "lucide-react"

import { Meeting } from "@/types"
import { scheduleInternalMeeting } from "@/app/api/meetings"
import { cn } from "@/lib/utils"

import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

type Props = {
    projectId: string
    companyId: string
    meetings: Meeting[]
    onMeetingScheduled: (meeting: Meeting) => void
    readOnly?: boolean
}

const statusConfig: Record<string, { label: string; className: string }> = {
    scheduled: { label: "Upcoming", className: "bg-blue-100 text-blue-700 border-blue-200" },
    completed: { label: "Completed", className: "bg-green-100 text-green-700 border-green-200" },
    cancelled: { label: "Cancelled", className: "bg-red-100 text-red-700 border-red-200" },
}

function ScheduleMeetingDialog({
    open,
    onOpenChange,
    projectId,
    companyId,
    onSuccess,
}: {
    open: boolean
    onOpenChange: (v: boolean) => void
    projectId: string
    companyId: string
    onSuccess: (meeting: Meeting) => void
}) {
    const [title, setTitle] = useState("")
    const [description, setDescription] = useState("")
    const [date, setDate] = useState<Date | undefined>()
    const [time, setTime] = useState("10:00")
    const [duration, setDuration] = useState("60")
    const [loading, setLoading] = useState(false)

    const handleOpenChange = (val: boolean) => {
        if (!val) {
            setTitle("")
            setDescription("")
            setDate(undefined)
            setTime("10:00")
            setDuration("60")
        }
        onOpenChange(val)
    }

    const handleSubmit = async () => {
        if (!date || !time || !title) return
        setLoading(true)

        const [hours, minutes] = time.split(":")
        const scheduledAt = new Date(date)
        scheduledAt.setHours(parseInt(hours), parseInt(minutes), 0, 0)

        const pad = (n: number) => String(n).padStart(2, "0")
        const localISO = `${scheduledAt.getFullYear()}-${pad(scheduledAt.getMonth() + 1)}-${pad(scheduledAt.getDate())}T${pad(parseInt(hours))}:${pad(parseInt(minutes))}:00+08:00`

        try {
            const res = await scheduleInternalMeeting(
                companyId,
                title,
                description,
                "project",
                projectId,
                localISO,
                parseInt(duration),
            )
            if (res.success) {
                toast.success("Meeting scheduled successfully")
                onSuccess(res.data)
                handleOpenChange(false)
            } else {
                toast.error("Failed to schedule meeting.")
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Schedule Team Meeting</DialogTitle>
                    <DialogDescription>Set a date and time for an internal team meeting.</DialogDescription>
                </DialogHeader>

                <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5">
                        <Label>Meeting Title</Label>
                        <Input
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g. Weekly Sync"
                        />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <Label>Agenda / Notes <span className="text-slate-400 text-xs">(Optional)</span></Label>
                        <Textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="e.g. Review sprint progress..."
                            rows={3}
                        />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <Label>Date</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <button
                                    type="button"
                                    className={cn(
                                        "w-full flex items-center gap-2 px-3 h-9 rounded-md border border-input text-sm text-left",
                                        !date && "text-slate-400"
                                    )}
                                >
                                    <CalendarDays size={13} className="text-slate-400 shrink-0" />
                                    {date ? format(date, "d MMM yyyy") : "Pick a date"}
                                </button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                    mode="single"
                                    selected={date}
                                    onSelect={setDate}
                                    disabled={(d) => d < new Date()}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="flex flex-col gap-1.5">
                            <Label>Time</Label>
                            <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <Label>Duration</Label>
                            <Select value={duration} onValueChange={setDuration}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Duration" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="30">30 minutes</SelectItem>
                                    <SelectItem value="45">45 minutes</SelectItem>
                                    <SelectItem value="60">1 hour</SelectItem>
                                    <SelectItem value="90">1.5 hours</SelectItem>
                                    <SelectItem value="120">2 hours</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>

                <DialogFooter className="gap-2">
                    <Button variant="outline" className="cursor-pointer" onClick={() => handleOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button
                        className="cursor-pointer gap-1.5"
                        disabled={!date || !time || !title || loading}
                        onClick={handleSubmit}
                    >
                        <Video size={14} /> Schedule Meeting
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export function TeamMeetingsTab({ projectId, companyId, meetings, onMeetingScheduled, readOnly = false }: Props) {
    const [dialogOpen, setDialogOpen] = useState(false)

    const sorted = [...meetings].sort(
        (a, b) => new Date(b.scheduled_at).getTime() - new Date(a.scheduled_at).getTime()
    )

    return (
        <Card className="mt-6 rounded-sm p-6 gap-4">
            <CardHeader className="p-0">
                <div className="flex items-start justify-between">
                    <div>
                        <CardTitle className="font-semibold text-lg">Team Meetings</CardTitle>
                        <CardDescription className="mt-0.5">
                            Centralize all internal project meetings, agendas, and discussions in one place.
                        </CardDescription>
                    </div>
                    {!readOnly && (
                        <Button
                            size="sm"
                            className="cursor-pointer gap-1.5 shrink-0"
                            onClick={() => setDialogOpen(true)}
                        >
                            <Plus size={14} /> Schedule Meeting
                        </Button>
                    )}
                </div>
            </CardHeader>

            <Separator />

            <CardContent className="p-0 flex flex-col gap-3">
                {sorted.length === 0 ? (
                    <div className="flex flex-col items-center justify-center gap-2 py-14 text-slate-400">
                        <Video size={32} className="text-slate-300" />
                        <p className="text-sm font-medium text-slate-500">No meetings scheduled yet</p>
                        <p className="text-xs">Schedule one to coordinate with your team.</p>
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
                                        <p className="flex items-start gap-1 text-xs text-white/80  mt-0.5 line-clamp-1">
                                            <AlignLeft size={11} className="mt-0.5 shrink-0" />
                                            {meeting.description}
                                        </p>
                                    )}
                                </div>

                                {/* Join button */}
                                {meeting.status !== "cancelled" && (
                                    <a
                                        href={meeting.meeting_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="shrink-0"
                                    >
                                        <Button size="sm" variant="outline" className="cursor-pointer gap-1.5 bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white">
                                            <Video size={13} /> Join Meeting
                                        </Button>
                                    </a>
                                )}
                            </div>
                        )
                    })
                )}
            </CardContent>

            <ScheduleMeetingDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                projectId={projectId}
                companyId={companyId}
                onSuccess={onMeetingScheduled}
            />
        </Card>
    )
}
