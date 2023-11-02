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
  millisecondsToHours,
  isSameDay,
} from "date-fns";
import _ from "lodash";
import { useRouter } from "next/navigation";
import DnDCalendar, { localizer } from "@/src/components/ui/dnd-calendar";
import { useCallback, useMemo, useRef, useState } from "react";
import { NavigateAction, SlotInfo, View, Views } from "react-big-calendar";
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
import { useSaveServiceEvent } from "@/src/hooks/use-save-service-event";

type CalEvent = BusinessServiceEvent & {
  isRecurrentEvent?: boolean;
  color?: boolean;
};

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
  const draggedServiceRef = useRef<Tables<"service"> | null>(null);
  const [svcEventDialogState, setSvcEventDialogState] = useState<{
    isOpen: boolean;
    data?: Partial<SaveServiceEventFormSchemaType> & { id?: string };
    isRecurrentEvent?: boolean;
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

  const serviceGroupColorMap = useMemo(() => {
    const map: Record<string, string | null> = {};
    serviceGroups.forEach((sg) => {
      map[sg.id] = sg.color;
    });
    return map;
  }, [serviceGroups]);

  const { data: staffs, isLoading: isStaffsLoading } = useStaffs(
    currentBusiness?.id,
  );

  const { mutate: saveServiceEvent } = useSaveServiceEvent(currentBusiness);

  const services = useMemo(() => {
    return serviceGroups?.map((sg) => sg.services)?.flat() || [];
  }, [serviceGroups]);

  // Using useMemo here causes a bug where the calendar doesn't update.
  const serviceEvents =
    (data || [])
      .map(
        (sg) =>
          sg.service_events?.map((se) => {
            const baseEvent = {
              ...se,
              title: se.service.title,
              duration: se.service.duration,
              price: se.service.price,
              color: serviceGroupColorMap[sg.id],
            };

            if (
              se.recurrence_start &&
              se.recurrence_count &&
              se.recurrence_interval
            ) {
              const calEvents = [];
              const eventStart = new Date(se.start);
              const recurrenceStart = new Date(se.recurrence_start);

              if (isSameDay(recurrenceStart, eventStart)) {
                calEvents.push({
                  ...baseEvent,
                  start: eventStart,
                  end: addMilliseconds(recurrenceStart, se.service.duration),
                });
              }

              const numJumps =
                Math.floor(
                  (recurrenceStart.getTime() - eventStart.getTime()) /
                    se.recurrence_interval,
                ) + 1;
              const firstRecurringStart = add(eventStart, {
                hours: numJumps * millisecondsToHours(se.recurrence_interval),
              });
              const recurrenceEnd = add(firstRecurringStart, {
                hours: millisecondsToHours(
                  se.recurrence_count * se.recurrence_interval,
                ),
              });
              for (
                let i = firstRecurringStart;
                i < recurrenceEnd;
                i = add(i, {
                  hours: millisecondsToHours(se.recurrence_interval),
                })
              ) {
                calEvents.push({
                  ...baseEvent,
                  start: i,
                  end: addMilliseconds(i, se.service.duration),
                  isRecurrentEvent: true,
                });
              }
              return calEvents;
            }
            return {
              ...baseEvent,
              start: new Date(se?.start || ""),
              end: addMilliseconds(
                new Date(se?.start || ""),
                se.service.duration,
              ),
            };
          }),
      )
      ?.flat(2) || [];

  const openUpdateServiceEventDialog = (event: CalEvent, start: Date) => {
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
      isRecurrentEvent: event.isRecurrentEvent,
    });
  };

  // When the user moves an existing event, we open the dialog to edit it.
  const onEventDrop = useCallback((args: EventInteractionArgs<CalEvent>) => {
    saveServiceEvent({
      id: args.event.id,
      start: (args.start as Date).toISOString(),
      service_id: args.event.service.id,
      service: args.event.service,
    });
  }, []);

  // When the user clicks on an existing event, we open the dialog to edit it.
  const onSelectEvent = useCallback((event: CalEvent) => {
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
    setSvcEventDialogState({
      isOpen: true,
      data: {
        service_id: draggedServiceRef.current?.id,
        start: args.start as Date,
        recurrence_count: undefined,
        recurrence_interval: undefined,
        recurrence_start: undefined,
      },
    });
  }, []);

  const onNavigate = useCallback(
    (newDate: Date, view: View, action: NavigateAction) => {
      // This function does nothing other than enable navigation on the calendar atm.
    },
    [],
  );

  const handleOnServiceDrag = (draggedService: Tables<"service">) => {
    draggedServiceRef.current = draggedService;
  };

  if (isBusinessScheduleDataLoading || isServicesLoading || isStaffsLoading) {
    // todo - add a loading state.
    return <>Loading...</>;
  }

  return (
    <div className="flex h-full flex-col gap-x-8 overflow-y-auto overscroll-contain">
      <SaveServiceEventDialog
        {...svcEventDialogState}
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
              {services.map((svc) => (
                <Badge
                  draggable={true}
                  className="cursor-pointer"
                  style={{
                    background: serviceGroupColorMap[svc.service_group_id!],
                  }}
                  key={svc.id}
                  onDragStart={() => handleOnServiceDrag(svc)}
                >
                  {svc.title}
                </Badge>
              ))}
            </div>
          </>
        )}
      </div>
      <div className="overflow-scroll text-sm">
        <DnDCalendar
          defaultDate={today}
          view={calView}
          onDropFromOutside={onDropFromOutside}
          events={serviceEvents}
          eventPropGetter={(event: CalEvent) => ({
            className: "isDraggable text-sm",
            style: event.color && { background: event.color },
          })}
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
          onNavigate={onNavigate}
        />
      </div>
    </div>
  );
}
