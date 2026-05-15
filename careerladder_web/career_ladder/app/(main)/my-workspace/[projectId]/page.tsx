"use client"

import { useUser } from "@clerk/nextjs"
import { useParams } from "next/navigation"
import { useState, useEffect } from "react"

import { Project, Task, Meeting } from "@/types"
import { getProjectById, getProjectMembers, getProjectOwner, getStudentReviewCount, addProjectReview } from "@/app/api/project"
import { getStudentTasks } from "@/app/api/task"
import { getProjectInternalMeeting } from "@/app/api/meetings"
import { createNotification } from "@/app/api/notifications"

import { toast } from "sonner"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { KanbanSquare, Users, Video, MessageSquare, FolderOpen, MessageSquareText } from "lucide-react"
import { KanbanBoard } from "./components/KanbanBoard"
import { ProjectOverview } from "./components/ProjectOverview"
import { TeamMembersOverview } from "./components/TeamMembersOverview"
import { DiscussionTab } from "./components/DiscussionTab"
import { TeamMeetingsTab } from "./components/TeamMeetingsTab"
import { ReviewTab, ReviewFormValues } from "./components/ReviewTab"

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
    const [reviewCount, setReviewCount] = useState(0);

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

                    if (projectRes.data.status === "completed") {
                        const getStudentReview = await getStudentReviewCount(projectId, user.id);
                        if (getStudentReview.success) {
                            setReviewCount(getStudentReview.data.count);
                        }
                    }
                } else {
                    toast.error("Failed to fetch project details");
                }
            } catch {
                toast.error("Something went wrong. Please try again")
            }
        }

        getProjectDetails();
    }, [user, projectId])

    const submitReview = async (values: ReviewFormValues) => {
        try {
            const insertRes = await addProjectReview(projectId, user!.id, values.rating, values.review_text);

            if (insertRes.success) {
                toast.success("Review has been submitted successfully");
                setReviewCount(1);

                if (owner?.company_id) {
                    await createNotification(
                        owner.company_id,
                        "project_review_received",
                        "New Project Review Received",
                        `${user!.firstName} ${user!.lastName} left a ${values.rating}-star review on "${project?.title}".`,
                        "project",
                        projectId,
                    );
                }
            } else {
                toast.error("Failed to submit review. Please try again");
            }
        } catch {
            toast.error("Failed to submit review. Please try again");
        }
    }

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
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
                    <div className="flex items-center gap-3 mt-1">
                        <h1 className="text-xl font-bold">{project?.title ?? ""}</h1>
                        {project?.status && project.status !== "open" && (() => {
                            const cfg: Record<string, { label: string; className: string }> = {
                                in_progress: { label: "In Progress", className: "bg-blue-100 text-blue-700 border-blue-200" },
                                completed: { label: "Completed", className: "bg-green-100 text-green-700 border-green-200" },
                                closed: { label: "Closed", className: "bg-slate-100 text-slate-500 border-slate-200" },
                            }
                            const s = cfg[project.status]
                            return s ? <Badge className={`text-xs px-2 py-0.5 border ${s.className}`}>{s.label}</Badge> : null
                        })()}
                    </div>
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
                                {project?.status === "completed" && (
                                    <TabsTrigger value="rating" className="cursor-pointer"><MessageSquareText />Rate Project Experience</TabsTrigger>
                                )}
                            </TabsList>

                            <TabsContent value="task_overview">
                                <KanbanBoard
                                    tasks={task}
                                    setTasks={setTasks}
                                    readOnly={project?.status === "completed" || project?.status === "closed"}
                                />
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

                            <TabsContent value="rating">
                                <ReviewTab reviewCount={reviewCount} onSubmit={submitReview} />
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
