"use client";
import { Button } from "@/src/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/src/components/ui/card";
import _ from "lodash";
import { useRouter } from "next/navigation";
import { useCallback, useRef, useState } from "react";
import { SlotInfo } from "react-big-calendar";
import { Badge } from "@/src/components/ui/badge";
import { Tables } from "@/types/db.extension";
import {
  DragFromOutsideItemArgs,
  EventInteractionArgs,
} from "react-big-calendar/lib/addons/dragAndDrop";
import { SaveServiceEventFormSchemaType } from "@/src/components/forms/save-service-event-form";
import { SaveServiceEventDialog } from "@/src/components/dialogs/save-service-event-dialog";
import ScheduleCalendar, { CalEvent } from "./_components/calendar";
import { useCurrentBusinessContext } from "@/src/contexts/current-business";
import { useSupaMutation, useSupaQuery } from "@/src/hooks/use-supabase";
import { getBusinessData } from "@/src/data/business";
import { saveServiceEvent } from "@/src/data/service";
import { toast } from "@/src/components/ui/use-toast";

export default function SchedulePage() {
  const router = useRouter();
  const { currentBusiness } = useCurrentBusinessContext();
  const draggedServiceRef = useRef<Tables<"services"> | null>(null);
  const [svcEventDialogState, setSvcEventDialogState] = useState<{
    isOpen: boolean;
    initFormValues?: Partial<SaveServiceEventFormSchemaType>;
    isRecurrentEvent?: boolean;
  }>({
    isOpen: false,
  });

  const { data: businessData, isLoading: isBusinessDataLoading } = useSupaQuery(
    getBusinessData,
    currentBusiness.handle,
    { queryKey: ["getBusinessData", currentBusiness.handle] },
  );
  const { mutate: _saveServiceEvent } = useSupaMutation(saveServiceEvent, {
    // todo: potential optimization here: this is inefficient, we refetch the entire schedule.
    invalidate: [["getBusinessScheduleByTimeRange", currentBusiness.handle]],
  });

  const openUpdateServiceEventDialog = (event: CalEvent, start: Date) => {
    setSvcEventDialogState({
      isOpen: true,
      initFormValues: {
        id: event.id,
        start,
        recurrence_count: event.recurrence_count ?? undefined,
        recurrence_interval: event.recurrence_interval ?? undefined,
        recurrence_start: event.recurrence_start
          ? new Date(event.recurrence_start)
          : undefined,
        service_id: event.service.id,
        staff_ids: event.staffs?.map((s) => s.id),
        live_stream: event.live_stream,
      },
      isRecurrentEvent: event.isRecurrentEvent,
    });
  };

  // When the user moves an existing event, we open the dialog to edit it.
  const onEventDrop = useCallback((args: EventInteractionArgs<CalEvent>) => {
    if (args.event.isRecurrentEvent) {
      toast({
        description: "Recurring events cannot be moved.",
        duration: 4000,
        variant: "destructive",
      });
      return;
    }
    _saveServiceEvent({
      serviceEvent: {
        id: args.event.id,
        start: (args.start as Date).toISOString(),
        service_id: args.event.service.id,
      },
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
      initFormValues: {
        start: slotInfo.start,
      },
    });
  }, []);

  const onDropFromOutside = useCallback((args: DragFromOutsideItemArgs) => {
    setSvcEventDialogState({
      isOpen: true,
      initFormValues: {
        service_id: draggedServiceRef.current?.id,
        start: args.start as Date,
      },
    });
  }, []);

  const handleOnServiceDrag = (draggedService: Tables<"services">) => {
    draggedServiceRef.current = draggedService;
  };

  if (isBusinessDataLoading) {
    // todo - add a loading state.
    return <>Loading...</>;
  }

  return (
    <div className="flex h-full flex-col gap-x-8 overflow-y-auto overscroll-contain">
      <SaveServiceEventDialog
        {...svcEventDialogState}
        onClose={() =>
          setSvcEventDialogState({
            ...svcEventDialogState,
            isOpen: !svcEventDialogState.isOpen,
          })
        }
        availableServices={businessData?.services || []}
        availableStaffs={businessData?.staffs || []}
      />
      <div className="mb-2 flex-shrink-0">
        {_.isEmpty(businessData?.services) ? (
          <>
            <Card className="w-full ">
              <CardHeader>
                <h3 className="text-medium font-semibold">No services found</h3>
                <CardDescription>
                  In order to add events to your calendar, you must first define
                  services your business offers.
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
              {(businessData?.services || []).map((svc) => (
                <Badge
                  draggable={true}
                  className="cursor-pointer"
                  style={{
                    background: svc.color,
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
      <ScheduleCalendar
        onDropFromOutside={onDropFromOutside}
        onEventDrop={onEventDrop}
        onSelectEvent={onSelectEvent}
        onSelectSlot={onSelectSlot}
      />
    </div>
  );
}
