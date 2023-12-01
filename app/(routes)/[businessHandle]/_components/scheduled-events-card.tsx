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
import { getBusinessScheduleByTimeRange } from "@/src/data/business";
import { useSupaQuery } from "@/src/hooks/use-supabase";
import { Tables } from "@/types/db.extension";
import { endOfDay, startOfDay } from "date-fns";
import { Calendar } from "lucide-react";
import { useRouter } from "next/navigation";

const people = [
  {
    name: "Leslie Alexander",
    email: "leslie.alexander@example.com",
    role: "Co-Founder / CEO",
    imageUrl:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    lastSeen: "3h ago",
    lastSeenDateTime: "2023-01-23T13:23Z",
  },
  {
    name: "Michael Foster",
    email: "michael.foster@example.com",
    role: "Co-Founder / CTO",
    imageUrl:
      "https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    lastSeen: "3h ago",
    lastSeenDateTime: "2023-01-23T13:23Z",
  },
  {
    name: "Dries Vincent",
    email: "dries.vincent@example.com",
    role: "Business Relations",
    imageUrl:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    lastSeen: null,
  },
  {
    name: "Lindsay Walton",
    email: "lindsay.walton@example.com",
    role: "Front-end Developer",
    imageUrl:
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    lastSeen: "3h ago",
    lastSeenDateTime: "2023-01-23T13:23Z",
  },
  {
    name: "Courtney Henry",
    email: "courtney.henry@example.com",
    role: "Designer",
    imageUrl:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    lastSeen: "3h ago",
    lastSeenDateTime: "2023-01-23T13:23Z",
  },
  {
    name: "Tom Cook",
    email: "tom.cook@example.com",
    role: "Director of Product",
    imageUrl:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    lastSeen: null,
  },
];

export default function ScheduledEventsCard({
  business,
}: {
  business: Tables<"businesses">;
}) {
  const router = useRouter();
  const { data, isLoading } = useSupaQuery(
    getBusinessScheduleByTimeRange,
    {
      businessHandle: business.handle,
      start: startOfDay(new Date()),
      end: endOfDay(new Date()),
    },
    {
      queryKey: [
        "getBusinessScheduleByTimeRange",
        business.id,
        startOfDay(new Date()),
        endOfDay(new Date()),
      ],
    },
  );

  if (isLoading) {
    return <>Loading...</>;
  }

  const events = (data || []).flatMap((category) => category.service_events);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Today</CardTitle>
      </CardHeader>
      <CardContent className="p-2">
        <ul role="list" className="divide-y divide-gray-100 text-sm">
          {events.map((event) => (
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
