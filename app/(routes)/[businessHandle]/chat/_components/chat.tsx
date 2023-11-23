"use client";

import { Tables } from "@/types/db.extension";
import { useState } from "react";
import Room from "./room";
import { cn } from "@/src/utils";

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
  const [currentRoom, setCurrentRoom] = useState(initialRoom || rooms[0]);

  return (
    <div className="flex">
      <div className="h-full">
        {rooms.map((room) => (
          <div
            key={room.id}
            className={cn(
              room.id === currentRoom.id && "bg-gray-200",
              "cursor-pointer border-b-secondary-foreground p-2",
            )}
            onClick={() => {
              setCurrentRoom(room);
            }}
          >
            {room.name}
          </div>
        ))}
      </div>
      <div>
        <Room room={currentRoom} loggedInUser={loggedInUser} />
      </div>
    </div>
  );
}
