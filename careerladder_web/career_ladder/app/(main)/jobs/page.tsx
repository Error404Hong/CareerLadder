"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { Briefcase, Search } from "lucide-react"

import { getAllJobs } from "@/app/api/job"
import { JobCard, type Jobs } from "./components/JobCard"
import { JobCardSkeleton } from "./components/JobCardSkeleton"


export default function Jobs() {
    const [jobList, setJobList] = useState<Jobs[]>([]);
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState("")
    const [employmentFilter, setEmploymentFilter] = useState("all")
    const [remoteFilter, setRemoteFilter] = useState("all")

    useEffect(() => {
        const fetchJobs = async () => {
            try {
                const jobs = await getAllJobs()
                if (jobs.success) {
                    setJobList(jobs.data)
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
        <div className="min-h-screen bg-slate-50">
            <div className="bg-white border-b border-slate-100">
                <div className="max-w-7xl mx-auto px-6 py-6">

                    {/* Breadcrumb */}
                    <Breadcrumb className="mb-4">
                        <BreadcrumbList>
                            <BreadcrumbItem>
                                <BreadcrumbLink href="/home" className="text-sm text-slate-400 hover:text-[#0f172a]">Home</BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                                <BreadcrumbLink className="text-sm text-slate-400 hover:text-[#0f172a]">Opportunities</BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                                <BreadcrumbPage className="text-sm text-[#0f172a] font-medium">Opening Job Positions</BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>

                    <div className="flex items-end justify-between gap-6 flex-wrap">
                        <div>
                            <h1 className="text-2xl font-bold text-[#0f172a] tracking-tight">Opening Job Positions</h1>
                            <p className="text-sm text-slate-400 mt-1">
                                {loading ? "Loading..." : `${filtered.length} job${filtered.length !== 1 ? "s" : ""} available`}
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
                ) : filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 gap-3">
                        <Briefcase size={36} className="text-slate-200" />
                        <p className="text-sm font-medium text-slate-400">No jobs found</p>
                        <p className="text-sm text-slate-300">Try adjusting your search or filters</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {filtered.map((job) => <JobCard key={job.id} job={job} />)}
                    </div>
                )}
            </div>
        </div>
    )
}