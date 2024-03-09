"use client";

import { add, format, parse, startOfToday } from "date-fns";
import ServiceEventCalendar from "./_components/calendar";
import { useSupaQuery } from "@/src/hooks/use-supabase";
import { getScheduledEventsInTimeRange } from "@/src/data/business";
import { getAuthUser } from "@/src/data/user";
import useBooking from "@/src/hooks/use-booking";
import HeaderWithAction from "@/src/components/shared/header-with-action";

export default function SchedulePage({
  params,
}: {
  params: { businessHandle: string };
}) {
  const { data: user, isLoading: userIsLoading } = useSupaQuery(getAuthUser);
  const { bookEvent } = useBooking();

  const today = startOfToday();
  const firstDayCurrentMonth = parse(
    format(today, "MMM-yyyy"),
    "MMM-yyyy",
    new Date(),
  );

  // @todo (important) - right now we only fetch 6 month window of data, and we don't have a dynamic way of fetching more data as the user moves around the calendar.
  const { data, isLoading } = useSupaQuery(
    getScheduledEventsInTimeRange,
    {
      businessHandle: params.businessHandle,
      start: add(firstDayCurrentMonth, { months: -3 }),
      end: add(firstDayCurrentMonth, { months: 3 }),
    },
    {
      queryKey: ["getScheduledEventsInTimeRange", params.businessHandle],
    },
  );

  if (isLoading || userIsLoading) {
    // todo - add a loading state.
    return <>Loading...</>;
  }

  return (
    <div className="mx-auto  max-w-4xl py-4">
      <HeaderWithAction />
      <div className="mx-auto mt-2 max-w-lg px-4 sm:px-7 lg:max-w-4xl lg:px-6">
        <div className="lg:grid lg:grid-cols-2 lg:divide-x lg:divide-gray-200">
          <ServiceEventCalendar
            data={data || []}
            onServiceEventClick={(event) => {
              bookEvent({
                user: user ?? undefined,
                businessHandle: params.businessHandle,
                bookingRequest: {
                  service_id: event.service.id,
                  service_event_id: event.id,
                  start: event.start,
                  end: event.end,
                },
                hasPreRequisiteQuestions:
                  (event.service?.questions || []).length > 0,
              });
            }}
          />
        </div>
      </div>
    </div>
  );
}
