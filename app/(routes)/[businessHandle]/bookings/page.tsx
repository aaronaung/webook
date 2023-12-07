import { redirect } from "next/navigation";
import { getAuthUser } from "@/src/data/user";
import { supaServerComponentClient } from "@/src/data/clients/server";
import { getBusinessByHandle } from "@/src/data/business";
import UserBookings from "./_components/user-bookings";

export default async function BookingsPage({
  params,
  searchParams,
}: {
  params: { businessHandle: string };
  searchParams: { booking_id: string };
}) {
  const supabaseOptions = { client: supaServerComponentClient() };
  const loggedInUser = await getAuthUser(supabaseOptions);
  if (!loggedInUser) {
    redirect(
      `/login?return_path=${encodeURIComponent(
        `/${params.businessHandle}/bookings?booking_id=${searchParams.booking_id}`,
      )}`,
    );
  }
  const business = await getBusinessByHandle(
    params.businessHandle,
    supabaseOptions,
  );
  if (!business) {
    console.error(`Business not found for handle: ${params.businessHandle}`);
    redirect("/");
  }

  return (
    <div className="m-auto h-full max-w-6xl p-4">
      {/* <HeaderWithAction /> */}
      <UserBookings loggedInUser={loggedInUser} business={business} />
    </div>
  );
}
