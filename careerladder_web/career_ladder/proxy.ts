import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export default clerkMiddleware(async (auth, req) => {
    const { userId } = await auth();
    const path = req.nextUrl.pathname;

    // only check role when navigating between role-specific landing pages
    if (userId && (path === "/home" || path === "/dashboard" || path === "/admin-dashboard")) {
        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/users/getUser/${userId}`,
                { cache: "no-store" },
            );
            const data = await response.json();
            const roleValue = data?.data?.role;
            const role =
                typeof roleValue === "string" ? Number(roleValue) : roleValue;

            if (role === 3) {
                if (path !== "/admin-dashboard") {
                    return NextResponse.redirect(new URL("/admin-dashboard", req.url));
                }
                return NextResponse.next();
            }

            const isEmployer = role === 2;

            if (isEmployer && path === "/home") {
                return NextResponse.redirect(new URL("/dashboard", req.url));
            }

            if (!isEmployer && path === "/dashboard") {
                return NextResponse.redirect(new URL("/home", req.url));
            }

            if (path === "/admin-dashboard") {
                return NextResponse.redirect(new URL(isEmployer ? "/dashboard" : "/home", req.url));
            }
        } catch (error) {
            // if fetch fails just let them through
            console.error("Middleware role check failed:", error);
        }
    }
});

export const config = {
    matcher: [
        "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
        "/(api|trpc)(.*)",
    ],
};
