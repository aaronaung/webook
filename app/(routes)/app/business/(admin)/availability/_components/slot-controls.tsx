import { Button } from "@/src/components/ui/button";
import InputSelect from "@/src/components/ui/input/select";
import { toast } from "@/src/components/ui/use-toast";
import { Tables } from "@/types/db.extension";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { add, format, startOfDay } from "date-fns";

export const validateSlotChange = (
  newSlot: Slot,
  newSlotKey: string,
  slots: Record<string, Slot[]>,
) => {
  if (newSlot.end < newSlot.start) {
    toast({
      title: "Change prevented",
      description: `You selected an end time ${formatOffsetFromDayStart(
        newSlot.end,
      )} which is before the start time ${formatOffsetFromDayStart(
        newSlot.start,
      )}.`,
      variant: "destructive",
      duration: 60000,
    });
    return false;
  }
  for (const slot of slots[newSlotKey]) {
    if (slot.id !== newSlot.id) {
      if (
        (newSlot.start >= slot.start && newSlot.start < slot.end) ||
        (newSlot.end > slot.start && newSlot.end <= slot.end)
      ) {
        toast({
          title: "Change prevented",
          description: `Time slot ${formatOffsetFromDayStart(
            newSlot.start,
          )} - ${formatOffsetFromDayStart(
            newSlot.end,
          )} overlaps with another time slot on the same day.`,
          variant: "destructive",
          duration: 60000,
        });
        return false;
      }
    }
  }
  return true;
};

export const formatOffsetFromDayStart = (offset: number) => {
  return format(
    add(startOfDay(new Date()), {
      seconds: offset / 1000,
    }),
    "h:mm a",
  );
};

export const timeSlotOptions = Array.from(
  { length: 48 }, // 48 half hour slots in a day
  (_, i) => i * 30 * 60 * 1000, // 30 minutes in milliseconds
).map((time) => {
  return {
    label: `${formatOffsetFromDayStart(time)}`,
    value: time,
  };
});

export const constructNewSlot = (
  slots: Record<string, Slot[]>,
  slotKey: string,
) => {
  let maxEnd = 0;
  for (const slot of slots[slotKey] || []) {
    if (slot.end > maxEnd) {
      maxEnd = slot.end;
    }
  }
  let latestTimeSlot = timeSlotOptions[timeSlotOptions.length - 1].value;

  let newStart = maxEnd + 60 * 60 * 1000;
  newStart = newStart > latestTimeSlot ? newStart - latestTimeSlot : newStart;

  let newEnd = newStart + 60 * 60 * 1000;
  newEnd = newEnd > latestTimeSlot ? newEnd - latestTimeSlot : newEnd;

  return {
    start: newStart,
    end: newEnd,
  };
};

export type Slot =
  | Tables<"availability_slot_overrides">
  | Tables<"availability_weekly_slots">;

type SlotControlsProps = {
  slots: Record<string, Slot[]>;
  day: string;
  disabled: boolean;
  onSlotStartChange: (slot: Slot, newStart: number) => void;
  onSlotEndChange: (slot: Slot, newEnd: number) => void;
  onSlotAdd: (day: string) => void;
  onSlotDelete: (slot: Slot) => void;
};
export default function SlotControls({
  slots,
  day,
  disabled,
  onSlotStartChange,
  onSlotEndChange,
  onSlotAdd,
  onSlotDelete,
}: SlotControlsProps) {
  return (
    <div className="flex flex-1">
      <div className="flex flex-1 flex-col gap-y-2">
        {slots[day].map((slot) => (
          <div key={slot.id} className="flex items-center gap-x-2">
            <InputSelect
              className="w-[105px]"
              value={slot.start}
              disabled={disabled}
              options={timeSlotOptions}
              onChange={(newStart) => {
                onSlotStartChange(slot, newStart);
              }}
            />
            <span>-</span>
            <InputSelect
              className="w-[105px]"
              value={slot.end}
              disabled={disabled}
              options={timeSlotOptions}
              onChange={(newEnd) => {
                onSlotEndChange(slot, newEnd);
              }}
            />
            <Button
              variant="ghost"
              disabled={disabled}
              onClick={() => {
                onSlotDelete(slot);
              }}
              className="px-3 py-1"
            >
              <XMarkIcon className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
