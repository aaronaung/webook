"use client";

import {
  ChatBody,
  ChatContainer,
  ChatHeader,
  ChatInput,
  ChatMessage,
} from "@/src/components/chat-room/chat-room";
import { useCurrentViewingBusinessContext } from "@/src/contexts/current-viewing-business";
import { Tables } from "@/types/db.extension";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Chat({
  loggedInUser,
  initialRoom,
  rooms,
}: {
  loggedInUser: Tables<"users">;
  initialRoom?: Tables<"chat_rooms">;
  rooms: Tables<"chat_rooms">[];
}) {
  const router = useRouter();
  const { currentViewingBusiness } = useCurrentViewingBusinessContext();

  // todo: if initalRoom is null set to the latest booking room
  const [currentRoom, setCurrentRoom] = useState(initialRoom || rooms[0]);

  console.log("rooms", rooms);

  return (
    <div>
      <ChatContainer>
        <ChatHeader
          title={currentRoom.name || `${currentViewingBusiness?.title} <> me`}
          subtitle={
            currentRoom.created_at
              ? `Created: ${new Date(currentRoom.created_at).toISOString()}`
              : ""
          }
          onBack={() => {
            router.back();
          }}
        />
        <ChatBody>
          {(
            [
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
        <ChatInput
          onSend={(message) => {
            console.log("sending message", message);
          }}
        />
      </ChatContainer>
    </div>
  );
}
