"use client";
import { Checkbox } from "@/src/components/ui/checkbox";
import { toast } from "@/src/components/ui/use-toast";
import { Day } from "@/src/consts/availability";
import {
  deleteWeeklyAvailabilitySlot,
  getWeeklyAvailabilitySlotsBySchedule,
  saveWeeklyAvailabilitySlots,
} from "@/src/data/availability";
import { useSupaMutation, useSupaQuery } from "@/src/hooks/use-supabase";
import { Tables } from "@/types/db.extension";
import _ from "lodash";
import SlotControls, {
  Slot,
  constructNewSlot,
  validateSlotChange,
} from "./slot-controls";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu";
import { Button } from "@/src/components/ui/button";
import { CopyIcon, PlusIcon } from "lucide-react";
import { TrashIcon } from "@heroicons/react/24/outline";

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
  const { mutate: saveSlots, isPending: isSavingSlot } = useSupaMutation(
    saveWeeklyAvailabilitySlots,
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
      saveSlots([
        {
          day,
          start: 18 * 30 * 60 * 1000,
          end: 34 * 30 * 60 * 1000,
          availability_schedule_id: scheduleId,
        },
      ]);
    }
  };

  const handleOnSlotStartChange = (slot: Slot, newStart: number) => {
    const newSlot = {
      ...slot,
      start: newStart,
    } as Tables<"availability_weekly_slots">;
    if (validateSlotChange(newSlot, newSlot.day, weeklySlots)) {
      saveSlots([newSlot]);
    }
  };

  const handleOnSlotEndChange = (slot: Slot, newEnd: number) => {
    const newSlot = {
      ...slot,
      end: newEnd,
    } as Tables<"availability_weekly_slots">;
    if (validateSlotChange(newSlot, newSlot.day, weeklySlots)) {
      saveSlots([newSlot]);
    }
  };

  const handleOnSlotAdd = (day: string) => {
    const { start, end } = constructNewSlot(weeklySlots, day);
    saveSlots([
      {
        day,
        start,
        end,
        availability_schedule_id: scheduleId,
      },
    ]);
  };

  const handleOnSlotCopy = (slots: Slot[], day: string) => {
    saveSlots(
      slots.map((s) => ({
        day,
        start: s.start,
        end: s.end,
        availability_schedule_id: scheduleId,
      })),
    );
  };

  const handleOnSlotDelete = (slot: Slot) => {
    deleteSlot({
      slotId: slot.id,
    });
  };

  const handleOnDayDelete = (day: string) => {
    deleteSlot({ day });
  };

  return (
    <div className="col-span-3 flex flex-col gap-y-1 p-1">
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
            <>
              <SlotControls
                slots={weeklySlots}
                day={day}
                disabled={isSavingSlot || isDeletingSlot}
                onSlotStartChange={handleOnSlotStartChange}
                onSlotEndChange={handleOnSlotEndChange}
                onSlotAdd={handleOnSlotAdd}
                onSlotDelete={handleOnSlotDelete}
              />
              <div className="flex shrink-0">
                <Button
                  disabled={isSavingSlot || isDeletingSlot}
                  onClick={() => {
                    handleOnSlotAdd(day);
                  }}
                  variant="ghost"
                  className="px-3 py-1"
                >
                  <PlusIcon className="h-4 w-4" />
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="px-3 py-1">
                      <CopyIcon className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuLabel>Copy to day</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {Object.values(Day).map((val) => (
                      <DropdownMenuItem
                        key={val}
                        className="cursor-pointer"
                        onSelect={() => {
                          handleOnSlotCopy(weeklySlots[day], val);
                          toast({
                            title: "Copied",
                            description: `Copied availability to ${val}`,
                            variant: "success",
                          });
                        }}
                      >
                        {val}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button
                  variant={"ghost"}
                  className="px-3 py-1"
                  onClick={() => {
                    handleOnDayDelete(day);
                  }}
                >
                  <TrashIcon className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </>
          ) : (
            <p className="mt-1.5 text-sm text-muted-foreground">Unavailable</p>
          )}
        </div>
      ))}
    </div>
  );
}
