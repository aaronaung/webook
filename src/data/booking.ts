import { Tables } from "@/types/db.extension";
import { SupabaseOptions } from "./types";
import { throwOrData } from "./util";

export const saveBooking = async (
  booking: Partial<Tables<"bookings">>,
  { client }: SupabaseOptions,
) => {
  return throwOrData(
    client
      .from("bookings")
      .upsert({ ...(booking as Tables<"bookings">) })
      .select("id")
      .limit(1)
      .single(),
  );
};

export const deleteBooking = async (
  bookingId: string,
  { client }: SupabaseOptions,
) => {
  return throwOrData(client.from("bookings").delete().eq("id", bookingId));
};

export const getBookings = async (
  { businessId, userId }: { businessId: string; userId: string },
  { client }: SupabaseOptions,
) => {
  return throwOrData(
    client
      .from("bookings")
      .select()
      .eq("business_id", businessId)
      .eq("booker_id", userId),
  );
};

export const getBookingForServiceEventByUser = async (
  { serviceEventId, userId }: { serviceEventId: string; userId: string },
  { client }: SupabaseOptions,
) => {
  return throwOrData(
    client
      .from("bookings")
      .select()
      .eq("service_event_id", serviceEventId)
      .eq("booker_id", userId)
      .limit(1)
      .maybeSingle(),
  );
};
