"use client";

import InputDateTimePicker from "@/src/components/ui/input/date-time-picker";
import {
  deleteAvailabilitySlotOverride,
  getAvailabilitySlotOverridesBySchedule,
  saveAvailabilitySlotOverrides,
} from "@/src/data/availability";
import { useSupaMutation, useSupaQuery } from "@/src/hooks/use-supabase";
import _ from "lodash";
import SlotControls, {
  Slot,
  constructNewSlot,
  validateSlotChange,
} from "./slot-controls";
import { toast } from "@/src/components/ui/use-toast";
import { Tables } from "@/types/db.extension";
import { Button } from "@/src/components/ui/button";
import { isSameDay } from "date-fns";
import { CopyIcon, PlusIcon } from "lucide-react";
import { TrashIcon } from "@heroicons/react/24/outline";
import { cn } from "@/src/utils";

type SlotOverridesProps = {
  scheduleId: string;
  className?: string;
};

export default function SlotOverrides({
  scheduleId,
  className,
}: SlotOverridesProps) {
  const { data, isLoading } = useSupaQuery(
    getAvailabilitySlotOverridesBySchedule,
    scheduleId,
    {
      queryKey: ["getAvailabilitySlotOverridesBySchedule", scheduleId],
    },
  );
  const { mutate: saveSlots, isPending: isSavingSlot } = useSupaMutation(
    saveAvailabilitySlotOverrides,
    {
      invalidate: [["getAvailabilitySlotOverridesBySchedule", scheduleId]],
      onSuccess: () => {
        toast({
          title: "Time slot updated.",
          variant: "success",
        });
      },
    },
  );
  const { mutate: deleteSlot, isPending: isDeletingSlot } = useSupaMutation(
    deleteAvailabilitySlotOverride,
    {
      invalidate: [["getAvailabilitySlotOverridesBySchedule", scheduleId]],
      onSuccess: () => {
        toast({
          title: "Time slot updated.",
          variant: "success",
        });
      },
    },
  );

  if (isLoading) {
    return <>Loading...</>;
  }

  const handleOnSlotStartChange = (slot: Slot, newStart: number) => {
    const newSlot = {
      ...slot,
      start: newStart,
    } as Tables<"availability_slot_overrides">;
    if (validateSlotChange(newSlot, newSlot.date, slotOverrides)) {
      saveSlots([newSlot]);
    }
  };

  const handleOnSlotEndChange = (slot: Slot, newEnd: number) => {
    const newSlot = {
      ...slot,
      end: newEnd,
    } as Tables<"availability_slot_overrides">;
    if (validateSlotChange(newSlot, newSlot.date, slotOverrides)) {
      saveSlots([newSlot]);
    }
  };

  const handleOnSlotAdd = (date: string) => {
    const { start, end } = constructNewSlot(slotOverrides, date);
    saveSlots([
      {
        date,
        start,
        end,
        availability_schedule_id: scheduleId,
      },
    ]);
  };

  const handleOnSlotDelete = (slot: Slot) => {
    deleteSlot({
      slotId: slot.id,
    });
  };

  const handleOnDateDelete = (date: string) => {
    deleteSlot({ date });
  };

  const handleOnDateAdd = (date: string) => {
    if (
      Object.keys(slotOverrides).some((d) =>
        isSameDay(new Date(d), new Date(date)),
      )
    ) {
      toast({
        title: `Overrides for date "${new Date(
          date,
        ).toDateString()}" already exists.`,
        variant: "destructive",
      });
      return;
    }

    saveSlots([
      {
        date,
        start: 18 * 30 * 60 * 1000,
        end: 34 * 30 * 60 * 1000,
        availability_schedule_id: scheduleId,
      },
    ]);
  };

  const handleOnSlotsCopy = (slots: Slot[], date: string) => {
    saveSlots(
      slots.map((s) => ({
        date,
        start: s.start,
        end: s.end,
        availability_schedule_id: scheduleId,
      })),
    );
  };

  const slotOverrides = _.groupBy(data, "date");

  return (
    <div className={cn(className)}>
      <p className="font-medium text-muted-foreground">Date specific hours</p>
      <p className="text-sm text-muted-foreground">
        Override your availability for particular dates when your hours deviate
        from your usual weekly schedule.
      </p>

      {Object.keys(slotOverrides).map((date) => (
        <div key={date} className="mt-2 flex flex-col space-y-2">
          <div className="mt-1 flex h-fit shrink-0 items-center space-x-2">
            <div className="flex-1">
              <p className="text-sm font-medium">
                {new Date(date).toDateString()}
              </p>
            </div>
            <Button
              disabled={isSavingSlot || isDeletingSlot}
              onClick={() => {
                handleOnSlotAdd(date);
              }}
              variant="ghost"
              className="px-3 py-1"
            >
              <PlusIcon className="h-4 w-4" />
            </Button>
            <InputDateTimePicker
              button={
                <Button variant="ghost" className="px-3 py-1">
                  <CopyIcon className="h-4 w-4" />
                </Button>
              }
              disableTimePicker
              disablePastDays
              onChange={(val) => {
                handleOnSlotsCopy(slotOverrides[date], val.date.toISOString());
              }}
            />{" "}
            <Button
              variant={"ghost"}
              className="px-3 py-1"
              onClick={() => {
                handleOnDateDelete(date);
              }}
            >
              <TrashIcon className="h-4 w-4 text-destructive" />
            </Button>
          </div>

          {Boolean(slotOverrides[date]) && slotOverrides[date].length > 0 && (
            <div className="flex">
              <SlotControls
                slots={slotOverrides}
                day={date}
                disabled={isSavingSlot || isDeletingSlot}
                onSlotStartChange={handleOnSlotStartChange}
                onSlotEndChange={handleOnSlotEndChange}
                onSlotAdd={handleOnSlotAdd}
                onSlotDelete={handleOnSlotDelete}
              />
              <div className="shrink-0"></div>
            </div>
          )}
        </div>
      ))}
      <InputDateTimePicker
        className={"mt-2"}
        disableTimePicker
        disablePastDays
        inputProps={{
          placeholder: "Add date",
        }}
        onChange={(val) => {
          handleOnDateAdd(val.date.toISOString());
        }}
      />
    </div>
  );
}
