"use client";

import VideoPlayer from "@/src/components/common/video-player/video-player";
import { Button } from "@/src/components/ui/button";
import { toast } from "@/src/components/ui/use-toast";
import { BUCKETS } from "@/src/consts/storage";
import { useAuthUser } from "@/src/contexts/auth";
import { getClass } from "@/src/data/class";
import { supaClientComponentClient } from "@/src/data/clients/browser";
import { createStripeCheckoutSession } from "@/src/data/stripe";
import { useSupaQuery } from "@/src/hooks/use-supabase";
import { useEffect, useState } from "react";

export default function DanceClass({
  params,
}: {
  params: {
    id: string;
    businessHandle: string;
  };
}) {
  const { user } = useAuthUser();
  const { isLoading, data } = useSupaQuery(getClass, {
    arg: {
      id: params.id,
      userId: user?.id,
    },
    queryKey: ["getClass", params.id, user?.id],
  });

  const [signedVideoUrl, setSignedVideoUrl] = useState<string | undefined>();

  useEffect(() => {
    const fetchSignedVideoUrl = async () => {
      const { data } = await supaClientComponentClient()
        .storage.from(BUCKETS.classes)
        .createSignedUrl(`${params.id}/class`, 24 * 3600);
      console.log(data?.signedUrl);
      setSignedVideoUrl(data?.signedUrl);
    };

    if (data && data.isUserOwner) {
      fetchSignedVideoUrl();
    }
  }, [data, params.id]);

  const handleBuyClass = async () => {
    if (!data?.danceClass?.stripe_product_id || !user) {
      return;
    }
    const checkoutSession = await createStripeCheckoutSession({
      businessHandle: params.businessHandle,
      productId: data.danceClass.stripe_product_id,
      userId: user.id,
    });

    if (!checkoutSession.url) {
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to create checkout session for class ${data.danceClass.title}.`,
      });
      return;
    }
    window.location.href = checkoutSession.url;
  };

  if (isLoading || !data) {
    return <>Loading...</>;
  }
  return (
    <div className="p-4">
      <h1>{data.danceClass.title}</h1>
      <p>{data.danceClass.description}</p>
      {data.isUserOwner ? (
        <>
          <p>YOU OWN THIS CLASS</p>{" "}
          {signedVideoUrl ? (
            <VideoPlayer
              urls={{
                auto: signedVideoUrl,
              }}
              sections={[]}
            />
          ) : (
            <>Loading...</>
          )}
        </>
      ) : (
        data.danceClass.stripe_product_id &&
        user && <Button onClick={() => handleBuyClass()}>Buy class</Button>
      )}
    </div>
  );
}
