"use client";

import { Spinner } from "@/src/components/common/loading-spinner";
import { Button } from "@/src/components/ui/button";
import { useCurrentViewingBusinessContext } from "@/src/contexts/current-viewing-business";
import { useBuyDanceClass } from "@/src/hooks/use-buy-dance-class";
import { Tables } from "@/types/db";
import dynamic from "next/dynamic";

// Disable ssr on VideoPlayer to avoid Hydration Error.
const VideoPlayer = dynamic(
  () => import("@/src/components/common/video-player/video-player"),
  { ssr: false },
);

export default function ClassView({
  user,
  danceClass,
  isUserOwner,
  videoUrl,
}: {
  user: Tables<"users">;
  danceClass: Tables<"classes">;
  isUserOwner: boolean;
  videoUrl: string;
}) {
  const { currentViewingBusiness } = useCurrentViewingBusinessContext();
  const { buy } = useBuyDanceClass({
    user,
    business: currentViewingBusiness,
  });

  return (
    <div className="p-4">
      <h1>{danceClass.title}</h1>
      <p>{danceClass.description}</p>
      {isUserOwner ? (
        <>
          <p>YOU OWN THIS CLASS</p>{" "}
          {videoUrl ? (
            <VideoPlayer
              urls={{
                auto: videoUrl,
              }}
              sections={[]}
            />
          ) : (
            <Spinner />
          )}
        </>
      ) : (
        danceClass.stripe_product_id &&
        user && <Button onClick={() => buy(danceClass)}>Buy class</Button>
      )}
    </div>
  );
}
