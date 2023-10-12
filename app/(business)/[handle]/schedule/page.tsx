"use client";

import Calendar from "@/components/common/calendar";
import ServiceSlot from "@/components/pages/business/schedule/service-slot";
import { Tabs, TabsList, TabsTrigger } from "@/components/common/tabs";
import { useBusinessScheduleByTimeRange } from "@/lib/hooks/use-business-schedule-by-time-range";
import { add, format, isAfter, isSameDay, parse, startOfToday } from "date-fns";
import Link from "next/link";
import { useMemo, useState } from "react";

export default function Schedule({ params }: { params: { handle: string } }) {
  const today = startOfToday();
  const [selectedDay, setSelectedDay] = useState(today);
  const firstDayCurrentMonth = parse(
    format(today, "MMM-yyyy"),
    "MMM-yyyy",
    new Date(),
  );

  const { data, isLoading } = useBusinessScheduleByTimeRange(
    params.handle,
    add(firstDayCurrentMonth, { months: -1 }),
    add(firstDayCurrentMonth, { months: 1 }),
  );

  const [selectedTab, setSelectedTab] = useState(data?.[0]?.id);

  const selectedDayServiceSlots = useMemo(() => {
    return (
      (data || [])
        .find(
          (serviceGroup) => serviceGroup.id === (selectedTab || data?.[0]?.id),
        )
        ?.service_slots.filter((slot) => {
          const startDateTime = slot.start ? new Date(slot.start) : null;
          const repeatStartDateTime = slot.repeat_start
            ? new Date(slot.repeat_start)
            : null;
          const repeatInterval = slot.repeat_interval;

          if (!startDateTime) {
            return false;
          }
          if (isSameDay(startDateTime, selectedDay)) {
            return true;
          }
          if (
            !repeatStartDateTime ||
            !repeatInterval ||
            isAfter(repeatStartDateTime, startDateTime)
          ) {
            return false;
          }

          const repeatIntervalsToJump =
            Math.floor(
              (selectedDay.getTime() - repeatStartDateTime.getTime()) /
                repeatInterval,
            ) + 1;
          if (
            slot.repeat_count &&
            repeatIntervalsToJump > slot.repeat_count - 1
          ) {
            return false;
          }
          const result = isSameDay(
            selectedDay,
            new Date(
              startDateTime.getTime() + repeatInterval * repeatIntervalsToJump,
            ),
          );
          return result;
        }) || []
    );
  }, [data, selectedTab, selectedDay]);

  if (isLoading) {
    // todo - add a loading state.
    return <></>;
  }

  return (
    <div className="py-6">
      <div className="mx-auto max-w-lg px-4 sm:px-7 lg:max-w-4xl lg:px-6">
        <div className="lg:grid lg:grid-cols-2 lg:divide-x lg:divide-gray-200">
          <div className="lg:pr-14">
            <Calendar
              defaultSelectedDay={selectedDay}
              onDateSelect={(newDate) => setSelectedDay(newDate)}
            />
          </div>
          {/* <h4 className="my-4 font-semibold text-gray-700">
            {format(selectedDay, "MMMM dd")}
          </h4> */}
          <section className="mt-4 w-full lg:mt-0 lg:pl-14">
            {data?.length > 1 && (
              <Tabs
                value={selectedTab || data?.[0]?.id}
                onValueChange={(newTab: string) => setSelectedTab(newTab)}
                className="h-16  w-[400px] overflow-x-auto"
              >
                <TabsList className="h-12 p-2">
                  {(data || []).map((group, index) => (
                    <TabsTrigger key={`${group.id}-${index}`} value={group.id}>
                      {group.title}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            )}

            <ol className=" space-y-1 text-sm leading-6 text-gray-500">
              {selectedDayServiceSlots.length > 0 ? (
                selectedDayServiceSlots.map((slot) => (
                  <Link href={`/${params.handle}/${slot.id}/booking`}>
                    <ServiceSlot slot={slot} key={slot.id} />
                  </Link>
                ))
              ) : (
                <p>Nothing for today.</p>
              )}
            </ol>
          </section>
        </div>
      </div>
    </div>
  );
}
