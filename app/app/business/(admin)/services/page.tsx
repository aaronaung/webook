"use client";
import { useCurrentBusinessContext } from "@/src/contexts/current-business";
import { Button } from "@/src/components/ui/button";
import { useServiceGroupsWithServices } from "@/src/hooks/use-service-groups-with-services";
import {
  PencilSquareIcon,
  Square3Stack3DIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import _ from "lodash";
import { useRouter } from "next/navigation";
import { SaveServiceGroupDialog } from "@/src/components/dialogs/save-service-group-dialog";
import { useCallback, useState } from "react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/src/components/ui/tabs";
import ServicesTable from "@/src/components/tables/services-table";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuTrigger,
} from "@/src/components/ui/context-menu";

import { PlusIcon } from "lucide-react";
import { SaveServiceDialog } from "@/src/components/dialogs/save-service-dialog";
import { SaveServiceFormSchemaType } from "@/src/components/forms/save-service-form";
import { Row } from "@tanstack/react-table";
import { Tables } from "@/types/db.extension";
import { useDeleteServiceGroup } from "@/src/hooks/use-delete-service-group";
import { useDeleteService } from "@/src/hooks/use-delete-service";
import { ServiceGroupWithServices } from "@/types";
import { DeleteConfirmationDialog } from "@/src/components/dialogs/delete-confirmation-dialog";
import { RowAction } from "@/src/components/tables/types";
import { SaveServiceGroupFormSchemaType } from "@/src/components/forms/save-service-group-form";

