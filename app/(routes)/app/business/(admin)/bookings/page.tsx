"use client";
import BookingList, {
  ViewMode,
} from "@/src/components/common/bookings/booking-list";
import { Spinner } from "@/src/components/common/loading-spinner";
import { useCurrentBusinessContext } from "@/src/contexts/current-business";
import { getBookingsForBusiness } from "@/src/data/booking";
import { useSupaQuery } from "@/src/hooks/use-supabase";

export default function BusinessBookings() {
  const { currentBusiness } = useCurrentBusinessContext();

  const { data: bookings, isLoading: isLoadingBookings } = useSupaQuery(
    getBookingsForBusiness,
    {
      arg: {
        businessId: currentBusiness.id,
      },
      queryKey: ["getBookingsForBusiness", currentBusiness.id],
    },
  );

  if (isLoadingBookings) {
    return <Spinner />;
  }
  return (
    <BookingList
      hideBackBtn
      bookings={bookings || []}
      business={currentBusiness}
      viewMode={ViewMode.Business}
    />
  );
}
