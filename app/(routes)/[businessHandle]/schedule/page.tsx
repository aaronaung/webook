"use client";

import { useBusinessScheduleByTimeRange } from "@/src/hooks/use-business-schedule-by-time-range";
import { add, format, parse, startOfToday } from "date-fns";
import { useState } from "react";
import ServiceEventCalendar from "./_components/calendar-view";
import ServiceEventQuestions from "./_components/questions-view";
import ServiceEventBooking from "./_components/booking-view";

type ViewModes = "questions" | "calendar" | "booking";

export default function SchedulePage({
  params,
}: {
  params: { businessHandle: string };
}) {
  const today = startOfToday();
  const firstDayCurrentMonth = parse(
    format(today, "MMM-yyyy"),
    "MMM-yyyy",
    new Date(),
  );

  // @todo (important) - right now we only fetch 6 month window of data, and we don't have a dynamic way of fetching more data as the user moves around the calendar.
  const { data, isLoading } = useBusinessScheduleByTimeRange(
    params.businessHandle,
    add(firstDayCurrentMonth, { months: -3 }),
    add(firstDayCurrentMonth, { months: 3 }),
  );

  const [viewMode, setViewMode] = useState<ViewModes>("calendar");
  const [selectedServiceEvent, setSelectedServiceEvent] = useState<any>(null);

  if (isLoading) {
    // todo - add a loading state.
    return <></>;
  }

  return (
    <div className="py-6">
      <div className="mx-auto max-w-lg px-4 sm:px-7 lg:max-w-4xl lg:px-6">
        <div className="lg:grid lg:grid-cols-2 lg:divide-x lg:divide-gray-200">
          {viewMode === "calendar" && (
            <ServiceEventCalendar
              data={data}
              serviceEventsClassName="mt-4 w-full lg:mt-0 lg:pl-14"
              calendarClassName="lg:pr-14"
              onServiceEventClick={(event) => {
                setSelectedServiceEvent(event);
                if (event.service.questions) {
                  setViewMode("questions");
                } else {
                  setViewMode("booking");
                }
              }}
            />
          )}
          {selectedServiceEvent && viewMode === "questions" && (
            <ServiceEventQuestions
              event={selectedServiceEvent}
              onBack={() => {
                setViewMode("calendar");
              }}
            />
          )}
          {selectedServiceEvent && viewMode === "booking" && (
            <ServiceEventBooking
              event={selectedServiceEvent}
              onBack={() => {
                setViewMode("calendar");
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
