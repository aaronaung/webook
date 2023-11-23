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
  searchParams: { event_id: string };
}) {
  const supabaseOptions = { client: supaServerComponentClient() };
  const loggedInUser = await getAuthUser(supabaseOptions);
  if (!loggedInUser) {
    redirect(
      `/login?return_path=${encodeURIComponent(
        `/${params.businessHandle}/questions?event_id=${searchParams.event_id}`,
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

  // Check to see if booking for the event already exists, if so redirect to the chat room for that booking.
  const existingBooking = await getBookingForServiceEventByUser(
    {
      serviceEventId: searchParams.event_id,
      userId: loggedInUser.id,
    },
    supabaseOptions,
  );
  console.log("existingBooking", existingBooking);
  if (existingBooking) {
    redirect(`/${params.businessHandle}/chat?room_id=${existingBooking.id}`);
  }

  const serviceEvent = await getDetailedServiceEvent(
    searchParams.event_id,
    supabaseOptions,
  );

  return <Questions serviceEvent={serviceEvent} loggedInUser={loggedInUser} />;
}
