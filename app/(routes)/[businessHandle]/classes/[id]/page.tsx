"use client";

import { Button } from "@/src/components/ui/button";
import { toast } from "@/src/components/ui/use-toast";
import { useAuthUser } from "@/src/contexts/auth";
import { getClass } from "@/src/data/class";
import { createStripeCheckoutSession } from "@/src/data/stripe";
import { useSupaQuery } from "@/src/hooks/use-supabase";

export default function DanceClass({
  params,
}: {
  params: {
    id: string;
    businessHandle: string;
  };
}) {
  const { user } = useAuthUser();
  const { isLoading, data } = useSupaQuery(
    getClass,
    {
      id: params.id,
      userId: user?.id,
    },
    {
      queryKey: ["getClass", params.id, user?.id],
    },
  );

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
        <p>YOU OWN THIS CLASS</p>
      ) : (
        data.danceClass.stripe_product_id &&
        user && <Button onClick={() => handleBuyClass()}>Buy class</Button>
      )}
    </div>
  );
}
