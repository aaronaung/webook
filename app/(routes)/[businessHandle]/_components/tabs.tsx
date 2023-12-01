"use client";

import { Button } from "@/src/components/ui/button";
import ScheduledEventsCard from "./scheduled-events-card";
import BookServicesCard from "./book-services-card";
import { Tables } from "@/types/db.extension";
import { useRouter, useSearchParams } from "next/navigation";

enum TabTypes {
  BOOK_SERVICES,
  SCHEDULED_EVENTS,
}
export default function Tabs({ business }: { business: Tables<"businesses"> }) {
  const router = useRouter();

  const searchParams = useSearchParams();
  const tab = searchParams.get("tab");

  const handleTabChange = (newTab: TabTypes) => {
    const newParams = new URLSearchParams(searchParams.toString());
    newParams.set("tab", newTab.toString());
    router.replace(`${window.location.pathname}?${newParams.toString()}`);
  };

  return (
    <>
      <div className="mb-[20px] mt-[38px] flex justify-center gap-x-3">
        <Button
          onClick={() => handleTabChange(TabTypes.BOOK_SERVICES)}
          variant={
            tab === TabTypes.BOOK_SERVICES.toString() ? "default" : "secondary"
          }
          className="rounded-full"
        >
          Book services
        </Button>
        <Button
          onClick={() => handleTabChange(TabTypes.SCHEDULED_EVENTS)}
          variant={
            tab === TabTypes.SCHEDULED_EVENTS.toString()
              ? "default"
              : "secondary"
          }
          className="rounded-full"
        >
          Scheduled events
        </Button>
      </div>
      {tab === TabTypes.BOOK_SERVICES.toString() ? (
        <BookServicesCard />
      ) : (
        <ScheduledEventsCard business={business} />
      )}
    </>
  );
}
