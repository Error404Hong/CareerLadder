"use client"

import { useUser } from "@clerk/nextjs"
import { useState, useEffect } from "react"
import { getTrainingRegistrations } from "@/app/api/training"
import { toast } from "sonner"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { BookOpen } from "lucide-react"

import { TrainingRegistrationCard } from "./components/TrainingRegistrationCard"
import { TrainingRegistrationCardSkeleton } from "./components/TrainingRegistrationCardSkeleton"
import { TrainingRegistrationDrawer } from "./components/TrainingRegistrationDrawer"

export type TrainingRegistration = {
    id: string
    clerk_id: string
    training_id: string
    registration_status: string
    registered_at: string
    title: string
    company_id: string
    description: string
    prerequisites: string
    location: string
    date: string
    time: string
    duration: string
    meeting_url: string
    is_public: boolean
    program_status: string
    expected_outcome: string
    company_email: string
    company_logo_url: string
    company_name: string
    website: string
}

export const registrationStatusConfig: Record<string, { label: string; className: string }> = {
    registered: { label: "Registered", className: "bg-blue-100 text-blue-600 border border-blue-100" },
    completed: { label: "Completed", className: "bg-green-100 text-green-600 border border-green-100" },
}

export default function Registrations() {
    const { user } = useUser()
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const [registeredTraining, setRegisteredTraining] = useState<TrainingRegistration[]>([])
    const [selectedTraining, setSelectedTraining] = useState<TrainingRegistration | null>(null)
    const [drawerOpen, setDrawerOpen] = useState<boolean>(false)

    useEffect(() => {
        if (!user) return

        const getRegisteredTraining = async () => {
            try {
                const result = await getTrainingRegistrations(user.id)
                if (result.success) {
                    console.log("dataL ", result.data)
                    setRegisteredTraining(result.data)
                } else {
                    toast.error("Failed to fetch registered training programs. Please try again")
                }
            } catch {
                toast.error("Something went wrong. Please try again")
            } finally {
                setIsLoading(false)
            }
        }

        getRegisteredTraining()
    }, [user])

    const registered = registeredTraining.filter(t => t.registration_status === "registered" && t.program_status !== "completed")
    const completed = registeredTraining.filter(t => t.registration_status === "registered" && t.program_status === "completed")

    const renderGrid = (list: TrainingRegistration[]) => (
        list.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 gap-3">
                <BookOpen size={36} className="text-slate-200" />
                <p className="text-sm  text-slate-400">No training programs found</p>
                <p className="text-xs text-slate-300">Register for a training program to see it here</p>
            </div>
        ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {list.map(t => (
                    <TrainingRegistrationCard
                        key={t.id}
                        training={t}
                        onView={(t) => {
                            setSelectedTraining(t)
                            setDrawerOpen(true)
                        }}
                    />
                ))}
            </div>
        )
    )

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="bg-white border-b border-slate-100">
                <div className="max-w-7xl mx-auto px-6 py-6">
                    <Breadcrumb className="mb-4">
                        <BreadcrumbList>
                            <BreadcrumbItem>
                                <BreadcrumbLink href="/home" >Home</BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                                <BreadcrumbLink >My Activities</BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                                <BreadcrumbPage>My Training Registrations</BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>

                    <div className="flex items-end justify-between gap-6 flex-wrap">
                        <div>
                            <h1 className="text-xl font-bold">My Training Registrations</h1>
                            <p className="text-sm text-slate-400 mt-1">
                                {isLoading ? "Loading..." : `${registeredTraining.length} program${registeredTraining.length !== 1 ? "s" : ""} registered`}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-8">
                {isLoading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {Array.from({ length: 6 }).map((_, i) => <TrainingRegistrationCardSkeleton key={i} />)}
                    </div>
                ) : (
                    <Tabs defaultValue="registered">
                        <TabsList className="mb-6" variant="line">
                            <TabsTrigger value="registered" className="gap-2 p-4 cursor-pointer">
                                Registered
                                <Badge className="ml-2 text-[11px] bg-blue-50 text-blue-600 border border-blue-100 rounded-full px-2 py-0">{registered.length}</Badge>
                            </TabsTrigger>
                            <TabsTrigger value="completed" className="gap-2 p-4 cursor-pointer">
                                Completed
                                <Badge className="ml-2 text-[11px] bg-green-50 text-green-600 border border-green-100 rounded-full px-2 py-0">{completed.length}</Badge>
                            </TabsTrigger>
                        </TabsList>
                        <TabsContent value="registered">{renderGrid(registered)}</TabsContent>
                        <TabsContent value="completed">{renderGrid(completed)}</TabsContent>
                    </Tabs>
                )}
            </div>

            <TrainingRegistrationDrawer
                open={drawerOpen}
                onOpenChange={setDrawerOpen}
                training={selectedTraining}
            />
        </div >
    )
}