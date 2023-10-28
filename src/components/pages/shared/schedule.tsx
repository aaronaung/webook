"use client";

import CalendarV2 from "@/src/components/ui/calendar-v2";
import ServiceSlot from "@/src/components/pages/shared/service-slot";
import { format, isAfter, isSameDay, startOfToday } from "date-fns";
import Link from "next/link";
import { useMemo, useState } from "react";
import AnimatedTabs from "@/src/components/ui/animated-tabs";
import { BusinessSchedule } from "@/types";

export default function Schedule({
  handle,
  data,
  calendarClassName,
  serviceSlotsClassName,
}: {
  handle: string;
  data: BusinessSchedule;
  calendarClassName?: string;
  serviceSlotsClassName?: string;
}) {
  const today = startOfToday();
  const [selectedDay, setSelectedDay] = useState(today);
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

  return (
    <>
      <div className={calendarClassName}>
        <CalendarV2
          defaultSelectedDay={selectedDay}
          onDateSelect={(newDate) => setSelectedDay(newDate)}
          onServiceDrop={(service, day) => {
            console.log("SERVICE DROPED", service, day);
          }}
        />
      </div>

      <section className={serviceSlotsClassName}>
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
          {selectedDayServiceSlots.length > 0 ? (
            selectedDayServiceSlots.map((slot) => (
              <Link key={slot.id} href={`/${handle}/${slot.id}/booking`}>
                <ServiceSlot slot={slot} key={slot.id} />
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
