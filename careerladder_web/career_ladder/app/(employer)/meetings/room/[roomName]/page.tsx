"use client"

import { useUser } from "@clerk/nextjs"
import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import {
    Call,
    StreamVideo,
    StreamVideoClient,
    StreamCall,
    CallControls,
    SpeakerLayout,
    StreamTheme,
    useCallStateHooks,
} from "@stream-io/video-react-sdk"
import "@stream-io/video-react-sdk/dist/css/styles.css"
import { getStreamToken } from "@/app/api/meetings"
import { Loader2 } from "lucide-react"

export default function MeetingRoom() {
    const { user } = useUser()
    const params = useParams()
    const router = useRouter()
    const roomName = params.roomName as string

    const [client, setClient] = useState<StreamVideoClient | null>(null)
    const [call, setCall] = useState<Call>()
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        if (!user) return

        const setup = async () => {
            try {
                // get token from backend
                const tokenRes = await getStreamToken(user.id)
                if (!tokenRes.success) return

                const streamUser = {
                    id: user.id,
                    name: `${user.firstName} ${user.lastName}`,
                    image: user.imageUrl,
                }

                const videoClient = new StreamVideoClient({
                    apiKey: process.env.NEXT_PUBLIC_STREAM_API_KEY!,
                    user: streamUser,
                    token: tokenRes.data.token,
                })

                const videoCall = videoClient.call("default", roomName)
                await videoCall.join({ create: false })

                setClient(videoClient)
                setCall(videoCall)
            } catch (error) {
                console.error("Failed to join meeting: ", error)
            } finally {
                setIsLoading(false)
            }
        }

        setup()

        return () => {
            call?.leave()
            client?.disconnectUser()
        }
    }, [user, roomName])

    if (isLoading) return (
        <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
                <Loader2 size={32} className="text-white animate-spin" />
                <p className="text-sm text-white/60">Joining meeting...</p>
            </div>
        </div>
    )

    if (!client || !call) return (
        <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
                <p className="text-sm text-white/60">Failed to join meeting.</p>
                <button
                    onClick={() => router.back()}
                    className="text-sm text-white underline cursor-pointer"
                >
                    Go Back
                </button>
            </div>
        </div>
    )

    return (
        <StreamVideo client={client}>
            <StreamCall call={call}>
                <StreamTheme>
                    <div className="min-h-screen bg-[#0f172a] flex flex-col">
                        <SpeakerLayout />
                        <CallControls onLeave={() => router.back()} />
                    </div>
                </StreamTheme>
            </StreamCall>
        </StreamVideo>
    )
}