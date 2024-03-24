"use client";

import ClassCard from "@/src/components/common/class-card";
import InstructorCard from "@/src/components/common/instructor-card";
import { ClassActionType } from "@/src/consts/classes";
import { ClassWithBusiness } from "@/src/data/class";
import { Tables } from "@/types/db";

export default function ExploreView({
  businesses,
  classes,
}: {
  businesses: Tables<"businesses">[];
  classes: {
    owned: ClassWithBusiness[];
    notOwned: ClassWithBusiness[];
  };
}) {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <p className="mb-2 text-xl font-bold">Trending Instructors</p>
        <div className="flex flex-col gap-2 p-2">
          {businesses.map((business) => {
            return <InstructorCard key={business.id} business={business} />;
          })}
        </div>
      </div>
      <div>
        <p className="mb-2 text-xl font-bold">Trending Classes</p>
        <div className="gird-cols-1 grid gap-2 p-2 sm:grid-cols-3">
          {classes.notOwned.map((danceClass) => {
            return (
              <ClassCard
                key={danceClass.id}
                danceClass={danceClass}
                classActionType={ClassActionType.Buy}
              />
            );
          })}
          {classes.owned.map((danceClass) => {
            return (
              <ClassCard
                key={danceClass.id}
                danceClass={danceClass}
                classActionType={ClassActionType.View}
                hidePriceTag
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
