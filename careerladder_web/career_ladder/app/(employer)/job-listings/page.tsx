"use client"

import { useUser } from "@clerk/nextjs"
import { redirect } from "next/navigation"
import { useState, useEffect } from "react"
import { getJobsByCompany } from "@/app/api/job"

import { toast } from "sonner"
import { Briefcase, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

import { Job } from "@/types"
import { getColumns } from "./columns"
import { DataTable } from "./data-table"
import { deleteJob } from "@/app/api/job"

export default function JobListings() {
    const { user } = useUser()
    const [jobListings, setJobListings] = useState<Job[]>([])
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const [deleteTarget, setDeleteTarget] = useState<Job>()
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

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

    const handleDelete = (job: Job) => {
        setDeleteTarget(job)
        setDeleteDialogOpen(true)
    }

    const handleEdit = (id: string) => {
        redirect(`/job-listings/edit/${id}`)
    }

    const handleView = (id: string) => {
        redirect(`/job-listings/view/${id}`)
    }

    const confirmDelete = async () => {
        if (!deleteTarget) return
        try {
            const deleteRes = await deleteJob(deleteTarget.id)
            if (deleteRes.success) {
                setJobListings(prev => prev.filter(j => j.id !== deleteTarget.id))
                toast.success("Job has been deleted successfully")
            } else {
                toast.error("Failed to delete job")
            }
        } finally {
            setDeleteTarget(undefined)
            setDeleteDialogOpen(false)
        }
    }

    const columns = getColumns(handleDelete, handleEdit, handleView)

    return (
        <>
            <div className="min-h-screen bg-slate-50">
                <div className="max-w-6xl mx-auto px-6 py-6 flex flex-col gap-6">

                    {/* Breadcrumb */}
                    <Breadcrumb>
                        <BreadcrumbList>
                            <BreadcrumbItem>
                                <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                                <BreadcrumbPage>Job Listings</BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>

                    {isLoading ? (
                        <Card className="rounded-lg border border-slate-200 shadow-sm">
                            <CardHeader className="px-5 border-b border-grey-300">
                                <div className="flex items-center justify-between">
                                    <div className="flex flex-col gap-2">
                                        <Skeleton className="h-6 w-32 rounded" />
                                        <Skeleton className="h-4 w-64 rounded" />
                                    </div>
                                    <Skeleton className="h-9 w-28 rounded-full" />
                                </div>
                            </CardHeader>
                            <CardContent className="px-5 py-3">
                                <div className="flex flex-col gap-3 py-4">
                                    {Array.from({ length: 5 }).map((_, i) => (
                                        <Skeleton key={i} className="h-12 w-full rounded-xl" />
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        <Card className="rounded-lg border border-slate-200 shadow-sm">
                            <CardHeader className="px-5 border-b border-grey-300">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle className="text-xl font-bold">Job Listings</CardTitle>
                                        <CardDescription>
                                            View, track, and manage your job postings, including applications and updates.
                                        </CardDescription>
                                    </div>
                                    <Button className="cursor-pointer rounded-full gap-1.5"
                                        onClick={() => redirect("/job-listings/create")}
                                    >
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
                    )}

                </div>
            </div>

            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Confirmation</DialogTitle>
                        <DialogDescription>
                            Are you sure to delete the opening position for <span className="font-bold">{deleteTarget?.title} </span>? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline" className="cursor-pointer">Cancel</Button>
                        </DialogClose>
                        <Button type="button" className="cursor-pointer bg-destructive hover:bg-destructive/70"
                            onClick={() => confirmDelete()}
                        >
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}