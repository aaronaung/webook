import { Tables } from "@/types/db.extension";
import { SupabaseOptions } from "./types";
import { throwOrData } from "./util";
import { Day } from "../consts/availability";
import { getScheduledEventsInTimeRange } from "./business";
import { endOfDay, startOfDay } from "date-fns";
import {
  findFreeIntervalsInLeft,
  flattenIntervals,
} from "../libs/availability/availability";

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
    findFreeIntervalsInLeft(availabilitySlots, unavailableSlots, true),
  );
  return {
    service,
    availability: flattenIntervals(
      findFreeIntervalsInLeft(availabilitySlots, unavailableSlots),
    ),
  };
};
