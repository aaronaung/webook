"use client";

import CalendarV2 from "@/src/components/ui/calendar-v2";
import { format, isBefore, isSameDay, startOfToday } from "date-fns";
import { useMemo } from "react";
import { BusinessSchedule, ServiceEvent } from "@/types";
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from "../../../../../src/components/ui/tabs";
import ServiceEventItem from "./service-event-item";
import { useRouter, useSearchParams } from "next/navigation";

type ServiceEventCalendarProps = {
  data: BusinessSchedule;
  calendarClassName?: string;
  serviceEventsClassName?: string;
  onServiceEventClick: (serviceEvent: ServiceEvent) => void;
};

export default function ServiceEventCalendar({
  data,
  calendarClassName,
  serviceEventsClassName,
  onServiceEventClick,
}: ServiceEventCalendarProps) {
  const today = startOfToday();
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedDay = new Date(
    parseInt(searchParams.get("date_millis") || "") || today.getTime(),
  );
  const selectedCategory = searchParams.get("category") || data?.[0]?.id;

  const handleDaySelect = (newDate: Date) => {
    const newParams = new URLSearchParams(searchParams.toString());
    newParams.set("date_millis", newDate.getTime().toString());
    router.push(`${window.location.pathname}?${newParams.toString()}`);
  };
  const handleCategorySelect = (newCategory: string) => {
    const newParams = new URLSearchParams(searchParams.toString());
    newParams.set("category", newCategory);
    router.push(`${window.location.pathname}?${newParams.toString()}`);
  };

  const selectedDayServiceEvents = useMemo(() => {
    return (
      (data || [])
        .find(
          (serviceCategory) =>
            serviceCategory.id === (selectedCategory || data?.[0]?.id),
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

          return isSameDay(
            selectedDay,
            new Date(
              startDateTime.getTime() + repeatInterval * repeatIntervalsToJump,
            ),
          );
        }) || []
    );
  }, [data, selectedCategory, selectedDay]);

  return (
    <>
      <div className={calendarClassName}>
        <CalendarV2
          defaultSelectedDay={selectedDay}
          onDateSelect={(newDate) => handleDaySelect(newDate)}
        />
      </div>

      <section className={serviceEventsClassName}>
        <p className="text- my-4 text-sm font-semibold">
          {format(selectedDay, "MMMM dd")}
        </p>
        <Tabs
          value={selectedCategory}
          onValueChange={(selected) => handleCategorySelect(selected)}
        >
          <div className="flex max-w-full items-center overflow-x-scroll">
            <TabsList className="relative overflow-visible">
              {(data || []).map((sg) => (
                <TabsTrigger key={sg.id} value={sg.id}>
                  {sg.title}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
        </Tabs>
        <ol className="mt-4 space-y-1 text-sm leading-6 text-muted-foreground">
          {selectedDayServiceEvents.length > 0 ? (
            selectedDayServiceEvents.map((event) => (
              <ServiceEventItem
                event={event}
                key={event.id}
                onClick={() => {
                  onServiceEventClick(event);
                }}
              />
            ))
          ) : (
            <p>Nothing for today.</p>
          )}
        </ol>
      </section>
    </>
  );
}
