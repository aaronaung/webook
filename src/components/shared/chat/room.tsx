"use client";
import {
  ChatBody,
  ChatContainer,
  ChatHeader,
  ChatInput,
  ChatMessage,
} from "@/src/components/chat-room/chat-room";
import { listChatMessagesInRoom, saveChatMessage } from "@/src/data/chat";
import { supaClientComponentClient } from "@/src/data/clients/browser";
import { useSupaMutation } from "@/src/hooks/use-supabase";
import { chatMessagesToChatRoomMessages } from "@/src/utils";
import { Tables } from "@/types/db.extension";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type RoomProps = {
  room: Tables<"chat_rooms">;
  loggedInUser?: Tables<"users">;
  business?: Tables<"businesses">;
};

// Note: Either loggedInUser or business must be provided.
export default function Room({ room, loggedInUser, business }: RoomProps) {
  const router = useRouter();
  const [messages, setMessages] = useState<Tables<"chat_messages">[]>([]);

  const { mutate: sendMessage } = useSupaMutation(saveChatMessage);

  useEffect(() => {
    const fetchMessages = async () => {
      const messages = await listChatMessagesInRoom(room.id, {
        client: supaClientComponentClient(),
      });
      setMessages(messages);
    };
    fetchMessages();
  }, [room.id]);

  useEffect(() => {
    const client = supaClientComponentClient();
    const chatMessagesChannel = client
      .channel("chat_messages")
      .on<Tables<"chat_messages">>(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_messages",
          filter: `room_id=eq.${room.id}`,
        },
        (payload) => {
          // TODO: add new user to cache if their profile doesn't exist
          setMessages((prevMessages) => [...prevMessages, payload.new]);
          // if (messagesRef.current) {
          //   messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
          // }
        },
      )
      .subscribe();

    // todo: subscribe to new messages
    return () => {
      console.log("tearing down", room.id);
      // todo: unsubscribe from new messages
      client.removeChannel(chatMessagesChannel);
    };
  }, [room.id]);

  const handleNewMessage = (message: string) => {
    sendMessage({
      room_id: room.id,
      content: message,
      ...(business ? { sender_business_id: business.id } : {}),
      ...(loggedInUser ? { sender_user_id: loggedInUser.id } : {}),
    });
  };

  return (
    <ChatContainer>
      <ChatHeader
        title={room.name || `Room ${room.id}`}
        subtitle={
          room.created_at
            ? `Created: ${new Date(room.created_at).toISOString()}`
            : ""
        }
        onBack={() => {
          router.back();
        }}
      />

      <ChatBody>
        {chatMessagesToChatRoomMessages(
          messages || [],
          loggedInUser?.id || business?.id || "",
        ).map((chatMessage, i) => (
          <ChatMessage key={i} chatMessage={chatMessage} />
        ))}
      </ChatBody>

      <ChatInput onSend={handleNewMessage} />
    </ChatContainer>
  );
}
