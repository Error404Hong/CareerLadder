"use client"

import { useUser } from "@clerk/nextjs"
import { useParams } from "next/navigation"
import { useState, useEffect } from "react"

import { Project, Task } from "@/types"
import { getProjectById } from "@/app/api/project"
import { getStudentTasks } from "@/app/api/task"

import { toast } from "sonner"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { KanbanSquare, Users, Video, MessageSquare, FolderOpen } from "lucide-react"
import { KanbanBoard } from "./components/KanbanBoard"
import { ProjectOverview } from "./components/ProjectOverview"



export default function ProjectDetails() {
    const { user } = useUser();
    const params = useParams();
    const projectId = params.projectId as string

    const [project, setProject] = useState<Project | null>(null)
    const [task, setTasks] = useState<Task[]>([]);

    useEffect(() => {
        if (!user) return;

        const getProjectDetails = async () => {
            try {
                const projectRes = await getProjectById(projectId);
                const taskRes = await getStudentTasks(user.id, projectId);

                if (projectRes.success && taskRes.success) {
                    setProject(projectRes.data);
                    setTasks(taskRes.data);
                    // console.log("Tasks: ", taskRes.data);
                    console.log("Details: ", projectRes.data);
                } else {
                    toast.error("Failed to fetch project details");
                }
            } catch {
                toast.error("Something went wrong. Please try again")
            }
        }

        getProjectDetails();
    }, [user, projectId])
    return (
        <div className="min-h-screen bg-slate-100 flex flex-col">
            <div className="bg-white border-b border-slate-100">
                <div className="max-w-7xl mx-auto px-6 py-6">
                    <Breadcrumb className="mb-4">
                        <BreadcrumbList>
                            <BreadcrumbItem>
                                <BreadcrumbLink href="/home">Home</BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                                <BreadcrumbLink href="/my-workspace">My Workspace</BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                                <BreadcrumbPage>Project Overview</BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>
                    <h1 className="text-xl font-bold">{project?.title ?? ""}</h1>
                    <p className="text-sm text-slate-400 mt-1">
                        Your hub for collaborating with companies, building projects, and gaining real experience.
                    </p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto w-full px-6 py-8">
                <Card className="rounded-sm">
                    <CardContent className="px-5">
                        <Tabs defaultValue="task_overview">
                            <TabsList variant="line" className="gap-6">
                                <TabsTrigger value="task_overview" className="cursor-pointer"><KanbanSquare />Task Overview</TabsTrigger>
                                <TabsTrigger value="project_overview" className="cursor-pointer"><FolderOpen />Project Overview</TabsTrigger>
                                <TabsTrigger value="discussion" className="cursor-pointer"><MessageSquare />Discussion</TabsTrigger>
                                <TabsTrigger value="meeting" className="cursor-pointer"><Video />Meetings</TabsTrigger>
                                <TabsTrigger value="team" className="cursor-pointer"><Users />Team / Members</TabsTrigger>
                            </TabsList>

                            <TabsContent value="task_overview">
                                <KanbanBoard tasks={task} setTasks={setTasks} />
                            </TabsContent>

                            <TabsContent value="project_overview">
                                {project && <ProjectOverview project={project} />}
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}