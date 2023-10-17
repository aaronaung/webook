"use client";

import { useBusinessScheduleByTimeRange } from "@/lib/hooks/use-business-schedule-by-time-range";
import { add, format, parse, startOfToday } from "date-fns";
import Schedule from "@/components/pages/app/business/schedule";

export default function SchedulePage({
  params,
}: {
  params: { handle: string };
}) {
  const today = startOfToday();
  const firstDayCurrentMonth = parse(
    format(today, "MMM-yyyy"),
    "MMM-yyyy",
    new Date(),
  );

  // @todo (important) - right now we only fetch 6 month window of data, and we don't have a dynamic way of fetching more data as the user moves around the calendar.
  const { data, isLoading } = useBusinessScheduleByTimeRange(
    params.handle,
    add(firstDayCurrentMonth, { months: -3 }),
    add(firstDayCurrentMonth, { months: 3 }),
  );

  if (isLoading) {
    // todo - add a loading state.
    return <></>;
  }

  return (
    <div className="py-6">
      <div className="mx-auto max-w-lg px-4 sm:px-7 lg:max-w-4xl lg:px-6">
        <div className="lg:grid lg:grid-cols-2 lg:divide-x lg:divide-gray-200">
          <Schedule
            data={data}
            handle={params.handle}
            serviceSlotsClassName="mt-4 w-full lg:mt-0 lg:pl-14"
            calendarClassName="lg:pr-14"
          />
        </div>
      </div>
    </div>
  );
}
