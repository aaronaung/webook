"use client";

import { Tables } from "@/types/db.extension";
import Room from "./room";
import { cn } from "@/src/utils";
import { useRouter, useSearchParams } from "next/navigation";

export default function Chat({
  loggedInUser,
  initialRoom,
  rooms,
}: {
  loggedInUser: Tables<"users">;
  initialRoom?: Tables<"chat_rooms">;
  rooms: Tables<"chat_rooms">[];
}) {
  // todo: if initalRoom is null set to the latest booking room
  const searchParams = useSearchParams();
  const router = useRouter();
  const currentRoomId = searchParams.get("room_id") || rooms[0].id;
  const currentRoom = rooms.find((room) => room.id === currentRoomId);

  const handleRoomSelect = (newRoomId: string) => {
    const newParams = new URLSearchParams(searchParams.toString());
    newParams.set("room_id", newRoomId);
    router.replace(`${window.location.pathname}?${newParams.toString()}`);
  };

  return (
    <div className="flex">
      <div className="h-full">
        {rooms.map((room) => (
          <div
            key={room.id}
            className={cn(
              room.id === searchParams.get("room_id") && "bg-gray-200",
              "cursor-pointer border-b-secondary-foreground p-2",
            )}
            onClick={() => {
              handleRoomSelect(room.id);
            }}
          >
            {room.id} - {room.name}
          </div>
        ))}
      </div>
      <div>
        <Room room={currentRoom!} loggedInUser={loggedInUser} />
      </div>
    </div>
  );
}
