"use client"

import { useUser } from "@clerk/nextjs"
import { useState, useEffect } from "react"

import { Meeting } from "@/types"
import { getMeetingsByApplicant } from "@/app/api/meetings"

import { toast } from "sonner"
import { Video } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"

import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"

import { MeetingCard } from "./MeetingCard"
import { MeetingCardSkeleton } from "./MeetingCardSkeleton"


function EmptyState({ label }: { label: string }) {
    return (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Video size={36} className="text-slate-200" />
            <p className="text-sm font-medium text-slate-400">No {label} meetings</p>
            <p className="text-xs text-slate-300">Your scheduled meetings will appear here</p>
        </div>
    )
}

export default function MyMeetings() {
    const { user } = useUser()
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const [meetings, setMeetings] = useState<Meeting[]>([])

    useEffect(() => {
        if (!user) return
        const getMeetings = async () => {
            try {
                const fetchRes = await getMeetingsByApplicant(user.id)
                if (fetchRes.success) {
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
    const ongoing = meetings.filter(m => m.status === "ongoing")
    const completed = meetings.filter(m => m.status === "completed")
    const cancelled = meetings.filter(m => m.status === "cancelled")

    const renderGrid = (list: Meeting[], label: string) => {
        if (isLoading) return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => <MeetingCardSkeleton key={i} />)}
            </div>
        )
        if (list.length === 0) return <EmptyState label={label} />
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {list.map(m => <MeetingCard key={m.id} meeting={m} />)}
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="bg-white border-b border-slate-100">
                <div className="max-w-7xl mx-auto px-6 py-6">
                    <Breadcrumb className="mb-4">
                        <BreadcrumbList>
                            <BreadcrumbItem>
                                <BreadcrumbLink href="/home">Home</BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                                <BreadcrumbLink>My Activities</BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                                <BreadcrumbPage>My Meetings</BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>

                    <div className="flex items-end justify-between gap-6 flex-wrap">
                        <div>
                            <h1 className="text-2xl font-bold text-[#0f172a] tracking-tight">My Meetings</h1>
                            <p className="text-sm text-slate-400 mt-1">
                                {isLoading ? "Loading..." : `${meetings.length} total meeting${meetings.length !== 1 ? "s" : ""}`}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-8">
                <Tabs defaultValue="scheduled">
                    <TabsList className="mb-6">
                        <TabsTrigger value="scheduled" className="gap-2">
                            Scheduled
                            <Badge className="ml-1 text-[11px] bg-blue-50 text-blue-600 border border-blue-100 rounded-full px-2 py-0">{scheduled.length}</Badge>
                        </TabsTrigger>
                        <TabsTrigger value="ongoing" className="gap-2">
                            Ongoing
                            <Badge className="ml-1 text-[11px] bg-green-50 text-green-600 border border-green-100 rounded-full px-2 py-0">{ongoing.length}</Badge>
                        </TabsTrigger>
                        <TabsTrigger value="completed" className="gap-2">
                            Completed
                            <Badge className="ml-1 text-[11px] bg-slate-100 text-slate-500 border border-slate-200 rounded-full px-2 py-0">{completed.length}</Badge>
                        </TabsTrigger>
                        <TabsTrigger value="cancelled" className="gap-2">
                            Cancelled
                            <Badge className="ml-1 text-[11px] bg-red-50 text-red-500 border border-red-100 rounded-full px-2 py-0">{cancelled.length}</Badge>
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="scheduled">{renderGrid(scheduled, "scheduled")}</TabsContent>
                    <TabsContent value="ongoing">{renderGrid(ongoing, "ongoing")}</TabsContent>
                    <TabsContent value="completed">{renderGrid(completed, "completed")}</TabsContent>
                    <TabsContent value="cancelled">{renderGrid(cancelled, "cancelled")}</TabsContent>
                </Tabs>
            </div>
        </div>
    )
}