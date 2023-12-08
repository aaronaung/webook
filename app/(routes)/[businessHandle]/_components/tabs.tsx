"use client";

import { Button } from "@/src/components/ui/button";
import { useState } from "react";
import ScheduledEventsCard from "./scheduled-events-card";
import BookServicesCard from "./book-services-card";
import { GetServicesResponse } from "@/src/data/service";
import { Tables } from "@/types/db.extension";

enum TabTypes {
  BOOK_SERVICES,
  SCHEDULED_EVENTS,
}
export default function Tabs({
  user,
  services,
  business,
}: {
  user?: Tables<"users">;
  services: GetServicesResponse;
  business: Tables<"businesses">;
}) {
  const [selected, setSelected] = useState(TabTypes.BOOK_SERVICES);
  return (
    <>
      <div className="mb-[20px] mt-[38px] flex justify-center gap-x-3">
        <Button
          onClick={() => {
            if (selected !== TabTypes.BOOK_SERVICES) {
              setSelected(TabTypes.BOOK_SERVICES);
            }
          }}
          variant={
            selected === TabTypes.BOOK_SERVICES ? "default" : "secondary"
          }
          className="rounded-full hover:bg-primary hover:text-secondary"
        >
          Book now
        </Button>
        <Button
          onClick={() => {
            if (selected !== TabTypes.SCHEDULED_EVENTS) {
              setSelected(TabTypes.SCHEDULED_EVENTS);
            }
          }}
          variant={
            selected === TabTypes.SCHEDULED_EVENTS ? "default" : "secondary"
          }
          className="rounded-full hover:bg-primary hover:text-secondary"
        >
          Scheduled events
        </Button>
      </div>
      {selected === TabTypes.BOOK_SERVICES ? (
        <BookServicesCard
          business={business}
          services={services.filter((s) => s.availability_schedule_id)}
        />
      ) : (
        <ScheduledEventsCard user={user} business={business} />
      )}
    </>
  );
}
