import { currentUser } from "@clerk/nextjs/server";

export default async function HomePage() {
    const user = await currentUser();
    const firstname = user?.firstName;
    const lastname = user?.lastName;
    const id = user?.id;

    return (
        <div className="min-h-[95vh] bg-pink-200 flex items-center justify-center flex-col">
            <div>username - {firstname} {lastname}</div>

            <div> id - {id}</div>
        </div>
    );
}