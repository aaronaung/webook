import { Tables } from "@/types/db.extension";
import { SupabaseOptions } from "./types";
import { throwOrData } from "./util";
import { Day } from "../consts/availability";
import { getScheduledEventsInTimeRange } from "./business";
import { endOfDay, startOfDay } from "date-fns";

export const saveAvailabilitySchedule = (
  schedule: Partial<Tables<"availability_schedules">>,
  { client }: SupabaseOptions,
) => {
  return throwOrData(
    client
      .from("availability_schedules")
      .upsert({ ...(schedule as Tables<"availability_schedules">) })
      .select("id")
      .limit(1)
      .single(),
  );
};

export const saveWeeklyAvailabilitySlots = async (
  slots: Partial<Tables<"availability_weekly_slots">>[],
  { client }: SupabaseOptions,
) => {
  return throwOrData(
    client
      .from("availability_weekly_slots")
      .upsert(slots as Tables<"availability_weekly_slots">[]),
  );
};

export const saveAvailabilitySlotOverrides = async (
  slots: Partial<Tables<"availability_slot_overrides">>[],
  { client }: SupabaseOptions,
) => {
  return throwOrData(
    client
      .from("availability_slot_overrides")
      .upsert(slots as Tables<"availability_slot_overrides">[]),
  );
};

export const deleteAvailabilitySchedule = async (
  scheduleId: string,
  { client }: SupabaseOptions,
) => {
  return throwOrData(
    client.from("availability_schedules").delete().eq("id", scheduleId),
  );
};

export const deleteWeeklyAvailabilitySlot = async (
  { slotId, day }: { slotId?: string; day?: string },
  { client }: SupabaseOptions,
) => {
  let mutation = client.from("availability_weekly_slots").delete();

  if (slotId) {
    mutation = mutation.eq("id", slotId);
  }

  if (day) {
    mutation = mutation.eq("day", day);
  }
  return throwOrData(mutation);
};

export const deleteAvailabilitySlotOverride = async (
  { slotId, date }: { slotId?: string; date?: string },
  { client }: SupabaseOptions,
) => {
  let mutation = client.from("availability_slot_overrides").delete();

  if (slotId) {
    mutation = mutation.eq("id", slotId);
  }

  if (date) {
    mutation = mutation.eq("date", date);
  }
  return throwOrData(mutation);
};

export const getAvailabilitySchedules = async (
  businessId: string,
  { client }: SupabaseOptions,
) => {
  return throwOrData(
    client
      .from("availability_schedules")
      .select("*")
      .eq("business_id", businessId)
      .order("created_at", { ascending: true }),
  );
};

export const getWeeklyAvailabilitySlotsBySchedule = async (
  scheduleId: string,
  { client }: SupabaseOptions,
) => {
  return throwOrData(
    client
      .from("availability_weekly_slots")
      .select("*")
      .eq("availability_schedule_id", scheduleId)
      .order("created_at", { ascending: true }),
  );
};

export const getAvailabilitySlotOverridesBySchedule = async (
  scheduleId: string,
  { client }: SupabaseOptions,
) => {
  return throwOrData(
    client
      .from("availability_slot_overrides")
      .select("*")
      .eq("availability_schedule_id", scheduleId)
      .order("created_at", { ascending: true }),
  );
};

export const getAvailabilityForServiceOnDate = async (
  { serviceId, date }: { serviceId: string; date: Date },
  { client }: SupabaseOptions,
) => {
  const service = await throwOrData(
    client
      .from("services")
      .select("*, business:businesses(*), questions(*)")
      .eq("id", serviceId)
      .single(),
  );
  if (!service.availability_schedule_id || !service.business) {
    // If there's no availability schedule or business attached to the service, return empty array.
    return {
      service,
      availability: [],
    };
  }
  let availabilitySlots: number[][] = [];
  const overrides = await throwOrData(
    client
      .from("availability_slot_overrides")
      .select("*")
      .eq("availability_schedule_id", service.availability_schedule_id)
      .eq("date", date.toISOString()),
  );
  if (overrides.length > 0) {
    // If there's override for the specified date, use the override slots.
    availabilitySlots = overrides.map((override) => [
      new Date(override.start).getTime(),
      new Date(override.end).getTime(),
    ]);
  } else {
    let weeklySlots = await throwOrData(
      client
        .from("availability_weekly_slots")
        .select("*")
        .eq("availability_schedule_id", service.availability_schedule_id)
        .eq("day", Object.keys(Day)[date.getDay()]),
    );
    availabilitySlots = weeklySlots.map((slot) => [
      new Date(slot.start).getTime(),
      new Date(slot.end).getTime(),
    ]);
  }

  const [eventsOnDate, bookingsOnDate] = await Promise.all([
    getScheduledEventsInTimeRange(
      {
        businessHandle: service.business.handle,
        start: startOfDay(date),
        end: endOfDay(date),
        availabilityScheduleId: service.availability_schedule_id,
      },
      { client },
    )
      .then((events) =>
        events.map((e) => {
          const start = new Date(e.start);
          const dayStart = startOfDay(start);
          const end = new Date(e.end);
          return [
            start.getTime() - dayStart.getTime(),
            end.getTime() - dayStart.getTime(),
          ];
        }),
      )
      .catch((e) => []),
    // get candidate slots on the date.
    throwOrData(
      client
        .from("bookings")
        .select("*")
        .eq("service_id", serviceId)
        .gte("start", startOfDay(date).toISOString())
        .lte("end", endOfDay(date).toISOString()),
    )
      .then((bookings) =>
        bookings.map((e) => {
          const start = new Date(e.start);
          const dayStart = startOfDay(start);
          const end = new Date(e.end);
          return [
            start.getTime() - dayStart.getTime(),
            end.getTime() - dayStart.getTime(),
          ];
        }),
      )
      .catch((e) => []),
  ]);
  const unavailableSlots = flattenIntervals([
    ...eventsOnDate,
    ...bookingsOnDate,
  ]);
  console.log("available", availabilitySlots);
  console.log("unavailable", unavailableSlots);
  if (unavailableSlots.length === 0) {
    return {
      service,
      availability: availabilitySlots.sort((a, b) => a[0] - b[0]),
    };
  }
  console.log(
    "findFreeIntervalsInLeft",
    findFreeIntervalsInLeft(availabilitySlots, unavailableSlots),
  );
  return {
    service,
    availability: flattenIntervals(
      findFreeIntervalsInLeft(availabilitySlots, unavailableSlots),
    ),
  };
};

