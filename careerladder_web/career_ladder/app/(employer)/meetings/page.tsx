"use client"

import { useUser } from "@clerk/nextjs"
import { useState, useEffect } from "react"

import { Meeting } from "@/types"
import { getMeetingsByCompany, updateMeetingStatus } from "@/app/api/meetings"

import { toast } from "sonner"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"

import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"

import { MeetingCard } from "./MeetingCard"
import { MeetingCardSkeleton } from "./MeetingCardSkeleton"
import { EmptyState } from "./EmptyState"

export default function AllMeetings() {
    const { user } = useUser()
    const [meetings, setMeetings] = useState<Meeting[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        if (!user) return
        const getMeetings = async () => {
            try {
                const fetchRes = await getMeetingsByCompany(user.id)
                if (fetchRes.success) {
                    console.log("Fetch: ", fetchRes.data)
                    setMeetings(fetchRes.data)
                } else {
                    toast.error("Failed to fetch meetings. Please try again")
                }
            } finally {
                setIsLoading(false)
            }
        }
        getMeetings()
    }, [user])

    const scheduled = meetings.filter(m => m.status === "scheduled")
    const rescheduleRequested = meetings.filter(m => m.status === "reschedule_requested")
    const completed = meetings.filter(m => m.status === "completed")
    const cancelled = meetings.filter(m => m.status === "cancelled")

    const handleCancel = async (id: string) => {
        const cancelMeeting = await updateMeetingStatus(id, "cancelled");

        if (cancelMeeting.success) {
            setMeetings(prev => prev.map(m => m.id === id ? { ...m, status: "cancelled" } : m))
            toast.success("Meeting has been cancelled successfully")
        } else {
            toast.error("Failed to cancel meeting. Please try again")
        }
    }

    const renderGrid = (list: Meeting[], label: string) => {
        if (isLoading) return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => <MeetingCardSkeleton key={i} />)}
            </div>
        )
        if (list.length === 0) return <EmptyState label={label} />
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {list.map(m => <MeetingCard key={m.id} meeting={m} onCancel={handleCancel} />)}
            </div>
        )
    }

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
                            <BreadcrumbPage>Meetings</BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>

                <div className="flex items-end justify-between flex-wrap gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-[#0f172a] tracking-tight">Meetings</h1>
                        <p className="text-sm text-slate-400 mt-1">
                            {isLoading ? "Loading..." : `${meetings.length} meeting${meetings.length !== 1 ? "s" : ""} total`}
                        </p>
                    </div>
                </div>

                <Tabs defaultValue="scheduled">
                    <TabsList className="mb-6" variant="line">
                        <TabsTrigger value="scheduled" className="gap-2 cursor-pointer">
                            Scheduled
                            <Badge className="ml-1 text-[11px] bg-blue-50 text-blue-600 border border-blue-100 rounded-full px-2 py-0">{scheduled.length}</Badge>
                        </TabsTrigger>
                        <TabsTrigger value="reschedule_requested" className="gap-2 cursor-pointer">
                            Reschedule Requested
                            <Badge className="ml-1 text-[11px] bg-yellow-50 text-yellow-600 border border-yellow-100 rounded-full px-2 py-0">{rescheduleRequested.length}</Badge>
                        </TabsTrigger>
                        <TabsTrigger value="completed" className="gap-2 cursor-pointer">
                            Completed
                            <Badge className="ml-1 text-[11px] bg-slate-100 text-slate-500 border border-slate-200 rounded-full px-2 py-0">{completed.length}</Badge>
                        </TabsTrigger>
                        <TabsTrigger value="cancelled" className="gap-2 cursor-pointer">
                            Cancelled
                            <Badge className="ml-1 text-[11px] bg-red-50 text-red-500 border border-red-100 rounded-full px-2 py-0">{cancelled.length}</Badge>
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="scheduled">{renderGrid(scheduled, "scheduled")}</TabsContent>
                    <TabsContent value="reschedule_requested">{renderGrid(rescheduleRequested, "reschedule requested")}</TabsContent>
                    <TabsContent value="completed">{renderGrid(completed, "completed")}</TabsContent>
                    <TabsContent value="cancelled">{renderGrid(cancelled, "cancelled")}</TabsContent>
                </Tabs>
            </div>
        </div>
    )
}