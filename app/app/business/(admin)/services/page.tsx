"use client";
import { useCurrentBusinessContext } from "@/src/contexts/current-business";
import { Button } from "@/src/components/ui/button";
import { useServiceGroupsWithServices } from "@/src/hooks/use-service-groups-with-services";
import {
  PencilSquareIcon,
  PlusIcon,
  Square3Stack3DIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import _ from "lodash";
import { useRouter } from "next/navigation";
import { SaveServiceGroupDialog } from "@/src/components/dialogs/save-service-group-dialog";
import { useState } from "react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/src/components/ui/tabs";
import ServicesTable from "@/src/components/tables/services-table";

// TODO: IMPORTANT (the styling doesn't work perfect for a lot of service groups and mobile)
export default function Services() {
  const { currentBusiness } = useCurrentBusinessContext();
  const router = useRouter();

  const [isCreateSGDialogOpen, setIsCreateSGDialogOpen] = useState(false);

  const { data: serviceGroups, isLoading: isServiceGroupsLoading } =
    useServiceGroupsWithServices(currentBusiness?.id);

  if (isServiceGroupsLoading) {
    return <></>;
  }
  return (
    <div className="flex w-full justify-center">
      <SaveServiceGroupDialog
        isOpen={isCreateSGDialogOpen}
        toggleOpen={() => setIsCreateSGDialogOpen(!isCreateSGDialogOpen)}
      />
      {_.isEmpty(serviceGroups) ? (
        <div className="flex  max-w-[400px] flex-col items-center gap-y-2 text-center">
          <Square3Stack3DIcon className="h-12 w-12" />
          <h3 className="">No service group found</h3>
          <p className="text-sm text-muted-foreground">
            Service groups help you categorize your services.
          </p>
          <Button
            className="mt-2"
            onClick={() => setIsCreateSGDialogOpen(true)}
          >
            Start by creating one
          </Button>
        </div>
      ) : (
        <div className="w-full">
          <Tabs defaultValue={serviceGroups[0].id}>
            <div className="flex flex-col items-center justify-between md:flex-row">
              <div className="max-w-full flex-grow overflow-x-scroll md:max-w-[600px]">
                <TabsList>
                  {serviceGroups.map((sg) => (
                    <TabsTrigger key={sg.id} value={sg.id}>
                      {sg.title}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>
              <div className="mt-4 flex space-x-2 md:mt-0">
                <Button onClick={() => setIsCreateSGDialogOpen(true)}>
                  <PlusIcon className="h-5 w-5" />
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => setIsCreateSGDialogOpen(true)}
                >
                  <PencilSquareIcon className="h-5 w-5" />
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => setIsCreateSGDialogOpen(true)}
                >
                  <TrashIcon className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {serviceGroups.map((sg) => (
              <TabsContent key={sg.id} value={sg.id}>
                {_.isEmpty(sg.services) ? (
                  <div className="mt-20 flex flex-col items-center gap-y-2 text-center">
                    <Square3Stack3DIcon className="h-12 w-12" />
                    <h3 className="">No service found</h3>

                    <Button
                      className="mt-2"
                      onClick={() => setIsCreateSGDialogOpen(true)}
                    >
                      Start by creating one
                    </Button>
                  </div>
                ) : (
                  <div className="mt-6 max-h-[600px] overflow-scroll ">
                    <ServicesTable data={sg.services || []} />
                  </div>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </div>
      )}
    </div>
  );
}
