"use client";

import HeaderWithAction from "@/src/components/common/header-with-action";
import CalendarV2 from "@/src/components/ui/calendar-v2";
import { useCurrentViewingBusinessContext } from "@/src/contexts/current-viewing-business";
import { getAvailabilityForServiceOnDate } from "@/src/data/availability";
import { getAuthUser } from "@/src/data/user";
import useBooking from "@/src/hooks/use-booking";
import { useSupaQuery } from "@/src/hooks/use-supabase";
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
  const { currentViewingBusiness } = useCurrentViewingBusinessContext();
  const { bookEvent } = useBooking();

  const { data: user, isLoading: isLoadingUser } = useSupaQuery(getAuthUser);
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
  const availability = data?.availability || [];
  const service = data?.service;

  const handleDaySelect = (newDate: Date) => {
    const newParams = new URLSearchParams(searchParams.toString());
    newParams.set("date_millis", newDate.getTime().toString());
    router.replace(`${window.location.pathname}?${newParams.toString()}`);
  };

  const getAvailabilityOffsetsFromDayStart = () => {
    if (availability.length === 0 || !service) {
      return [];
    }

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

  const renderSlotStart = (offsetFromDayStart: number) => {
    const start = add(startOfDay(selectedDay), {
      seconds: offsetFromDayStart / 1000,
    });
    return (
      <div
        onClick={() => {
          bookEvent({
            user: user ?? undefined,
            businessHandle: currentViewingBusiness.handle,
            bookingRequest: {
              service_id: params.serviceId,
              start: new Date(start).toISOString(),
              end: new Date(
                start.getTime() + (service?.duration || 0),
              ).toISOString(),
            },
            hasPreRequisiteQuestions: (service?.questions || []).length > 0,
          });
        }}
        key={offsetFromDayStart}
        className="no-shrink flex h-12 w-28 cursor-pointer items-center justify-center rounded-full font-semibold text-primary ring-1 ring-offset-primary-foreground hover:bg-secondary"
      >
        {format(start, "h:mm a")}
      </div>
    );
  };

  if (isLoadingUser) {
    return <>Loading...</>;
  }

  return (
    <div className="mx-auto  max-w-4xl py-4">
      <HeaderWithAction
        title={`${service?.title || ""} (${millisecondsToMinutes(
          service?.duration || 0,
        )} 
          minutes)`}
      />
      <div className="py-4">
        <div className="mx-auto max-w-lg px-4 sm:px-7 lg:max-w-4xl lg:px-6">
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
                    {getAvailabilityOffsetsFromDayStart().length === 0 && (
                      <p>Nothing for this day.</p>
                    )}
                    {getAvailabilityOffsetsFromDayStart().map(
                      (offsetFromDayStart) =>
                        renderSlotStart(offsetFromDayStart),
                    )}
                  </div>
                )}
              </ol>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
