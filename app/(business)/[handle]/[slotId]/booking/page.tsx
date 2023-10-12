export default function Booking({ params }: { params: { slotId: string } }) {
  return <div>HELLO {params.slotId}</div>;
}
