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
};
export const createBookingChatRoom = async (
  { name, bookerId, businessId }: CreateBookingChatRoomArgs,
  { client }: SupabaseOptions,
) => {
  const room = await throwOrData(
    client
      .from("chat_rooms")
      .upsert({
        name,
      })
      .select("id")
      .limit(1)
      .single(),
  );

  await throwOrData(
    client.from("chat_room_participants").upsert({
      room_id: room.id,
      user_id: bookerId,
      business_id: businessId,
    }),
  );

  return room;
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

export const listChatMessagesInRoom = async (
  roomId: string,
  { client }: SupabaseOptions,
) => {
  return throwOrData(
    client
      .from("chat_messages")
      .select("*")
      .eq("room_id", roomId)
      .order("created_at", { ascending: true }),
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

export const listChatRoomsByUserParticipantForBusiness = async (
  {
    userId,
    businessId,
  }: {
    userId: string;
    businessId: string;
  },
  { client }: SupabaseOptions,
) => {
  const queryResult = await throwOrData(
    client
      .from("chat_room_participants")
      .select("chat_rooms(*)")
      .eq("user_id", userId)
      .eq("business_id", businessId)
      .order("created_at", { ascending: false }),
  );
  return queryResult
    .filter((r) => r.chat_rooms !== null)
    .map((r) => r.chat_rooms) as Tables<"chat_rooms">[];
};

export const listChatRoomsByBusinessParticipant = async (
  businessId: string,
  { client }: SupabaseOptions,
) => {
  const queryResult = await throwOrData(
    client
      .from("chat_room_participants")
      .select("chat_rooms(*), users(*)")
      .eq("business_id", businessId)
      .order("created_at", { ascending: false }),
  );
  return queryResult
    .filter((r) => r.chat_rooms !== null)
    .map((r) => ({
      ...r.chat_rooms,
      booker: { ...r.users },
    })) as (Tables<"chat_rooms"> & { booker: Tables<"users"> })[];
};

export const deleteChatRoom = async (
  chatRoomId: string,
  { client }: SupabaseOptions,
) => {
  return throwOrData(client.from("chat_rooms").delete().eq("id", chatRoomId));
};
