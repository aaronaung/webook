"use client";

import { Tables } from "@/types/db.extension";
import Room from "./room";
import { cn } from "@/src/utils";
import { useRouter, useSearchParams } from "next/navigation";
import EmptyState from "../empty-state";
import { ChatBubbleOvalLeftIcon } from "@heroicons/react/24/outline";

export default function Chat({
  loggedInUser,
  business,
  rooms,
}: {
  loggedInUser?: Tables<"users">;
  business?: Tables<"businesses">;
  rooms: Tables<"chat_rooms">[];
}) {
  // todo: if initalRoom is null set to the latest booking room
  const searchParams = useSearchParams();
  const router = useRouter();
  const currentRoomId = searchParams.get("room_id") || rooms[0]?.id || null;
  const currentRoom = rooms.find((room) => room.id === currentRoomId);

  const handleRoomSelect = (newRoomId: string) => {
    const newParams = new URLSearchParams(searchParams.toString());
    newParams.set("room_id", newRoomId);
    router.replace(`${window.location.pathname}?${newParams.toString()}`);
  };

  if (rooms.length === 0) {
    return (
      <EmptyState
        title={"You currently have no messages."}
        description={
          "Once a customer books an appointment with you, you will be able to chat with them here."
        }
        Icon={ChatBubbleOvalLeftIcon}
      />
    );
  }

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
        {currentRoom ? (
          <Room
            room={currentRoom}
            loggedInUser={loggedInUser}
            business={business}
          />
        ) : (
          <div>Room not found.</div>
        )}
      </div>
    </div>
  );
}
