"use client";
import { useCurrentBusinessContext } from "@/src/contexts/current-business";
import { Button } from "@/src/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/src/components/ui/card";
import { useBusinessScheduleByTimeRange } from "@/src/hooks/use-business-schedule-by-time-range";
import { useServiceGroupsWithServices } from "@/src/hooks/use-service-groups-with-services";
import {
  parse,
  startOfToday,
  format,
  add,
  addMilliseconds,
  subDays,
} from "date-fns";
import _ from "lodash";
import { useRouter } from "next/navigation";
import DnDCalendar, { localizer } from "@/src/components/ui/dnd-calendar";
import { useCallback, useMemo, useState } from "react";
import { View, Views } from "react-big-calendar";
import { Badge } from "@/src/components/ui/badge";
import { Tables } from "@/types/db.extension";
import {
  DragFromOutsideItemArgs,
  EventInteractionArgs,
} from "react-big-calendar/lib/addons/dragAndDrop";
import { SaveServiceSlotFormSchemaType } from "@/src/components/forms/save-service-slot-form";
import { SaveServiceSlotDialog } from "@/src/components/dialogs/save-service-slot-dialog";
import { BusinessServiceSlot } from "@/types";

export default function SchedulePage() {
  const { currentBusiness } = useCurrentBusinessContext();
  const router = useRouter();

  const today = startOfToday();
  const firstDayCurrentMonth = parse(
    format(today, "MMM-yyyy"),
    "MMM-yyyy",
    new Date(),
  );

  const [calView, setCalView] = useState<View>(Views.MONTH);
  const [draggedService, setDraggedService] = useState<Tables<"service">>();
  const [svcSlotDialogState, setSvcSlotDialogState] = useState<{
    isOpen: boolean;
    data?: SaveServiceSlotFormSchemaType & { id?: string };
    service?: Tables<"service">;
  }>({
    isOpen: false,
  });

  // @todo (important) - right now we only fetch 6 month window of data, and we don't have a dynamic way of fetching more data as the user moves around the calendar.
  const { data, isLoading } = useBusinessScheduleByTimeRange(
    currentBusiness?.handle,
    add(firstDayCurrentMonth, { months: -3 }),
    add(firstDayCurrentMonth, { months: 3 }),
  );

  const { data: serviceGroups, isLoading: isServicesLoading } =
    useServiceGroupsWithServices(currentBusiness?.id);

  const services = useMemo(() => {
    return serviceGroups?.map((sg) => sg.services)?.flat() || [];
  }, [serviceGroups]);

  const serviceSlots = useMemo(() => {
    return (
      data
        ?.map(
          (sg) =>
            sg.service_slots?.map((ss) => ({
              title: ss.service.title,
              duration: ss.service.duration,
              price: ss.service.price,
              start: new Date(ss?.start || ""),
              end: addMilliseconds(
                new Date(ss?.start || ""),
                ss.service.duration,
              ),
              ..._.omit(ss, ["start", "title", "duration", "price"]),
            })),
        )
        ?.flat() || []
    );
  }, [data]);

  const onEventDrop = useCallback(
    (args: EventInteractionArgs<BusinessServiceSlot>) => {
      console.log(args.event);
      setSvcSlotDialogState({
        isOpen: true,
        data: {
          id: args.event.id,
          start: args.start as Date,
          recurrence_count: args.event.recurrence_count || undefined,
          recurrence_interval: args.event.recurrence_interval || undefined,
          recurrence_start: args.event.recurrence_start
            ? new Date(args.event.recurrence_start)
            : undefined,
        },
        service: args.event.service,
      });
    },
    [],
  );

  const onDropFromOutside = useCallback((args: DragFromOutsideItemArgs) => {
    console.log("on drop from outside", args);
  }, []);

  const handleOnServiceDrag = (draggedService: Tables<"service">) => {
    setDraggedService(draggedService);
  };

  if (isLoading || isServicesLoading) {
    // todo - add a loading state.
    return <>Loading...</>;
  }

  return (
    <div className="flex h-full flex-col gap-x-8 overflow-y-auto overscroll-contain">
      <SaveServiceSlotDialog
        isOpen={svcSlotDialogState.isOpen}
        service={svcSlotDialogState.service}
        data={svcSlotDialogState.data}
        toggleOpen={() =>
          setSvcSlotDialogState({
            ...svcSlotDialogState,
            isOpen: !svcSlotDialogState.isOpen,
          })
        }
      />
      <div className="mb-2 flex-shrink-0">
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
            <p className="mb-2 text-sm text-muted-foreground">
              You can drag and drop services onto the calendar to create an
              event.
            </p>
            <div className="mb-3 flex max-w-full flex-wrap gap-1 text-sm">
              {services.map(
                (svc) =>
                  svc && (
                    <Badge
                      draggable={true}
                      className="cursor-pointer"
                      key={svc.id}
                      onDragStart={() => handleOnServiceDrag(svc)}
                    >
                      {svc.title}
                    </Badge>
                  ),
              )}
            </div>
          </>
        )}
      </div>
      <div className="overflow-scroll text-sm">
        <DnDCalendar
          defaultDate={subDays(today, 25)}
          view={calView}
          onDropFromOutside={onDropFromOutside}
          events={serviceSlots}
          eventPropGetter={(event) => ({ className: "isDraggable" })}
          onView={(view) => setCalView(view)}
          localizer={localizer}
          onEventDrop={onEventDrop}
          scrollToTime={add(startOfToday(), { hours: 8 })}
          style={{ height: "100vh" }}
          min={add(startOfToday(), { hours: 8 })}
        />
      </div>
    </div>
  );
}
