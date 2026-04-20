"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import { getAllTraining } from "@/app/api/training"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Search, BookOpen } from "lucide-react"

import { TrainingCard, type Training } from "./components/TrainingCard"
import { TrainingCardSkeleton } from "./components/TrainingCardSkeleton"


export default function TrainingPage() {
    const [trainingList, setTrainingList] = useState<Training[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState("")
    const [visibilityFilter, setVisibilityFilter] = useState("all")

    useEffect(() => {
        const fetchTrainingPrograms = async () => {
            try {
                const result = await getAllTraining()
                if (result.success) {
                    const filtered = result.data.filter((e: Training) => e.status === "open")
                    setTrainingList(filtered)
                } else {
                    toast.error("Failed to fetch training programs. Please try again")
                }
            } finally {
                setLoading(false)
            }
        }
        fetchTrainingPrograms()
    }, [])

    const filtered = trainingList
        .filter(t =>
            t.title.toLowerCase().includes(search.toLowerCase()) ||
            t.description.toLowerCase().includes(search.toLowerCase())
        )
        .filter(t => visibilityFilter === "all" || (visibilityFilter === "public" ? t.is_public : !t.is_public))

    const open = filtered.filter(t => t.status === "open")
    const ongoing = filtered.filter(t => t.status === "ongoing")

    const renderGrid = (list: Training[]) => (
        list.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 gap-3">
                <BookOpen size={36} className="text-slate-200" />
                <p className="text-sm  text-slate-400">No training programs found</p>
                <p className="text-sm text-slate-300">Try adjusting your search or filters</p>
            </div>
        ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {list.map(t => <TrainingCard key={t.id} training={t} />)}
            </div>
        )
    )

    return (
        <div className="min-h-screen bg-slate-100">
            <div className="bg-white border-b border-slate-100">
                <div className="max-w-7xl mx-auto px-6 py-6">

                    <Breadcrumb className="mb-4">
                        <BreadcrumbList>
                            <BreadcrumbItem>
                                <BreadcrumbLink href="/home" >Home</BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                                <BreadcrumbLink>Opportunities</BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                                <BreadcrumbPage>Industrial Training Programs</BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>

                    <div className="flex items-end justify-between gap-6 flex-wrap">
                        <div>
                            <h1 className="text-xl font-bold">Industrial Training Programs</h1>
                            <p className="text-sm text-slate-400 mt-1">
                                {loading ? "Loading..." : `${filtered.length} program${filtered.length !== 1 ? "s" : ""} available`}
                            </p>
                        </div>

                        <div className="flex items-center gap-3 flex-wrap">
                            <div className="flex items-center gap-2 h-9 px-3 rounded-xl border border-slate-200 bg-white w-56">
                                <Search size={13} className="text-slate-400 shrink-0" />
                                <input
                                    type="text"
                                    placeholder="Search programs..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="flex-1 text-sm bg-transparent outline-none text-slate-600 placeholder:text-slate-400"
                                />
                            </div>
                            <Select value={visibilityFilter} onValueChange={setVisibilityFilter}>
                                <SelectTrigger className="h-9 w-36 text-sm rounded-xl border-slate-200">
                                    <SelectValue placeholder="Visibility" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All</SelectItem>
                                    <SelectItem value="public">Public</SelectItem>
                                    <SelectItem value="private">Private</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-8">
                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                        {Array.from({ length: 8 }).map((_, i) => <TrainingCardSkeleton key={i} />)}
                    </div>
                ) : (
                    <Tabs defaultValue="open">
                        <TabsList className="mb-6">
                            <TabsTrigger value="open">
                                Open
                                <Badge className="ml-2 text-[11px] bg-green-50 text-green-600 border border-green-100 rounded-full px-2 py-0">
                                    {open.length}
                                </Badge>
                            </TabsTrigger>
                            <TabsTrigger value="ongoing">
                                Ongoing
                                <Badge className="ml-2 text-[11px] bg-blue-50 text-blue-600 border border-blue-100 rounded-full px-2 py-0">
                                    {ongoing.length}
                                </Badge>
                            </TabsTrigger>
                        </TabsList>
                        <TabsContent value="open">{renderGrid(open)}</TabsContent>
                        <TabsContent value="ongoing">{renderGrid(ongoing)}</TabsContent>
                    </Tabs>
                )}
            </div>
        </div >
    )
}