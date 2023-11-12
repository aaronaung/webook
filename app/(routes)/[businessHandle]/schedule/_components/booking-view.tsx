import { Button } from "@/src/components/ui/button";

type ServiceEventBookingProps = {
  onBack: () => void;
};
export default function ServiceEventBooking({
  onBack,
}: ServiceEventBookingProps) {
  return (
    <div>
      <Button onClick={onBack}>Back</Button>
      Hello service Booking{" "}
    </div>
  );
}
