import ClassCard from "@/src/components/common/class-card";
import EmptyState from "@/src/components/common/empty-state";
import { ClassActionType } from "@/src/consts/classes";
import { listAuthUserClasses } from "@/src/data/class";
import { supaServerComponentClient } from "@/src/data/clients/server";
import { Tables } from "@/types/db";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function Classes() {
  const data = await listAuthUserClasses({
    client: supaServerComponentClient(),
  });

  return !data || data.length === 0 ? (
    <div>
      <EmptyState
        title="No classes"
        description="Looks like you haven't bought any classes."
        actionButtonText="Explore classes"
        onAction={() => {
          redirect("/app/explore");
        }}
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
                classActionType={ClassActionType.View}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
