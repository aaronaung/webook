"use client";

import BookingList, {
  ViewMode,
} from "@/src/components/common/bookings/booking-list";
import { getBookingsForBusiness } from "@/src/data/booking";
import { useSupaQuery } from "@/src/hooks/use-supabase";
import { Tables } from "@/types/db.extension";

export default function UserBookings({
  business,
  loggedInUser,
}: {
  business: Tables<"businesses">;
  loggedInUser: Tables<"users">;
}) {
  // We do client side fetching intentionally to take advantage of the caching and smart refetching.
  const { data: bookings, isLoading: isLoadingBookings } = useSupaQuery(
    getBookingsForBusiness,
    {
      arg: {
        businessId: business.id,
        userId: loggedInUser.id,
      },
      queryKey: ["getBookingsForBusiness", loggedInUser.id, business.id],
    },
  );

  if (isLoadingBookings) {
    return <>Loading...</>;
  }
  return (
    <BookingList
      bookings={bookings || []}
      loggedInUser={loggedInUser}
      business={business}
      viewMode={ViewMode.User}
    />
  );
}
