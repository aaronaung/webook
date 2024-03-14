"use client";
import ClassCard from "@/src/components/shared/class-card";
import { Button } from "@/src/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { toast } from "@/src/components/ui/use-toast";
import { useAuthUser } from "@/src/contexts/auth";
import { listClassProductIdsUserOwn, listClasses } from "@/src/data/class";
import { createStripeCheckoutSession } from "@/src/data/stripe";
import { useSupaQuery } from "@/src/hooks/use-supabase";
import { Tables } from "@/types/db";

export default function ClassesTabContent({
  business,
}: {
  business: Tables<"businesses">;
}) {
  const { user } = useAuthUser();
  const { isLoading, data } = useSupaQuery(listClasses, undefined, {
    queryKey: ["listClasses", business.id],
  });
  const { isLoading: isLoadingUserClasses, data: userClassProductIds } =
    useSupaQuery(listClassProductIdsUserOwn, user?.id, {
      queryKey: ["listClassesUserOwn", user?.id],
    });

  const handleBuyClass = async (danceClass: Tables<"classes">) => {
    if (!danceClass.stripe_product_id || !user) {
      return;
    }
    const checkoutSession = await createStripeCheckoutSession({
      businessHandle: business.handle,
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

  if (isLoading || isLoadingUserClasses) {
    return <>Loading...</>;
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Classes</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {(data || []).map((danceClass) => {
            const userIsOwner = userClassProductIds?.some(
              (id) => danceClass.stripe_product_id === id,
            );

            return (
              <ClassCard
                key={danceClass.id}
                danceClass={danceClass}
                footerActionButton={
                  userIsOwner ? (
                    <a href={`${business.handle}/classes/${danceClass.id}`}>
                      <Button className="ml-2">View</Button>
                    </a>
                  ) : (
                    <Button
                      className="ml-2 bg-green-600 hover:bg-green-700"
                      onClick={() => {
                        handleBuyClass(danceClass);
                      }}
                    >
                      Buy
                    </Button>
                  )
                }
              />
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
