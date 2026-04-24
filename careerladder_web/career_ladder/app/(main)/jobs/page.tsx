"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { toast } from "sonner"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { Briefcase, Search, Sparkles, Loader2 } from "lucide-react"

import { getAllJobs } from "@/app/api/job"
import { JobCard, type Jobs } from "./components/JobCard"
import { JobCardSkeleton } from "./components/JobCardSkeleton"
import { useRecommendations } from "@/hooks/useRecommendations"


export default function Jobs() {
    const searchParams = useSearchParams()
    const [jobList, setJobList] = useState<Jobs[]>([]);
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState(searchParams.get("search") ?? "")
    const [employmentFilter, setEmploymentFilter] = useState("all")
    const [remoteFilter, setRemoteFilter] = useState("all")

    const { recommendations, isLoading: aiLoading, refresh: refreshAI } = useRecommendations(
        jobList, [], [], { autoFetch: false }
    )
    const aiJobs = recommendations
        ? jobList.filter(j => recommendations.recommendedJobIds.includes(j.id)).slice(0, 3)
        : []

    useEffect(() => {
        const fetchJobs = async () => {
            try {
                const jobs = await getAllJobs()
                if (jobs.success) {
                    const filtered = jobs.data.filter((e: Jobs) => e.status === "open")
                    setJobList(filtered)
                } else {
                    toast.error("Failed to fetch jobs. Please reload page.")
                }
            } finally {
                setLoading(false)
            }
        }

        fetchJobs();
    }, [])

    const filtered = jobList
        .filter(j =>
            j.title.toLowerCase().includes(search.toLowerCase()) ||
            j.description.toLowerCase().includes(search.toLowerCase())
        )
        .filter(j => employmentFilter === "all" || j.employment_type === employmentFilter)
        .filter(j => remoteFilter === "all" || (remoteFilter === "remote" ? j.is_remote : !j.is_remote))

    return (
        <div className="min-h-screen bg-slate-100">
            <div className="bg-white border-b border-slate-100">
                <div className="max-w-7xl mx-auto px-6 py-6">

                    {/* Breadcrumb */}
                    <Breadcrumb className="mb-4">
                        <BreadcrumbList>
                            <BreadcrumbItem>
                                <BreadcrumbLink href="/home" >Home</BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                                <BreadcrumbLink >Opportunities</BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                                <BreadcrumbPage>Opening Job Positions</BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>

                    <div className="flex items-end justify-between gap-6 flex-wrap">
                        <div>
                            <h1 className="text-xl font-bold">Opening Job Positions</h1>
                            <p className="text-sm text-slate-400 mt-1">
                                Explore roles that are currently open for applications
                            </p>
                        </div>

                        <div className="flex items-center gap-3 flex-wrap">
                            <div className="flex items-center gap-2 h-9 px-3 rounded-xl border border-slate-200 bg-white w-56">
                                <Search size={13} className="text-slate-400 shrink-0" />
                                <input
                                    type="text"
                                    placeholder="Search jobs..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="flex-1 text-sm bg-transparent outline-none text-slate-600 placeholder:text-slate-400"
                                />
                            </div>
                            <Select value={employmentFilter} onValueChange={setEmploymentFilter}>
                                <SelectTrigger className="h-9 w-40 text-sm rounded-xl border-slate-200">
                                    <SelectValue placeholder="Employment Type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Types</SelectItem>
                                    <SelectItem value="fulltime">Full Time</SelectItem>
                                    <SelectItem value="parttime">Part Time</SelectItem>
                                    <SelectItem value="contract">Contract</SelectItem>
                                    <SelectItem value="freelance">Freelance</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select value={remoteFilter} onValueChange={setRemoteFilter}>
                                <SelectTrigger className="h-9 w-36 text-sm rounded-xl border-slate-200">
                                    <SelectValue placeholder="Work Mode" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All</SelectItem>
                                    <SelectItem value="remote">Remote</SelectItem>
                                    <SelectItem value="onsite">On-site</SelectItem>
                                </SelectContent>
                            </Select>
                            <button
                                onClick={refreshAI}
                                disabled={aiLoading || loading}
                                className="flex items-center gap-1.5 h-9 px-3 rounded-xl border border-indigo-200 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 text-sm font-medium transition-colors disabled:opacity-60"
                            >
                                {aiLoading ? <Loader2 size={13} className="animate-spin" /> : <Sparkles size={13} />}
                                {aiLoading ? "Thinking..." : "AI Picks"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Job Grid */}
            <div className="max-w-7xl mx-auto px-6 py-8">
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Array.from({ length: 6 }).map((_, i) => <JobCardSkeleton key={i} />)}
                    </div>
                ) : aiJobs.length > 0 ? (
                    <>
                        <div className="flex items-center gap-2 mb-4">
                            <Sparkles size={13} className="text-indigo-500" />
                            <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wide">AI Picks for You</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            {aiJobs.map(job => <JobCard key={job.id} job={job} aiPick />)}
                        </div>
                    </>
                ) : filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 gap-3">
                        <Briefcase size={36} className="text-slate-200" />
                        <p className="text-sm text-slate-400">No jobs found</p>
                        <p className="text-sm text-slate-300">Try adjusting your search or filters</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {filtered.map((job) => <JobCard key={job.id} job={job} />)}
                    </div>
                )}
            </div>
        </div >
    )
}