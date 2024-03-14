"use client";
import ClassCard from "@/src/components/shared/class-card";
import EmptyState from "@/src/components/shared/empty-state";
import { Button } from "@/src/components/ui/button";
import { listClasses } from "@/src/data/class";
import { useSupaQuery } from "@/src/hooks/use-supabase";

export default function Classes() {
  // for now use list classes.
  const { data, isLoading } = useSupaQuery(listClasses, undefined, {
    queryKey: ["listClasses"],
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
          // todo maybe group by business title and make horizontally scrollable like netflix
          return (
            <div className="" key={danceClass.id}>
              <p>{danceClass.business?.title}</p>
              <ClassCard
                danceClass={danceClass}
                footerActionButton={
                  <a
                    href={`${danceClass.business?.handle}/classes/${danceClass.id}`}
                  >
                    <Button className="ml-2">Take class</Button>
                  </a>
                }
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
