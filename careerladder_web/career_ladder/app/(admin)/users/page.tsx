"use client"

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAllStudent, getAllCompany } from "@/app/api/user";
import { Student } from "@/types/student";
import { CompanyProfile } from "@/types/companyProfile";

import { toast } from "sonner"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Building2, GraduationCap } from "lucide-react";
import { DataTable } from "./data-table"
import { getStudentColumns } from "./student-columns"
import { getCompanyColumns } from "./company-columns"
import { FreezeAccountDialog } from "./components/FreezeAccountDialog"

export default function UsersPage() {
    const router = useRouter()
    const [students, setStudents] = useState<Student[]>([])
    const [companies, setCompanies] = useState<CompanyProfile[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [freezeTarget, setFreezeTarget] = useState<{ clerkId: string; name: string; status: number; type: "student" | "company" } | null>(null)

    useEffect(() => {
        const fetchAllUsers = async () => {
            try {
                const [studentRes, companyRes] = await Promise.all([
                    getAllStudent(),
                    getAllCompany(),
                ])
                if (studentRes.success) setStudents(studentRes.data ?? [])
                if (companyRes.success) {
                    setCompanies(companyRes.data ?? [])
                    console.log("Company: ", companyRes.data);
                }
            } catch {
                toast.error("Something went wrong. Please try again")
            } finally {
                setIsLoading(false)
            }
        }
        fetchAllUsers()
    }, [])

    const studentColumns = getStudentColumns(
        (id) => router.push(`/users/user/${id}`),
        (s) => setFreezeTarget({ clerkId: s.clerk_id, name: `${s.firstName} ${s.lastName}`, status: Number(s.status), type: "student" }),
    )
    const companyColumns = getCompanyColumns(
        (id) => router.push(`/users/company/${id}`),
        (c) => setFreezeTarget({ clerkId: c.clerk_id, name: c.company_name, status: Number(c.status), type: "company" }),
    )

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="max-w-6xl mx-auto px-6 py-6 flex flex-col gap-6">
                <Breadcrumb>
                    <BreadcrumbList>
                        <BreadcrumbItem>
                            <BreadcrumbLink href="/admin-dashboard">Dashboard</BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbPage>User Management</BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>

                {isLoading ? (
                    <Card className="rounded-lg border border-slate-200 shadow-sm">
                        <CardHeader className="px-5 border-b border-grey-300">
                            <div className="flex flex-col gap-2">
                                <Skeleton className="h-6 w-32 rounded" />
                                <Skeleton className="h-4 w-64 rounded" />
                            </div>
                        </CardHeader>
                        <CardContent className="px-5 py-3">
                            <div className="flex flex-col gap-3 py-4">
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <Skeleton key={i} className="h-12 w-full rounded-xl" />
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    <Card className="rounded-lg border border-slate-200 shadow-sm">
                        <CardHeader className="px-5 border-b border-slate-100">
                            <CardTitle className="text-xl font-bold">User Management</CardTitle>
                            <CardDescription>
                                View, manage, and monitor user accounts in one place
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="px-5">
                            <Tabs defaultValue="students">
                                <TabsList variant="line" className="mb-4">
                                    <TabsTrigger value="students" className="cursor-pointer">
                                        <GraduationCap />
                                        Students
                                        <span className="ml-1.5 text-xs text-slate-400">({students.length})</span>
                                    </TabsTrigger>
                                    <TabsTrigger value="companies" className="cursor-pointer">
                                        <Building2 />
                                        Companies
                                        <span className="ml-1.5 text-xs text-slate-400">({companies.length})</span>
                                    </TabsTrigger>
                                </TabsList>

                                <TabsContent value="students">
                                    <DataTable
                                        columns={studentColumns}
                                        data={students}
                                        searchPlaceholder="Search students..."
                                        emptyTitle="No students found"
                                    />
                                </TabsContent>

                                <TabsContent value="companies">
                                    <DataTable
                                        columns={companyColumns}
                                        data={companies}
                                        searchPlaceholder="Search companies..."
                                        emptyTitle="No companies found"
                                    />
                                </TabsContent>
                            </Tabs>
                        </CardContent>
                    </Card>
                )}
            </div>

            <FreezeAccountDialog
                open={!!freezeTarget}
                name={freezeTarget?.name ?? ""}
                clerkId={freezeTarget?.clerkId ?? ""}
                isFreezing={freezeTarget?.status === 1}
                onClose={() => setFreezeTarget(null)}
                onSuccess={(newStatus) => {
                    if (!freezeTarget) return
                    if (freezeTarget.type === "student") {
                        setStudents((prev) => prev.map((s) => s.clerk_id === freezeTarget.clerkId ? { ...s, status: newStatus } : s))
                    } else {
                        setCompanies((prev) => prev.map((c) => c.clerk_id === freezeTarget.clerkId ? { ...c, status: newStatus } : c))
                    }
                    setFreezeTarget(null)
                }}
            />
        </div>
    )
}
