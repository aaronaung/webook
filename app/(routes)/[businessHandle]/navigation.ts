import { sidebarNavigation } from "../app/business/navigation";
import {
  ClipboardDocumentCheckIcon,
  Squares2X2Icon,
} from "@heroicons/react/24/outline";

export const customerNavigations = (businessHandle: string) => [
  {
    name: "My bookings",
    icon: ClipboardDocumentCheckIcon,
    href: `/${businessHandle}/bookings`,
  },
  {
    name: "Manage businesses",
    icon: Squares2X2Icon,
    href: sidebarNavigation[0].href,
  },
];
