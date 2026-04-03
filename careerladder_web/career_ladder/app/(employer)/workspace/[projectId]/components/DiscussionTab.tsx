"use client"

import { useEffect, useState } from "react"
import { StreamChat, Channel as StreamChannel } from "stream-chat"
import { Chat, Channel, ChannelHeader, MessageInput, MessageList, Thread, Window } from "stream-chat-react"
// @ts-expect-error no type declarations for css
import "stream-chat-react/dist/css/v2/index.css"

import { getChatToken } from "@/app/api/chat"

interface DiscussionTabProps {
    projectId: string
    projectTitle: string
    userId: string
    userName: string
    userImage: string
    memberIds: string[]
}

export function DiscussionTab({ projectId, projectTitle, userId, userName, userImage, memberIds }: DiscussionTabProps) {
    const [client, setClient] = useState<StreamChat | null>(null)
    const [channel, setChannel] = useState<StreamChannel | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        let chatClient: StreamChat

        const init = async () => {
            try {
                const tokenRes = await getChatToken(userId)
                if (!tokenRes.success) return

                chatClient = StreamChat.getInstance(process.env.NEXT_PUBLIC_STREAM_API_KEY!)
                await chatClient.connectUser(
                    { id: userId, name: userName, image: userImage },
                    tokenRes.data.token
                )

                // All unique participants: owner (employer) + all members
                const allMemberIds = [...new Set([userId, ...memberIds])]

                const ch = chatClient.channel("messaging", `project-${projectId}`, {
                    members: allMemberIds,
                    name: projectTitle,
                } as Record<string, unknown>)

                // watch() returns existing channel or creates it if it doesn't exist
                await ch.watch()
                try { await ch.update({ name: projectTitle } as Record<string, unknown>) } catch { /* non-critical */ }

                setClient(chatClient)
                setChannel(ch)
            } catch {
                // silently fail
            } finally {
                setLoading(false)
            }
        }

        init()

        return () => {
            chatClient?.disconnectUser()
        }
    }, [userId, projectId])

    if (loading) return (
        <div className="flex items-center justify-center h-64 mt-6">
            <p className="text-sm text-slate-400">Loading discussion...</p>
        </div>
    )

    if (!client || !channel) return (
        <div className="flex items-center justify-center h-64 mt-6">
            <p className="text-sm text-slate-400">Unable to load discussion. Please try again.</p>
        </div>
    )

    return (
        <div className="mt-6 rounded-lg overflow-hidden border border-slate-200 bg-white shadow-sm h-150">
            <Chat client={client}>
                <Channel channel={channel}>
                    <Window>
                        <ChannelHeader />
                        <MessageList />
                        <MessageInput />
                    </Window>
                    <Thread />
                </Channel>
            </Chat>
        </div>
    )
}
