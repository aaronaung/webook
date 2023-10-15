"use client";
import { navigation } from "@/app/app/business/navigation";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useState } from "react";

export default function Navbar() {
  const [selectedTab, setSelectedTab] = useState(navigation[0].name);
  return (
    <aside className="flex overflow-x-auto border-b border-gray-900/5 pb-4 lg:block lg:w-64 lg:flex-none lg:border-0">
      <nav className="flex-none px-4 sm:px-6 lg:px-0">
        <ul
          role="list"
          className="flex gap-x-3 gap-y-1 whitespace-nowrap lg:flex-col"
        >
          {navigation.map((item) => (
            <li key={item.name}>
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setSelectedTab(item.name)}
                className={cn(
                  item.name === selectedTab
                    ? "bg-secondary text-foreground"
                    : "text-gray-700 hover:bg-gray-50 hover:text-foreground",
                  "group flex gap-x-3 rounded-md py-2 pl-2 pr-3 text-sm font-semibold leading-6",
                )}
              >
                {/* <item.icon
              className={cn(
                item.current
                  ? "text-indigo-600"
                  : "text-gray-400 group-hover:text-indigo-600",
                "h-6 w-6 shrink-0",
              )}
              aria-hidden="true"
            /> */}
                {item.name}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
