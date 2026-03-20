"use client"

import Link from "next/link"
import Image from "next/image"
import { ChevronDown } from "lucide-react"
import { navItems } from "@/lib/employer-nav"
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible"
import {
    Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader,
    SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarMenuSub, SidebarMenuSubButton, SidebarMenuSubItem
} from "@/components/ui/sidebar"


export function AppSidebar() {
    return (
        <Sidebar>
            {/* Logo */}
            <SidebarHeader className="px-4 py-4 border-b border-slate-100">
                <Link href="/dashboard">
                    <Image
                        src="/careerladder-logo.png"
                        alt="logo"
                        width={200}
                        height={60}
                    />
                </Link>
            </SidebarHeader>

            {/* Nav */}
            <SidebarContent>
                <Collapsible defaultOpen className="group/collapsible">
                    <SidebarGroup>
                        <SidebarGroupLabel asChild className="uppercase tracking-widest px-4 mb-1">
                            <CollapsibleTrigger>
                                Navigation
                                <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
                            </CollapsibleTrigger>
                        </SidebarGroupLabel>

                        <CollapsibleContent>
                            <SidebarGroupContent>
                                <SidebarMenu>
                                    {navItems.map((item) => (
                                        item.children.length === 0 ? (
                                            // No children — plain link
                                            <SidebarMenuItem key={item.href}>
                                                <SidebarMenuButton asChild>
                                                    <Link href={item.href} className="flex items-center gap-3 px-4 py-2 hover:text-[#0f172a] hover:bg-slate-50 rounded-lg transition-colors">
                                                        {item.icon}
                                                        {item.label}
                                                    </Link>
                                                </SidebarMenuButton>
                                            </SidebarMenuItem>
                                        ) : (
                                            // Has children — collapsible
                                            <Collapsible key={item.href} className="group/item">
                                                <SidebarMenuItem>
                                                    <CollapsibleTrigger asChild>
                                                        <SidebarMenuButton className="flex items-center gap-3 px-4 py-2 w-full hover:text-[#0f172a] hover:bg-slate-50 rounded-lg transition-colors cursor-pointer">
                                                            {item.icon}
                                                            <span>{item.label}</span>
                                                            <ChevronDown size={13} className="ml-auto transition-transform group-data-[state=open]/item:rotate-180" />
                                                        </SidebarMenuButton>
                                                    </CollapsibleTrigger>

                                                    <CollapsibleContent>
                                                        <SidebarMenuSub>
                                                            {item.children.map((child) => (
                                                                <SidebarMenuSubItem key={child.href}>
                                                                    <SidebarMenuSubButton asChild>
                                                                        <Link href={child.href} className="text-slate-600 hover:text-black transition-colors">
                                                                            {child.label}
                                                                        </Link>
                                                                    </SidebarMenuSubButton>
                                                                </SidebarMenuSubItem>
                                                            ))}
                                                        </SidebarMenuSub>
                                                    </CollapsibleContent>
                                                </SidebarMenuItem>
                                            </Collapsible>
                                        )
                                    ))}
                                </SidebarMenu>
                            </SidebarGroupContent>
                        </CollapsibleContent>
                    </SidebarGroup>
                </Collapsible>
            </SidebarContent>

            {/* Footer — User */}
            <SidebarFooter className="border-t border-slate-100 px-4 py-4">
            </SidebarFooter>
        </Sidebar>
    )
}