// findFreeIntervalsInLeft finds the free intervals in the left array, given the candidate intervals in the right array.
// For example: findFreeIntervalsInLeft(
//     [
//       [1, 5],
//       [10, 15],
//       [20, 30],
//     ],
//     [
//       [0, 2],
//       [3, 11],
//       [7, 12],
//       [14, 15],
//       [18, 30],
//     ],
//   ),
// returns [[2, 3], [12, 14]]
const findFreeIntervalsInLeft = (left: number[][], right: number[][]) => {
  if (right.length === 0) {
    return left;
  }
  const result = [];
  if (right.length === 1) {
    const [candidateStart, candidateEnd] = right[0];
    for (const interval of left) {
      const [start, end] = interval;
      if (candidateStart >= end) {
        result.push(interval);
        continue;
      }
      if (candidateStart <= start && candidateEnd >= end) {
        // current interval is completely inside candidate interval
        continue;
      }
      if (candidateStart <= start && candidateEnd < end) {
        // candidate interval overlaps with the start of current interval
        result.push([candidateEnd, end]);
        continue;
      }
      if (candidateStart > start && candidateEnd >= end) {
        // candidate interval overlaps with the end of current interval
        result.push([start, candidateStart]);
        continue;
      }
      if (candidateStart > start && candidateEnd < end) {
        // candidate interval is completely inside current interval
        result.push([start, candidateStart]);
        result.push([candidateEnd, end]);
        continue;
      }
    }
    return result;
  }

  const freeIntervals = findFreeIntervals(right);

  for (const freeInterval of freeIntervals) {
    for (const interval of left) {
      const [start, end] = interval;
      const [freeStart, freeEnd] = freeInterval;
      if (freeStart >= start && freeEnd <= end) {
        result.push(freeInterval);
      }
    }
  }
  // findFreeIntervals only finds the free intervals in the right array.
  // We need to check the boundary conditions that are not covered by findFreeIntervals.
  // This includes the intervals that are completely outside the right array.
  // for example: assume the folowing:
  // available: [1, 10], [20, 30]
  // unavailable: [5, 15], [23, 27]

  return result;
};

function findFreeIntervals(intervals: number[][]) {
  if (intervals.length <= 0) {
    return [];
  }

  const result = [];

  // Sort the given interval based on the first number.
  intervals.sort((a, b) => a[0] - b[0]);

  // Iterate over all the intervals
  for (let i = 1; i < intervals.length; i++) {
    // Previous interval end
    let prevEnd = intervals[i - 1][1];

    // Current interval start
    let currStart = intervals[i][0];

    // If prev end is less than curr start, then it is free interval
    if (prevEnd < currStart) {
      result.push([prevEnd, currStart]);
    }
  }

  return result;
}

// Flatten intervals flattens the intervals and merges the overlapping intervals. For example: [[0, 3], [3, 11], [7, 12], [14, 19], [18, 30]] will be flattened to [[0, 12], [14, 30]]
function flattenIntervals(intervals: number[][]) {
  if (intervals.length === 0) {
    return [];
  }
  intervals.sort((a, b) => a[0] - b[0]);

  const flattened = [];
  let current = intervals[0];
  for (const interval of intervals) {
    const [start, end] = interval;
    const [currentStart, currentEnd] = current;
    if (start > currentEnd) {
      flattened.push(current);
      current = interval;
      continue;
    }
    if (start >= currentStart && end > currentEnd) {
      current[1] = end;
    }
  }
  flattened.push(current);
  return flattened;
}

//Todo: important - ideally this should be done in the database right before a booking is made to ensure no double booking ever occurs.
function isIntervalAvailable(
  candidateInterval: number[],
  busyIntervals: number[][],
) {
  for (const interval of busyIntervals) {
    const [busyStart, busyEnd] = interval;
    const [candidateStart, candidateEnd] = candidateInterval;
    if (candidateStart >= busyEnd || candidateEnd <= busyStart) {
      continue;
    }
    if (candidateStart <= busyStart && candidateEnd >= busyEnd) {
      // current busy interval is completely inside candidate interval
      return false;
    }
    if (candidateStart <= busyStart && candidateEnd < busyEnd) {
      // candidate interval overlaps with the busyStart of current interval
      return false;
    }
    if (candidateStart > busyStart && candidateEnd >= busyEnd) {
      // candidate interval overlaps with the busyEnd of current interval
      return false;
    }
    if (candidateStart > busyStart && candidateEnd < busyEnd) {
      // candidate interval is completely inside current interval
      return false;
    }
  }
  return false;
}
