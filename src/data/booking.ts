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
  businessId: string,
  { client }: SupabaseOptions,
) => {
  const data = client.from("bookings").select().eq("business_id", businessId);
  return throwOrData(
    client.from("bookings").select().eq("business_id", businessId),
  );
};
