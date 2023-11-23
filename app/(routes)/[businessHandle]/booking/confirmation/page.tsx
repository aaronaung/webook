export default function BookingConfirmationPage({
  searchParams,
}: {
  searchParams: { event_id: string };
}) {
  return <>Booking confirmation page for event: {searchParams.event_id}</>;
}
