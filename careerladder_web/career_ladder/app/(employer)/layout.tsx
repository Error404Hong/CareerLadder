"use client"

import { Toaster } from "sonner"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/ui/app-sidebar"
import { SignedIn, SignedOut, UserButton, useUser, useClerk } from "@clerk/nextjs"
import Link from "next/link"
import { Building2, Bell } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getNotifications, markAllAsRead, markAsRead } from "@/app/api/notifications"
import { getUserById } from "@/app/api/user"

type Notification = {
    id: number
    recipient_id: string
    type: string
    title: string
    message: string
    is_read: boolean
    reference_type: string | null
    reference_id: string | null
    created_at: string
}

const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return "Just now"
    if (mins < 60) return `${mins}m ago`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `${hrs}h ago`
    const days = Math.floor(hrs / 24)
    if (days === 1) return "Yesterday"
    return `${days}d ago`
}

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const { user } = useUser()
    const { signOut } = useClerk()
    const router = useRouter()
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [unreadCount, setUnreadCount] = useState(0)

    const userId = user?.id

    useEffect(() => {
        if (!userId) return
        const checkFrozen = async () => {
            try {
                const res = await getUserById(userId)
                if (res.data?.status && res.data.status !== 1) {
                    await signOut()
                    router.replace("/account-frozen")
                }
            } catch {
                // silently fail — don't block if API is temporarily unavailable
            }
        }
        checkFrozen()
    }, [userId])

    useEffect(() => {
        if (!userId) return

        const fetch = async () => {
            try {
                const res = await getNotifications(userId)
                const data: Notification[] = res.data ?? []
                setNotifications(data)
                setUnreadCount(data.filter((n) => !n.is_read).length)
            } catch {
                // silently fail — non-critical
            }
        }

        fetch()
        const interval = setInterval(fetch, 30000)
        return () => clearInterval(interval)
    }, [userId])

    const handleMarkAllAsRead = async () => {
        if (!userId) return
        try {
            await markAllAsRead(userId)
            setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })))
            setUnreadCount(0)
        } catch {
            // silently fail
        }
    }

    const handleMarkAsRead = async (n: Notification) => {
        if (n.is_read || !userId) return
        try {
            await markAsRead(n.id, userId)
            setNotifications((prev) => prev.map((x) => x.id === n.id ? { ...x, is_read: true } : x))
            setUnreadCount((prev) => Math.max(0, prev - 1))
        } catch {
            // silently fail
        }
    }

    return (
        <SidebarProvider>
            <AppSidebar />
            <main className="flex-1 min-h-screen bg-slate-50">
                <div className="sticky top-0 z-50 bg-white border-b border-slate-100 h-15 flex items-center px-4 shadow-sm justify-between">
                    <SidebarTrigger />
                    <SignedIn>
                        <div className="px-3 py-1.5 flex gap-3">
                            <Popover>
                                <PopoverTrigger asChild>
                                    <button className="relative w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400 hover:text-[#0f172a] transition-colors cursor-pointer">
                                        <Bell size={16} />
                                        {unreadCount > 0 && (
                                            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-[#2563eb] rounded-full" />
                                        )}
                                    </button>
                                </PopoverTrigger>
                                <PopoverContent className="w-90 p-0" align="end">
                                    <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                                        <p className="text-sm font-semibold text-[#0f172a]">Notifications</p>
                                        {unreadCount > 0 && (
                                            <button onClick={handleMarkAllAsRead} className="text-xs text-[#2563eb] hover:underline cursor-pointer">
                                                Mark all as read
                                            </button>
                                        )}
                                    </div>
                                    <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                                        {notifications.length === 0 ? (
                                            <p className="text-xs text-slate-400 text-center py-6">No notifications yet</p>
                                        ) : (
                                            notifications.map((n) => (
                                                <div
                                                    key={n.id}
                                                    onClick={() => handleMarkAsRead(n)}
                                                    className={`px-4 py-3 cursor-pointer transition-colors hover:bg-slate-50 ${!n.is_read ? "bg-blue-50 hover:bg-blue-100/60" : ""}`}
                                                >
                                                    <p className="text-sm font-medium text-[#0f172a]">{n.title}</p>
                                                    <p className="text-xs text-slate-500 mt-0.5">{n.message}</p>
                                                    <p className="text-xs text-slate-400 mt-1">{timeAgo(n.created_at)}</p>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </PopoverContent>
                            </Popover>
                            <UserButton showName>
                                <UserButton.MenuItems>
                                    <UserButton.Link
                                        href="/company-profile"
                                        labelIcon={<Building2 size={14} />}
                                        label="Company Profile"
                                    />
                                    <UserButton.Action label="manageAccount" />
                                    <UserButton.Action label="signOut" />
                                </UserButton.MenuItems>
                            </UserButton>
                        </div>
                    </SignedIn>
                    <SignedOut>
                        <div className="flex items-center gap-2 px-3">
                            <Link href="/sign-in">
                                <button className="text-sm text-slate-600 hover:text-[#0f172a] px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer">
                                    Login
                                </button>
                            </Link>
                            <Link href="/register">
                                <button className="text-sm text-white bg-[#0f172a] hover:bg-[#1e293b] px-4 py-1.5 rounded-lg transition-colors cursor-pointer shadow-sm">
                                    Register
                                </button>
                            </Link>
                        </div>
                    </SignedOut>
                </div>
                <div className="p-6">
                    {children}
                </div>
                <Toaster position="top-left" richColors />
            </main>
        </SidebarProvider>
    )
}
