"use client";

import CalendarV2 from "@/src/components/ui/calendar-v2";
import ServiceEvent from "@/src/components/pages/shared/service-event";
import { format, isBefore, isSameDay, startOfToday } from "date-fns";
import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import AnimatedTabs from "@/src/components/ui/animated-tabs";
import { BusinessSchedule } from "@/types";
import { Tables } from "@/types/db.extension";

export default function Schedule({
  handle,
  data,
  calendarClassName,
  serviceEventsClassName,
}: {
  handle: string;
  data: BusinessSchedule;
  calendarClassName?: string;
  serviceEventsClassName?: string;
}) {
  const today = startOfToday();
  const [selectedDay, setSelectedDay] = useState(today);
  const [selectedTab, setSelectedTab] = useState(data?.[0]?.id);

  const onServiceDrop = useCallback(
    (service: Tables<"service">, day: Date) => {},
    [],
  );

  const selectedDayServiceEvents = useMemo(() => {
    return (
      (data || [])
        .find(
          (serviceGroup) => serviceGroup.id === (selectedTab || data?.[0]?.id),
        )
        ?.service_events.filter((event) => {
          const startDateTime = new Date(event.start);
          let repeatStartDateTime = event.recurrence_start
            ? new Date(event.recurrence_start)
            : null;
          const repeatInterval = event.recurrence_interval;

          if (isSameDay(startDateTime, selectedDay)) {
            return true;
          }

          if (!repeatStartDateTime || !repeatInterval) {
            return false;
          }

          if (isBefore(repeatStartDateTime, startDateTime)) {
            repeatStartDateTime = startDateTime;
          }

          if (isBefore(selectedDay, repeatStartDateTime)) {
            // selected day is before repeat start.
            return false;
          }

          let repeatIntervalsToJump = Math.floor(
            (selectedDay.getTime() - repeatStartDateTime.getTime()) /
              repeatInterval,
          );
          let timeLeftBeforeNextRepeatingEvent =
            (selectedDay.getTime() - repeatStartDateTime.getTime()) %
            repeatInterval;
          if (timeLeftBeforeNextRepeatingEvent > 0) {
            // if there is time left before next repeating event, add 1 to repeatIntervalsToJump
            repeatIntervalsToJump += 1;
          }

          if (
            event.recurrence_count &&
            repeatIntervalsToJump > event.recurrence_count
          ) {
            // repeat interval jump is greater than count
            return false;
          }

          console.log(
            selectedDay,
            repeatStartDateTime,
            repeatInterval,
            repeatIntervalsToJump,
          );

          return isSameDay(
            selectedDay,
            new Date(
              startDateTime.getTime() + repeatInterval * repeatIntervalsToJump,
            ),
          );
        }) || []
    );
  }, [data, selectedTab, selectedDay]);

  return (
    <>
      <div className={calendarClassName}>
        <CalendarV2
          defaultSelectedDay={selectedDay}
          onDateSelect={(newDate) => setSelectedDay(newDate)}
          onServiceDrop={onServiceDrop}
        />
      </div>

      <section className={serviceEventsClassName}>
        <p className="text- my-4 text-sm font-semibold">
          {format(selectedDay, "MMMM dd")}
        </p>
        {data?.length > 1 && (
          <AnimatedTabs
            tabs={(data || []).map((group) => ({
              id: group.id,
              label: group.title,
            }))}
            onChange={(newTab: string) => setSelectedTab(newTab)}
            value={selectedTab || data?.[0]?.id}
          />
        )}

        <ol className="mt-4 space-y-1 text-sm leading-6 text-muted-foreground">
          {selectedDayServiceEvents.length > 0 ? (
            selectedDayServiceEvents.map((event) => (
              <Link key={event.id} href={`/${handle}/${event.id}/booking`}>
                <ServiceEvent event={event} key={event.id} />
              </Link>
            ))
          ) : (
            <p>Nothing for today.</p>
          )}
        </ol>
      </section>
    </>
  );
}
