import { LayoutDashboard, Briefcase, FileText, Users, DollarSign, Star, Video } from "lucide-react"

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
            { label: "Create New Job", href: "/job-listings/create" },
        ],
    },
    {
        label: "Projects",
        href: "/dashboard/projects",
        icon: <FileText size={16} />,
        children: [
            { label: "All Projects", href: "/project-listings" },
            { label: "Create New Project", href: "/project-listings/create" },
        ],
    },
    {
        label: "Applications",
        href: "/dashboard/applications",
        icon: <Users size={16} />,
        children: [
            { label: "Job Applications", href: "/application-management/jobs" },
            { label: "Project Applications", href: "/application-management/projects" },
        ],
    },
    {
        label: "Meetings",
        href: "/meetings",
        icon: <Video size={16} />,
        children: [
            { label: "Upcoming Meetings", href: "/meetings" },
            { label: "Recordings", href: "/meetings/recodings" },
        ],
    },
    {
        label: "Finance",
        href: "/dashboard/finance",
        icon: <DollarSign size={16} />,
        children: [
            { label: "Overview", href: "/finance" },
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