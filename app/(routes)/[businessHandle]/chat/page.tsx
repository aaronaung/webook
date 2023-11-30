import { redirect } from "next/navigation";
import { getAuthUser } from "@/src/data/user";
import { supaServerComponentClient } from "@/src/data/clients/server";
import { listChatRoomsByUserParticipantForBusiness } from "@/src/data/chat";
import Chat from "@/src/components/shared/chat/chat";
import { getBusinessByHandle } from "@/src/data/business";

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
  const business = await getBusinessByHandle(
    params.businessHandle,
    supabaseOptions,
  );
  if (!business) {
    console.error(`Business not found for handle: ${params.businessHandle}`);
    redirect("/");
  }

  // todo - in the future when we have pagination, we should get the rooms in proximity to the room in search param
  const userChatRooms = await listChatRoomsByUserParticipantForBusiness(
    {
      userId: loggedInUser.id,
      businessId: business.id,
    },
    supabaseOptions,
  );

  if (userChatRooms.length === 0) {
    redirect(`/${params.businessHandle}/schedule`);
  }

  return (
    <div className="m-auto h-full max-w-6xl p-4">
      <Chat rooms={userChatRooms} loggedInUser={loggedInUser} />
    </div>
  );
}
