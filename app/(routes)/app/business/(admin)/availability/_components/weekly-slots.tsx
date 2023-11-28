import { Checkbox } from "@/src/components/ui/checkbox";
import InputSelect from "@/src/components/ui/input/select";
import { Day } from "@/src/consts/availability";
import { getWeeklyAvailabilitySlotsBySchedule } from "@/src/data/availability";
import { useSupaQuery } from "@/src/hooks/use-supabase";
import { add, format, startOfDay } from "date-fns";

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

  if (isLoading) {
    return <>Loading...</>;
  }

  const handleOnDayAvailabilityChange = (
    day: string,
    isAvailable: string | boolean,
  ) => {
    console.log(isAvailable);
  };

  return (
    <div className="col-span-1 flex flex-col gap-y-2">
      <p className="font-medium text-muted-foreground">Weekly hours</p>

      {Object.keys(Day).map((day) => (
        <div key={day} className="flex items-center space-x-2">
          <Checkbox
            id="day_availability"
            onCheckedChange={(checked) => {
              handleOnDayAvailabilityChange(day, checked);
            }}
          />
          <label
            htmlFor="day_availability"
            className="w-[100px] text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            {day}
          </label>
          <div className="flex flex-1 items-center gap-x-2">
            <InputSelect
              className="w-[120px]"
              options={Array.from(
                { length: 48 },
                (_, i) => i * 30 * 60 * 1000,
              ).map((time) => ({
                label: `${format(
                  add(startOfDay(new Date()), {
                    seconds: time / 1000,
                  }),
                  "h:mm a",
                )}`,
                value: time,
              }))}
            />
            <span>-</span>
            <InputSelect
              className="w-[120px]"
              options={Array.from(
                { length: 48 },
                (_, i) => i * 30 * 60 * 1000,
              ).map((time) => ({
                label: `${format(
                  add(startOfDay(new Date()), {
                    seconds: time / 1000,
                  }),
                  "h:mm a",
                )}`,
                value: time,
              }))}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
