"use client"

import { useUser } from "@clerk/nextjs"
import { useParams } from "next/navigation"
import { useState, useEffect } from "react"

import { Project, Task, Meeting } from "@/types"
import { getProjectById, getProjectMembers, getProjectOwner } from "@/app/api/project"
import { getStudentTasks } from "@/app/api/task"
import { getProjectInternalMeeting } from "@/app/api/meetings"

import { toast } from "sonner"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { KanbanSquare, Users, Video, MessageSquare, FolderOpen } from "lucide-react"
import { KanbanBoard } from "./components/KanbanBoard"
import { ProjectOverview } from "./components/ProjectOverview"
import { TeamMembersOverview } from "./components/TeamMembersOverview"
import { DiscussionTab } from "./components/DiscussionTab"
import { TeamMeetingsTab } from "./components/TeamMeetingsTab"

export type Owner = {
    company_id: string
    company_name: string
    email: string
    profile_image: string
}

export type Member = {
    clerk_id: string
    email: string
    first_name: string
    last_name: string
    profile_image: string
}

export default function ProjectDetails() {
    const { user } = useUser();
    const params = useParams();
    const projectId = params.projectId as string

    const [project, setProject] = useState<Project | null>(null)
    const [task, setTasks] = useState<Task[]>([]);
    const [members, setMembers] = useState<Member[]>([]);
    const [owner, setOwner] = useState<Owner | null>(null);
    const [meetings, setMeetings] = useState<Meeting[]>([])

    useEffect(() => {
        if (!user) return;

        const getProjectDetails = async () => {
            try {
                const projectRes = await getProjectById(projectId);
                const taskRes = await getStudentTasks(user.id, projectId);
                const memberRes = await getProjectMembers(projectId);
                const ownerRes = await getProjectOwner(projectId);
                const meetingRes = await getProjectInternalMeeting(projectId)

                if (projectRes.success && taskRes.success && memberRes.success && ownerRes.success && meetingRes.success) {
                    setProject(projectRes.data);
                    setTasks(taskRes.data);
                    setOwner(ownerRes.data[0]);
                    setMembers(memberRes.data);
                    setMeetings(meetingRes.data);
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

                            <TabsContent value="discussion">
                                {owner && user && project && (
                                    <DiscussionTab
                                        projectId={projectId}
                                        projectTitle={project.title}
                                        userId={user.id}
                                        userName={`${user.firstName} ${user.lastName}`}
                                        userImage={user.imageUrl}
                                        ownerCompanyId={owner.company_id}
                                        memberIds={members.map(m => m.clerk_id)}
                                    />
                                )}
                            </TabsContent>

                            <TabsContent value="meeting">
                                <TeamMeetingsTab meetings={meetings} />
                            </TabsContent>

                            <TabsContent value="team">
                                {owner && <TeamMembersOverview owner={owner} members={members} currentUserId={user?.id ?? ""} />}
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}