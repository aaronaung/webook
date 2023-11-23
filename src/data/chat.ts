import { Tables } from "@/types/db.extension";
import { SupabaseOptions } from "./types";
import { throwOrData } from "./util";

export const saveChatRoom = async (
  chatRoom: Partial<Tables<"chat_rooms">>,
  { client }: SupabaseOptions,
) => {
  return throwOrData(
    client
      .from("chat_rooms")
      .upsert({ ...(chatRoom as Tables<"chat_rooms">) })
      .select("id")
      .limit(1)
      .single(),
  );
};

type CreateBookingChatRoomArgs = {
  name: string;
  bookerId: string;
  businessId: string;
  bookingId: string;
};
export const createBookingChatRoom = async (
  { name, bookingId, bookerId, businessId }: CreateBookingChatRoomArgs,
  { client }: SupabaseOptions,
) => {
  const room = await throwOrData(
    client
      .from("chat_rooms")
      .upsert({
        name,
        booking_id: bookingId,
      })
      .select("id")
      .limit(1)
      .single(),
  );

  const addUserParticipant = throwOrData(
    client.from("chat_rooms_user_participants").upsert({
      room_id: room.id,
      user_id: bookerId,
    }),
  );
  const addBusinessParticipant = throwOrData(
    client.from("chat_rooms_business_participants").upsert({
      room_id: room.id,
      business_id: businessId,
    }),
  );
  await Promise.all([addUserParticipant, addBusinessParticipant]);
  return room;
};

export const saveChatRoomParticipants = async (
  {
    chatRoomId,
    participants,
    businessId,
  }: {
    chatRoomId: string;
    participants: string[];
    businessId: string;
  },
  { client }: SupabaseOptions,
) => {
  return throwOrData(
    client.from("chat_rooms_participants").upsert(
      participants.map((participant) => ({
        room_id: chatRoomId,
        user_id: participant,
        business_id: businessId,
      })),
    ),
  );
};

export const saveChatMessage = async (
  chatMessage: Partial<Tables<"chat_messages">>,
  { client }: SupabaseOptions,
) => {
  return throwOrData(
    client
      .from("chat_messages")
      .upsert({ ...(chatMessage as Tables<"chat_messages">) })
      .select("id")
      .limit(1)
      .single(),
  );
};

export const getChatRoom = async (
  chatRoomId: string,
  { client }: SupabaseOptions,
) => {
  return throwOrData(
    client
      .from("chat_rooms")
      .select("*")
      .eq("id", chatRoomId)
      .limit(1)
      .maybeSingle(),
  );
};

export const listChatRoomsByUserParticipant = async (
  userId: string,
  { client }: SupabaseOptions,
) => {
  const queryResult = await throwOrData(
    client
      .from("chat_rooms_user_participants")
      .select("chat_rooms(*)")
      .eq("user_id", userId)
      .order("created_at", { ascending: false }),
  );
  return queryResult
    .filter((r) => r.chat_rooms !== null)
    .map((r) => r.chat_rooms) as Tables<"chat_rooms">[];
};

export const deleteChatRoom = async (
  chatRoomId: string,
  { client }: SupabaseOptions,
) => {
  return throwOrData(client.from("chat_rooms").delete().eq("id", chatRoomId));
};
