import { getAuthUser } from "@/src/data/user";
import Questions from "./_components/questions";
import { supaServerComponentClient } from "@/src/data/clients/server";
import { redirect } from "next/navigation";
import { getBusinessByHandle } from "@/src/data/business";
import { getDetailedServiceEvent } from "@/src/data/service";
import { getBookingForServiceEventByUser } from "@/src/data/booking";

export default async function QuestionsPage({
  params,
  searchParams,
}: {
  params: { businessHandle: string };
  // We use event start to differentiate recurring events that belong to the same service event.
  searchParams: { event_id: string; event_start: string };
}) {
  const supabaseOptions = { client: supaServerComponentClient() };
  const loggedInUser = await getAuthUser(supabaseOptions);
  if (!loggedInUser) {
    redirect(
      `/login?return_path=${encodeURIComponent(
        `/${params.businessHandle}/questions?event_id=${searchParams.event_id}&event_start=${searchParams.event_start}`,
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

  const existingBooking = await getBookingForServiceEventByUser(
    {
      serviceEventStart: searchParams.event_start,
      serviceEventId: searchParams.event_id,
      userId: loggedInUser.id,
    },
    supabaseOptions,
  );
  if (existingBooking) {
    redirect(
      `/${params.businessHandle}/chat?room_id=${existingBooking.chat_room_id}`,
    );
  }

  const serviceEvent = await getDetailedServiceEvent(
    searchParams.event_id,
    supabaseOptions,
  );

  return (
    <Questions
      serviceEvent={serviceEvent}
      serviceEventStart={searchParams.event_start}
      loggedInUser={loggedInUser}
    />
  );
}
