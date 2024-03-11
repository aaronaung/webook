"use client";

import { Button } from "@/src/components/ui/button";
import { toast } from "@/src/components/ui/use-toast";
import { getClass } from "@/src/data/class";
import { createStripeCheckoutSession } from "@/src/data/stripe";
import { getAuthUser } from "@/src/data/user";
import { useSupaQuery } from "@/src/hooks/use-supabase";
import { Tables } from "@/types/db";

export default function DanceClass({
  params,
}: {
  params: {
    id: string;
    businessHandle: string;
  };
}) {
  const { isLoading: isLoadingUser, data: user } = useSupaQuery(getAuthUser);
  const { isLoading, data } = useSupaQuery(getClass, params.id, {
    queryKey: ["getClass", params.id],
  });

  const handleBuyClass = async (
    user: Tables<"users">,
    danceClass: Tables<"classes">,
  ) => {
    const checkoutSession = await createStripeCheckoutSession({
      businessHandle: params.businessHandle,
      productId: danceClass.stripe_product_id,
      userId: user.id,
    });

    if (!checkoutSession.url) {
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to create checkout session for class ${danceClass.title}.`,
      });
      return;
    }
    window.location.href = checkoutSession.url;
  };

  if (isLoadingUser || isLoading || !data || !user) {
    return <>Loading...</>;
  }
  return (
    <div className="p-4">
      <h1>{data.title}</h1>
      <p>{data.description}</p>
      <Button onClick={() => handleBuyClass(user, data)}>Buy class</Button>
    </div>
  );
}
