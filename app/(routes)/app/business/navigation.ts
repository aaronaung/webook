import {
  CalendarIcon,
  Cog8ToothIcon,
  QuestionMarkCircleIcon,
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
  {
    name: "Questions",
    icon: QuestionMarkCircleIcon,
    href: "/app/business/questions",
  },
  { name: "Settings", icon: Cog8ToothIcon, href: "/app/business/settings" },
];
