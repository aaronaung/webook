import {
  AcademicCapIcon,
  CalendarIcon,
  ClipboardDocumentCheckIcon,
  ClockIcon,
  QuestionMarkCircleIcon,
  Square3Stack3DIcon,
  UsersIcon,
} from "@heroicons/react/24/outline";

export const sidebarNavigation = [
  {
    name: "Classes",
    icon: AcademicCapIcon,
    href: "/app/business/classes",
  },
  {
    name: "Bookings",
    icon: ClipboardDocumentCheckIcon,
    href: "/app/business/bookings",
  },
  {
    name: "Availability",
    icon: ClockIcon,
    href: "/app/business/availability",
  },
  {
    name: "Scheduled Events",
    icon: CalendarIcon,
    href: "/app/business/schedule",
  },
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
];
