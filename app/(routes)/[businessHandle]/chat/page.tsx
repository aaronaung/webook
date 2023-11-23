import { redirect } from "next/navigation";
import { getAuthUser } from "@/src/data/user";
import { supaServerComponentClient } from "@/src/data/clients/server";
import { getChatRoom, listChatRoomsByUserParticipant } from "@/src/data/chat";
import Chat from "./_components/chat";

export default async function ChatPage({
  params,
  searchParams,
}: {
  params: { businessHandle: string };
  searchParams: { room_id: string };
}) {
  const supabaseOptions = { client: supaServerComponentClient() };
  const loggedInUser = await getAuthUser(supabaseOptions);
  if (!loggedInUser) {
    redirect(
      `/login?return_path=${encodeURIComponent(
        `/${params.businessHandle}/chat?room_id=${searchParams.room_id}`,
      )}`,
    );
  }

  const initialRoom = await getChatRoom(searchParams.room_id, supabaseOptions);

  // todo - in the future we should get the rooms in proximity to the initial room passed in param
  const userChatRooms = await listChatRoomsByUserParticipant(
    loggedInUser.id,
    supabaseOptions,
  );

  return (
    <Chat
      initialRoom={initialRoom ?? undefined}
      rooms={userChatRooms ?? []}
      loggedInUser={loggedInUser}
    />
  );
}
