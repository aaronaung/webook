import {
  CalendarIcon,
  Cog8ToothIcon,
  Square3Stack3DIcon,
  UsersIcon,
} from "@heroicons/react/24/outline";

export const navigation = [
  { name: "Schedule", icon: CalendarIcon, href: "/app/business/schedule" },
  {
    name: "Services",
    icon: Square3Stack3DIcon,
    href: "/app/business/services",
  },
  { name: "Staffs", icon: UsersIcon, href: "/app/business/staffs" },
  { name: "Settings", icon: Cog8ToothIcon, href: "/app/business/settings" },
];
