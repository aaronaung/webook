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

// type CreateBusinessUserChatRoomParams = {
//   name?: string;
//   business: Partial<Tables<"businesses">>;
//   user: Partial<User>;
// };
// export const createBusinessUserChatRoom = async (
//   { name, business, user }: CreateBusinessUserChatRoomParams,
//   { client }: SupabaseOptions,
// ) => {
//   if (!business.id || !user.id) {
//     return;
//   }
//   const chatRoomParticipants = await throwOrData(
//     client
//       .from("chat_rooms_participants")
//       .select("*", { head: true, count: "exact" })
//       .eq("user_id", user.id!)
//       .eq("business_id", business.id!),
//   );
//   if (count < 1) {
//     const chatRoom = await saveChatRoom(
//       { name: name || `${business.handle} <> ${user.email}` },
//       { client },
//     );
//     await saveChatRoomParticipants(
//       {
//         chatRoomId: chatRoom.id,
//         participants: [user.id],
//         businessId: business.id,
//       },
//       { client },
//     );
//     return chatRoom;
//   }
// };

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

export const deleteChatRoom = async (
  chatRoomId: string,
  { client }: SupabaseOptions,
) => {
  return throwOrData(client.from("chat_rooms").delete().eq("id", chatRoomId));
};

export const getChatRooms = async (
  businessId: string,
  { client }: SupabaseOptions,
) => {
  return throwOrData(
    client.from("chat_rooms").select().eq("business_id", businessId),
  );
};
