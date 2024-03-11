"use client";

import { Button } from "@/src/components/ui/button";

export default function BookingConfirmationPage({
  searchParams,
}: {
  // - if booking id is provided, it's a pending booking that just needs to be confirmed on Confirm.
  // - if booking id is not provided, it's a new booking that needs to be confirmed and created on Confirm; this is
  // usually the case when the booking type doesn't require service provider's acceptance.
  searchParams: {
    booking_id?: string;
    service_event_id?: string;
    service_id?: string;
    business_handle?: string;
  };
}) {
  const onConfirmBooking = async () => {
    // Call /api/stripe/check-out to create a checkout session
    // const checkoutSession = await createStripeCheckoutSession({
    //   businessHandle: searchParams.business_handle,
    //   productId: searchParams.service_id,
    // })
    // if (checkoutSession.url) {
    //   window.location.href = checkoutSession.url;
    // }
  };

  return (
    <div>
      <p>
        Booking confirmation page - where check payment stuff - delete booking
        and related resources if declined
      </p>
      <p>Booking ID needs confirmation from user: {searchParams.booking_id}</p>
      <p>
        New booking for event (service provider auto confirmed):{" "}
        {searchParams.service_event_id}
      </p>
      <Button onClick={onConfirmBooking}>Confirm Booking</Button>
    </div>
  );
}
