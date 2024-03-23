import ClassCard from "@/src/components/common/class-card";
import EmptyState from "@/src/components/common/empty-state";
import { Button } from "@/src/components/ui/button";
import { listAuthUserClasses } from "@/src/data/class";
import { supaServerComponentClient } from "@/src/data/clients/server";
import { Tables } from "@/types/db";
import Link from "next/link";

export default async function Classes() {
  const data = await listAuthUserClasses({
    client: supaServerComponentClient(),
  });

  return !data || data.length === 0 ? (
    <div>
      <EmptyState
        title="No classes"
        description="Looks like you haven't bought any classes."
      />
    </div>
  ) : (
    <div className="relative mb-12">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
        {data.map((danceClass) => {
          const business = danceClass.business as Tables<"businesses">;
          // todo maybe group by business title and make horizontally scrollable like netflix
          return (
            <div key={danceClass.id}>
              <ClassCard
                danceClass={danceClass}
                hidePriceTag
                footerAction={
                  <Link href={`/${business?.handle}/classes/${danceClass.id}`}>
                    <Button className="ml-2 rounded-full">View lesson</Button>
                  </Link>
                }
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
