"use client";

import { Button } from "@/src/components/ui/button";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuTrigger,
} from "@/src/components/ui/context-menu";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/src/components/ui/tabs";
import { useCurrentBusinessContext } from "@/src/contexts/current-business";
import {
  deleteAvailabilitySchedule,
  getAvailabilitySchedules,
} from "@/src/data/availability";
import { useSupaMutation, useSupaQuery } from "@/src/hooks/use-supabase";
import {
  ClockIcon,
  PencilSquareIcon,
  PlusIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import WeeklySlots from "./_components/weekly-slots";
import SlotOverrides from "./_components/slot-overrides";
import { SaveAvailabilityScheduleDialog } from "@/src/components/dialogs/save-availability-schedule-dialog";
import { SaveAvailabilityScheduleFormSchemaType } from "@/src/components/forms/save-availability-schedule-form";
import { useState } from "react";
import { DeleteConfirmationDialog } from "@/src/components/dialogs/delete-confirmation-dialog";
import EmptyState from "@/src/components/common/empty-state";
import { useSearchParams } from "next/navigation";

export default function Availability() {
  const { currentBusiness } = useCurrentBusinessContext();
  const searchParams = useSearchParams();
  const {
    data: availabilitySchedules,
    isLoading: isLoadingAvailabilitySchedules,
  } = useSupaQuery(getAvailabilitySchedules, currentBusiness.id, {
    queryKey: ["getAvailabilitySchedules", currentBusiness.id],
  });

  const {
    mutate: _deleteAvailabilitySchedule,
    isPending: isDeletingAvailabilitySchedule,
  } = useSupaMutation(deleteAvailabilitySchedule, {
    invalidate: [["getAvailabilitySchedules", currentBusiness.id]],
  });

  const [scheduleDialogState, setScheduleDialogState] = useState<{
    isOpen: boolean;
    initFormValues?: SaveAvailabilityScheduleFormSchemaType;
  }>({
    isOpen: false,
  });

  const [confirmDeleteDialogState, setConfirmDeleteDialogState] = useState<{
    isOpen: boolean;
    scheduleId?: string;
  }>({
    isOpen: false,
  });

  if (isLoadingAvailabilitySchedules) {
    return <>Loading...</>;
  }

  return (
    <div>
      <SaveAvailabilityScheduleDialog
        isOpen={scheduleDialogState.isOpen}
        onClose={() => setScheduleDialogState({ isOpen: false })}
        initFormValues={scheduleDialogState.initFormValues}
      />
      <DeleteConfirmationDialog
        isOpen={confirmDeleteDialogState.isOpen}
        onClose={() => setConfirmDeleteDialogState({ isOpen: false })}
        label="Are you sure? This will delete the availability schedule and all its associated slots."
        onDelete={() => {
          if (
            !isDeletingAvailabilitySchedule &&
            confirmDeleteDialogState.scheduleId
          ) {
            _deleteAvailabilitySchedule(confirmDeleteDialogState.scheduleId);
          }
        }}
      />
      {(availabilitySchedules || []).length < 1 ? (
        <EmptyState
          Icon={ClockIcon}
          title="No availability schedule found"
          description="Availability schedule allows your clients to book services in your desired availability schedule."
          actionButtonText="Start by creating one"
          onAction={() =>
            setScheduleDialogState({
              initFormValues: undefined,
              isOpen: true,
            })
          }
        />
      ) : (
        <Tabs
          defaultValue={
            searchParams.get("id") || availabilitySchedules?.[0]?.id
          }
        >
          <div className="mb-8 flex max-w-full items-center overflow-x-scroll">
            <TabsList className="relative overflow-visible">
              {(availabilitySchedules || []).map((schedule) => (
                <ContextMenu key={schedule.id}>
                  <ContextMenuTrigger>
                    <TabsTrigger key={schedule.id} value={schedule.id}>
                      {schedule.name}
                    </TabsTrigger>
                  </ContextMenuTrigger>
                  <ContextMenuContent className="w-fit min-w-[200px]">
                    <ContextMenuLabel inset>{schedule.name}</ContextMenuLabel>
                    <ContextMenuSeparator />
                    <ContextMenuItem
                      inset
                      onClick={() =>
                        setScheduleDialogState({
                          initFormValues: schedule,
                          isOpen: !scheduleDialogState.isOpen,
                        })
                      }
                    >
                      Edit
                      <ContextMenuShortcut>
                        <PencilSquareIcon className="h-5 w-5" />
                      </ContextMenuShortcut>
                    </ContextMenuItem>
                    <ContextMenuItem
                      inset
                      onClick={() => {
                        setConfirmDeleteDialogState({
                          isOpen: true,
                          scheduleId: schedule.id,
                        });
                      }}
                    >
                      Delete
                      <ContextMenuShortcut>
                        <TrashIcon className="h-5 w-5 text-destructive" />
                      </ContextMenuShortcut>
                    </ContextMenuItem>
                  </ContextMenuContent>
                </ContextMenu>
              ))}
            </TabsList>
            <Button
              className="ml-2"
              onClick={() =>
                setScheduleDialogState({
                  initFormValues: undefined,
                  isOpen: !scheduleDialogState.isOpen,
                })
              }
            >
              <PlusIcon className="mr-1 h-5 w-5" /> New schedule
            </Button>
          </div>

          {(availabilitySchedules || []).map((schedule) => (
            <TabsContent key={schedule.id} value={schedule.id}>
              {/** todo - (not important) for mobile, show weekly slots and slot overrides in tabs */}
              <div className="grid w-full grid-cols-1 gap-x-6 sm:grid-cols-5">
                <WeeklySlots
                  className="col-span-1 mb-8 sm:col-span-3"
                  scheduleId={schedule.id}
                />
                <SlotOverrides
                  className="col-span-1 sm:col-span-2"
                  scheduleId={schedule.id}
                />
              </div>
            </TabsContent>
          ))}
        </Tabs>
      )}
    </div>
  );
}
