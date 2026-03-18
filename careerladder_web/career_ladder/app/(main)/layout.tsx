"use client"

import Link from "next/link"
import Image from "next/image"
import { Toaster } from "sonner"
import { navItems } from "@/lib/nav"
import { Bell, User, DollarSign } from "lucide-react"
import NavDropdown from "@/components/ui/navigation-dropdown"
import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs"

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
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
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => (
                <NavDropdown key={item.label} item={item} />
              ))}
            </nav>
          </SignedIn>

          <div className="flex items-center gap-3 shrink-0">
            <SignedOut>
              <div className="flex items-center gap-2">
                <SignInButton>
                  <button className="text-sm  text-slate-600 hover:text-[#0f172a] px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer">
                    Login
                  </button>
                </SignInButton>
                <SignUpButton>
                  <button className="text-sm  text-white bg-[#0f172a] hover:bg-[#1e293b] px-4 py-1.5 rounded-lg transition-colors cursor-pointer shadow-sm">
                    Register
                  </button>
                </SignUpButton>
              </div>
            </SignedOut>

            <SignedIn>
              <button className="relative w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400 hover:text-[#0f172a] transition-colors">
                <Bell size={15} />
                <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-[#2563eb] rounded-full" />
              </button>
              <div className="w-px h-5 bg-slate-200" />
              <UserButton
                showName
                appearance={{
                  elements: {
                    avatarBox: "w-7 h-7",
                    userButtonBox: "flex-row-reverse gap-2",
                    userButtonOuterIdentifier: "text-sm  text-[#0f172a]",
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
                    href="/finance"
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