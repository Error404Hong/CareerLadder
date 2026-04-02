"use client"

import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent, CardHeader, CardDescription, CardTitle } from "@/components/ui/card"
import { ProjectApplicant } from "@/types"

interface TeamMembersOverviewProps {
    ownerImageUrl: string
    ownerName: string
    ownerEmail: string
    projectApplicants: ProjectApplicant[]
}

export function TeamMembersOverview({ ownerImageUrl, ownerName, ownerEmail, projectApplicants }: TeamMembersOverviewProps) {
    return (
        <Card className="mt-6 rounded-sm p-6 gap-4">
            <CardHeader className="p-0">
                <CardTitle className="font-semibold text-lg">Team Members</CardTitle>
                <CardDescription>
                    Overview of individuals assigned to this project and their responsibilities.
                </CardDescription>
            </CardHeader>

            <Separator />

            <CardContent className="p-0 flex flex-col gap-3">
                {/* Company (Owner) */}
                <div className="flex items-center gap-3 p-3 rounded-lg border border-slate-100 bg-slate-100">
                    <Image
                        src={ownerImageUrl}
                        alt="Owner"
                        height={40}
                        width={40}
                        className="rounded-full object-cover"
                    />
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-800">{ownerName} (You)</p>
                        <p className="text-xs text-slate-400 truncate">{ownerEmail}</p>
                    </div>
                    <Badge className="bg-blue-100 text-blue-600 text-xs px-2.5 py-1 shrink-0">Owner</Badge>
                </div>

                {/* Applicants */}
                {projectApplicants.map(member => (
                    <div key={member.clerk_id} className="flex items-center gap-3 p-3 rounded-lg border border-slate-100 bg-slate-100">
                        <Image
                            src={member.profile_image}
                            alt={member.first_name}
                            height={40}
                            width={40}
                            className="rounded-full object-cover"
                        />
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-slate-800">
                                {member.first_name} {member.last_name}
                            </p>
                            <p className="text-xs text-slate-400 truncate">{member.email}</p>
                        </div>
                        <Badge className="bg-green-100 text-green-600 text-xs px-2.5 py-1 shrink-0">Member</Badge>
                    </div>
                ))}
            </CardContent>
        </Card>
    )
}
