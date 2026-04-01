"use client"

import { useUser } from "@clerk/nextjs"
import { useParams } from "next/navigation"
import { useState, useEffect } from "react"

import { ProjectApplicant, Project, Task } from "@/types"
import { getTasksByProject } from "@/app/api/task"
import { getProjectApplicantsById, getProjectById } from "@/app/api/project"

import { toast } from "sonner"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { KanbanSquare, Users, Video, MessageSquare } from "lucide-react"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"

import { KanbanBoard } from "./components/KanbanBoard"

export default function ProjectCollabPage() {
    const { user } = useUser()
    const params = useParams()
    const projectId = params.projectId as string

    const [tasks, setTasks] = useState<Task[]>([])
    const [project, setProject] = useState<Project | null>(null)
    const [projectApplicants, setProjectApplicants] = useState<ProjectApplicant[]>([])

    useEffect(() => {
        if (!user) return

        const getProjectDetails = async () => {
            try {
                const pApplicants = await getProjectApplicantsById(projectId)
                const projectRes = await getProjectById(projectId)
                const tasksRes = await getTasksByProject(projectId)

                if (pApplicants.success && projectRes.success && tasksRes.success) {
                    setProjectApplicants(pApplicants.data)
                    setProject(projectRes.data)
                    setTasks(tasksRes.data)
                } else {
                    toast.error("Failed to fetch project details")
                }
            } catch {
                toast.error("Something went wrong. Please try again")
            }
        }

        getProjectDetails()
    }, [user, projectId])

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
                            <BreadcrumbLink href="/workspace">Workspace</BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbPage>Project - {project?.title}</BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>
            </div>

            <div className="max-w-6xl mx-auto px-6 pb-8">
                <Card className="rounded-sm">
                    <CardContent className="px-5">
                        <Tabs defaultValue="overview">
                            <TabsList variant="line" className="gap-8">
                                <TabsTrigger value="overview" className="cursor-pointer"><KanbanSquare />Project Overview</TabsTrigger>
                                <TabsTrigger value="discussion" className="cursor-pointer"><MessageSquare />Discussion</TabsTrigger>
                                <TabsTrigger value="meeting" className="cursor-pointer"><Video />Meetings</TabsTrigger>
                                <TabsTrigger value="team" className="cursor-pointer"><Users />Team / Members</TabsTrigger>
                            </TabsList>

                            <TabsContent value="overview">
                                <KanbanBoard
                                    tasks={tasks}
                                    setTasks={setTasks}
                                    projectApplicants={projectApplicants}
                                />
                            </TabsContent>

                            <TabsContent value="discussion">
                            </TabsContent>

                            <TabsContent value="meeting">
                            </TabsContent>

                            <TabsContent value="team">
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
