import { BusinessServiceGroup } from "@/types";
import { format } from "date-fns";

const people = [
  {
    name: "Leslie Alexander",
    email: "leslie.alexander@example.com",
    role: "Co-Founder / CEO",
    imageUrl:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
  },
  {
    name: "Leslie Alexander",
    email: "leslie.alexander+1@example.com",
    role: "Co-Founder / CEO",
    imageUrl:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
  },
  // More people...
];

export default function ServiceGroup({
  serviceGroup,
  className,
}: {
  serviceGroup: BusinessServiceGroup;
  className: any;
}) {
  return (
    <div className="divide-y divide-gray-200 overflow-hidden rounded-lg bg-white shadow">
      <div className="px-4 py-5 sm:px-6">
        <h3 className="text-base font-semibold leading-6 text-gray-900">
          {serviceGroup.title}
        </h3>
      </div>
      <div className="px-4 py-5 sm:p-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {serviceGroup.service_slots.map((slot) => (
            <div
              key={slot.staffs[0].instagram_handle} // todo for now just use 1 staff
              className="relative flex items-center space-x-3 rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2 hover:border-gray-400"
            >
              {slot.staffs[0].image_url && (
                <div className="flex-shrink-0">
                  <img
                    className="h-10 w-10 rounded-full"
                    src={slot.staffs[0].image_url}
                    alt=""
                  />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <a href="#" className="focus:outline-none">
                  <span className="absolute inset-0" aria-hidden="true" />
                  <p className="text-sm font-medium text-gray-900">
                    {slot.staffs[0].instagram_handle}
                  </p>
                  <p className="truncate text-sm text-gray-500">{slot.title}</p>
                  <p className="truncate text-sm text-gray-500">
                    {format(new Date(slot.start || ""), "hh:mm a")}
                  </p>
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
