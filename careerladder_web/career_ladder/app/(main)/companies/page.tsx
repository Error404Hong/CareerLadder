"use client"

import { useState, useEffect, useMemo } from "react"

import { CompanyProfile } from "@/types"
import { getAllCompany } from "@/app/api/user"

import { toast } from "sonner"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination"
import { Building2, Search } from "lucide-react"

import { CompanyCard } from "./components/CompanyCard"
import { CompanyCardSkeleton } from "./components/CompanyCardSkeleton"

const ITEMS_PER_PAGE = 6

function buildPageNumbers(current: number, total: number) {
    if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1)
    if (current <= 3) return [1, 2, 3, 4, "...", total]
    if (current >= total - 2) return [1, "...", total - 3, total - 2, total - 1, total]
    return [1, "...", current - 1, current, current + 1, "...", total]
}

export default function CompanyReview() {
    const [isLoading, setIsLoading] = useState(true);
    const [companies, setCompanies] = useState<CompanyProfile[]>([]);
    const [search, setSearch] = useState("");
    const [industryFilter, setIndustryFilter] = useState("all");
    const [currentPage, setCurrentPage] = useState(1)

    useEffect(() => {
        const fetchAllCompany = async () => {
            try {
                const fetchRes = await getAllCompany();

                if (fetchRes.success) {
                    setCompanies(fetchRes.data);
                } else {
                    toast.error("Failed to fetch companies. Please try again")
                }
            } catch {
                toast.error("Something went wrong. Please try again")
            } finally {
                setIsLoading(false)
            }
        }

        fetchAllCompany()
    }, [])

    const industries = useMemo(() => {
        const set = new Set(companies.map((c) => c.industry).filter(Boolean))
        return Array.from(set).sort()
    }, [companies])

    const filtered = useMemo(() =>
        companies
            .filter((c) => {
                const q = search.toLowerCase()
                return (
                    c.company_name.toLowerCase().includes(q) ||
                    c.description?.toLowerCase().includes(q) ||
                    c.location?.toLowerCase().includes(q)
                )
            })
            .filter((c) => industryFilter === "all" || c.industry === industryFilter),
        [companies, search, industryFilter]
    )

    useEffect(() => { setCurrentPage(1) }, [search, industryFilter])

    const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE)
    const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header */}
            <div className="bg-white border-b border-slate-100">
                <div className="max-w-7xl mx-auto px-6 py-6">
                    <Breadcrumb className="mb-4">
                        <BreadcrumbList>
                            <BreadcrumbItem>
                                <BreadcrumbLink href="/home">Home</BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                                <BreadcrumbPage>Companies</BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>

                    <div className="flex items-end justify-between gap-6 flex-wrap">
                        <div>
                            <h1 className="text-xl font-bold">Companies Overview</h1>
                            <p className="text-sm text-slate-400 mt-1">
                                Explore a list of companies and view their profiles, details, and peer reviews.
                            </p>
                        </div>

                        {/* Filters */}
                        <div className="flex items-center gap-3 flex-wrap">
                            <div className="flex items-center gap-2 h-9 px-3 rounded-xl border border-slate-200 bg-white w-56">
                                <Search size={13} className="text-slate-400 shrink-0" />
                                <input
                                    type="text"
                                    placeholder="Search companies..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="flex-1 text-sm bg-transparent outline-none text-slate-600 placeholder:text-slate-400"
                                />
                            </div>

                            <Select value={industryFilter} onValueChange={setIndustryFilter}>
                                <SelectTrigger className="h-9 w-44 text-sm rounded-xl border-slate-200">
                                    <SelectValue placeholder="Industry" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Industries</SelectItem>
                                    {industries.map((ind) => (
                                        <SelectItem key={ind} value={ind}>
                                            {ind}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>
            </div>

            {/* Grid */}
            <div className="max-w-7xl mx-auto px-6 py-8">
                {isLoading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <CompanyCardSkeleton key={i} />
                        ))}
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 gap-3">
                        <Building2 size={36} className="text-slate-200" />
                        <p className="text-sm text-slate-400">No companies found</p>
                        <p className="text-sm text-slate-400">Try adjusting your search or filters</p>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                            {paginated.map((company) => (
                                <CompanyCard key={company.id} company={company} />
                            ))}
                        </div>

                        {totalPages > 1 && (
                            <div className="mt-8 flex justify-center">
                                <Pagination>
                                    <PaginationContent>
                                        <PaginationItem>
                                            <PaginationPrevious
                                                href="#"
                                                onClick={(e) => { e.preventDefault(); setCurrentPage(p => Math.max(1, p - 1)) }}
                                                className={currentPage === 1 ? "pointer-events-none opacity-40" : "cursor-pointer"}
                                            />
                                        </PaginationItem>

                                        {buildPageNumbers(currentPage, totalPages).map((page, idx) =>
                                            page === "..." ? (
                                                <PaginationItem key={`ellipsis-${idx}`}>
                                                    <PaginationEllipsis />
                                                </PaginationItem>
                                            ) : (
                                                <PaginationItem key={page}>
                                                    <PaginationLink
                                                        href="#"
                                                        isActive={currentPage === page}
                                                        onClick={(e) => { e.preventDefault(); setCurrentPage(page as number) }}
                                                        className="cursor-pointer"
                                                    >
                                                        {page}
                                                    </PaginationLink>
                                                </PaginationItem>
                                            )
                                        )}

                                        <PaginationItem>
                                            <PaginationNext
                                                href="#"
                                                onClick={(e) => { e.preventDefault(); setCurrentPage(p => Math.min(totalPages, p + 1)) }}
                                                className={currentPage === totalPages ? "pointer-events-none opacity-40" : "cursor-pointer"}
                                            />
                                        </PaginationItem>
                                    </PaginationContent>
                                </Pagination>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    )
}
