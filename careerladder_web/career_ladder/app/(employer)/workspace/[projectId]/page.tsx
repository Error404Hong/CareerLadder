"use client"

import { useUser } from "@clerk/nextjs"
import { useParams, useRouter } from "next/navigation"
import { useState, useEffect } from "react"

import { ProjectApplicant, Project, Task, Meeting, ProjectReview, Badge as AwardBadge } from "@/types"
import { getBadges } from "@/app/api/rewards"
import { getTasksByProject } from "@/app/api/task"
import { getProjectApplicantsById, getProjectById, completeProject, getStudentsReviews } from "@/app/api/project"
import { getProjectInternalMeeting } from "@/app/api/meetings"

import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardDescription, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { KanbanSquare, Users, Video, MessageSquare, FolderOpen, CheckCircle, MessageSquareText } from "lucide-react"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"

import { KanbanBoard } from "./components/KanbanBoard"
import { ProjectOverview } from "./components/ProjectOverview"
import { TeamMembersOverview } from "./components/TeamMembersOverview"
import { DiscussionTab } from "./components/DiscussionTab"
import { TeamMeetingsTab } from "./components/TeamMeetingsTab"
import { ReviewsAndEvaluationTab } from "./components/ReviewsAndEvaluationTab"
import { Separator } from "@/components/ui/separator"

const statusConfig: Record<string, { label: string; className: string }> = {
    in_progress: { label: "In Progress", className: "bg-blue-100 text-blue-700 border-blue-200" },
    completed: { label: "Completed", className: "bg-green-100 text-green-700 border-green-200" },
    closed: { label: "Closed", className: "bg-slate-100 text-slate-500 border-slate-200" },
}

