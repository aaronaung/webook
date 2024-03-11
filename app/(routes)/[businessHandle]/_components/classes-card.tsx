"use client";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import PriceTag from "@/src/components/ui/price-tag";
import { listClasses } from "@/src/data/class";
import { useSupaQuery } from "@/src/hooks/use-supabase";
import { Tables } from "@/types/db";
import Link from "next/link";

export default function ClassesCard({
  business,
}: {
  business: Tables<"businesses">;
}) {
  const { isLoading, data } = useSupaQuery(listClasses, undefined, {
    queryKey: ["listClasses", business.id],
  });

  if (isLoading) {
    return <>Loading...</>;
  }
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Classes</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col  divide-y">
          {(data || []).map((danceClass) => (
            <Link
              key={danceClass.id}
              href={`${business.handle}/classes/${danceClass.id}`}
            >
              <div
                key={danceClass.id}
                className="flex cursor-pointer items-center gap-x-4 rounded-lg  px-6 py-5 hover:bg-secondary"
              >
                <div className="flex-shrink-0">
                  <img
                    className="h-10 w-10 rounded-full"
                    src={`https://ui-avatars.com/api/?name=${danceClass.title}`}
                    alt=""
                  />
                </div>
                <div className="flex min-w-0 flex-1 flex-col gap-y-2">
                  <p className="text-sm font-medium text-secondary-foreground">
                    {danceClass.title}
                  </p>
                  {danceClass.description && (
                    <p className="truncate text-sm text-muted-foreground">
                      {danceClass.description}
                    </p>
                  )}
                  <PriceTag price={danceClass.price} />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
