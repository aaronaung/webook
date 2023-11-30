"use client";
import {
  ChatBody,
  ChatContainer,
  ChatHeader,
  ChatInput,
  ChatMessage,
} from "@/src/components/ui/chat/chat";
import { getBookingByChatRoom, saveBooking } from "@/src/data/booking";
import { listChatMessagesInRoom, saveChatMessage } from "@/src/data/chat";
import { supaClientComponentClient } from "@/src/data/clients/browser";
import { useSupaMutation, useSupaQuery } from "@/src/hooks/use-supabase";
import { chatMessagesToChatRoomMessages } from "@/src/utils";
import { Tables } from "@/types/db.extension";
import { useEffect, useRef, useState } from "react";
import { isMobile } from "react-device-detect";
import { flushSync } from "react-dom";
import { BOOKING_STATUS_LABELS, BookingStatus } from "@/src/consts/booking";

type RoomProps = {
  room: Tables<"chat_rooms">;
  loggedInUser?: Tables<"users">;
  business?: Tables<"businesses">;
  onBack?: () => void;
};

// Note: Either loggedInUser or business must be provided.
// If business is provided then the chat room is a business chat room.
// If loggedInUser is provided then the chat room is a user chat room.
export default function Room({
  room,
  loggedInUser,
  business,
  onBack,
}: RoomProps) {
  const [messages, setMessages] = useState<Tables<"chat_messages">[]>([]);
  const chatBodyRef = useRef<HTMLDivElement>(null);
  const { mutate: sendMessage } = useSupaMutation(saveChatMessage);
  const { mutate: _saveBooking } = useSupaMutation(saveBooking, {
    invalidate: [["getBookingByChatRoom", room.id]],
  });
  const { data: booking } = useSupaQuery(getBookingByChatRoom, room.id, {
    queryKey: ["getBookingByChatRoom", room.id],
  });
  const [bookingStatus, setBookingStatus] = useState(booking?.status);

  useEffect(() => {
    const fetchMessages = async () => {
      const messages = await listChatMessagesInRoom(room.id, {
        client: supaClientComponentClient(),
      });
      // We need to flush the dom here, since the messages changes the height of the chat body.
      flushSync(() => {
        setMessages(messages);
      });
      if (chatBodyRef.current) {
        chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
      }
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
          // We need to flush the dom here, since the messages changes the height of the chat body.
          flushSync(() => {
            setMessages((prevMessages) => [...prevMessages, payload.new]);
          });
          if (chatBodyRef.current) {
            chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
          }
        },
      )
      .subscribe();

    // todo: subscribe to new messages
    return () => {
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

  const handleBookingStatusChange = (newStatus: BookingStatus) => {
    setBookingStatus(newStatus);
    if (booking && business) {
      _saveBooking({
        ...booking,
        status: newStatus,
      });

      sendMessage({
        room_id: room.id,
        content: `${business.title} updated the booking status from '${
          BOOKING_STATUS_LABELS[booking.status as BookingStatus]
        }' to '${BOOKING_STATUS_LABELS[newStatus]}'.`,
        ...(business ? { sender_business_id: business.id } : {}),
      });
    }
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
        onBack={isMobile ? onBack : undefined}
      />

      <ChatBody ref={chatBodyRef}>
        {chatMessagesToChatRoomMessages(
          messages || [],
          loggedInUser?.id || business?.id || "",
        ).map((chatMessage, i) => (
          <ChatMessage key={i} chatMessage={chatMessage} />
        ))}
      </ChatBody>

      <div className="flex items-center ">
        <ChatInput
          onSend={handleNewMessage}
          bookingStatus={(bookingStatus || booking?.status) as BookingStatus}
          onBookingStatusChange={
            business
              ? (newStatus) => {
                  handleBookingStatusChange(newStatus);
                }
              : undefined
          }
        />
      </div>
    </ChatContainer>
  );
}
