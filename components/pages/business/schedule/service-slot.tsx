import { BusinessServiceSlot } from "@/types";
import { format } from "date-fns";
import Image from "next/image";

export default function ServiceSlot({ slot }: { slot: BusinessServiceSlot }) {
  const startDateTime = new Date(slot.start || "");
  const staffName = (slot.staffs || [])
    .map((staff) => {
      return !staff.first_name && !staff.last_name
        ? staff.instagram_handle
        : `${staff.first_name} ${staff.last_name}`;
    })
    .join("&");

  function imageUrls() {
    let imageUrls = [];
    if (slot.service.image_url) {
      imageUrls.push(slot.service.image_url);
    } else if (slot.image_url) {
      imageUrls.push(slot.image_url);
    } else {
      imageUrls = (slot.staffs || []).map((staff) => staff.image_url);
    }
    return imageUrls;
  }

  return (
    <li className="group flex cursor-pointer items-center space-x-4 rounded-xl px-4 py-2 focus-within:bg-gray-100 hover:bg-gray-100">
      <div className="flex -space-x-1">
        <dt className="sr-only">Commenters</dt>
        {imageUrls().map((url, index) => (
          <dd key={`${url}-${index}`}>
            <Image
              className="rounded-full bg-gray-50 ring-2 ring-white"
              src={
                url || `https://ui-avatars.com/api/?name=${slot.service.title}`
              }
              alt={staffName || ""}
              width={46}
              height={46}
              objectFit="cover"
            />
          </dd>
        ))}
      </div>
      <div className="flex min-h-[40px] w-full items-center justify-between">
        <div>
          <p className="font-medium text-gray-900">{slot.service.title} </p>
          <p className="text-gray-900">{staffName}</p>
        </div>
        <div className="flex flex-col items-end justify-center gap-1">
          <span className="ml-1 inline-flex flex-shrink-0 items-center rounded-full bg-green-50 px-1.5 py-0.5 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
            ${((slot.service?.price || 0) / 100).toFixed(2)}
          </span>
          <p className="text-gray-600">
            <time dateTime={slot.start || ""}>
              {format(startDateTime, "h:mm a")}
            </time>
          </p>
        </div>
      </div>
    </li>
  );
}