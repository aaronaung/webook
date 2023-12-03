import { PRICING_INTERVALS } from "@/src/components/forms/save-availability-based-service-form";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import PriceTag from "@/src/components/ui/price-tag";
import { GetServicesResponse } from "@/src/data/service";
import { Tables } from "@/types/db.extension";
import Link from "next/link";

export default function BookServicesCard({
  business,
  services,
}: {
  business: Tables<"businesses">;
  services: GetServicesResponse;
}) {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Services</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col  divide-y">
          {(services || []).map((service) => (
            <Link
              href={`${business.handle}/availability/${service.availability_schedule_id}`}
            >
              <div
                key={service.id}
                className="flex cursor-pointer items-center gap-x-4 rounded-lg  px-6 py-5 hover:bg-secondary"
              >
                <div className="flex-shrink-0">
                  <img
                    className="h-10 w-10 rounded-full"
                    src={`https://ui-avatars.com/api/?name=${service.title}`}
                    alt=""
                  />
                </div>
                <div className="flex min-w-0 flex-1 flex-col gap-y-2">
                  <p className="text-sm font-medium text-secondary-foreground">
                    {service.title}
                  </p>
                  {service.description && (
                    <p className="truncate text-sm text-muted-foreground">
                      {service.description}
                    </p>
                  )}
                  <PriceTag
                    price={service.price}
                    suffix={PRICING_INTERVALS[service.duration]}
                  />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
