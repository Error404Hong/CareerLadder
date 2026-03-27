"use client"

import { useUser } from "@clerk/nextjs"
import { redirect } from "next/navigation"
import { useEffect, useState } from "react"

import { Training } from "@/types"
import { getCompanyTrainingPrograms, deleteProgramById } from "@/app/api/training"

import { toast } from "sonner"
import { GraduationCap, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"

import { getColumns } from "./columns"
import { DataTable } from "./data-table"

export default function TrainingPrograms() {
    const { user } = useUser()
    const [trainings, setTrainings] = useState<Training[]>([])
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const [deleteTarget, setDeleteTarget] = useState<Training>()
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

    useEffect(() => {
        const getTrainings = async () => {
            if (!user) return
            try {
                const fetchRes = await getCompanyTrainingPrograms(user.id)
                if (fetchRes.success) {
                    setTrainings(fetchRes.data)
                } else {
                    toast.error("Failed to fetch company training programs.")
                }
            } finally {
                setIsLoading(false)
            }
        }
        getTrainings()
    }, [user])

    const handleDelete = (training: Training) => {
        setDeleteTarget(training)
        setDeleteDialogOpen(true)
    }

    const handleEdit = (id: string) => {
        redirect(`/training-programs/edit/${id}`)
    }

    const handleView = (id: string) => {
        redirect(`/training-programs/view/${id}`)
    }

    const confirmDelete = async () => {
        if (!deleteTarget) return

        const deleteRes = await deleteProgramById(deleteTarget.id);

        if (deleteRes.success) {
            setTrainings(prev => prev.filter(t => t.id !== deleteTarget.id))
            toast.success("Training program has been deleted successfully")
            setDeleteTarget(undefined)
            setDeleteDialogOpen(false)
        } else {
            toast.error("Failed to delete training program.");
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
                                <BreadcrumbPage>Training Programs</BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>

                    {isLoading ? (
                        <Card className="rounded-lg border border-slate-200 shadow-sm">
                            <CardHeader className="px-5 border-b border-grey-300">
                                <div className="flex items-center justify-between">
                                    <div className="flex flex-col gap-2">
                                        <Skeleton className="h-6 w-44 rounded" />
                                        <Skeleton className="h-4 w-72 rounded" />
                                    </div>
                                    <Skeleton className="h-9 w-36 rounded-full" />
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
                                        <CardTitle className="text-xl font-bold">Training Programs</CardTitle>
                                        <CardDescription>
                                            View, track, and manage your training programs and registrations.
                                        </CardDescription>
                                    </div>
                                    <Button className="cursor-pointer rounded-full gap-1.5"
                                        onClick={() => redirect("/training-programs/create")}
                                    >
                                        <Plus size={14} /> Create Training
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="px-5 py-3">
                                <DataTable
                                    columns={columns}
                                    data={trainings}
                                    searchPlaceholder="Search training programs..."
                                    emptyIcon={<GraduationCap size={32} className="text-slate-200" />}
                                    emptyTitle="No training programs yet"
                                    emptyDescription="Create your first training program to get started"
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
                            Are you sure you want to delete <span className="font-bold">{deleteTarget?.title}</span>? This action cannot be undone.
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