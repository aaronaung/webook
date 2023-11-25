"use client";

import { add, format, parse, startOfToday } from "date-fns";
import ServiceEventCalendar from "./_components/calendar";
import { useRouter } from "next/navigation";
import { toast } from "@/src/components/ui/use-toast";
import { useSupaQuery } from "@/src/hooks/use-supabase";
import { getBusinessScheduleByTimeRange } from "@/src/data/business";
import { getAuthUser } from "@/src/data/user";

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

  if (isLoading || userIsLoading) {
    // todo - add a loading state.
    return <>Loading...</>;
  }

  return (
    <div className="py-6">
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
                router.replace(`/login?return_path=${returnPath}`);
                return;
              }
              if (event.service.questions) {
                router.push(
                  `/${params.businessHandle}/questions?event_id=${event.id}&event_start=${event.start}`,
                );
              } else {
                router.push(
                  `/${params.businessHandle}/booking/confirmation?event_id=${event.id}`,
                );
              }
            }}
          />
        </div>
      </div>
    </div>
  );
}
