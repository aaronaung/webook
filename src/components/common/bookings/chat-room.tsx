"use client";
import {
  ChatBody,
  ChatContainer,
  ChatHeader,
  ChatInput,
  ChatMessage,
} from "@/src/components/ui/chat/chat";
import {
  GetBookingsForBusinessResponseSingle,
  saveBooking,
} from "@/src/data/booking";
import { listChatMessagesInRoom, saveChatMessage } from "@/src/data/chat";
import { supaClientComponentClient } from "@/src/data/clients/browser";
import { useSupaMutation } from "@/src/hooks/use-supabase";
import { chatMessagesToChatRoomMessages, userFriendlyDate } from "@/src/utils";
import { Tables } from "@/types/db.extension";
import { useEffect, useRef, useState } from "react";
import { isMobile } from "react-device-detect";
import { flushSync } from "react-dom";
import { BookingStatus } from "@/src/consts/booking";
import {
  bookingTime,
  bookingTitle,
  getBookingStatusIcon,
} from "./booking-list";
import InputSelect from "../../ui/input/select";
import { Button } from "../../ui/button";

type ChatRoomProps = {
  room: Tables<"chat_rooms">;
  booking: GetBookingsForBusinessResponseSingle;
  loggedInUser?: Tables<"users">;
  business?: Tables<"businesses">;
  onBack?: () => void;
};

// Note: Either loggedInUser or business must be provided.
// If business is provided then the chat room is a business chat room.
// If loggedInUser is provided then the chat room is a user chat room.
export default function ChatRoom({
  room,
  booking,
  loggedInUser,
  business,
  onBack,
}: ChatRoomProps) {
  const [messages, setMessages] = useState<Tables<"chat_messages">[]>([]);
  const chatBodyRef = useRef<HTMLDivElement>(null);
  const { mutate: sendMessage } = useSupaMutation(saveChatMessage);
  const { mutate: _saveBooking } = useSupaMutation(saveBooking, {
    invalidate: [
      ["getBookingsForBusiness", business?.id || loggedInUser?.id || ""],
    ],
  });

  const getBookingStatusUpdateMessage = (newStatus: BookingStatus) => {
    // todo important: normalize user name if first and last name doesn't exist fallback to email
    const senderName = `${loggedInUser?.email}` || business?.title || "";
    switch (newStatus) {
      case BookingStatus.Confirmed:
        return `${getBookingStatusIcon(
          BookingStatus.Confirmed,
        )} ${senderName} has confirmed the booking.`;
      case BookingStatus.Canceled:
        return `${getBookingStatusIcon(
          BookingStatus.Canceled,
        )} ${senderName} canceled the booking.`;
      case BookingStatus.Pending:
        return `${getBookingStatusIcon(
          BookingStatus.Pending,
        )} ${senderName} set the booking status to pending.`;
      default:
        return `${senderName} updated the booking status from '${booking.status}' to '${newStatus}'.`;
    }
  };

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
    if (booking) {
      // TODO - turn this into RPC
      _saveBooking({
        id: booking.id,
        booker_id: booking.booker_id,
        business_id: booking.business_id,
        updated_at: new Date().toISOString(),
        service_id: booking.service_id,
        service_event_id: booking.service_event_id,
        start: booking.start,
        end: booking.end,
        chat_room_id: booking.chat_room_id,
        status: newStatus,
      });

      sendMessage({
        room_id: room.id,
        content: getBookingStatusUpdateMessage(newStatus),
        ...(business ? { sender_business_id: business.id } : {}),
        ...(loggedInUser ? { sender_user_id: loggedInUser.id } : {}),
      });
    }
  };

  return (
    <ChatContainer>
      <ChatHeader
        title={bookingTitle(booking)}
        subtitle={bookingTime(booking)}
        subtitle1={
          booking.created_at
            ? `Booking initiated: ${userFriendlyDate(booking.created_at)}`
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

      <div className="flex items-center">
        <ChatInput className="pr-2 lg:pr-2" onSend={handleNewMessage} />
        <div className="pr-1">
          {business && (
            <InputSelect
              selectLabel="Booking Status"
              className="w-[60px] sm:w-36"
              value={booking.status}
              options={Object.keys(BookingStatus).map((key) => ({
                label: `${getBookingStatusIcon(
                  BookingStatus[key as BookingStatus],
                )} ${isMobile ? "" : BookingStatus[key as BookingStatus]}`,
                value: BookingStatus[key as BookingStatus],
              }))}
              onChange={(newStatus) => {
                handleBookingStatusChange?.(newStatus);
              }}
            />
          )}
          {loggedInUser && booking.status === BookingStatus.Confirmed && (
            <Button
              variant="destructive"
              onClick={() => handleBookingStatusChange(BookingStatus.Canceled)}
            >
              Cancel
            </Button>
          )}
        </div>
      </div>
    </ChatContainer>
  );
}
