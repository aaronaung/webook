import { sidebarNavigation } from "../app/business/navigation";
import { Squares2X2Icon } from "@heroicons/react/24/outline";

export const customerNavigations = (businessHandle: string) => [
  // {
  //   name: "My bookings",
  //   icon: ClipboardDocumentCheckIcon,
  //   href: `/${businessHandle}/bookings`,
  // },
  {
    name: "Go to app",
    icon: Squares2X2Icon,
    href: sidebarNavigation[0].href,
  },
];
