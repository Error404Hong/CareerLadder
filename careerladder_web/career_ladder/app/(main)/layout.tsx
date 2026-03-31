"use client"

import Link from "next/link"
import Image from "next/image"
import { Toaster } from "sonner"
import { navItems } from "@/lib/nav"
import { Bell, User, DollarSign, MessageCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { useUser } from "@clerk/nextjs"
import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger, navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"

import { getNotifications, markAllAsRead, markAsRead } from "@/app/api/notifications"
import { Notification } from "@/types"


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

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const { user } = useUser()
  const router = useRouter()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)

  const userId = user?.id

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
    if (!user?.id) return
    try {
      await markAllAsRead(user.id)
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })))
      setUnreadCount(0)
    } catch {
      // silently fail
    }
  }

  const handleMarkAsRead = async (n: Notification) => {
    if (n.is_read || !user?.id) return
    try {
      await markAsRead(n.id, user.id)
      setNotifications((prev) => prev.map((x) => x.id === n.id ? { ...x, is_read: true } : x))
      setUnreadCount((prev) => Math.max(0, prev - 1))
    } catch {
      // silently fail
    }
  }

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-slate-100 bg-white/90 backdrop-blur-md h-16 shadow-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-6">

          <Link href="/home" className="flex items-center gap-2 shrink-0">
            <Image
              src="/careerladder-logo.png"
              alt="logo"
              width={188}
              height={100}
            />
          </Link>

          <SignedIn>
            <NavigationMenu className="hidden md:flex">
              <NavigationMenuList>
                {navItems.map((item) =>
                  item.links.length > 0 ? (
                    <NavigationMenuItem key={item.label}>
                      <NavigationMenuTrigger className="text-sm hover:text-[#0f172a] bg-transparent data-[state=open]:text-[#0f172a]">
                        {item.label}
                      </NavigationMenuTrigger>
                      <NavigationMenuContent>
                        <ul className="w-60">
                          {item.links.map((link) => (
                            <li key={link.href}>
                              <NavigationMenuLink asChild>
                                <Link
                                  href={link.href}
                                  className="block px-3 py-2 text-sm hover:text-[#0f172a] hover:bg-slate-100 rounded-lg transition-colors"
                                >
                                  {link.label}
                                </Link>
                              </NavigationMenuLink>
                            </li>
                          ))}
                        </ul>
                      </NavigationMenuContent>
                    </NavigationMenuItem>
                  ) : (
                    <NavigationMenuItem key={item.label}>
                      <NavigationMenuLink asChild>
                        <Link href={item.href!} className={navigationMenuTriggerStyle() + " text-sm hover:text-[#0f172a] bg-transparent"}>
                          {item.label}
                        </Link>
                      </NavigationMenuLink>
                    </NavigationMenuItem>
                  )
                )}
              </NavigationMenuList>
            </NavigationMenu>
          </SignedIn>

          <div className="flex items-center gap-3 shrink-0">
            <SignedOut>
              <div className="flex items-center gap-2">
                <SignInButton mode="redirect">
                  <button className="text-sm text-slate-600 hover:text-[#0f172a] px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer">
                    Login
                  </button>
                </SignInButton>
                <SignUpButton mode="redirect">
                  <button className="text-sm text-white bg-[#0f172a] hover:bg-[#1e293b] px-4 py-1.5 rounded-lg transition-colors cursor-pointer shadow-sm">
                    Register
                  </button>
                </SignUpButton>
              </div>
            </SignedOut>

            <SignedIn>
              <button className="relative w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400 hover:text-[#0f172a] transition-colors cursor-pointer"
                onClick={() => router.push("/my-messages")}
              >
                <MessageCircle size={15} />
                <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-[#2563eb] rounded-full" />
              </button>
              <Popover>
                <PopoverTrigger asChild>
                  <button className="relative w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400 hover:text-[#0f172a] transition-colors cursor-pointer">
                    <Bell size={15} />
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
                  <div className="px-4 py-2.5 border-t border-slate-100 text-center">
                    <Link href="/notifications" className="text-xs text-[#2563eb] hover:underline">View all notifications</Link>
                  </div>
                </PopoverContent>
              </Popover>
              <div className="w-px h-5 bg-slate-200" />
              <UserButton
                showName
                appearance={{
                  elements: {
                    avatarBox: "w-7 h-7",
                    userButtonBox: "flex-row-reverse gap-2",
                    userButtonOuterIdentifier: "text-sm text-[#0f172a]",
                  },
                }}
              >
                <UserButton.MenuItems>
                  <UserButton.Link
                    label="My Profile"
                    labelIcon={<User size={14} />}
                    href="/profile"
                  />
                  <UserButton.Link
                    label="Finance"
                    labelIcon={<DollarSign size={14} />}
                    href="/my-finance"
                  />
                  <UserButton.Action label="manageAccount" />
                  <UserButton.Action label="signOut" />
                </UserButton.MenuItems>
              </UserButton>
            </SignedIn>
          </div>
        </div>
      </header>

      {children}

      <Toaster position="top-left" richColors />
    </>
  )
}
