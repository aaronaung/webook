export const BOOKING_STATUS_PENDING = "PENDING";
export const BOOKING_STATUS_CONFIRMED = "CONFIRMED";
export const BOOKING_STATUS_CANCELLED = "CANCELLED";
export const BOOKING_STATUS_LABELS: { [k: string]: string } = {
  [BOOKING_STATUS_PENDING]: "Pending",
  [BOOKING_STATUS_CONFIRMED]: "Confirmed",
  [BOOKING_STATUS_CANCELLED]: "Cancelled",
};
