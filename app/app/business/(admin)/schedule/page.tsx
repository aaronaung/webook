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
import PriceTag from "@/src/components/ui/price-tag";
import { useBusinessScheduleByTimeRange } from "@/src/hooks/use-business-schedule-by-time-range";
import { useServiceGroupsWithServices } from "@/src/hooks/use-service-groups-with-services";
import { parse, startOfToday, format, add } from "date-fns";
import _ from "lodash";
import { useRouter } from "next/navigation";

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
    <div className="grid h-full grid-cols-2 gap-x-8 lg:grid-cols-5">
      <div className="col-span-1 overflow-y-auto lg:col-span-3">
        <Schedule
          data={data}
          handle={currentBusiness?.handle}
          serviceSlotsClassName="mt-4"
        />
      </div>
      <div className="col-span-1 overflow-y-auto lg:col-span-2">
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
                <Card className="w-full">
                  <CardHeader>
                    <h3 className="text-medium font-semibold">{sg.title}</h3>
                    {_.isEmpty(sg.services) && (
                      <CardDescription>
                        This service group doesn't have any services yet.
                      </CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    {_.isEmpty(sg.services) && (
                      <Button
                        onClick={() => router.push("/app/business/services")}
                      >
                        Add Services
                      </Button>
                    )}
                    <ul role="list" className="divide-y divide-gray-100">
                      {(sg.services || []).map((service) => (
                        <li
                          key={service.id}
                          className="flex cursor-pointer flex-wrap items-center justify-between gap-x-6 gap-y-4 rounded-md p-2 hover:bg-secondary sm:flex-nowrap"
                        >
                          <div>
                            <p className="text-sm font-medium leading-6 text-secondary-foreground">
                              {service.title}
                            </p>
                            {service.description && (
                              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                                {service.description}
                              </p>
                            )}
                          </div>
                          <dl className="flex w-full flex-none justify-between gap-x-8 sm:w-auto">
                            {service.image_url && (
                              <div className="flex -space-x-0.5">
                                <dt className="sr-only">Image</dt>
                                <dd key={service.id}>
                                  <img
                                    className="h-10 w-10 rounded-full bg-gray-50 ring-2 ring-white"
                                    src={service.image_url}
                                    alt={service.title}
                                  />
                                </dd>
                              </div>
                            )}

                            <dt>
                              <span className="sr-only">Price</span>
                              <PriceTag price={service.price} />
                            </dt>
                          </dl>
                        </li>
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
