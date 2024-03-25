"use client";

import { Button } from "@/src/components/ui/button";
import { useState } from "react";
import { GetServicesResponse } from "@/src/data/service";
import { Tables } from "@/types/db.extension";
import ClassesTabContent from "./tab-content-classes";
import { useAuthUser } from "@/src/contexts/auth";

enum TabType {
  Classes = "Classes",
  // BookServices = "Book now",
  // ScheduledEvents = "Scheduled events",
}
export default function Tabs({
  services,
  business,
}: {
  services: GetServicesResponse;
  business: Tables<"businesses">;
}) {
  const [selected, setSelected] = useState(TabType.Classes);
  const { user } = useAuthUser();

  const renderTabContent = () => {
    if (!user) return <></>;
    switch (selected) {
      // case TabType.BookServices:
      //   return (
      //     <BookServicesTabContent
      //       business={business}
      //       services={services.filter((s) => s.availability_schedule_id)}
      //     />
      //   );
      // case TabType.ScheduledEvents:
      //   return <ScheduledEventsTabContent user={user} business={business} />;
      case TabType.Classes:
        return <ClassesTabContent user={user} business={business} />;
      default:
        return <></>;
    }
  };

  return (
    <>
      {Object.values(TabType).length > 1 && (
        <div className="mt-[38px] flex justify-center gap-x-3">
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
      )}
      <div className="mt-[20px]">{renderTabContent()}</div>
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