// TODO: IMPORTANT (the styling doesn't work perfect for a lot of service groups and mobile)
export default function Services() {
  const { currentBusiness } = useCurrentBusinessContext();
  const router = useRouter();

  const { data: serviceGroups, isLoading: isServiceGroupsLoading } =
    useServiceGroupsWithServices(currentBusiness?.id);
  const { mutate: deleteServiceGroup, isPending: isDeleteSgPending } =
    useDeleteServiceGroup(currentBusiness.id);
  const { mutate: deleteService, isPending: isDeleteSvcPending } =
    useDeleteService(currentBusiness.id);

  const [sgDialogState, setSgDialogState] = useState<{
    isOpen: boolean;
    initFormValues?: SaveServiceGroupFormSchemaType;
  }>({
    isOpen: false,
  });

  const [svcDialogState, setSvcDialogState] = useState<{
    isOpen: boolean;
    initFormValues?: SaveServiceFormSchemaType;
    serviceGroupId?: string;
  }>({
    isOpen: false,
  });

  const [confirmDeleteDialogState, setConfirmDeleteDialogState] = useState<{
    isOpen: boolean;
    serviceGroupId?: string;
  }>({
    isOpen: false,
  });

  const onSvcRowAction = useCallback(
    (row: Row<Tables<"service">>, action: RowAction) => {
      switch (action) {
        case RowAction.EDIT:
          setSvcDialogState({
            isOpen: !svcDialogState.isOpen,
            initFormValues: {
              id: row.original.id,
              title: row.original.title,
              price: row.original.price ?? 0,
              duration: row.original.duration ?? 0,
              booking_limit: row.original.booking_limit ?? 0,
            },
            serviceGroupId: row.original.service_group_id ?? undefined,
          });
          break;
        case RowAction.DELETE:
          if (!isDeleteSvcPending) {
            deleteService(row.original.id);
          }
          break;
        default:
          console.error("Unknown row action");
      }
    },
    [],
  );

  function handleSgDelete(sg: ServiceGroupWithServices) {
    if (!_.isEmpty(sg.services)) {
      setConfirmDeleteDialogState({
        isOpen: true,
        serviceGroupId: sg.id,
      });
      return;
    }
    if (!isDeleteSgPending) {
      deleteServiceGroup(sg.id);
    }
  }

  if (isServiceGroupsLoading) {
    return <></>;
  }
  return (
    <div className="flex w-full justify-center">
      <DeleteConfirmationDialog
        label="Deleting service group will delete all services in it. Are you sure?"
        isOpen={confirmDeleteDialogState.isOpen}
        onClose={() =>
          setConfirmDeleteDialogState({
            ...confirmDeleteDialogState,
            isOpen: !confirmDeleteDialogState.isOpen,
          })
        }
        onDelete={() => {
          deleteServiceGroup(confirmDeleteDialogState.serviceGroupId!);
        }}
      />
      <SaveServiceGroupDialog
        isOpen={sgDialogState.isOpen}
        initFormValues={sgDialogState.initFormValues}
        onClose={() =>
          setSgDialogState({ ...sgDialogState, isOpen: !sgDialogState.isOpen })
        }
      />
      <SaveServiceDialog
        isOpen={svcDialogState.isOpen}
        initFormValues={svcDialogState.initFormValues}
        serviceGroupId={svcDialogState.serviceGroupId}
        onClose={() =>
          setSvcDialogState({
            ...svcDialogState,
            isOpen: !svcDialogState.isOpen,
          })
        }
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
            onClick={() =>
              setSgDialogState({
                initFormValues: undefined,
                isOpen: !sgDialogState.isOpen,
              })
            }
          >
            Start by creating one
          </Button>
        </div>
      ) : (
        <div className="w-full">
          <Tabs defaultValue={serviceGroups[0].id}>
            <div className="flex max-w-full items-center overflow-x-scroll">
              <TabsList className="relative overflow-visible">
                {serviceGroups.map((sg) => (
                  <ContextMenu key={sg.id}>
                    <ContextMenuTrigger>
                      <TabsTrigger key={sg.id} value={sg.id}>
                        {sg.color && (
                          <div
                            className="mr-1.5 h-3 w-3 rounded !bg-cover !bg-center transition-all"
                            style={{ background: sg.color }}
                          ></div>
                        )}
                        {sg.title}
                      </TabsTrigger>
                    </ContextMenuTrigger>
                    <ContextMenuContent className="w-fit min-w-[200px]">
                      <ContextMenuLabel inset>{sg.title}</ContextMenuLabel>
                      <ContextMenuSeparator />
                      <ContextMenuItem
                        inset
                        onClick={() =>
                          setSgDialogState({
                            initFormValues: sg,
                            isOpen: !sgDialogState.isOpen,
                          })
                        }
                      >
                        Edit
                        <ContextMenuShortcut>
                          <PencilSquareIcon className="h-5 w-5" />
                        </ContextMenuShortcut>
                      </ContextMenuItem>
                      <ContextMenuItem inset onClick={() => handleSgDelete(sg)}>
                        Delete
                        <ContextMenuShortcut>
                          <TrashIcon className="h-5 w-5 text-destructive" />
                        </ContextMenuShortcut>
                      </ContextMenuItem>
                    </ContextMenuContent>
                  </ContextMenu>
                ))}
              </TabsList>
              <Button
                className="ml-2"
                onClick={() =>
                  setSgDialogState({
                    initFormValues: undefined,
                    isOpen: !sgDialogState.isOpen,
                  })
                }
              >
                <PlusIcon className="mr-1 h-5 w-5" /> New group
              </Button>
            </div>

            {serviceGroups.map((sg) => (
              <TabsContent key={sg.id} value={sg.id}>
                {_.isEmpty(sg.services) ? (
                  <div className="mt-20 flex flex-col items-center gap-y-2 text-center">
                    <Square3Stack3DIcon className="h-12 w-12" />
                    <h3 className="">No service found</h3>
                    <Button
                      className="mt-2"
                      onClick={() =>
                        setSvcDialogState({
                          isOpen: !svcDialogState.isOpen,
                          initFormValues: undefined,
                          serviceGroupId: sg.id,
                        })
                      }
                    >
                      Start by creating one
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="mt-4 max-h-[600px] overflow-scroll ">
                      <ServicesTable
                        data={sg.services || []}
                        onRowAction={onSvcRowAction}
                      />
                    </div>
                    <Button
                      className="float-right mt-2"
                      onClick={() =>
                        setSvcDialogState({
                          isOpen: !svcDialogState.isOpen,
                          initFormValues: undefined,
                          serviceGroupId: sg.id,
                        })
                      }
                    >
                      <PlusIcon className="mr-1 h-5 w-5" /> New service
                    </Button>
                  </>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </div>
      )}
    </div>
  );
}
