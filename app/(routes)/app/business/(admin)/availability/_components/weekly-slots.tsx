"use client";
import { Checkbox } from "@/src/components/ui/checkbox";
import { toast } from "@/src/components/ui/use-toast";
import { Day } from "@/src/consts/availability";
import {
  deleteWeeklyAvailabilitySlot,
  getWeeklyAvailabilitySlotsBySchedule,
  saveWeeklyAvailabilitySlot,
} from "@/src/data/availability";
import { useSupaMutation, useSupaQuery } from "@/src/hooks/use-supabase";
import { Tables } from "@/types/db.extension";
import _ from "lodash";
import SlotControls, {
  Slot,
  constructNewSlot,
  validateSlotChange,
} from "./slot-controls";

type WeeklySlotsProps = {
  scheduleId: string;
};
export default function WeeklySlots({ scheduleId }: WeeklySlotsProps) {
  const { data, isLoading } = useSupaQuery(
    getWeeklyAvailabilitySlotsBySchedule,
    scheduleId,
    {
      queryKey: ["getWeeklyAvailabilitySlotsBySchedule", scheduleId],
    },
  );
  const { mutate: saveSlot, isPending: isSavingSlot } = useSupaMutation(
    saveWeeklyAvailabilitySlot,
    {
      invalidate: [["getWeeklyAvailabilitySlotsBySchedule", scheduleId]],
      onSuccess: () => {
        toast({
          title: "Time slot updated.",
          variant: "success",
        });
      },
    },
  );
  const { mutate: deleteSlot, isPending: isDeletingSlot } = useSupaMutation(
    deleteWeeklyAvailabilitySlot,
    {
      invalidate: [["getWeeklyAvailabilitySlotsBySchedule", scheduleId]],
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

  const weeklySlots = _.groupBy(data, "day");

  const handleOnDayAvailabilityChange = (
    day: string,
    isAvailable: string | boolean,
  ) => {
    if (!isAvailable) {
      deleteSlot({
        day,
      });
    } else {
      saveSlot({
        day,
        start: 18 * 30 * 60 * 1000,
        end: 34 * 30 * 60 * 1000,
        availability_schedule_id: scheduleId,
      });
    }
  };

  const handleOnSlotStartChange = (slot: Slot, newStart: number) => {
    const newSlot = {
      ...slot,
      start: newStart,
    } as Tables<"availability_weekly_slots">;
    if (validateSlotChange(newSlot, newSlot.day, weeklySlots)) {
      saveSlot(newSlot);
    }
  };

  const handleOnSlotEndChange = (slot: Slot, newEnd: number) => {
    const newSlot = {
      ...slot,
      end: newEnd,
    } as Tables<"availability_weekly_slots">;
    if (validateSlotChange(newSlot, newSlot.day, weeklySlots)) {
      saveSlot(newSlot);
    }
  };

  const handleOnSlotAdd = (day: string) => {
    const { start, end } = constructNewSlot(weeklySlots, day);
    saveSlot({
      day,
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

  return (
    <div className="col-span-1 flex flex-col gap-y-1 p-1">
      <p className="font-medium text-muted-foreground">Weekly hours</p>

      {Object.keys(Day).map((day) => (
        <div key={day} className="mt-4 flex space-x-2">
          <div className="mt-2 flex h-fit items-center space-x-2">
            <Checkbox
              id={day}
              checked={Boolean(weeklySlots[day]) && weeklySlots[day].length > 0}
              onCheckedChange={(checked) => {
                handleOnDayAvailabilityChange(day, checked);
              }}
            />
            <label
              htmlFor={day}
              className="w-[60px] text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              {day}
            </label>
          </div>

          {Boolean(weeklySlots[day]) && weeklySlots[day].length > 0 ? (
            <SlotControls
              slots={weeklySlots}
              day={day}
              disabled={isSavingSlot || isDeletingSlot}
              onSlotStartChange={handleOnSlotStartChange}
              onSlotEndChange={handleOnSlotEndChange}
              onSlotAdd={handleOnSlotAdd}
              onSlotDelete={handleOnSlotDelete}
            />
          ) : (
            <p className="mt-1.5 text-sm text-muted-foreground">Unavailable</p>
          )}
        </div>
      ))}
    </div>
  );
}
