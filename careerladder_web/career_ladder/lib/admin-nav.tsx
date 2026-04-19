import { LayoutDashboard, Briefcase, Users, Star, CreditCard, Bot, FolderOpen } from "lucide-react"

export const adminNavItems = [
    {
        label: "Dashboard",
        href: "/admin-dashboard",
        icon: <LayoutDashboard size={16} />,
        children: [],
    },
    {
        label: "User Accounts",
        href: "/users",
        icon: <Users size={16} />,
        children: [
            { label: "All Users", href: "/users" },
        ],
    },
    {
        label: "Job Listings",
        href: "/admin-dashboard/jobs",
        icon: <Briefcase size={16} />,
        children: [
            { label: "All Job Listings", href: "/admin-dashboard/jobs" },
        ],
    },
    {
        label: "Project Listings",
        href: "/admin-dashboard/projects",
        icon: <FolderOpen size={16} />,
        children: [
            { label: "All Project Listings", href: "/admin-dashboard/projects" },
        ],
    },
    {
        label: "Company Profiles",
        href: "/admin-dashboard/companies",
        icon: <Star size={16} />,
        children: [
            { label: "All Companies", href: "/admin-dashboard/companies" },
            { label: "Ratings & Reviews", href: "/admin-dashboard/companies/ratings" },
        ],
    },
    {
        label: "Credit Transactions",
        href: "/admin-dashboard/credits",
        icon: <CreditCard size={16} />,
        children: [
            { label: "All Transactions", href: "/admin-dashboard/credits" },
            { label: "Withdrawal Requests", href: "/admin-dashboard/credits/withdrawals" },
        ],
    },
    {
        label: "AI Model",
        href: "/admin-dashboard/ai",
        icon: <Bot size={16} />,
        children: [
            { label: "Model Settings", href: "/admin-dashboard/ai" },
        ],
    },
]

export type AdminNavItem = (typeof adminNavItems)[0];
