"use client"

import { useEffect, useState } from "react"
import { useUser } from "@clerk/nextjs"
import { StreamChat } from "stream-chat"
import { Chat, Channel, ChannelHeader, ChannelList, MessageInput, MessageList, Thread, Window } from "stream-chat-react"
import "stream-chat-react/dist/css/v2/index.css"

import { getChatToken } from "@/app/api/chat"

import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"


export default function MessagesPage() {
    const { user } = useUser()
    const [client, setClient] = useState<StreamChat | null>(null)

    useEffect(() => {
        if (!user) return

        let chatClient: StreamChat

        const init = async () => {
            try {
                const res = await getChatToken(user.id)
                if (!res.success) return

                chatClient = StreamChat.getInstance(process.env.NEXT_PUBLIC_STREAM_API_KEY!)
                await chatClient.connectUser(
                    {
                        id: user.id,
                        name: `${user.firstName} ${user.lastName}`,
                        image: user.imageUrl,
                    },
                    res.data.token
                )
                setClient(chatClient)
            } catch {
                // silently fail
            }
        }

        init()

        return () => {
            chatClient?.disconnectUser()
        }
    }, [user?.id])

    if (!client || !user) return (
        <div className="flex items-center justify-center h-[calc(100vh-108px)]">
            <p className="text-sm text-slate-400">Loading messages...</p>
        </div>
    )

    const filters = { type: "messaging" as const, members: { $in: [user.id] } }
    const sort = { last_message_at: -1 } as const

    return (
        <div className="flex flex-col gap-4 h-[calc(100vh-108px)]">
            <Breadcrumb>
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbPage>Chats and Messages</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>
            <Chat client={client}>
                <div className="flex flex-1 rounded-lg overflow-hidden border border-slate-200 bg-white shadow-sm min-h-0">
                    <div className="w-[20rem] border-r border-slate-100 overflow-y-auto shrink-0">
                        <ChannelList filters={filters} sort={sort} showChannelSearch />
                    </div>
                    <div className="flex-1 flex flex-col min-w-0">
                        <Channel>
                            <Window>
                                <ChannelHeader />
                                <MessageList />
                                <MessageInput />
                            </Window>
                            <Thread />
                        </Channel>
                    </div>
                </div>
            </Chat>
        </div>
    )
}