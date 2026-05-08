"use client"

import { useParams } from "next/navigation"
import { useEffect, useState } from "react"

import { CompanyProfile, CompanyReview, ProjectReview } from "@/types";
import { getCompanyProfile, getCompanyReviews } from "@/app/api/user";
import { getCompanyReviews as getCompanyProjectReviews } from "@/app/api/project";

import { toast } from "sonner"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"

import { CompanyHeader } from "./components/CompanyHeader"
import { FreezeAccountDialog } from "../../components/FreezeAccountDialog"
import { OverviewTab } from "./components/OverviewTab"
import { ReviewsTab } from "./components/ReviewsTab"
import { ProjectReviewsTab } from "./components/ProjectReviewsTab"

export default function CompanyDetailsPage() {
    const params = useParams();
    const companyid = params.id as string;

    const [isLoading, setIsLoading] = useState(true);
    const [companyProfile, setCompanyProfile] = useState<CompanyProfile | null>(null);
    const [freezeDialogOpen, setFreezeDialogOpen] = useState(false);
    const [companyReviews, setCompanyReviews] = useState<CompanyReview[]>([]);
    const [projectReviews, setProjectReviews] = useState<ProjectReview[]>([]);

    useEffect(() => {
        const fetchCompanyProfile = async () => {
            try {
                const [profileRes, cReviewRes, cProjectReviewRes] = await Promise.all([
                    getCompanyProfile(companyid),
                    getCompanyReviews(companyid),
                    getCompanyProjectReviews(companyid)
                ])

                if (profileRes.success) setCompanyProfile(profileRes.data);
                if (cReviewRes.success) setCompanyReviews(cReviewRes.data);
                if (cProjectReviewRes.success) setProjectReviews(cProjectReviewRes.data);
            } catch {
                toast.error("Something went wrong please try again")
            } finally {
                setIsLoading(false);
            }
        }

        fetchCompanyProfile()
    }, [companyid])

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="max-w-6xl mx-auto px-6 py-6 flex flex-col gap-6">

                <Breadcrumb>
                    <BreadcrumbList>
                        <BreadcrumbItem><BreadcrumbLink href="/admin-dashboard">Dashboard</BreadcrumbLink></BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem><BreadcrumbLink href="/admin-dashboard/users">User Management</BreadcrumbLink></BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem><BreadcrumbPage>Company Profile</BreadcrumbPage></BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>

                {isLoading ? (
                    <div className="flex flex-col gap-4">
                        <Card className="rounded-xl border border-slate-200 shadow-sm">
                            <CardContent className="px-6 py-6">
                                <div className="flex items-center gap-5">
                                    <Skeleton className="w-20 h-20 rounded-xl shrink-0" />
                                    <div className="flex flex-col gap-2 flex-1">
                                        <Skeleton className="h-6 w-48 rounded" />
                                        <Skeleton className="h-4 w-64 rounded" />
                                        <Skeleton className="h-4 w-32 rounded" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="rounded-xl border border-slate-200 shadow-sm">
                            <CardContent className="px-6 py-6 flex flex-col gap-3">
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <Skeleton key={i} className="h-10 w-full rounded-lg" />
                                ))}
                            </CardContent>
                        </Card>
                    </div>
                ) : companyProfile ? (
                    <>
                        <CompanyHeader
                            profile={companyProfile}
                            onFreeze={() => setFreezeDialogOpen(true)}
                            onUnfreeze={() => setFreezeDialogOpen(true)}
                        />

                        <Card className="rounded-xl border border-slate-200 shadow-sm">
                            <CardContent className="px-6 pt-2 pb-6">
                                <Tabs defaultValue="overview">
                                    <TabsList variant="line" className="mb-6 border-b border-slate-100 w-full justify-start rounded-none pb-0">
                                        <TabsTrigger value="overview">Overview</TabsTrigger>
                                        <TabsTrigger value="reviews">
                                            Reviews
                                            {companyReviews.length > 0 && (
                                                <span className="ml-1.5 text-xs bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-full">{companyReviews.length}</span>
                                            )}
                                        </TabsTrigger>
                                        <TabsTrigger value="project-reviews">
                                            Project Reviews
                                            {projectReviews.length > 0 && (
                                                <span className="ml-1.5 text-xs bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-full">{projectReviews.length}</span>
                                            )}
                                        </TabsTrigger>
                                    </TabsList>

                                    <TabsContent value="overview">
                                        <OverviewTab profile={companyProfile} />
                                    </TabsContent>

                                    <TabsContent value="reviews">
                                        <ReviewsTab reviews={companyReviews} />
                                    </TabsContent>

                                    <TabsContent value="project-reviews">
                                        <ProjectReviewsTab reviews={projectReviews} />
                                    </TabsContent>
                                </Tabs>
                            </CardContent>
                        </Card>
                    </>
                ) : (
                    <Card className="rounded-xl border border-slate-200 shadow-sm">
                        <CardContent className="px-6 py-16 text-center">
                            <p className="text-sm text-slate-400">Company not found</p>
                        </CardContent>
                    </Card>
                )}
            </div>

            {companyProfile && (
                <FreezeAccountDialog
                    open={freezeDialogOpen}
                    name={companyProfile.company_name}
                    clerkId={companyProfile.clerk_id}
                    isFreezing={Number(companyProfile.status) === 1}
                    onClose={() => setFreezeDialogOpen(false)}
                    onSuccess={(newStatus) => setCompanyProfile((prev) => prev ? { ...prev, status: newStatus } : prev)}
                />
            )}
        </div>
    )
}
