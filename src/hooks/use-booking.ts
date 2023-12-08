import { Tables } from "@/types/db.extension";
import { toast } from "../components/ui/use-toast";
import { useRouter } from "next/navigation";

export type BookingRequest = {
  start: string;
  end: string;
  service_id: string;
  service_event_id?: string;
};

export default function useBooking() {
  const router = useRouter();

  const checkPrereqsAndRedirectBookingRequest = ({
    user,
    businessHandle,
    bookingRequest,
    hasPreRequisiteQuestions,
  }: {
    user?: Tables<"users">;
    businessHandle: string;
    bookingRequest: BookingRequest;
    hasPreRequisiteQuestions: boolean;
  }) => {
    if (!user) {
      const returnPath = encodeURIComponent(
        `${window.location.pathname}${window.location.search}`,
      );
      toast({
        title: "Please login to continue.",
        description: "You need to be logged in to continue with booking.",
        variant: "default",
      });
      router.replace(`/login?return_path=${returnPath}`);
      return;
    }
    console.log("hasPreRequisiteQuestions", hasPreRequisiteQuestions);
    console.log("bookingRequest", bookingRequest);
    const url = new URL(window.location.origin);
    url.searchParams.set("start", bookingRequest.start);
    url.searchParams.set("end", bookingRequest.end);
    if (bookingRequest.service_event_id) {
      url.searchParams.set("service_event_id", bookingRequest.service_event_id);
    }
    if (bookingRequest.service_id) {
      url.searchParams.set("service_id", bookingRequest.service_id);
    }
    url.pathname = hasPreRequisiteQuestions
      ? `/${businessHandle}/questions`
      : `/${businessHandle}/bookings/confirm`;
    router.push(url.toString());
  };

  return {
    checkPrereqsAndRedirectBookingRequest,
  };
}
