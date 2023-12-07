"use client";

import { Tables } from "@/types/db.extension";
import ChatRoom from "./chat-room";
import { cn, userFriendlyDate } from "@/src/utils";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { isMobile } from "react-device-detect";
import HeaderWithAction from "../header-with-action";
import {
  GetBookingsForBusinessResponse,
  GetBookingsForBusinessResponseSingle,
} from "@/src/data/booking";
import Image from "../../ui/image";
import {
  BOOKING_STATUS_CANCELED,
  BOOKING_STATUS_CONFIRMED,
  BOOKING_STATUS_LABELS,
  BOOKING_STATUS_PENDING,
  BookingStatus,
} from "@/src/consts/booking";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/src/components/ui/tooltip";

export const bookingTitle = (booking: GetBookingsForBusinessResponseSingle) => {
  return `${
    booking.service?.title || booking.service_event?.service?.title || ""
  } (${userFriendlyDate(booking.start)})`;
};

export const getBookingStatusIcon = (status: BookingStatus) => {
  switch (status) {
    case BOOKING_STATUS_CONFIRMED:
      return "✅";
    case BOOKING_STATUS_CANCELED:
      return "❌";
    case BOOKING_STATUS_PENDING:
      return "🕒";
    default:
      return "🕒";
  }
};

// If only business is passed, it's a business view. If both business and loggedInUser are passed, it's a user view.
export default function BookingList({
  loggedInUser,
  business,
  bookings,
  hideBackBtn,
}: {
  loggedInUser?: Tables<"users">;
  business: Tables<"businesses">;
  bookings: GetBookingsForBusinessResponse;
  hideBackBtn?: boolean;
}) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const currentBookingId =
    searchParams.get("booking_id") || bookings?.[0]?.id || null;
  const currentBooking = (bookings || []).find(
    (booking) => booking.id === currentBookingId,
  );

  const [showSideBar, setShowSideBar] = useState(false);

  const handleBookingSelect = (newBookingId: string) => {
    const newParams = new URLSearchParams(searchParams.toString());
    newParams.set("booking_id", newBookingId);
    router.replace(`${window.location.pathname}?${newParams.toString()}`);
  };

  return (
    <div className="flex h-full w-full overflow-hidden">
      <div
        className={cn(
          "hidden h-full overflow-scroll sm:block lg:flex-[0.75]",
          isMobile && showSideBar ? "block flex-1" : "hidden",
        )}
      >
        <HeaderWithAction
          title={"Bookings"}
          subtitle={"Select a booking to see the details."}
          hideBackBtn={hideBackBtn}
        />
        {(bookings || []).map((booking) => (
          <div
            key={booking.id}
            className={cn(
              booking.id === currentBookingId && "bg-secondary",
              "mt-4 cursor-pointer rounded-lg border-b-secondary-foreground p-2",
            )}
            onClick={() => {
              handleBookingSelect(booking.id);
              setShowSideBar(false);
            }}
          >
            {business && booking.booker && (
              <div className="flex items-center gap-x-4">
                <Image
                  className="h-8 w-8 rounded-full"
                  src={
                    booking.booker?.avatar_url ||
                    `https://ui-avatars.com/api/?name=${booking.booker?.first_name}+${booking.booker?.last_name}`
                  }
                />
                <div>
                  <p>{bookingTitle(booking)}</p>
                  <p className="text-sm text-muted-foreground">
                    {booking.booker?.first_name} {booking.booker?.last_name} (
                    {booking.booker?.email})
                  </p>
                </div>
                <Tooltip>
                  <TooltipTrigger>
                    <div className="mr-4 w-14 shrink-0 text-right">
                      <p className={cn("text-sm text-muted-foreground")}>
                        {`${getBookingStatusIcon(
                          booking.status as BookingStatus,
                        )}`}
                      </p>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>
                      {BOOKING_STATUS_LABELS[booking.status as BookingStatus]}
                    </p>
                  </TooltipContent>
                </Tooltip>
              </div>
            )}
          </div>
        ))}
      </div>

      <div
        className={cn(
          "flex-1",
          isMobile && showSideBar ? "hidden" : "block w-full",
        )}
      >
        {currentBooking && currentBooking.chat_room && (
          <ChatRoom
            room={currentBooking.chat_room}
            booking={currentBooking}
            loggedInUser={loggedInUser}
            business={business}
            onBack={() => {
              setShowSideBar(true);
            }}
          />
        )}
        {currentBooking && !currentBooking.chat_room && (
          <>
            Booking details go here: <pre>{JSON.stringify(currentBooking)}</pre>
          </>
        )}
      </div>
    </div>
  );
}