export default function ProjectCollabPage() {
    const { user } = useUser()
    const params = useParams()
    const router = useRouter()
    const projectId = params.projectId as string

    const [tasks, setTasks] = useState<Task[]>([])
    const [project, setProject] = useState<Project | null>(null)
    const [projectApplicants, setProjectApplicants] = useState<ProjectApplicant[]>([])
    const [meetings, setMeetings] = useState<Meeting[]>([])
    const [activeTab, setActiveTab] = useState("task_overview")
    const [confirmOpen, setConfirmOpen] = useState(false)
    const [completing, setCompleting] = useState(false)
    const [reviews, setReviews] = useState<ProjectReview[]>([]);
    const [badges, setBadges] = useState<AwardBadge[]>([]);

    useEffect(() => {
        if (!user) return

        const getProjectDetails = async () => {
            try {
                const pApplicants = await getProjectApplicantsById(projectId)
                const projectRes = await getProjectById(projectId)
                const tasksRes = await getTasksByProject(projectId)
                const meetingRes = await getProjectInternalMeeting(projectId)
                const reviewsRes = await getStudentsReviews(projectId)
                const badgesRes = await getBadges();

                if (pApplicants.success && projectRes.success && tasksRes.success && meetingRes.success && reviewsRes.success && badgesRes.success) {
                    setProjectApplicants(pApplicants.data)
                    setProject(projectRes.data)
                    setTasks(tasksRes.data)
                    setMeetings(meetingRes.data)
                    setReviews(reviewsRes.data);
                    setBadges(badgesRes.data);
                    console.log("reviews: ", reviewsRes.data)
                } else {
                    toast.error("Failed to fetch project details")
                }
            } catch {
                toast.error("Something went wrong. Please try again")
            }
        }

        getProjectDetails()
    }, [user, projectId])

    const handleCompleteProject = async () => {
        setCompleting(true)
        try {
            const res = await completeProject(projectId)
            if (res.success) {
                toast.success("Project marked as completed.")
                setConfirmOpen(false)
                router.push("/workspace")
            } else {
                toast.error("Failed to complete project.")
            }
        } catch {
            toast.error("Something went wrong.")
        } finally {
            setCompleting(false)
        }
    }

    const isFinished = project?.status === "completed" || project?.status === "closed"
    const statusInfo = project ? (statusConfig[project.status] ?? statusConfig["open"]) : null

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="max-w-6xl mx-auto px-6 py-6">
                <div className="flex items-center justify-between gap-4">
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

                    <div className="flex items-center gap-3 shrink-0">
                        {statusInfo && (
                            <Badge className={`text-xs px-3 py-2 border ${statusInfo.className}`}>
                                {statusInfo.label}
                            </Badge>
                        )}
                        {!isFinished && (
                            <Button
                                size="sm"
                                className="cursor-pointer gap-1.5 "
                                onClick={() => setConfirmOpen(true)}
                            >
                                <CheckCircle size={14} /> Complete Project
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-6 pb-8">
                <Card className="rounded-sm">
                    <CardContent className="px-5">
                        <Tabs value={activeTab} onValueChange={setActiveTab}>
                            <TabsList variant="line" className="gap-3">
                                <TabsTrigger value="task_overview" className="cursor-pointer"><KanbanSquare />Task Overview</TabsTrigger>
                                <TabsTrigger value="project_overview" className="cursor-pointer"><FolderOpen />Project Overview</TabsTrigger>
                                <TabsTrigger value="discussion" className="cursor-pointer"><MessageSquare />Discussion</TabsTrigger>
                                <TabsTrigger value="meeting" className="cursor-pointer"><Video />Meetings</TabsTrigger>
                                <TabsTrigger value="team" className="cursor-pointer"><Users />Team / Members</TabsTrigger>
                                {
                                    project?.status === "completed" && (
                                        <TabsTrigger value="ratings" className="cursor-pointer"><MessageSquareText />Project Reviews and Student Evaluation</TabsTrigger>
                                    )
                                }
                            </TabsList>

                            <TabsContent value="task_overview">
                                <KanbanBoard
                                    tasks={tasks}
                                    setTasks={setTasks}
                                    projectApplicants={projectApplicants}
                                    projectId={projectId}
                                    readOnly={isFinished}
                                />
                            </TabsContent>

                            <TabsContent value="project_overview">
                                <ProjectOverview
                                    project={project!}
                                    onTabChange={() => setActiveTab("team")}
                                />
                            </TabsContent>

                            <TabsContent value="discussion">
                                {project && user && (
                                    <DiscussionTab
                                        projectId={projectId}
                                        projectTitle={project.title}
                                        userId={user.id}
                                        userName={`${user.firstName} ${user.lastName}`}
                                        userImage={user.imageUrl}
                                        memberIds={projectApplicants.map(a => a.clerk_id)}
                                    />
                                )}
                            </TabsContent>

                            <TabsContent value="meeting">
                                {user && (
                                    <TeamMeetingsTab
                                        projectId={projectId}
                                        companyId={user.id}
                                        meetings={meetings}
                                        onMeetingScheduled={(meeting) => setMeetings(prev => [...prev, meeting])}
                                        readOnly={isFinished}
                                    />
                                )}
                            </TabsContent>

                            <TabsContent value="team">
                                <TeamMembersOverview
                                    ownerImageUrl={user?.imageUrl ?? ""}
                                    ownerName={`${user?.firstName ?? ""} ${user?.lastName ?? ""}`}
                                    ownerEmail={user?.primaryEmailAddress?.emailAddress ?? ""}
                                    projectApplicants={projectApplicants}
                                />
                            </TabsContent>

                            <TabsContent value="ratings">
                                <Card className="mt-6 rounded-sm p-6 gap-4">
                                    <CardHeader className="p-0">
                                        <CardTitle className="font-semibold text-lg">Project Reviews and Student Evaluation</CardTitle>
                                        <CardDescription>
                                            View project feedback and assess students based on their involvement and performance.
                                        </CardDescription>
                                    </CardHeader>

                                    <Separator />

                                    <CardContent className="p-0 flex flex-col gap-3">
                                        <ReviewsAndEvaluationTab reviews={reviews} projectApplicants={projectApplicants} employer={user?.id ?? ""} badges={badges} projectId={projectId} />
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>
            </div>

            {/* Complete Project Confirmation Dialog */}
            <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Complete Project Early?</DialogTitle>
                        <DialogDescription>
                            This will mark <span className="font-medium text-[#0f172a]">{project?.title}</span> as completed and notify all team members. This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2">
                        <Button variant="outline" className="cursor-pointer" onClick={() => setConfirmOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            className="cursor-pointer gap-1.5 bg-green-600 hover:bg-green-700"
                            disabled={completing}
                            onClick={handleCompleteProject}
                        >
                            <CheckCircle size={14} />
                            {completing ? "Completing..." : "Yes, Complete Project"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
