"use client";

import InputDateTimePicker from "@/src/components/ui/input/date-time-picker";
import {
  deleteAvailabilitySlotOverride,
  getAvailabilitySlotOverridesBySchedule,
  saveAvailabilitySlotOverride,
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
import { TrashIcon } from "@heroicons/react/24/outline";
import { format, isSameDay } from "date-fns";

type SlotOverridesProps = {
  scheduleId: string;
};

export default function SlotOverrides({ scheduleId }: SlotOverridesProps) {
  const { data, isLoading } = useSupaQuery(
    getAvailabilitySlotOverridesBySchedule,
    scheduleId,
    {
      queryKey: ["getAvailabilitySlotOverridesBySchedule", scheduleId],
    },
  );
  const { mutate: saveSlot, isPending: isSavingSlot } = useSupaMutation(
    saveAvailabilitySlotOverride,
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
      saveSlot(newSlot);
    }
  };

  const handleOnSlotEndChange = (slot: Slot, newEnd: number) => {
    const newSlot = {
      ...slot,
      end: newEnd,
    } as Tables<"availability_slot_overrides">;
    if (validateSlotChange(newSlot, newSlot.date, slotOverrides)) {
      saveSlot(newSlot);
    }
  };

  const handleOnSlotAdd = (date: string) => {
    const { start, end } = constructNewSlot(slotOverrides, date);
    saveSlot({
      date,
      start,
      end,
      availability_schedule_id: scheduleId,
    });
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
        title: `Overrides for date ${format(
          new Date(date),
          "MM/dd/yyyy",
        )} already exists.`,
        variant: "destructive",
      });
      return;
    }

    saveSlot({
      date,
      start: 18 * 30 * 60 * 1000,
      end: 34 * 30 * 60 * 1000,
      availability_schedule_id: scheduleId,
    });
  };

  const slotOverrides = _.groupBy(data, "date");

  return (
    <div className="col-span-1">
      <p className="font-medium text-muted-foreground">Date specific hours</p>
      <p className="text-sm text-muted-foreground">
        Override your availability for particular dates when your hours deviate
        from your usual weekly schedule.
      </p>

      {Object.keys(slotOverrides).map((date) => (
        <div key={date} className="mt-2 flex flex-col space-y-2">
          <div className="mt-2 flex h-fit items-center space-x-2">
            <div className="flex-1">
              <p className="text-sm font-medium">
                {new Date(date).toDateString()}
              </p>
            </div>
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
            <SlotControls
              slots={slotOverrides}
              day={date}
              disabled={isSavingSlot || isDeletingSlot}
              onSlotStartChange={handleOnSlotStartChange}
              onSlotEndChange={handleOnSlotEndChange}
              onSlotAdd={handleOnSlotAdd}
              onSlotDelete={handleOnSlotDelete}
            />
          )}
        </div>
      ))}
      <InputDateTimePicker
        className="mt-6"
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
