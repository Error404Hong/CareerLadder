import { SignInButton, SignUpButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs"

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <header className="flex justify-end items-center px-6 h-12 bg-white">
        <SignedOut>
          <div className="flex items-center gap-3">
            <SignInButton >
              <button className="text-sm font-medium text-gray-700 hover:text-[#0B1F3A] transition-colors cursor-pointer">
                Login
              </button>
            </SignInButton>

            <SignUpButton>
              <button className="bg-[#182a40] text-white text-sm font-medium px-4 py-1.5 rounded-md transition-colors shadow-sm cursor-pointer">
                Register
              </button>
            </SignUpButton>
          </div>
        </SignedOut>

        <SignedIn>
          <UserButton
            showName
            appearance={{
              elements: {
                avatarBox: "w-8 h-8",
              },
            }}
          />
        </SignedIn>
      </header>
      {children}
    </>
  );
}
