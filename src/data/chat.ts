import { Tables } from "@/types/db.extension";
import { SupabaseOptions } from "./types";
import { throwIfError } from "./util";

export const saveChatRoom = async (
  chatRoom: Partial<Tables<"chat_rooms">>,
  { client }: SupabaseOptions,
) => {
  return throwIfError(
    client
      .from("chat_rooms")
      .upsert({ ...(chatRoom as Tables<"chat_rooms">) })
      .select("id")
      .limit(1)
      .single(),
  );
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
  return throwIfError(
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
  return throwIfError(
    client
      .from("chat_messages")
      .upsert({ ...(chatMessage as Tables<"chat_messages">) })
      .select("id")
      .limit(1)
      .single(),
  );
};

export const deleteChatRoom = async (
  chatRoomId: string,
  { client }: SupabaseOptions,
) => {
  return throwIfError(client.from("chat_rooms").delete().eq("id", chatRoomId));
};

export const getChatRooms = async (
  businessId: string,
  { client }: SupabaseOptions,
) => {
  return throwIfError(
    client.from("chat_rooms").select().eq("business_id", businessId),
  );
};
