"use client";
import BookingList from "@/src/components/shared/bookings/booking-list";
import { useCurrentBusinessContext } from "@/src/contexts/current-business";
import { getBookingsForBusiness } from "@/src/data/booking";
import { useSupaQuery } from "@/src/hooks/use-supabase";

export default function BusinessBookings() {
  const { currentBusiness } = useCurrentBusinessContext();

  const { data: bookings, isLoading: isLoadingBookings } = useSupaQuery(
    getBookingsForBusiness,
    {
      businessId: currentBusiness.id,
    },
    {
      queryKey: ["getBookingsForBusiness", currentBusiness.id],
    },
  );

  if (isLoadingBookings) {
    return <>Loading...</>;
  }
  return (
    <BookingList
      hideBackBtn
      bookings={bookings || []}
      business={currentBusiness}
    />
  );
}