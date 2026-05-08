import { verifyWebhook } from "@clerk/nextjs/webhooks";
import { NextRequest } from "next/server";
import { addNewUser, deleteUserFromDB } from "../user";

export async function POST(req: NextRequest) {
    try {
        const evt = await verifyWebhook(req);

        const user = evt.data;
        const eventType = evt.type;

        if (eventType === "user.created") {
            const userData = user as {
                id: string;
                unsafe_metadata?: { role?: string };
            };
            const clerkId = userData.id || "";
            const role = userData.unsafe_metadata?.role === "employer" ? 2 : 1;

            console.log("Registering user:", clerkId, "as role:", role);

            try {
                await addNewUser(clerkId, role);
                console.log("User added successfully");
            } catch (err) {
                console.error("Failed to add user:", err);
            }
        }

        if (eventType === "user.deleted") {
            const userData = user as { id?: string; deleted?: boolean };
            const clerkId = userData.id || "";

            if (clerkId) {
                try {
                    await deleteUserFromDB(clerkId);
                    console.log("User deleted from DB:", clerkId);
                } catch (err) {
                    console.error("Failed to delete user from DB:", err);
                }
            }
        }

        return new Response("Webhook received", { status: 200 });
    } catch (err) {
        console.error("Error verifying webhook:", err);
        return new Response("Error verifying webhook", { status: 400 });
    }
}
