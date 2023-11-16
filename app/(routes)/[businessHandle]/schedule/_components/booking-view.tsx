import HeaderWithAction from "@/src/components/shared/header-with-action";
import { Button } from "@/src/components/ui/button";
import { ServiceEvent } from "@/types";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";

type ServiceEventBookingProps = {
  event: ServiceEvent;
  onBack: () => void;
};
export default function ServiceEventBooking({
  event,
  onBack,
}: ServiceEventBookingProps) {
  return (
    <div>
      <HeaderWithAction
        title="Book now"
        leftActionBtn={
          <Button onClick={onBack} variant="ghost">
            <ArrowLeftIcon className="h-5 w-5" />
          </Button>
        }
      />
      <p className="m-5">Payment stuff goes here... (Coming soon)</p>
    </div>
  );
}
