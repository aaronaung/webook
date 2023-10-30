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
import { SlotInfo, View, Views } from "react-big-calendar";
import { Badge } from "@/src/components/ui/badge";
import { Tables } from "@/types/db.extension";
import {
  DragFromOutsideItemArgs,
  EventInteractionArgs,
} from "react-big-calendar/lib/addons/dragAndDrop";
import { SaveServiceEventFormSchemaType } from "@/src/components/forms/save-service-event-form";
import { SaveServiceEventDialog } from "@/src/components/dialogs/save-service-event-dialog";
import { BusinessServiceEvent } from "@/types";
import { useStaffs } from "@/src/hooks/use-staffs";

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
  const [svcEventDialogState, setSvcEventDialogState] = useState<{
    isOpen: boolean;
    data?: Partial<SaveServiceEventFormSchemaType> & { id?: string };
    availableServices?: Tables<"service">[];
    availableStaffs?: Tables<"staff">[];
  }>({
    isOpen: false,
  });

  // @todo (important) - right now we only fetch 6 month window of data, and we don't have a dynamic way of fetching more data as the user moves around the calendar.
  const { data, isLoading: isBusinessScheduleDataLoading } =
    useBusinessScheduleByTimeRange(
      currentBusiness?.handle,
      add(firstDayCurrentMonth, { months: -3 }),
      add(firstDayCurrentMonth, { months: 3 }),
    );

  const { data: serviceGroups, isLoading: isServicesLoading } =
    useServiceGroupsWithServices(currentBusiness?.id);

  const { data: staffs, isLoading: isStaffsLoading } = useStaffs(
    currentBusiness?.id,
  );

  const services = useMemo(() => {
    return serviceGroups?.map((sg) => sg.services)?.flat() || [];
  }, [serviceGroups]);

  const serviceEvents = useMemo(() => {
    return (
      data
        ?.map(
          (sg) =>
            sg.service_events?.map((ss) => ({
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

  const openUpdateServiceEventDialog = (
    event: BusinessServiceEvent,
    start: Date,
  ) => {
    setSvcEventDialogState({
      isOpen: true,
      data: {
        id: event.id,
        start,
        recurrence_count: event.recurrence_count ?? undefined,
        recurrence_interval: event.recurrence_interval ?? undefined,
        recurrence_start: event.recurrence_start
          ? new Date(event.recurrence_start)
          : undefined,
        service_id: event.service.id,
        staff_ids: event.staffs?.map((s) => s.id),
      },
    });
  };

  // When the user moves an existing event, we open the dialog to edit it.
  const onEventDrop = useCallback(
    (args: EventInteractionArgs<BusinessServiceEvent>) => {
      openUpdateServiceEventDialog(args.event, args.start as Date);
    },
    [],
  );

  // When the user clicks on an existing event, we open the dialog to edit it.
  const onSelectEvent = useCallback((event: BusinessServiceEvent) => {
    openUpdateServiceEventDialog(event, new Date(event.start));
  }, []);

  // When the user clicks on an empty slot, we open the dialog to create a new event.
  const onSelectSlot = useCallback((slotInfo: SlotInfo) => {
    setSvcEventDialogState({
      isOpen: true,
      data: {
        start: slotInfo.start,
        recurrence_count: undefined,
        recurrence_interval: undefined,
        recurrence_start: undefined,
      },
    });
  }, []);

  const onDropFromOutside = useCallback((args: DragFromOutsideItemArgs) => {
    console.log("on drop from outside", args);
  }, []);

  const handleOnServiceDrag = (draggedService: Tables<"service">) => {
    setDraggedService(draggedService);
  };

  if (isBusinessScheduleDataLoading || isServicesLoading || isStaffsLoading) {
    // todo - add a loading state.
    return <>Loading...</>;
  }

  return (
    <div className="flex h-full flex-col gap-x-8 overflow-y-auto overscroll-contain">
      <SaveServiceEventDialog
        isOpen={svcEventDialogState.isOpen}
        data={svcEventDialogState.data}
        toggleOpen={() =>
          setSvcEventDialogState({
            ...svcEventDialogState,
            isOpen: !svcEventDialogState.isOpen,
          })
        }
        availableServices={services}
        availableStaffs={staffs}
      />
      <div className="mb-2 flex-shrink-0">
        {_.isEmpty(serviceGroups) ? (
          <>
            <Card className="w-full ">
              <CardHeader>
                <h3 className="text-medium font-semibold">No services found</h3>
                <CardDescription>
                  In order to add service events to your calendar, you must
                  first define services your business offers.
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
          events={serviceEvents}
          eventPropGetter={(event) => ({ className: "isDraggable" })}
          onView={(view) => setCalView(view)}
          localizer={localizer}
          onEventDrop={
            onEventDrop as any /* todo - the library typing is all messed up */
          }
          onSelectEvent={
            onSelectEvent as any /* todo - the library typing is all messed up */
          }
          selectable
          onSelectSlot={onSelectSlot}
          scrollToTime={add(startOfToday(), { hours: 8 })}
          style={{ height: "100vh" }}
          min={add(startOfToday(), { hours: 8 })}
        />
      </div>
    </div>
  );
}
