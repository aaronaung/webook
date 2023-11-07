import DnDCalendar, { localizer } from "@/src/components/ui/dnd-calendar";
import { useCurrentBusinessContext } from "@/src/contexts/current-business";
import { useBusinessScheduleByTimeRange } from "@/src/hooks/use-business-schedule-by-time-range";
import { BusinessServiceEvent } from "@/types";
import {
  add,
  addMilliseconds,
  format,
  isBefore,
  millisecondsToHours,
  parse,
  startOfToday,
} from "date-fns";
import { useCallback, useState } from "react";
import { NavigateAction, SlotInfo, View, Views } from "react-big-calendar";
import {
  DragFromOutsideItemArgs,
  EventInteractionArgs,
} from "react-big-calendar/lib/addons/dragAndDrop";

export type CalEvent = BusinessServiceEvent & {
  isRecurrentEvent?: boolean;
};

type ScheduleCalendarProps = {
  onDropFromOutside: (args: DragFromOutsideItemArgs) => void;
  onEventDrop: (args: EventInteractionArgs<CalEvent>) => void;
  onSelectEvent: (event: CalEvent) => void;
  onSelectSlot: (slotInfo: SlotInfo) => void;
};

export default function ScheduleCalendar({
  onDropFromOutside,
  onEventDrop,
  onSelectEvent,
  onSelectSlot,
}: ScheduleCalendarProps) {
  const today = startOfToday();
  const firstDayCurrentMonth = parse(
    format(today, "MMM-yyyy"),
    "MMM-yyyy",
    new Date(),
  );

  const [calView, setCalView] = useState<View>(Views.MONTH);

  const { currentBusiness } = useCurrentBusinessContext();

  // @todo (important) - right now we only fetch 6 month window of data, and we don't have a dynamic way of fetching more data as the user moves around the calendar.
  const { data, isLoading: isBusinessScheduleDataLoading } =
    useBusinessScheduleByTimeRange(
      currentBusiness?.handle,
      add(firstDayCurrentMonth, { months: -3 }),
      add(firstDayCurrentMonth, { months: 3 }),
    );

  const serviceEvents =
    (data || [])
      .map(
        (sg) =>
          sg.service_events?.map((se) => {
            const baseEvent = {
              ...se,
              title: se.service.title,
              duration: se.service.duration,
              price: se.service.price,
            };

            const recurringEvents = [];
            if (
              se.recurrence_start &&
              se.recurrence_count &&
              se.recurrence_interval
            ) {
              const eventStart = new Date(se.start);
              let recurrenceStart = new Date(se.recurrence_start);

              if (isBefore(recurrenceStart, eventStart)) {
                recurrenceStart = eventStart;
              }

              // Determine how many jumps we need to make to get to the first recurring event.
              const numJumps =
                Math.floor(
                  (recurrenceStart.getTime() - eventStart.getTime()) /
                    se.recurrence_interval,
                ) + 1;
              const firstRecurringStart = add(eventStart, {
                hours: numJumps * millisecondsToHours(se.recurrence_interval),
              });
              const recurrenceEnd = add(firstRecurringStart, {
                hours: millisecondsToHours(
                  se.recurrence_count * se.recurrence_interval,
                ),
              });

              // Loop through all the recurring events and add them to the calendar.
              for (
                let i = firstRecurringStart;
                i < recurrenceEnd;
                i = add(i, {
                  hours: millisecondsToHours(se.recurrence_interval),
                })
              ) {
                recurringEvents.push({
                  ...baseEvent,
                  start: i,
                  end: addMilliseconds(i, se.service.duration),
                  isRecurrentEvent: true,
                });
              }
            }
            return [
              {
                ...baseEvent,
                start: new Date(se?.start || ""),
                end: addMilliseconds(
                  new Date(se?.start || ""),
                  se.service.duration,
                ),
              },
              ...recurringEvents,
            ];
          }),
      )
      ?.flat(2) || [];

  const onNavigate = useCallback(
    (newDate: Date, view: View, action: NavigateAction) => {
      // This function does nothing other than enable navigation on the calendar atm.
    },
    [],
  );

  return (
    <div className="overflow-scroll text-sm">
      <DnDCalendar
        defaultDate={today}
        view={calView}
        onDropFromOutside={onDropFromOutside}
        events={serviceEvents}
        eventPropGetter={(event: object) => ({
          className: "isDraggable text-sm",
          style: (event as CalEvent).color
            ? { background: (event as CalEvent).color }
            : {},
        })}
        onView={(view) => setCalView(view)}
        localizer={localizer}
        onEventDrop={
          onEventDrop as any /* todo - the library typing is all messed up */
        }
        onSelectEvent={
          onSelectEvent as any /* todo - the library typing is all messed up */
        }
        selectable
        onSelectSlot={onSelectSlot}
        scrollToTime={add(startOfToday(), { hours: 8 })}
        style={{ height: "100vh" }}
        min={add(startOfToday(), { hours: 8 })}
        onNavigate={onNavigate}
      />
    </div>
  );
}
