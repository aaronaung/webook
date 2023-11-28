"use client";

import { Tables } from "@/types/db.extension";
import Room from "./room";
import { cn } from "@/src/utils";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { isMobile } from "react-device-detect";
import HeaderWithAction from "../header-with-action";

export default function Chat({
  loggedInUser,
  business,
  rooms,
}: {
  loggedInUser?: Tables<"users">;
  business?: Tables<"businesses">;
  rooms: (Tables<"chat_rooms"> & Partial<{ booker: Tables<"users"> }>)[];
}) {
  // todo: if initalRoom is null set to the latest booking room
  const searchParams = useSearchParams();
  const router = useRouter();
  const currentRoomId = searchParams.get("room_id") || rooms[0]?.id || null;
  const currentRoom = rooms.find((room) => room.id === currentRoomId);

  const [showSideBar, setShowSideBar] = useState(false);

  const handleRoomSelect = (newRoomId: string) => {
    const newParams = new URLSearchParams(searchParams.toString());
    newParams.set("room_id", newRoomId);
    router.replace(`${window.location.pathname}?${newParams.toString()}`);
  };

  return (
    <div className="flex max-h-full w-full overflow-hidden">
      <div
        className={cn(
          "hidden max-h-full overflow-scroll sm:block lg:flex-[0.75]",
          isMobile && showSideBar ? "block flex-1" : "hidden",
        )}
      >
        <HeaderWithAction
          title={"Chat rooms"}
          subtitle={"Select a chat room to view messages."}
        />
        {rooms.map((room) => (
          <div
            key={room.id}
            className={cn(
              room.id === currentRoomId && "bg-secondary",
              "mt-4 cursor-pointer rounded-lg border-b-secondary-foreground p-2",
            )}
            onClick={() => {
              handleRoomSelect(room.id);
              setShowSideBar(false);
            }}
          >
            <p>{room.name}</p>
            {business && (
              <p>
                {room.booker?.first_name} {room.booker?.last_name}
              </p>
            )}
          </div>
        ))}
      </div>

      <div
        className={cn(
          "flex-1",
          isMobile && showSideBar ? "hidden" : "block w-full",
        )}
      >
        {currentRoom ? (
          <Room
            room={currentRoom}
            loggedInUser={loggedInUser}
            business={business}
            onBack={() => {
              setShowSideBar(true);
            }}
          />
        ) : (
          <div>Room not found.</div>
        )}
      </div>
    </div>
  );
}
