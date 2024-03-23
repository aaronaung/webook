"use client";

import ClassCard from "@/src/components/common/class-card";
import { Spinner } from "@/src/components/common/loading-spinner";
import { Button } from "@/src/components/ui/button";
import { listClassProductIdsUserOwn, listClasses } from "@/src/data/class";
import { useBuyDanceClass } from "@/src/hooks/use-buy-dance-class";
import { useSupaQuery } from "@/src/hooks/use-supabase";
import { Tables } from "@/types/db";

export default function ClassesTabContent({
  business,
  user,
}: {
  business: Tables<"businesses">;
  user: Tables<"users">;
}) {
  const { buy } = useBuyDanceClass({
    user,
    business,
  });

  const { isLoading, data } = useSupaQuery(listClasses, {
    arg: business.id,
    queryKey: ["listClasses", business.id],
  });
  const { isLoading: isLoadingUserClasses, data: userClassProductIds } =
    useSupaQuery(listClassProductIdsUserOwn, {
      arg: {
        userId: user?.id,
      },
      queryKey: ["listClassesUserOwn", user?.id],
    });

  if (isLoading || isLoadingUserClasses) {
    return <Spinner />;
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:mt-4 sm:grid-cols-2">
      {(data || []).map((danceClass) => {
        const userIsOwner = userClassProductIds?.some(
          (id) => danceClass.stripe_product_id === id,
        );

        return (
          <ClassCard
            key={danceClass.id}
            danceClass={danceClass}
            hidePriceTag={userIsOwner}
            footerAction={
              userIsOwner ? (
                <a href={`${business.handle}/classes/${danceClass.id}`}>
                  <Button className="ml-2 rounded-full">View lesson</Button>
                </a>
              ) : (
                <Button
                  className="ml-2 rounded-full bg-green-600 hover:bg-green-700"
                  onClick={() => {
                    buy(danceClass);
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
  );
}
