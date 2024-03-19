"use client";
import { Card, CardContent, CardFooter } from "@/src/components/ui/card";
import PriceTag from "@/src/components/ui/price-tag";
import { Tables } from "@/types/db";

export default function ClassCard({
  danceClass,
  footerActionButton,
}: {
  danceClass: Tables<"classes">;
  footerActionButton?: React.ReactNode;
}) {
  return (
    <Card key={danceClass.id}>
      <CardContent className="p-0">
        <img
          className="cover h-72 w-full rounded-t-md"
          src={`/offstage_1.jpeg`}
          alt=""
        />
      </CardContent>
      <CardFooter className="items-start p-3">
        <div className="flex min-w-0 flex-1 flex-col gap-y-1">
          <div className="flex">
            <p className="text-md line-clamp-1 font-medium text-secondary-foreground">
              {danceClass.title}
            </p>
            <PriceTag className="ml-2" price={danceClass.price} />
          </div>

          {danceClass.description && (
            <p className="line-clamp-3 text-sm text-muted-foreground">
              {danceClass.description}
            </p>
          )}
        </div>
        {footerActionButton}
      </CardFooter>
    </Card>
  );
}
