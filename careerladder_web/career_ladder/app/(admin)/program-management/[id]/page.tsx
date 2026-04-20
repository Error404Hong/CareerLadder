"use client"

import { Training, TrainingRegistration } from "@/types"
import { getProgramById, getProgramRegistration } from "@/app/api/training"
import { useEffect, useState } from "react"
import { useParams } from "next/navigation"

import { toast } from "sonner"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent } from "@/components/ui/card"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"

import { ProgramHeader } from "./components/ProgramHeader"
import { DetailsTab } from "./components/DetailsTab"
import { RegistrantsTab } from "./components/RegistrantsTab"

export default function TrainingProgramDetailsPage() {
    const params = useParams()
    const trainingId = params.id as string

    const [isLoading, setIsLoading] = useState(true)
    const [program, setProgram] = useState<Training | null>(null)
    const [registrants, setRegistrants] = useState<TrainingRegistration[]>([])

    useEffect(() => {
        const fetchProgramDetails = async () => {
            try {
                const [programRes, registrationRes] = await Promise.all([
                    getProgramById(trainingId),
                    getProgramRegistration(trainingId),
                ])
                if (programRes.success) setProgram(programRes.data)
                if (registrationRes.success) setRegistrants(registrationRes.data ?? [])
            } catch {
                toast.error("Something went wrong. Please try again.")
            } finally {
                setIsLoading(false)
            }
        }
        fetchProgramDetails()
    }, [trainingId])

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="max-w-6xl mx-auto px-6 py-6 flex flex-col gap-6">

                <Breadcrumb>
                    <BreadcrumbList>
                        <BreadcrumbItem><BreadcrumbLink href="/admin-dashboard">Dashboard</BreadcrumbLink></BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem><BreadcrumbLink href="/program-management">Training Programs</BreadcrumbLink></BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem><BreadcrumbPage>Program Details</BreadcrumbPage></BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>

                {isLoading ? (
                    <div className="flex flex-col gap-5">
                        <Card className="rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                            <div className="h-2 w-full bg-slate-200" />
                            <CardContent className="px-6 py-5 flex flex-col gap-3">
                                <Skeleton className="h-7 w-64 rounded" />
                                <Skeleton className="h-4 w-48 rounded" />
                                <div className="flex gap-2 mt-1">
                                    {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-7 w-24 rounded-full" />)}
                                </div>
                            </CardContent>
                        </Card>
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                            <div className="lg:col-span-2 flex flex-col gap-5">
                                {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-40 w-full rounded-xl" />)}
                            </div>
                            <div className="flex flex-col gap-5">
                                <Skeleton className="h-28 w-full rounded-xl" />
                                <Skeleton className="h-56 w-full rounded-xl" />
                            </div>
                        </div>
                    </div>
                ) : program ? (
                    <>
                        <ProgramHeader program={program} />

                        <Tabs defaultValue="details">
                            <TabsList variant="line" className="mb-2">
                                <TabsTrigger value="details">Details</TabsTrigger>
                                <TabsTrigger value="registrants">
                                    Registrants
                                    {registrants.length > 0 && (
                                        <span className="ml-1.5 text-xs bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-full">{registrants.length}</span>
                                    )}
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value="details">
                                <DetailsTab program={program} />
                            </TabsContent>

                            <TabsContent value="registrants">
                                <RegistrantsTab registrants={registrants} />
                            </TabsContent>
                        </Tabs>
                    </>
                ) : (
                    <Card className="rounded-xl border border-slate-200 shadow-sm">
                        <CardContent className="px-6 py-16 text-center">
                            <p className="text-sm text-slate-400">Training program not found</p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    )
}
