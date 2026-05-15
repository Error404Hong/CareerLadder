"use client"

import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent, CardHeader, CardDescription, CardTitle } from "@/components/ui/card"
import { Owner, Member } from "../page"

interface TeamMembersOverviewProps {
    owner: Owner
    members: Member[]
    currentUserId: string
}

export function TeamMembersOverview({ owner, members, currentUserId }: TeamMembersOverviewProps) {
    return (
        <Card className="mt-2 p-4 rounded-sm border-none shadow-none">
            <CardHeader className="px-0 pt-0">
                <CardTitle className="font-semibold text-lg">Team Members</CardTitle>
                <CardDescription>
                    Overview of individuals assigned to this project and their responsibilities.
                </CardDescription>
            </CardHeader>

            <Separator />

            <CardContent className="px-0 pt-4 flex flex-col gap-3">
                {/* Owner */}
                <div className="flex items-center gap-3 p-3 rounded-lg border border-slate-100 bg-slate-50">
                    {owner.profile_image && (
                        <Image
                            src={owner.profile_image}
                            alt={owner.company_name}
                            height={40}
                            width={40}
                            className="rounded-full object-cover"
                        />
                    )}

                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-800">{owner.company_name}</p>
                        <p className="text-xs text-slate-400 truncate">{owner.email}</p>
                    </div>
                    <Badge className="bg-blue-100 text-blue-600 text-xs px-2.5 py-1 shrink-0">Owner</Badge>
                </div>

                {/* Members */}
                {members.map(member => {
                    const isYou = member.clerk_id === currentUserId
                    return (
                        <div key={member.clerk_id} className="flex items-center gap-3 p-3 rounded-lg border border-slate-100 bg-slate-50">
                            {member.profile_image && (
                                <div className="w-10 h-10 rounded-full overflow-hidden shrink-0">
                                    <Image
                                        src={member.profile_image}
                                        alt={member.first_name}
                                        height={40}
                                        width={40}
                                        className="object-cover w-full h-full"
                                    />
                                </div>

                            )}
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-slate-800">
                                    {member.first_name} {member.last_name}
                                    {isYou && <span className="ml-1.5 text-xs text-slate-400 font-normal">(You)</span>}
                                </p>
                                <p className="text-xs text-slate-400 truncate">{member.email}</p>
                            </div>
                            <Badge className="bg-green-100 text-green-600 text-xs px-2.5 py-1 shrink-0">Member</Badge>
                        </div>
                    )
                })}
            </CardContent>
        </Card>
    )
}
