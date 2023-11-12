"use client";

import { Button } from "@/src/components/ui/button";
import Link from "next/link";
import { useState } from "react";

export default function ZoomTest() {
  const [joinUrl, setJoinUrl] = useState<string>("");
  const [isCreating, setIsCreating] = useState(false);
  const createZoomMeeting = async () => {
    setIsCreating(true);
    const resp = await fetch("/api/live-stream/meeting", { method: "POST" });
    const createResult = await resp.json();
    setIsCreating(false);

    setJoinUrl(createResult.join_url);
  };

  return (
    <div>
      <Button
        className="mb-2"
        disabled={isCreating}
        onClick={() => {
          createZoomMeeting();
        }}
      >
        Create zoom meeting
      </Button>
      {joinUrl && <Link href={joinUrl}>{joinUrl}</Link>}
    </div>
  );
}
