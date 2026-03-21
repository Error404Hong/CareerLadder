"use client"

import { useUser } from "@clerk/nextjs"
import { useState, useEffect } from "react"
import { getJobsByCompany } from "@/app/api/job"
import { Job } from "@/types"
import { toast } from "sonner"
import { columns } from "./columns"
import { DataTable } from "./data-table"
import { Briefcase, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"

export default function JobListings() {
    const { user } = useUser()
    const [jobListings, setJobListings] = useState<Job[]>([])
    const [isLoading, setIsLoading] = useState<boolean>(true)

    useEffect(() => {
        const getJobs = async () => {
            if (!user) return
            try {
                const fetchRes = await getJobsByCompany(user.id)
                if (fetchRes.success) {
                    setJobListings(fetchRes.data)
                } else {
                    toast.error("Failed to get job listings. Please reload page")
                }
            } finally {
                setIsLoading(false)
            }
        }
        getJobs()
    }, [user])

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="max-w-6xl mx-auto px-6 py-6 flex flex-col gap-6">

                {/* Breadcrumb */}
                <Breadcrumb>
                    <BreadcrumbList>
                        <BreadcrumbItem>
                            <BreadcrumbLink href="/dashboard" className="text-sm text-slate-400 hover:text-[#0f172a]">Dashboard</BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbPage className="text-sm text-[#0f172a] font-medium">Job Listings</BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>

                <Card className="rounded-2xl border border-slate-100 shadow-sm">
                    <CardHeader className="px-5 border-b border-slate-300">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-xl font-bold">Job Listings</CardTitle>
                                <CardDescription>
                                    View, track, and manage your job postings, including applications and updates.
                                </CardDescription>
                            </div>
                            <Button className="cursor-pointer rounded-full gap-1.5">
                                <Plus size={14} /> Post a Job
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="px-5 py-3">
                        <DataTable
                            columns={columns}
                            data={jobListings}
                            searchPlaceholder="Search job listings..."
                            emptyIcon={<Briefcase size={32} className="text-slate-200" />}
                            emptyTitle="No job listings yet"
                            emptyDescription="Create your first job listing and start attracting top talent"
                        />
                    </CardContent>
                </Card>

            </div>
        </div >
    )
}