import { verifyWebhook } from "@clerk/nextjs/webhooks";
import { NextRequest } from "next/server";
import { addNewUser } from "../user";

export async function POST(req: NextRequest) {
    try {
        const evt = await verifyWebhook(req);

        // Do something with payload
        // For this guide, log payload to console
        const user = evt.data;
        const eventType = evt.type;

        if (eventType === "user.created") {
            const clerkId = user.id || "";
            const role = 1;

            await addNewUser(clerkId, role);
            console.log("Created UserId: ", user.id);
        }

        return new Response("Webhook received", { status: 200 });
    } catch (err) {
        console.error("Error verifying webhook:", err);
        return new Response("Error verifying webhook", { status: 400 });
    }
}
