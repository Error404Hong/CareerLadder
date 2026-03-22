import { LayoutDashboard, Briefcase, FileText, Users, DollarSign, Star } from "lucide-react"

export const navItems = [
    {
        label: "Dashboard",
        href: "/dashboard",
        icon: <LayoutDashboard size={16} />,
        children: [],
    },
    {
        label: "Job Postings",
        href: "/dashboard/jobs",
        icon: <Briefcase size={16} />,
        children: [
            { label: "All Jobs", href: "/job-listings" },
            { label: "Post a Job", href: "/job-listings/create" },
        ],
    },
    {
        label: "Projects",
        href: "/dashboard/projects",
        icon: <FileText size={16} />,
        children: [
            { label: "All Projects", href: "/dashboard/projects" },
            { label: "Post a Project", href: "/dashboard/projects/create" },
        ],
    },
    {
        label: "Applications",
        href: "/dashboard/applications",
        icon: <Users size={16} />,
        children: [
            { label: "Job Applications", href: "/dashboard/applications/jobs" },
            { label: "Project Applications", href: "/dashboard/applications/projects" },
        ],
    },
    {
        label: "Finance",
        href: "/dashboard/finance",
        icon: <DollarSign size={16} />,
        children: [
            { label: "Overview", href: "/dashboard/finance" },
            { label: "Withdrawals", href: "/dashboard/finance/withdrawals" },
        ],
    },
    {
        label: "Reviews",
        href: "/dashboard/reviews",
        icon: <Star size={16} />,
        children: [],
    },
]

export type NavItem = (typeof navItems)[0];