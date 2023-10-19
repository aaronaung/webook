"use client";

import { cn } from "@/src/utils";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import {
  add,
  eachDayOfInterval,
  endOfMonth,
  format,
  getDay,
  isEqual,
  isSameMonth,
  isToday,
  parse,
  startOfToday,
} from "date-fns";
import { useState } from "react";

type CalendarV2Props = {
  onDateSelect?: (date: Date) => void;
  defaultSelectedDay?: Date;
  className?: string;
};
export default function CalendarV2({
  onDateSelect,
  defaultSelectedDay,
  className,
}: CalendarV2Props) {
  const today = startOfToday();
  const [selectedDay, setSelectedDay] = useState(defaultSelectedDay || today);
  const [currentMonth, setCurrentMonth] = useState(
    format(defaultSelectedDay || today, "MMM-yyyy"),
  );

  const firstDayCurrentMonth = parse(currentMonth, "MMM-yyyy", new Date());
  const days = eachDayOfInterval({
    start: firstDayCurrentMonth,
    end: endOfMonth(firstDayCurrentMonth),
  });

  function handlePrevMonthClick() {
    const firstDayPrevMonth = add(firstDayCurrentMonth, { months: -1 });
    const currMonth = format(firstDayPrevMonth, "MMM-yyyy");
    setCurrentMonth(currMonth);
  }

  function handleNextMonthClick() {
    const firstDayNextMonth = add(firstDayCurrentMonth, { months: 1 });
    const currMonth = format(firstDayNextMonth, "MMM-yyyy");
    setCurrentMonth(currMonth);
  }

  function handleDateSelect(date: Date) {
    setSelectedDay(date);
    onDateSelect?.(date);
  }

  return (
    <div className={cn(className, "rounded-lg border border-slate-200 p-4")}>
      <div className="flex items-center px-3 pt-2">
        <h2 className="flex-auto font-semibold text-gray-900">
          {format(firstDayCurrentMonth, "MMMM yyyy")}
        </h2>
        <button
          type="button"
          onClick={handlePrevMonthClick}
          className="-my-1.5 flex flex-none items-center justify-center p-1.5 text-gray-400 hover:text-gray-500"
        >
          <span className="sr-only">Previous month</span>
          <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
        </button>
        <button
          onClick={handleNextMonthClick}
          type="button"
          className="-my-1.5 -mr-1.5 ml-2 flex flex-none items-center justify-center p-1.5 text-gray-400 hover:text-gray-500"
        >
          <span className="sr-only">Next month</span>
          <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>
      <div className="mt-10 grid grid-cols-7 text-center text-xs leading-6 text-gray-500">
        <div>S</div>
        <div>M</div>
        <div>T</div>
        <div>W</div>
        <div>T</div>
        <div>F</div>
        <div>S</div>
      </div>
      <div className="mt-2 grid grid-cols-7 text-sm">
        {days.map((day, dayIdx) => (
          <div
            key={day.toString()}
            className={cn(
              dayIdx === 0 && `col-start-${getDay(day) + 1}`,
              "py-1.5",
            )}
          >
            <button
              type="button"
              onClick={() => handleDateSelect(day)}
              className={cn(
                isEqual(day, selectedDay) && "text-white",
                !isEqual(day, selectedDay) && isToday(day) && "text-red-500",
                !isEqual(day, selectedDay) &&
                  !isToday(day) &&
                  isSameMonth(day, firstDayCurrentMonth) &&
                  "text-gray-900",
                !isEqual(day, selectedDay) &&
                  !isToday(day) &&
                  !isSameMonth(day, firstDayCurrentMonth) &&
                  "text-gray-400",
                isEqual(day, selectedDay) && isToday(day) && "bg-red-500",
                isEqual(day, selectedDay) && !isToday(day) && "bg-gray-900",
                !isEqual(day, selectedDay) && "hover:bg-gray-200",
                (isEqual(day, selectedDay) || isToday(day)) && "font-semibold",
                "mx-auto flex h-8 w-8 items-center justify-center rounded-full",
              )}
            >
              <time dateTime={format(day, "yyyy-MM-dd")}>
                {format(day, "d")}
              </time>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
