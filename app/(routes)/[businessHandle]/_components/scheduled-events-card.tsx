"use client";

import ServiceEventItem from "@/src/components/shared/service-event-item";
import { Button } from "@/src/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { getScheduledEventsInTimeRange } from "@/src/data/business";
import { useSupaQuery } from "@/src/hooks/use-supabase";
import { Tables } from "@/types/db.extension";
import { endOfDay, startOfDay } from "date-fns";
import { Calendar } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ScheduledEventsCard({
  business,
}: {
  business: Tables<"businesses">;
}) {
  const router = useRouter();

  // We make client side query here because we want the time to be relative to the user's timezone.
  const { data, isLoading } = useSupaQuery(
    getScheduledEventsInTimeRange,
    {
      businessHandle: business.handle,
      start: startOfDay(new Date()),
      end: endOfDay(new Date()),
    },
    {
      queryKey: [
        "getScheduledEventsInTimeRange",
        business.id,
        startOfDay(new Date()),
        endOfDay(new Date()),
      ],
    },
  );

  if (isLoading) {
    return <>Loading...</>;
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Today</CardTitle>
      </CardHeader>
      <CardContent className="p-2">
        <ul role="list" className="divide-y divide-gray-100 text-sm">
          {(data || []).map((event) => (
            <ServiceEventItem
              key={event.id}
              event={event}
              className="py-3"
              onClick={() => {
                router.push(
                  `/${business.handle}/booking/confirmation?event_id=${event.id}`,
                );
              }}
            />
          ))}
        </ul>
      </CardContent>
      <CardFooter className="mt-2">
        <Button
          onClick={() => {
            router.push(`/${business.handle}/schedule`);
          }}
          className="w-full"
          variant="secondary"
        >
          <Calendar className="mr-2 h-4 w-4" /> See full schedule
        </Button>
      </CardFooter>
    </Card>
  );
}
