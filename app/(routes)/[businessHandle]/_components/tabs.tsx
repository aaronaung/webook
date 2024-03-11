"use client";

import { Button } from "@/src/components/ui/button";
import { useState } from "react";
import ScheduledEventsCard from "./scheduled-events-card";
import BookServicesCard from "./book-services-card";
import { GetServicesResponse } from "@/src/data/service";
import { Tables } from "@/types/db.extension";
import ClassesCard from "./classes-card";

enum TabType {
  BookServices = "Book now",
  ScheduledEvents = "Scheduled events",
  Classes = "Classes",
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
  const [selected, setSelected] = useState(TabType.BookServices);

  const renderTabContent = () => {
    switch (selected) {
      case TabType.BookServices:
        return (
          <BookServicesCard
            business={business}
            services={services.filter((s) => s.availability_schedule_id)}
          />
        );
      case TabType.ScheduledEvents:
        return <ScheduledEventsCard user={user} business={business} />;
      case TabType.Classes:
        return <ClassesCard business={business} />;
      default:
        return <></>;
    }
  };

  return (
    <>
      <div className="mb-[20px] mt-[38px] flex justify-center gap-x-3">
        {Object.values(TabType).map((tab) => {
          return (
            <Tab
              key={tab}
              type={tab as TabType}
              selected={selected}
              onSelect={setSelected}
            />
          );
        })}
      </div>
      {renderTabContent()}
    </>
  );
}

const Tab = ({
  type,
  selected,
  onSelect,
}: {
  type: TabType;
  selected: TabType;
  onSelect: (tab: TabType) => void;
}) => {
  return (
    <Button
      onClick={() => {
        if (selected !== type) {
          onSelect(type);
        }
      }}
      variant={selected === type ? "default" : "secondary"}
      className="rounded-full hover:bg-primary hover:text-secondary"
    >
      {type}
    </Button>
  );
};
