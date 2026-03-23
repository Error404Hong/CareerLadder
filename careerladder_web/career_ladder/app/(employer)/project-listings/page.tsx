"use client"

import { useUser } from "@clerk/nextjs"
import { redirect } from "next/navigation"
import { useState, useEffect } from "react"
import { getCompanyProjects, deleteCompanyProjects } from "@/app/api/project"

import { toast } from "sonner"
import { FileText, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"

import { Project } from "@/types/project"
import { getColumns } from "./columns"
import { DataTable } from "./data-table"

export default function ProjectListings() {
    const { user } = useUser()
    const [projects, setProjects] = useState<Project[]>([])
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const [deleteTarget, setDeleteTarget] = useState<Project>()
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

    useEffect(() => {
        if (!user) return
        const fetchProjects = async () => {
            try {
                const fetchRes = await getCompanyProjects(user.id)
                if (fetchRes.success) {
                    setProjects(fetchRes.data)
                } else {
                    toast.error("Failed to get project listings. Please reload page")
                }
            } finally {
                setIsLoading(false)
            }
        }
        fetchProjects()
    }, [user])

    const handleDelete = (project: Project) => {
        setDeleteTarget(project)
        setDeleteDialogOpen(true)
    }

    const handleEdit = (id: string) => {
        redirect(`/project-listings/edit/${id}`)
    }

    const handleView = (id: string) => {
        redirect(`/project-listings/view/${id}`)
    }

    const confirmDelete = async () => {
        if (!deleteTarget) return

        try {
            const deleteRes = await deleteCompanyProjects(deleteTarget.id);
            if (deleteRes.success) {
                setProjects(prev => prev.filter(p => p.id !== deleteTarget.id))
                toast.success("Project has been deleted successfully");
            } else {
                toast.error("Failed to delete project")
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

                    <Breadcrumb>
                        <BreadcrumbList>
                            <BreadcrumbItem>
                                <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                                <BreadcrumbPage>Project Listings</BreadcrumbPage>
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
                                        <CardTitle className="text-xl font-bold">Project Listings</CardTitle>
                                        <CardDescription>
                                            View, track, and manage your project postings, including applications and updates.
                                        </CardDescription>
                                    </div>
                                    <Button className="cursor-pointer rounded-full gap-1.5"
                                        onClick={() => redirect("/project-listings/create")}
                                    >
                                        <Plus size={14} /> Create New Project
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="px-5 py-3">
                                <DataTable
                                    columns={columns}
                                    data={projects}
                                    searchPlaceholder="Search project listings..."
                                    emptyIcon={<FileText size={32} className="text-slate-200" />}
                                    emptyTitle="No project listings yet"
                                    emptyDescription="Create your first project listing and start attracting top talent"
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
                            Are you sure to delete <span className="font-bold">{deleteTarget?.title}</span>? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline" className="cursor-pointer">Cancel</Button>
                        </DialogClose>
                        <Button type="button" className="cursor-pointer bg-destructive hover:bg-destructive/70"
                            onClick={confirmDelete}
                        >
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}