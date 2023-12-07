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

export type GetBookingsForBusinessResponse = Awaited<
  ReturnType<typeof getBookingsForBusiness>
>;
export type GetBookingsForBusinessResponseSingle =
  GetBookingsForBusinessResponse[0];
export const getBookingsForBusiness = async (
  { businessId, userId }: { businessId: string; userId?: string },
  { client }: SupabaseOptions,
) => {
  let query = client
    .from("bookings")
    .select(
      "*, service_event:service_events(*, service:services(*)), service:services(*), chat_room:chat_rooms(*), booker:users(*)",
    )
    .eq("business_id", businessId)
    .order("created_at", { ascending: false });

  if (userId) {
    query = query.eq("booker_id", userId);
  }

  return throwOrData(query);
};

export const getBookingForServiceEventByUser = async (
  {
    serviceEventId,
    serviceEventStart,
    userId,
  }: { serviceEventId: string; serviceEventStart: string; userId: string },
  { client }: SupabaseOptions,
) => {
  return throwOrData(
    client
      .from("bookings")
      .select()
      .eq("service_event_id", serviceEventId)
      .eq("start", serviceEventStart)
      .eq("booker_id", userId)
      .limit(1)
      .maybeSingle(),
  );
};

export const getBookingForAvailabilityBasedServiceByUser = async (
  {
    availabilityBasedServiceId,
    start,
    end,
    userId,
  }: {
    availabilityBasedServiceId: string;
    start: string;
    end: string;
    userId: string;
  },
  { client }: SupabaseOptions,
) => {};

export const getBookingByChatRoom = async (
  chatRoomId: string,
  { client }: SupabaseOptions,
) => {
  return throwOrData(
    client
      .from("bookings")
      .select()
      .eq("chat_room_id", chatRoomId)
      .limit(1)
      .maybeSingle(),
  );
};
