"use client"

import { useUser } from "@clerk/nextjs"
import { useState } from "react"
import { format } from "date-fns"
import { CalendarIcon, Video } from "lucide-react"
import { cn } from "@/lib/utils"

import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Calendar } from "@/components/ui/calendar"
import { Textarea } from "@/components/ui/textarea"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"

import { Application, Job } from "@/types"
import { scheduleMeeting } from "@/app/api/meetings"
import { createNotification } from "@/app/api/notifications"

type Props = {
    open: boolean
    onOpenChange: (open: boolean) => void
    application: Application | null
    job: Job | null
}

export function MeetingDialog({ open, onOpenChange, application, job }: Props) {
    const { user } = useUser();
    const [title, setTitle] = useState("")
    const [date, setDate] = useState<Date | undefined>()
    const [time, setTime] = useState("10:00");
    const [description, setDescription] = useState("");
    const [duration, setDuration] = useState("60")

    const handleOpenChange = (val: boolean) => {
        if (!val) {
            setTitle("")
            setDate(undefined)
            setTime("10:00")
            setDuration("60")
        }
        onOpenChange(val)
    }

    const handleScheduleMeeting = async () => {
        const [hours, minutes] = time.split(":")
        const scheduledAt = new Date(date!)
        scheduledAt.setHours(parseInt(hours), parseInt(minutes), 0, 0)

        const pad = (n: number) => String(n).padStart(2, "0")
        const localISO = `${scheduledAt.getFullYear()}-${pad(scheduledAt.getMonth() + 1)}-${pad(scheduledAt.getDate())}T${pad(parseInt(hours))}:${pad(parseInt(minutes))}:00+08:00`

        const scheduleRes = await scheduleMeeting(
            application!.id,
            user!.id,
            application!.clerk_id,
            title,
            description ?? "",
            "interview",
            "job",
            job!.id,
            localISO,
            parseInt(duration)
        )

        if (scheduleRes.success) {
            toast.success("Meeting has been scheduled successfully")
            await createNotification(
                application!.clerk_id,
                "interview_scheduled",
                "Interview Scheduled",
                `An interview has been scheduled for your application to "${job?.title}". Please check your meetings.`,
                "job",
                job!.id,
            )
            onOpenChange(false);
        } else {
            toast.error("Failed to schedule meeting.")
        }
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-4xl">
                <DialogHeader>
                    <DialogTitle>Schedule Interview</DialogTitle>
                    <DialogDescription>
                        Set a date and time for the interview with{" "}
                        <span className="font-medium text-[#0f172a]">
                            {application?.first_name} {application?.last_name}
                        </span>
                    </DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

                    {/* Left - Form */}
                    <div className="flex flex-col gap-4">
                        <div className="flex flex-col gap-1.5">
                            <Label>Meeting Title</Label>
                            <Input
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="e.g. Interview for DevOps Engineer"
                            />
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <Label>Agenda / Notes <span className="text-slate-400 text-xs">(Optional)</span></Label>
                            <Textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="e.g. Technical Interview for position evaluation..."
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
                                        <CalendarIcon size={13} className="text-slate-400 shrink-0" />
                                        {date ? format(date, "d MMM yyyy") : "Pick a date"}
                                    </button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={date}
                                        onSelect={setDate}
                                        disabled={(date) => date < new Date()}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="flex flex-col gap-1.5">
                                <Label>Time</Label>
                                <Input
                                    type="time"
                                    value={time}
                                    onChange={(e) => setTime(e.target.value)}
                                />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <Label>Duration</Label>
                                <Select value={duration} onValueChange={setDuration}>
                                    <SelectTrigger>
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

                    {/* Right - Applicant Info + Summary */}
                    <div className="flex flex-col gap-4">
                        <div className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 flex flex-col gap-3">
                            <p className="text-xs text-slate-400 uppercase tracking-widest">Applicant</p>
                            <div className="flex flex-col gap-2">
                                <p className="text-sm font-medium text-[#0f172a]">
                                    {application?.first_name} {application?.last_name}
                                </p>
                                <p className="text-xs text-slate-400">{application?.email}</p>
                                <Separator />
                                <p className="text-xs text-slate-500">{application?.major}</p>
                                <p className="text-xs text-slate-500">{application?.location}</p>

                                {job?.title && (
                                    <>
                                        <Separator />
                                        <div className="flex flex-col gap-0.5">
                                            <p className="text-[11px] text-slate-400 uppercase tracking-widest">Applying For</p>
                                            <p className="text-sm font-medium text-[#2563eb]">{job.title}</p>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* {date && time && title ? (
                            <div className="bg-blue-50 border border-blue-100 rounded-lg px-4 py-3 flex flex-col gap-2">
                                <p className="text-xs text-blue-400 uppercase tracking-widest">Meeting Summary</p>
                                <p className="text-sm font-medium text-[#0f172a]">{title}</p>
                                <p className="text-xs text-slate-500">{format(date, "d MMMM yyyy")} at {time}</p>
                                <p className="text-xs text-slate-500">{duration} minutes</p>
                            </div>
                        ) : (
                            <div className="bg-slate-50 border border-dashed border-slate-200 rounded-lg px-4 py-6 flex items-center justify-center">
                                <p className="text-xs text-slate-400 text-center">Fill in the details to see the meeting summary</p>
                            </div>
                        )} */}
                    </div>
                </div>

                <DialogFooter className="gap-2">
                    <Button variant="outline" className="cursor-pointer" onClick={() => handleOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button
                        className="cursor-pointer gap-1.5"
                        disabled={!date || !time || !title}
                        onClick={() => handleScheduleMeeting()}
                    >
                        <Video size={14} /> Schedule Meeting
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}