"use client";

import { add, format, parse, startOfToday } from "date-fns";
import { useState } from "react";
import ServiceEventCalendar from "./_components/calendar-view";
import { ServiceEvent } from "@/types";
import { useRouter } from "next/navigation";
import ServiceEventQuestions from "./_components/questions-view";
import ServiceEventBooking from "./_components/booking-view";
import { toast } from "@/src/components/ui/use-toast";
import { useSupaQuery } from "@/src/hooks/use-supabase";
import { getBusinessScheduleByTimeRange } from "@/src/data/business";
import { getAuthUser } from "@/src/data/user";

type ViewModes = "questions" | "calendar" | "booking";

export default function SchedulePage({
  params,
}: {
  params: { businessHandle: string };
}) {
  const { data: user, isLoading: userIsLoading } = useSupaQuery(getAuthUser);

  const router = useRouter();
  const today = startOfToday();
  const firstDayCurrentMonth = parse(
    format(today, "MMM-yyyy"),
    "MMM-yyyy",
    new Date(),
  );

  // @todo (important) - right now we only fetch 6 month window of data, and we don't have a dynamic way of fetching more data as the user moves around the calendar.
  const { data, isLoading } = useSupaQuery(
    getBusinessScheduleByTimeRange,
    {
      businessHandle: params.businessHandle,
      start: add(firstDayCurrentMonth, { months: -3 }),
      end: add(firstDayCurrentMonth, { months: 3 }),
    },
    {
      queryKey: ["getBusinessScheduleByTimeRange", params.businessHandle],
    },
  );

  const [viewMode, setViewMode] = useState<ViewModes>("calendar");
  const [selectedServiceEvent, setSelectedServiceEvent] =
    useState<ServiceEvent>();

  if (isLoading || userIsLoading) {
    // todo - add a loading state.
    return <></>;
  }

  return (
    <div className="py-6">
      {viewMode === "calendar" && (
        <div className="mx-auto max-w-lg px-4 sm:px-7 lg:max-w-4xl lg:px-6">
          <div className="lg:grid lg:grid-cols-2 lg:divide-x lg:divide-gray-200">
            <ServiceEventCalendar
              data={data || []}
              serviceEventsClassName="mt-4 w-full lg:mt-0 lg:pl-14"
              calendarClassName="lg:pr-14"
              onServiceEventClick={(event) => {
                if (!user) {
                  const returnPath = encodeURIComponent(
                    `/${params.businessHandle}/schedule${window.location.search}`,
                  );
                  toast({
                    title: "Please login to continue.",
                    description:
                      "You need to be logged in to continue with booking.",
                    variant: "default",
                  });
                  router.replace(
                    `/login?returnPath=${returnPath}&backPath=${returnPath}`,
                  );
                  return;
                }
                setSelectedServiceEvent(event);
                if (event.service.questions) {
                  setViewMode("questions");
                } else {
                  setViewMode("booking");
                }
              }}
            />
          </div>
        </div>
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
  );
}
