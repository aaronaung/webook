"use client";

import HeaderWithAction from "@/src/components/shared/header-with-action";
import { Button } from "@/src/components/ui/button";
import CalendarV2 from "@/src/components/ui/calendar-v2";
import { getAvailabilityForServiceOnDate } from "@/src/data/availability";
import { useSupaQuery } from "@/src/hooks/use-supabase";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import {
  add,
  format,
  millisecondsToMinutes,
  minutesToMilliseconds,
  startOfDay,
  startOfToday,
} from "date-fns";
import { useRouter, useSearchParams } from "next/navigation";

export default function Availability({
  params,
}: {
  params: { serviceId: string };
}) {
  const today = startOfToday();
  const searchParams = useSearchParams();
  const router = useRouter();
  const selectedDay = new Date(
    parseInt(searchParams.get("date_millis") || "") || today.getTime(),
  );

  const { data, isLoading } = useSupaQuery(
    getAvailabilityForServiceOnDate,
    {
      serviceId: params.serviceId,
      date: selectedDay,
    },
    {
      queryKey: [
        "getAvailabilityForServiceOnDate",
        params.serviceId,
        selectedDay.getTime(),
      ],
    },
  );
  const service = data?.service;
  const availability = data?.availability || [];

  const handleDaySelect = (newDate: Date) => {
    const newParams = new URLSearchParams(searchParams.toString());
    newParams.set("date_millis", newDate.getTime().toString());
    router.replace(`${window.location.pathname}?${newParams.toString()}`);
  };

  const getSlotStarts = () => {
    if (availability.length === 0 || !service) return [];
    const starts = [];

    for (const availabilitySlot of availability) {
      let start = availabilitySlot[0];
      for (
        let i = start;
        i + service.duration <= availabilitySlot[1];
        i += minutesToMilliseconds(30)
      ) {
        starts.push(i);
      }
    }
    return starts;
  };

  return (
    <div className="py-6">
      <div className="mx-auto max-w-lg px-4 sm:px-7 lg:max-w-4xl lg:px-6">
        <HeaderWithAction
          title={`${service?.title || ""} (${millisecondsToMinutes(
            service?.duration || 0,
          )} 
          minutes)`}
          leftActionBtn={
            <Button onClick={() => router.back()} variant="ghost">
              <ArrowLeftIcon className="h-5 w-5" />
            </Button>
          }
        />
        <div className="lg:grid lg:grid-cols-2 lg:divide-x lg:divide-gray-200">
          <div className="lg:pr-14">
            <CalendarV2
              defaultSelectedDay={selectedDay}
              onDateSelect={(newDate) => handleDaySelect(newDate)}
            />
          </div>

          <section className="mt-4 w-full lg:mt-0 lg:pl-14">
            <p className="text- my-4 text-sm font-semibold">
              {format(selectedDay, "MMMM dd")}
            </p>

            <ol className="mt-4 space-y-1 text-sm leading-6 text-muted-foreground">
              {isLoading ? (
                <p>Loading...</p>
              ) : (
                <div className="flex flex-wrap gap-x-3 gap-y-5">
                  {getSlotStarts().length === 0 && <p>Nothing for this day.</p>}
                  {getSlotStarts().map((s) => (
                    <div
                      key={s}
                      className="no-shrink flex h-12 w-28 items-center justify-center rounded-full bg-primary text-secondary"
                    >
                      {format(
                        add(startOfDay(selectedDay), {
                          seconds: s / 1000,
                        }),
                        "h:mm a",
                      )}
                    </div>
                  ))}
                </div>
              )}
            </ol>
          </section>
        </div>
      </div>
    </div>
  );
}
