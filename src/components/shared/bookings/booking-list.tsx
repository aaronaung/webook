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
import { format } from "date-fns";

export const bookingTitle = (
  booking: Pick<
    GetBookingsForBusinessResponseSingle,
    "service" | "service_event" | "id"
  >,
) => {
  return `${
    booking.service?.title ||
    booking.service_event?.service?.title ||
    booking.id
  } `;
};

export const bookingTime = (
  booking: Pick<GetBookingsForBusinessResponseSingle, "start" | "end">,
) => {
  return `${userFriendlyDate(booking.start)} - ${format(
    new Date(booking.end),
    "h:mma",
  )}`;
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

export enum ViewMode {
  Business,
  User,
}

// If only business is passed, it's a business view. If both business and loggedInUser are passed, it's a user view.
export default function BookingList({
  loggedInUser,
  business,
  bookings,
  hideBackBtn,
  viewMode,
}: {
  loggedInUser?: Tables<"users">;
  business: Tables<"businesses">;
  bookings: GetBookingsForBusinessResponse;
  hideBackBtn?: boolean;
  viewMode: ViewMode;
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
          title={
            viewMode === ViewMode.Business
              ? "Bookings"
              : `Bookings with ${business.title}`
          }
          subtitle1={"Select a booking to see the details."}
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
            {booking.booker && (
              <div className="flex items-center gap-x-4">
                <Image
                  className="h-8 w-8 rounded-full"
                  src={
                    booking.booker?.avatar_url ||
                    `https://ui-avatars.com/api/?name=${booking.booker?.first_name}+${booking.booker?.last_name}`
                  }
                />
                <div className="flex-1">
                  <p className="font-medium">
                    {booking.service?.title ||
                      booking.service_event?.service?.title ||
                      booking.id}
                  </p>
                  <p className="text-sm">{bookingTime(booking)}</p>

                  {viewMode === ViewMode.Business && (
                    <p className="text-sm text-muted-foreground">
                      {booking.booker?.first_name} {booking.booker?.last_name} (
                      {booking.booker?.email})
                    </p>
                  )}
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
            business={viewMode === ViewMode.Business ? business : undefined}
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
