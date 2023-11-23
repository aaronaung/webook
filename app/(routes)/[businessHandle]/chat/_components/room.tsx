"use client";
import {
  ChatBody,
  ChatContainer,
  ChatHeader,
  ChatInput,
  ChatMessage,
} from "@/src/components/chat-room/chat-room";
import { useCurrentViewingBusinessContext } from "@/src/contexts/current-viewing-business";
import { listChatMessagesInRoom } from "@/src/data/chat";
import { useSupaQuery } from "@/src/hooks/use-supabase";
import { Tables } from "@/types/db.extension";
import { useRouter } from "next/navigation";

type RoomProps = {
  room: Tables<"chat_rooms">;
  loggedInUser: Tables<"users">;
};
export default function Room({ room, loggedInUser }: RoomProps) {
  const router = useRouter();
  const { currentViewingBusiness } = useCurrentViewingBusinessContext();
  const { data: messages, isLoading: isLoadingMessages } = useSupaQuery(
    listChatMessagesInRoom,
    room.id,
    {
      queryKey: ["listChatMessagesInRoom", room.id],
    },
  );

  return (
    <ChatContainer>
      <ChatHeader
        title={room.name || `${currentViewingBusiness?.title} <> me`}
        subtitle={
          room.created_at
            ? `Created: ${new Date(room.created_at).toISOString()}`
            : ""
        }
        onBack={() => {
          router.back();
        }}
      />
      {isLoadingMessages ? (
        <>Loading...</>
      ) : (
        <ChatBody>
          {(
            [
              ...(messages || []).map((m, index) => ({
                content: m.content,
                side: m.sender_user_id === loggedInUser.id ? "right" : "left",
                position: "middle", // todo - add top and bottom positions
              })),
              {
                content: "Hello",
                side: "left",
                position: "top",
              },
              {
                content: "how you doing",
                side: "left",
                position: "middle",
              },
              {
                content: "I miss you",
                side: "left",
                position: "bottom",
              },
              {
                content: "Wassup",
                side: "right",
                position: "top",
              },
              {
                content: "Nothing much. You?",
                side: "left",
                position: "top",
              },
              {
                content: "Nothing much. You?",
                side: "left",
                position: "bottom",
              },
            ] as const
          ).map((chatMessage, i) => (
            <ChatMessage key={i} chatMessage={chatMessage} />
          ))}
        </ChatBody>
      )}
      <ChatInput
        onSend={(message) => {
          console.log("sending message", message);
        }}
      />
    </ChatContainer>
  );
}
