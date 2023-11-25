"use client";
import Chat from "@/src/components/shared/chat/chat";
import EmptyState from "@/src/components/shared/empty-state";
import { useCurrentBusinessContext } from "@/src/contexts/current-business";
import { listChatRoomsByBusinessParticipant } from "@/src/data/chat";
import { useSupaQuery } from "@/src/hooks/use-supabase";
import { ChatBubbleOvalLeftIcon } from "@heroicons/react/24/outline";

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

  if ((chatRooms || []).length === 0) {
    return (
      <EmptyState
        title={"You currently have no messages."}
        description={`Once your clients book appointments, you'll be able to chat with them here.`}
        Icon={ChatBubbleOvalLeftIcon}
      />
    );
  }

  return <Chat rooms={chatRooms || []} business={currentBusiness} />;
}
