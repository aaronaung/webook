"use client";
import _ from "lodash";
import { useRouter } from "next/navigation";
import { useCallback, useRef, useState } from "react";
import { SlotInfo } from "react-big-calendar";
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
import { isBefore, startOfDay } from "date-fns";
import EmptyState from "@/src/components/common/empty-state";
import { Square3Stack3DIcon } from "@heroicons/react/24/outline";
import { useConnectedAccountStatus } from "@/src/hooks/use-connected-account-status";
import StripeBusinessAccountGuard from "@/src/components/common/stripe-business-account-guard";

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

  const {
    status: accountStatus,
    statusTitle: accountStatusTitle,
    statusDescription: accountStatusDescription,
    isLoading: isCheckingIfPaymentReady,
  } = useConnectedAccountStatus(currentBusiness);

  const { data: businessData, isLoading: isBusinessDataLoading } = useSupaQuery(
    getBusinessData,
    {
      arg: currentBusiness.handle,
      queryKey: ["getBusinessData", currentBusiness.handle],
    },
  );
  const { mutate: _saveServiceEvent } = useSupaMutation(saveServiceEvent, {
    // todo: potential optimization here: this is inefficient, we refetch the entire schedule.
    invalidate: [["getScheduledEventsInTimeRange", currentBusiness.handle]],
  });

  const openUpdateServiceEventDialog = (event: CalEvent, start: Date) => {
    setSvcEventDialogState({
      isOpen: true,
      initFormValues: {
        id: event.id,
        start,
        end: new Date(event.end),
        recurrence_count: event.recurrence_count ?? undefined,
        recurrence_interval: event.recurrence_interval ?? undefined,
        recurrence_start: event.recurrence_start
          ? new Date(event.recurrence_start)
          : undefined,
        service_id: event.service.id,
        staff_ids: event.staffs?.map((s) => s.id),
        live_stream: event.live_stream,
        availability_schedule_id: event.availability_schedule_id ?? undefined,
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
        start: (args.start as Date).toISOString(), // TODO - ONLY Move the date and not the hour
        end: (args.start as Date).toISOString(), // TODO - ONLY Move the date and not the hour
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
    if (isBefore(slotInfo.start, startOfDay(new Date()))) {
      toast({
        title: "Trying to create an event in the past? 🤔",
        description: "Time travel is prohibited on this platform.",
        duration: 4000,
        variant: "destructive",
      });
      return;
    }
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

  if (isBusinessDataLoading) {
    // todo - add a loading state.
    return <>Loading...</>;
  }

  return (
    <StripeBusinessAccountGuard>
      <div className="flex h-full flex-col gap-x-8 overflow-y-auto overscroll-contain">
        <SaveServiceEventDialog
          {...svcEventDialogState}
          onClose={() =>
            setSvcEventDialogState({
              ...svcEventDialogState,
              isOpen: !svcEventDialogState.isOpen,
            })
          }
          availableServices={
            businessData?.services.filter((s) => !s.availability_schedule_id) ||
            []
          }
          availableStaffs={businessData?.staffs || []}
          availableAvailabilitySchedules={
            businessData?.availability_schedules || []
          }
        />
        <div className="mb-3 flex-shrink-0">
          {_.isEmpty(businessData?.services) ? (
            <EmptyState
              Icon={Square3Stack3DIcon}
              title="No service found"
              description="To schedule events on your calendar, you need to create a service first."
              actionButtonText="Start by creating one"
              onAction={() => router.push("/app/business/services")}
            />
          ) : (
            <>
              <p className="mb-2 text-sm text-muted-foreground">
                You can select a calendar slot to create an event or click on an
                existing event to edit it.
              </p>
            </>
          )}
        </div>
        {!_.isEmpty(businessData?.services) && (
          <ScheduleCalendar
            onDropFromOutside={onDropFromOutside}
            onEventDrop={onEventDrop}
            onSelectEvent={onSelectEvent}
            onSelectSlot={onSelectSlot}
          />
        )}
      </div>
    </StripeBusinessAccountGuard>
  );
}
