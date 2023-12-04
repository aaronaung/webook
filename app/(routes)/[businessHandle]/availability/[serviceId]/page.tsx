"use client";

import CalendarV2 from "@/src/components/ui/calendar-v2";
import { getAvailabilityForServiceOnDate } from "@/src/data/availability";
import { useSupaQuery } from "@/src/hooks/use-supabase";
import { add, format, startOfDay, startOfToday } from "date-fns";
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

  const handleDaySelect = (newDate: Date) => {
    const newParams = new URLSearchParams(searchParams.toString());
    newParams.set("date_millis", newDate.getTime().toString());
    router.replace(`${window.location.pathname}?${newParams.toString()}`);
  };

  return (
    <>
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
            <>
              {(data || []).length > 0 ? (
                <>
                  {data!.map((availability, index) => (
                    <div key={`${availability[0]}-${index}`}>
                      {format(
                        add(startOfDay(selectedDay), {
                          seconds: availability[0] / 1000,
                        }),
                        "h:mm a",
                      )}{" "}
                      -
                      {format(
                        add(startOfDay(selectedDay), {
                          seconds: availability[1] / 1000,
                        }),
                        "h:mm a",
                      )}
                    </div>
                  ))}
                </>
              ) : (
                <p>Nothing for today.</p>
              )}
            </>
          )}
        </ol>
      </section>
    </>
  );
}
