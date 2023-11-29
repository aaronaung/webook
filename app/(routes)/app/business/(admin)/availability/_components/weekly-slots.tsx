"use client";
import { Button } from "@/src/components/ui/button";
import { Checkbox } from "@/src/components/ui/checkbox";
import InputSelect from "@/src/components/ui/input/select";
import { Day } from "@/src/consts/availability";
import {
  deleteWeeklyAvailabilitySlot,
  getWeeklyAvailabilitySlotsBySchedule,
  saveWeeklyAvailabilitySlot,
} from "@/src/data/availability";
import { useSupaMutation, useSupaQuery } from "@/src/hooks/use-supabase";
import { Tables } from "@/types/db.extension";
import { PlusIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { add, format, startOfDay } from "date-fns";
import _ from "lodash";

const timeSlotOptions = Array.from(
  { length: 48 },
  (_, i) => i * 30 * 60 * 1000,
).map((time) => {
  return {
    label: `${format(
      add(startOfDay(new Date()), {
        seconds: time / 1000,
      }),
      "h:mm a",
    )}`,
    value: time,
  };
});

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
    },
  );
  const { mutate: deleteSlot, isPending: isDeletingSlot } = useSupaMutation(
    deleteWeeklyAvailabilitySlot,
    {
      invalidate: [["getWeeklyAvailabilitySlotsBySchedule", scheduleId]],
    },
  );

  const weeklySlots = _.groupBy(data, "day");

  if (isLoading) {
    return <>Loading...</>;
  }

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

  const handleOnSlotStartChange = (
    slot: Tables<"availability_weekly_slots">,
    newStart: number,
  ) => {
    saveSlot({
      ...slot,
      start: newStart,
    });
  };

  const handleOnSlotEndChange = (
    slot: Tables<"availability_weekly_slots">,
    newEnd: number,
  ) => {
    saveSlot({
      ...slot,
      end: newEnd,
    });
  };

  return (
    <div className="col-span-1 flex flex-col gap-y-2 p-1">
      <p className="font-medium text-muted-foreground">Weekly hours</p>

      {Object.keys(Day).map((day) => (
        <div key={day} className="mt-4 flex space-x-2">
          <div className="mt-2 flex h-fit items-center space-x-2">
            <Checkbox
              id={day}
              checked={weeklySlots[day] && weeklySlots[day].length > 0}
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
          <div className="flex flex-1 flex-col">
            {weeklySlots[day] && weeklySlots[day].length > 0 ? (
              <>
                {weeklySlots[day].map((slot) => (
                  <div key={slot.id} className="flex items-center gap-x-2">
                    <InputSelect
                      className="w-[105px]"
                      value={slot.start}
                      options={timeSlotOptions}
                      onChange={(newStart) => {
                        handleOnSlotStartChange(slot, newStart);
                      }}
                    />
                    <span>-</span>
                    <InputSelect
                      className="w-[105px]"
                      value={slot.end}
                      options={timeSlotOptions}
                      onChange={(newEnd) => {
                        handleOnSlotEndChange(slot, newEnd);
                      }}
                    />
                    <Button
                      variant="ghost"
                      disabled={isDeletingSlot}
                      onClick={() => {
                        deleteSlot({
                          slotId: slot.id,
                        });
                      }}
                      className="px-3 py-1"
                    >
                      <XMarkIcon className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </>
            ) : (
              <p className="mt-1.5 text-sm text-muted-foreground">
                Unavailable
              </p>
            )}
          </div>

          <div className="shrink-0">
            <Button
              disabled={isSavingSlot}
              onClick={() => {
                saveSlot({
                  day,
                  start: 18 * 30 * 60 * 1000,
                  end: 34 * 30 * 60 * 1000,
                  availability_schedule_id: scheduleId,
                });
              }}
              variant="ghost"
              className="px-3 py-1"
            >
              <PlusIcon className="h-4 w-4" />
            </Button>
            {/* <Button onClick={} variant="ghost" className="px-3 py-1">
              <CopyIcon className="h-4 w-4" />
            </Button> */}
          </div>
        </div>
      ))}
    </div>
  );
}
