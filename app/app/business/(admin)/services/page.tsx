"use client";
import { useCurrentBusinessContext } from "@/src/contexts/current-business";
import { Button } from "@/src/components/ui/button";
import { useServiceGroupsWithServices } from "@/src/hooks/use-service-groups-with-services";
import { Square3Stack3DIcon } from "@heroicons/react/24/outline";
import _ from "lodash";
import { useRouter } from "next/navigation";

export default function Services() {
  const { currentBusiness } = useCurrentBusinessContext();
  const router = useRouter();

  const { data: serviceGroups, isLoading: isServiceGroupsLoading } =
    useServiceGroupsWithServices(currentBusiness?.id);

  if (isServiceGroupsLoading) {
    return <></>;
  }
  return (
    <div className="flex justify-center">
      {_.isEmpty(serviceGroups) ? (
        <div className="flex  max-w-[400px] flex-col items-center gap-y-2 text-center">
          <Square3Stack3DIcon className="h-12 w-12" />
          <h3 className="">No service group found</h3>
          <p className="text-sm text-muted-foreground">
            Service groups help you categorize your services.
          </p>
          <Button className="mt-2">Start by creating one</Button>
        </div>
      ) : (
        <div></div>
      )}
    </div>
  );
}
