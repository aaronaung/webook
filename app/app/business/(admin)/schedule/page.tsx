"use client";
import { useCurrentBusinessContext } from "@/src/contexts/current-business";
import Schedule from "@/src/components/pages/shared/schedule";
import { Button } from "@/src/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/src/components/ui/card";
import { useBusinessScheduleByTimeRange } from "@/src/hooks/use-business-schedule-by-time-range";
import { useServiceGroupsWithServices } from "@/src/hooks/use-service-groups-with-services";
import { parse, startOfToday, format, add } from "date-fns";
import _ from "lodash";
import { useRouter } from "next/navigation";
import DraggableServiceItem from "@/src/components/pages/business/schedule/draggable-service-item";

export default function SchedulePage() {
  const { currentBusiness } = useCurrentBusinessContext();
  const router = useRouter();

  const today = startOfToday();
  const firstDayCurrentMonth = parse(
    format(today, "MMM-yyyy"),
    "MMM-yyyy",
    new Date(),
  );

  // @todo (important) - right now we only fetch 6 month window of data, and we don't have a dynamic way of fetching more data as the user moves around the calendar.
  const { data, isLoading } = useBusinessScheduleByTimeRange(
    currentBusiness?.handle,
    add(firstDayCurrentMonth, { months: -3 }),
    add(firstDayCurrentMonth, { months: 3 }),
  );

  const { data: serviceGroups, isLoading: isServicesLoading } =
    useServiceGroupsWithServices(currentBusiness?.id);

  if (isLoading || isServicesLoading) {
    // todo - add a loading state.
    return <>Loading...</>;
  }

  return (
    <div className="grid h-full grid-cols-2 gap-x-8">
      <div className="col-span-1 overflow-y-auto">
        <Schedule
          data={data}
          handle={currentBusiness?.handle}
          serviceSlotsClassName="mt-4"
        />
      </div>
      <div className="col-span-1 overflow-y-auto">
        {_.isEmpty(serviceGroups) ? (
          <>
            <Card className="w-full ">
              <CardHeader>
                <h3 className="text-medium font-semibold">No services found</h3>
                <CardDescription>
                  In order to add service slots to your calendar, you must first
                  define services your business offers.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={() => router.push("/app/business/services")}>
                  Add Services
                </Button>
              </CardContent>
            </Card>
          </>
        ) : (
          <>
            <p className="mb-4 text-sm text-muted-foreground">
              You can drag and drop services onto the calendar to create an
              event.
            </p>
            <div className="grid gap-y-4">
              {serviceGroups.map((sg) => (
                <Card key={sg.id} className="w-full">
                  <CardHeader className="p-4">
                    <h3 className="text-medium font-semibold">{sg.title}</h3>
                    {_.isEmpty(sg.services) && (
                      <CardDescription>
                        This service group doesn't have any services.
                      </CardDescription>
                    )}
                  </CardHeader>
                  <CardContent className="p-4">
                    {_.isEmpty(sg.services) && (
                      <Button
                        onClick={() => router.push("/app/business/services")}
                      >
                        Add Services
                      </Button>
                    )}
                    <ul role="list" className="divide-y divide-gray-100">
                      {(sg.services || []).map((service) => (
                        <DraggableServiceItem
                          key={service.id}
                          service={service}
                        />
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
