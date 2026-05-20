"use client"

import { useUser } from "@clerk/nextjs"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Building2, Globe, MapPin, Pencil, Users, Calendar, Briefcase, TrendingUp, ExternalLink } from "lucide-react"

import { ProfileForm } from "./forms/ProfileForm"
import { DescriptionForm } from "./forms/DescriptionForm"
import { getCompanyProfile } from "@/app/api/user"
import { getJobsByCompany, getAllJobAppByCom } from "@/app/api/job"
import { getCompanyProjects, getProjectAppByCom } from "@/app/api/project"
import Image from "next/image"

export type CompanyProfile = {
    id: string
    company_id: string
    company_name: string
    description: string
    industry: string
    company_size: string
    founded_year: number
    website: string
    image_url: string | null
    location: string
    created_at: string
    updated_at: string
}

export default function CompanyProfilePage() {
    const { user } = useUser()
    const [profile, setProfile] = useState<CompanyProfile | null>(null)
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const [openEditDialog, setOpenEditDialog] = useState<boolean>(false);
    const [openDescriptionDialog, setOpenDescriptionDialog] = useState<boolean>(false);
    const [activeJobs, setActiveJobs] = useState<number>(0)
    const [activeProjects, setActiveProjects] = useState<number>(0)
    const [totalApplications, setTotalApplications] = useState<number>(0)

    useEffect(() => {
        if (!user) return
        const fetchProfile = async () => {
            try {
                const [profileRes, jobRes, projectRes, jobAppRes, projAppRes] = await Promise.all([
                    getCompanyProfile(user.id),
                    getJobsByCompany(user.id),
                    getCompanyProjects(user.id),
                    getAllJobAppByCom(user.id),
                    getProjectAppByCom(user.id),
                ])
                if (profileRes.success) {
                    setProfile(profileRes.data)
                } else {
                    toast.error("Failed to fetch company profile. Please reload page")
                }
                if (jobRes.success) setActiveJobs(jobRes.data.filter((j: { status: string }) => j.status === "open").length)
                if (projectRes.success) setActiveProjects(projectRes.data.filter((p: { status: string }) => p.status === "in_progress").length)
                const jobAppsCount = jobAppRes.success ? jobAppRes.data.length : 0
                const projAppsCount = projAppRes.success ? projAppRes.data.length : 0
                setTotalApplications(jobAppsCount + projAppsCount)
            } catch (error) {
                toast.error("Failed to fetch company profile")
            } finally {
                setIsLoading(false)
            }
        }
        fetchProfile()
    }, [user])

    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-50 p-8">
                <div className="max-w-5xl mx-auto flex flex-col gap-6">
                    <Skeleton className="h-5 w-48 rounded" />
                    <Skeleton className="h-64 w-full rounded-3xl" />
                    <div className="grid grid-cols-3 gap-4">
                        <Skeleton className="h-28 rounded-2xl" />
                        <Skeleton className="h-28 rounded-2xl" />
                        <Skeleton className="h-28 rounded-2xl" />
                    </div>
                    <Skeleton className="h-40 w-full rounded-2xl" />
                </div>
            </div>
        )
    }

    return (
        <>
            <div className="min-h-screen bg-slate-50">
                <div className="max-w-6xl mx-auto px-3 py-3 flex flex-col gap-6">

                    {/* Breadcrumb */}
                    <Breadcrumb>
                        <BreadcrumbList>
                            <BreadcrumbItem>
                                <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                                <BreadcrumbPage>Company Profile</BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>

                    {/* Hero Card */}
                    <div className="relative rounded-3xl overflow-hidden border border-slate-100 shadow-sm">
                        {/* Background */}
                        <div className="h-30 bg-[#0f172a] relative overflow-hidden">
                            <div className="absolute -bottom-10 -right-10 w-48 h-48 rounded-full bg-[#2563eb]/20" />
                            <div className="absolute top-4 right-4">
                                <Button size="sm" variant="outline" className="cursor-pointer bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white rounded-xl gap-1.5"
                                    onClick={() => setOpenEditDialog(true)}
                                >
                                    <Pencil size={12} /> Edit Profile
                                </Button>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="bg-white px-8 pb-8">
                            <div className="flex items-end gap-5 -mt-8 mb-5">
                                {/* Logo */}
                                <div className="w-20 h-20 rounded-2xl border-4 border-white bg-slate-100 shadow-lg flex items-center justify-center shrink-0 relative z-10">
                                    {profile?.image_url ? (
                                        <Image src={profile.image_url} alt="logo" className="w-full h-full rounded-xl object-cover z-10" width={80} height={80} />
                                    ) : (
                                        <Building2 size={28} className="text-slate-300" />
                                    )}
                                </div>
                                <div className="pb-1">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <h1 className="text-xl font-bold text-[#0f172a]">
                                            {profile?.company_name ?? "Your Company Name"}
                                        </h1>
                                        {profile?.industry && (
                                            <Badge className="text-[11px] bg-blue-50 text-[#2563eb] border border-blue-100 rounded-full px-2.5 py-0.5">
                                                {profile.industry}
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Meta */}
                            <div className="flex flex-wrap gap-5">
                                {profile?.location && (
                                    <div className="flex items-center gap-1.5 text-sm text-slate-500">
                                        <MapPin size={13} className="text-slate-300 shrink-0" />
                                        {profile.location}
                                    </div>
                                )}
                                {profile?.company_size && (
                                    <div className="flex items-center gap-1.5 text-sm text-slate-500">
                                        <Users size={13} className="text-slate-300 shrink-0" />
                                        {profile.company_size} employees
                                    </div>
                                )}
                                {profile?.founded_year && (
                                    <div className="flex items-center gap-1.5 text-sm text-slate-500">
                                        <Calendar size={13} className="text-slate-300 shrink-0" />
                                        Founded {profile.founded_year}
                                    </div>
                                )}
                                {profile?.website && (
                                    <a href={profile.website} target="_blank" rel="noreferrer"
                                        className="flex items-center gap-1.5 text-sm text-[#2563eb] hover:underline">
                                        <Globe size={13} className="shrink-0" />
                                        {profile.website.replace("https://", "").replace("http://", "")}
                                        <ExternalLink size={11} />
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {[
                            { label: "Active Job Postings", value: activeJobs, icon: Briefcase, color: "bg-blue-100 text-blue-600" },
                            { label: "Active Projects", value: activeProjects, icon: TrendingUp, color: "bg-green-100 text-green-600" },
                            { label: "Total Applications", value: totalApplications, icon: Users, color: "bg-purple-100 text-purple-600" },
                        ].map((stat) => {
                            const Icon = stat.icon
                            return (
                                <div key={stat.label} className="bg-white rounded-2xl border border-slate-100 shadow-sm px-5 py-4 flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${stat.color}`}>
                                        <Icon size={16} />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-[#0f172a]">{stat.value}</p>
                                        <p className="text-xs text-slate-400 mt-0.5">{stat.label}</p>
                                    </div>
                                </div>
                            )
                        })}
                    </div>

                    {/* About */}
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm px-6 py-5">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-sm font-semibold text-[#0f172a]">About the Company</h2>
                            <button className="text-xs text-slate-400 hover:text-[#0f172a] flex items-center gap-1 transition-colors"
                                onClick={() => setOpenDescriptionDialog(true)}
                            >
                                <Pencil size={11} /> Edit
                            </button>
                        </div>
                        {profile?.description ? (
                            <p className="text-sm text-slate-500 leading-relaxed">{profile.description}</p>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-10 gap-2">
                                <Building2 size={32} className="text-slate-200" />
                                <p className="text-sm font-medium text-slate-400">No description yet</p>
                                <p className="text-xs text-slate-300">Click Edit to add a company description</p>
                            </div>
                        )}
                    </div>

                </div>
            </div>

            <ProfileForm open={openEditDialog} onOpenChange={setOpenEditDialog} profile={profile} onSuccess={(updatedProfile) => setProfile(updatedProfile)} />
            <DescriptionForm open={openDescriptionDialog} onOpenChange={setOpenDescriptionDialog} profile={profile} onSuccess={(updatedProfile) => setProfile(updatedProfile)} />
        </>
    )
}