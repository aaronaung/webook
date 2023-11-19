import { Tables } from "@/types/db.extension";
import { SupabaseOptions } from "./types";
import { throwIfError } from "./util";

export const saveBooking = async (
  booking: Partial<Tables<"bookings">>,
  { client }: SupabaseOptions,
) => {
  return throwIfError(
    client
      .from("bookings")
      .upsert({ ...(booking as Tables<"bookings">) })
      .select(),
  );
};

export const deleteBooking = async (
  bookingId: string,
  { client }: SupabaseOptions,
) => {
  return throwIfError(client.from("bookings").delete().eq("id", bookingId));
};

export const getBookings = async (
  businessId: string,
  { client }: SupabaseOptions,
) => {
  return throwIfError(
    client.from("bookings").select().eq("business_id", businessId),
  );
};
