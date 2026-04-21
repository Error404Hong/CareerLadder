"use client"

import { useUser } from "@clerk/nextjs"
import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { getStreamToken, getMeetingByRoomName, updateMeetingStatus } from "@/app/api/meetings"
import { getTrainingMeetingByRoomName, updateTrainingStatus } from "@/app/api/training"
import { Meeting, Training } from "@/types"

import {
    Call,
    StreamVideo,
    StreamVideoClient,
    StreamCall,
    CallControls,
    SpeakerLayout,
    StreamTheme,
} from "@stream-io/video-react-sdk"
import "@stream-io/video-react-sdk/dist/css/styles.css"

import { Briefcase, Calendar, Clock, Loader2 } from "lucide-react"
import { format } from "date-fns"
import { Badge } from "@/components/ui/badge"

export default function MeetingRoom() {
    const { user } = useUser()
    const params = useParams()
    const router = useRouter()
    const roomName = params.roomName as string

    const [client, setClient] = useState<StreamVideoClient | null>(null)
    const [call, setCall] = useState<Call>()
    const [meeting, setMeeting] = useState<Meeting | null>(null)
    const [trainingMeeting, setTrainingMeeting] = useState<Training | null>(null);
    const [host, setHost] = useState("");
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (!user) return

        const setup = async () => {
            try {
                // fetch meeting info
                if (roomName.startsWith('training')) {
                    const hostname = roomName.split("-")
                    const tMeetingRes = await getTrainingMeetingByRoomName(roomName);

                    if (tMeetingRes.success) {
                        setTrainingMeeting(tMeetingRes.data);
                        setHost(hostname[1]);
                    }
                } else {
                    const meetingRes = await getMeetingByRoomName(roomName)
                    if (meetingRes.success) {
                        setHost(meetingRes.data.company_id);
                        setMeeting(meetingRes.data)
                    }
                }


                // get stream token
                const tokenRes = await getStreamToken(user.id)
                if (!tokenRes.success) {
                    setError("Failed to get meeting token")
                    return
                }

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
            } catch (err) {
                console.error("Failed to join meeting: ", err)
                setError("Failed to join meeting room")
            } finally {
                setIsLoading(false)
            }
        }

        setup()

        return () => {
            call?.leave()
            client?.disconnectUser()
        }
    }, [user, roomName]) // eslint-disable-line react-hooks/exhaustive-deps

    if (isLoading) return (
        <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
                <Loader2 size={32} className="text-white animate-spin" />
                <p className="text-sm text-white/60">Joining meeting room...</p>
            </div>
        </div>
    )

    if (error || !client || !call) return (
        <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <p className="text-sm text-white/60">{error ?? "Failed to join meeting."}</p>
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
        <div className="min-h-screen bg-[#0f172a] flex flex-col">

            {/* Top Info Bar */}
            <div className="bg-[#1e293b] border-b border-white/10 px-6 py-3">
                <div className="max-w-6xl mx-auto flex items-center justify-between gap-4 flex-wrap">
                    {trainingMeeting ? (
                        <>
                            <div className="flex items-center gap-4">
                                <div>
                                    <p className="text-sm font-semibold text-white">{trainingMeeting.title}</p>
                                    {trainingMeeting.company_name && (
                                        <div className="flex items-center gap-1.5 text-xs text-white/50 mt-0.5">
                                            <Briefcase size={11} />
                                            <span>{trainingMeeting.company_name}</span>
                                        </div>
                                    )}
                                </div>
                                <div className="w-px h-8 bg-white/10" />
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-1.5 text-xs text-white/50">
                                        <Calendar size={12} />
                                        {format(new Date(trainingMeeting.date), "d MMM yyyy")}
                                    </div>
                                    <div className="flex items-center gap-1.5 text-xs text-white/50">
                                        <Clock size={12} />
                                        {trainingMeeting.time} · {trainingMeeting.duration} mins
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Badge className="bg-white/10 text-white/70 border border-white/10 text-[11px]">
                                    Training
                                </Badge>
                                <Badge className="bg-green-500/20 text-green-400 border border-green-500/20 text-[11px]">
                                    Live
                                </Badge>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="flex items-center gap-4">
                                <div>
                                    <p className="text-sm font-semibold text-white">{meeting?.title ?? "Meeting Room"}</p>
                                    {meeting?.reference_title && (
                                        <div className="flex items-center gap-1.5 text-xs text-white/50 mt-0.5">
                                            <Briefcase size={11} />
                                            <span>{meeting.reference_title}</span>
                                        </div>
                                    )}
                                </div>
                                <div className="w-px h-8 bg-white/10" />
                                {meeting?.scheduled_at && (
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center gap-1.5 text-xs text-white/50">
                                            <Calendar size={12} />
                                            {format(new Date(meeting.scheduled_at), "d MMM yyyy")}
                                        </div>
                                        <div className="flex items-center gap-1.5 text-xs text-white/50">
                                            <Clock size={12} />
                                            {format(new Date(meeting.scheduled_at), "hh:mm a")} · {meeting.duration} mins
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="flex items-center gap-3">
                                {meeting?.meeting_type && (
                                    <Badge className="bg-white/10 text-white/70 border border-white/10 text-[11px] capitalize">
                                        {meeting.meeting_type.replace("_", " ")}
                                    </Badge>
                                )}
                                {meeting?.status && (
                                    <Badge className="bg-green-500/20 text-green-400 border border-green-500/20 text-[11px]">
                                        Live
                                    </Badge>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Video Room */}
            <div className="flex-1 bg-[#0f172a]">
                <StreamVideo client={client}>
                    <StreamCall call={call}>
                        <StreamTheme>
                            <div className="flex flex-col h-full bg-[#0f172a]">
                                <div className="flex-1 bg-[#0f172a]">
                                    <SpeakerLayout />
                                </div>
                                <CallControls onLeave={async () => {
                                    if (meeting && user?.id === meeting.company_id) {
                                        await updateMeetingStatus(meeting.id, "completed")
                                    }
                                    if (trainingMeeting && user?.id === host) {
                                        await updateTrainingStatus(trainingMeeting.id, "completed")
                                    }
                                    window.close()
                                    router.back()
                                }} />
                            </div>
                        </StreamTheme>
                    </StreamCall>
                </StreamVideo>
            </div>
        </div>
    )
}
