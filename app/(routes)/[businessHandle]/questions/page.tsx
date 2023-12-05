import { getAuthUser } from "@/src/data/user";
import Questions from "./_components/questions";
import { supaServerComponentClient } from "@/src/data/clients/server";
import { redirect } from "next/navigation";
import { getBusinessByHandle } from "@/src/data/business";
import { getBookingForServiceEventByUser } from "@/src/data/booking";
import { BookingRequest } from "@/src/hooks/use-booking";
import { getService } from "@/src/data/service";

export default async function QuestionsPage({
  params,
  searchParams,
}: {
  params: { businessHandle: string };
  // We use event start to differentiate recurring events that belong to the same service event.
  searchParams: BookingRequest;
}) {
  const supabaseOptions = { client: supaServerComponentClient() };
  const loggedInUser = await getAuthUser(supabaseOptions);
  if (!loggedInUser) {
    redirect(
      `/login?return_path=${encodeURIComponent(
        `/${params.businessHandle}/questions${window.location.search}`,
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

  if (!searchParams.service_id || !searchParams.start || !searchParams.end) {
    console.error(
      "invalid query params - missing one of [service_id, start, end]:",
      searchParams,
    );
    // TODO (important): SHOW ERROR, this is unexpected
    redirect(`/${params.businessHandle}`);
  }

  if (searchParams.service_event_id) {
    // Scheduled event based booking.
    const existingBooking = await getBookingForServiceEventByUser(
      {
        serviceEventStart: searchParams.start,
        serviceEventId: searchParams.service_event_id,
        userId: loggedInUser.id,
      },
      supabaseOptions,
    );
    if (existingBooking) {
      redirect(
        `/${params.businessHandle}/chat?room_id=${existingBooking.chat_room_id}`,
      );
    }
  }
  const service = await getService(searchParams.service_id, supabaseOptions);

  return (
    <Questions
      service={service}
      bookingRequest={searchParams}
      loggedInUser={loggedInUser}
    />
  );
}
