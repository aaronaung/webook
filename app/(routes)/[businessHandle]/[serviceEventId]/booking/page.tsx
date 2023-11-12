export default function BookingConfirmation({
  params,
  searchParams,
}: {
  params: { serviceEventId: string };
  searchParams: { serviceId: string };
}) {
  return (
    <div>
      Booking page {params.serviceEventId} {searchParams.serviceId}
    </div>
  );
}
