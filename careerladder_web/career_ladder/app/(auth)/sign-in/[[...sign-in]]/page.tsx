import { SignIn } from "@clerk/nextjs";

export default function LoginPage() {
    return (
        <div className="min-h-screen flex">
            {/* Left column */}
            <div className="w-1/2 flex items-center justify-center bg-purple-100">
                a
            </div>

            {/* Right column */}
            <div className="w-1/2 flex items-center justify-center">
                <SignIn appearance={{
                    variables: {
                        colorPrimary: 'var(--primary)'
                    }
                }} />
            </div>
        </div>
    );
}

