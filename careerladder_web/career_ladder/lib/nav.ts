export const navItems = [
    {
        label: "Opportunities",
        href: null,
        links: [
            { label: "Project Listings", href: "/projects" },
            { label: "Opening Job Positions", href: "/jobs" },
            { label: "Industrial Training Programs", href: "/training" },
        ],
    },
    {
        label: "Applications",
        href: null,
        links: [{ label: "Track Application Status", href: "/applications" }],
    },
    {
        label: "Company Reviews",
        href: "/companies",
        links: [],
    },
    {
        label: "Collaboration Space",
        href: "/collaboration",
        links: [],
    },
];

export type NavItem = (typeof navItems)[0];
