"use client";
import { useCurrentBusinessContext } from "@/src/contexts/current-business";
import { Button } from "@/src/components/ui/button";
import { useServiceGroupsWithServices } from "@/src/hooks/use-service-groups-with-services";
import { Square3Stack3DIcon } from "@heroicons/react/24/outline";
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
    <div className="flex justify-center">
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
        <div>
          <Button onClick={() => setIsCreateSGDialogOpen(true)}>
            New Group
          </Button>
          <Tabs defaultValue="account" className="w-[400px]">
            <TabsList>
              {serviceGroups.map((sg) => (
                <TabsTrigger key={sg.id} value={sg.id}>
                  {sg.title}
                </TabsTrigger>
              ))}
            </TabsList>
            {serviceGroups.map((sg) => (
              <TabsContent key={sg.id} value={sg.id}>
                {/** todo - add datatable here */}
                <ul>
                  {(sg.services || []).map((s) => (
                    <li key={s.id}>{s.title}</li>
                  ))}
                </ul>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      )}
    </div>
  );
}
