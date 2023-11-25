"use client";
import Chat from "@/src/components/shared/chat/chat";
import { useCurrentBusinessContext } from "@/src/contexts/current-business";
import { listChatRoomsByBusinessParticipant } from "@/src/data/chat";
import { useSupaQuery } from "@/src/hooks/use-supabase";

export default function ChatPage() {
  const { currentBusiness } = useCurrentBusinessContext();

  // todo - in the future when we have pagination, we should get the rooms in proximity to the room in search param
  const { data: chatRooms, isLoading: isLoadingChatRooms } = useSupaQuery(
    listChatRoomsByBusinessParticipant,
    currentBusiness.id,
    {
      queryKey: ["listChatRoomsByBusinessParticipant", currentBusiness.id],
    },
  );

  if (isLoadingChatRooms) {
    return <>Loading...</>;
  }

  return <Chat rooms={chatRooms ?? []} business={currentBusiness} />;
}
