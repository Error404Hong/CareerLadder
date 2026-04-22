import { LayoutDashboard, Briefcase, Users, Star, CreditCard, Bot, CodeXml, FolderOpen } from "lucide-react"

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
        href: "/job-management",
        icon: <Briefcase size={16} />,
        children: [
            { label: "All Job Listings", href: "/job-management" },
        ],
    },
    {
        label: "Project Listings",
        href: "/project-management",
        icon: <FolderOpen size={16} />,
        children: [
            { label: "All Project Listings", href: "/project-management" },
        ],
    },
    {
        label: "Training Programs",
        href: "/program-management",
        icon: <CodeXml size={16} />,
        children: [
            { label: "All Training Programs", href: "/program-management" },
        ],
    },
    {
        label: "Ratings & Reviews",
        href: "/ratings-reviews",
        icon: <Star size={16} />,
        children: [],
    },
    {
        label: "Credit Transactions",
        href: "/admin-dashboard/credits",
        icon: <CreditCard size={16} />,
        children: [
            // { label: "All Transactions", href: "/admin-dashboard/credits" },
            { label: "Withdrawal Requests", href: "/withdrawals" },
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
