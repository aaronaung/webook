import PriceTag from "@/src/components/ui/price-tag";
import { getServiceImgUrl, getStaffHeadshotUrl } from "@/src/utils";
import { ServiceEvent } from "@/types";
import { format } from "date-fns";
import _ from "lodash";
import Image from "../../../../../src/components/ui/image";

export default function ServiceEventItem({
  event,
  onClick,
}: {
  event: ServiceEvent;
  onClick: () => void;
}) {
  const startDateTime = new Date(event.start || "");
  const staffName = (event.staffs || [])
    .map((staff) => {
      return !staff.first_name && !staff.last_name
        ? staff.instagram_handle
        : `${staff.first_name} ${staff.last_name}`;
    })
    .join("&");

  function imageUrls() {
    if (!_.isEmpty(event.staffs)) {
      return (event.staffs || []).map((staff) => getStaffHeadshotUrl(staff.id));
    }

    return [getServiceImgUrl(event.service.id)];
  }

  return (
    <li
      onClick={onClick}
      className="group flex cursor-pointer items-center space-x-4 rounded-xl px-4 py-2 focus-within:bg-gray-100 hover:bg-gray-100"
    >
      <div className="flex h-12 w-12 shrink-0 -space-x-1">
        <dt className="sr-only">Staffs</dt>
        {imageUrls().map((url, index) => (
          <dd key={`${url}-${index}`}>
            <Image
              className="h-12 w-12 rounded-full bg-gray-50 object-cover ring-2 ring-white"
              src={
                url || `https://ui-avatars.com/api/?name=${event.service.title}`
              }
              // todo: IMPORTANT - this is just temporary placeholder for demo purposes
              fallbackSrc={`https://i.pravatar.cc/60?u=${staffName || "test"}`}
              alt={staffName || ""}
            />
          </dd>
        ))}
      </div>
      <div className="flex min-h-[40px] w-full items-center justify-between">
        <div>
          <p className="font-medium text-foreground">{event.service.title} </p>
          <p className="text-foreground">{staffName}</p>
        </div>
        <div className="flex flex-col items-end justify-center gap-1">
          <PriceTag price={event.service.price} />
          <p className="text-muted-foreground">
            <time dateTime={event.start || ""}>
              {format(startDateTime, "h:mm a")}
            </time>
          </p>
        </div>
      </div>
    </li>
  );
}
