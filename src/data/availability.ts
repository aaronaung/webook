import { Tables } from "@/types/db.extension";
import { SupabaseOptions } from "./types";
import { throwOrData } from "./util";

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

export const saveWeeklyAvailabilitySlot = async (
  slot: Partial<Tables<"availability_weekly_slots">>,
  { client }: SupabaseOptions,
) => {
  return throwOrData(
    client
      .from("availability_weekly_slots")
      .upsert({ ...(slot as Tables<"availability_weekly_slots">) })
      .select("id")
      .limit(1)
      .single(),
  );
};

export const saveAvailabilitySlotOverride = async (
  slot: Partial<Tables<"availability_slot_overrides">>,
  { client }: SupabaseOptions,
) => {
  return throwOrData(
    client
      .from("availability_slot_overrides")
      .upsert({ ...(slot as Tables<"availability_slot_overrides">) })
      .select("id")
      .limit(1)
      .single(),
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
  slotId: string,
  { client }: SupabaseOptions,
) => {
  return throwOrData(
    client.from("availability_slot_overrides").delete().eq("id", slotId),
  );
};

export const getAvailabilitySchedules = async (
  businessId: string,
  { client }: SupabaseOptions,
) => {
  return throwOrData(
    client
      .from("availability_schedules")
      .select("*")
      .eq("business_id", businessId),
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
      .eq("availability_schedule_id", scheduleId),
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
      .eq("availability_schedule_id", scheduleId),
  );
};
