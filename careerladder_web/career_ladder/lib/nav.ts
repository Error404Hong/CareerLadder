export const navItems = [
    {
        label: "Opportunities",
        href: null,
        links: [
            { label: "View Project Listings", href: "/projects" },
            { label: "View Opening Job Positions", href: "/jobs" },
            { label: "View Industrial Training Programs", href: "/training" },
        ],
    },
    {
        label: "Applications",
        href: null,
        links: [
            { label: "Track Application Status", href: "/applications/track" },
            {
                label: "View Application History",
                href: "/applications/history",
            },
        ],
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
