"use client";

import { Button } from "@/src/components/ui/button";
import { useState } from "react";
import ScheduledEventsCard from "./scheduled-events-card";
import BookServicesCard from "./book-services-card";
import { Tables } from "@/types/db.extension";

enum TabTypes {
  BOOK_SERVICES,
  SCHEDULED_EVENTS,
}
export default function Tabs({ business }: { business: Tables<"businesses"> }) {
  const [selected, setSelected] = useState(TabTypes.BOOK_SERVICES);

  return (
    <>
      <div className="mb-[20px] mt-[38px] flex justify-center gap-x-3">
        <Button
          onClick={() => setSelected(TabTypes.BOOK_SERVICES)}
          variant={
            selected === TabTypes.BOOK_SERVICES ? "default" : "secondary"
          }
          className="rounded-full"
        >
          Book services
        </Button>
        <Button
          onClick={() => setSelected(TabTypes.SCHEDULED_EVENTS)}
          variant={
            selected === TabTypes.SCHEDULED_EVENTS ? "default" : "secondary"
          }
          className="rounded-full"
        >
          Scheduled events
        </Button>
      </div>
      {selected === TabTypes.BOOK_SERVICES ? (
        <BookServicesCard business={business} />
      ) : (
        <ScheduledEventsCard business={business} />
      )}
    </>
  );
}
