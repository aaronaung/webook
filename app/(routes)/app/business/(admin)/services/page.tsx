"use client";
import { useCurrentBusinessContext } from "@/src/contexts/current-business";
import { Button } from "@/src/components/ui/button";
import {
  PencilSquareIcon,
  Square3Stack3DIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import _ from "lodash";
import { SaveServiceCategoryDialog } from "@/src/components/dialogs/save-service-category-dialog";
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
import { Service, ServiceCategoryWithServices } from "@/types";
import { DeleteConfirmationDialog } from "@/src/components/dialogs/delete-confirmation-dialog";
import { RowAction } from "@/src/components/tables/types";
import { SaveServiceCategoryFormSchemaType } from "@/src/components/forms/save-service-category-form";
import EmptyState from "@/src/components/shared/empty-state";
import { useSupaMutation, useSupaQuery } from "@/src/hooks/use-supabase";
import {
  deleteService,
  deleteServiceCategory,
  getServiceCategoriesWithServices,
} from "@/src/data/service";
import { getQuestions } from "@/src/data/question";

// TODO: IMPORTANT (the styling doesn't work perfect for a lot of service categories on mobile)
export default function Services() {
  const { currentBusiness } = useCurrentBusinessContext();

  const { data: questions, isLoading: isQuestionsLoading } = useSupaQuery(
    getQuestions,
    currentBusiness.id,
    {
      queryKey: ["getQuestions", currentBusiness.id],
    },
  );

  const { data: serviceCategories, isLoading: isServiceCategoriesLoading } =
    useSupaQuery(getServiceCategoriesWithServices, currentBusiness?.id, {
      queryKey: ["getServiceCategoriesWithServices", currentBusiness.id],
    });

  const { mutate: _deleteServiceCategory, isPending: isDeleteSgPending } =
    useSupaMutation(deleteServiceCategory, {
      invalidate: [["getServiceCategoriesWithServices", currentBusiness.id]],
    });

  const { mutate: _deleteService, isPending: isDeleteSvcPending } =
    useSupaMutation(deleteService, {
      invalidate: [["getServiceCategoriesWithServices", currentBusiness.id]],
    });

  const [sgDialogState, setSgDialogState] = useState<{
    isOpen: boolean;
    initFormValues?: SaveServiceCategoryFormSchemaType;
  }>({
    isOpen: false,
  });

  const [svcDialogState, setSvcDialogState] = useState<{
    isOpen: boolean;
    initFormValues?: SaveServiceFormSchemaType;
    serviceCategoryId?: string;
  }>({
    isOpen: false,
  });

  const [confirmDeleteDialogState, setConfirmDeleteDialogState] = useState<{
    isOpen: boolean;
    serviceCategoryId?: string;
  }>({
    isOpen: false,
  });

  const onSvcRowAction = useCallback((row: Row<Service>, action: RowAction) => {
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
            question_ids: (row.original.questions ?? []).map((q) => q.id),
          },
          serviceCategoryId: row.original.service_category_id ?? undefined,
        });
        break;
      case RowAction.DELETE:
        if (!isDeleteSvcPending) {
          _deleteService(row.original.id);
        }
        break;
      default:
        console.error("Unknown row action");
    }
  }, []);

  function handleSgDelete(sg: ServiceCategoryWithServices) {
    if (!_.isEmpty(sg.services)) {
      setConfirmDeleteDialogState({
        isOpen: true,
        serviceCategoryId: sg.id,
      });
      return;
    }
    if (!isDeleteSgPending) {
      _deleteServiceCategory(sg.id);
    }
  }

  if (isServiceCategoriesLoading || isQuestionsLoading) {
    return <>Loading...</>;
  }
  return (
    <div className="flex w-full justify-center">
      <DeleteConfirmationDialog
        label="Deleting service category will delete all services in it. Are you sure?"
        isOpen={confirmDeleteDialogState.isOpen}
        onClose={() =>
          setConfirmDeleteDialogState({
            ...confirmDeleteDialogState,
            isOpen: !confirmDeleteDialogState.isOpen,
          })
        }
        onDelete={() => {
          _deleteServiceCategory(confirmDeleteDialogState.serviceCategoryId!);
        }}
      />
      <SaveServiceCategoryDialog
        isOpen={sgDialogState.isOpen}
        initFormValues={sgDialogState.initFormValues}
        onClose={() =>
          setSgDialogState({ ...sgDialogState, isOpen: !sgDialogState.isOpen })
        }
      />
      <SaveServiceDialog
        isOpen={svcDialogState.isOpen}
        initFormValues={svcDialogState.initFormValues}
        serviceCategoryId={svcDialogState.serviceCategoryId}
        availableQuestions={questions}
        onClose={() =>
          setSvcDialogState({
            ...svcDialogState,
            isOpen: !svcDialogState.isOpen,
          })
        }
      />
      {_.isEmpty(serviceCategories) ? (
        <EmptyState
          Icon={Square3Stack3DIcon}
          title="No service category found"
          description="Service categories are used to group your services."
          actionButtonText="Start by creating one"
          onAction={() =>
            setSgDialogState({
              initFormValues: undefined,
              isOpen: !sgDialogState.isOpen,
            })
          }
        />
      ) : (
        <div className="w-full">
          <Tabs defaultValue={serviceCategories?.[0].id}>
            <div className="flex max-w-full items-center overflow-x-scroll">
              <TabsList className="relative overflow-visible">
                {(serviceCategories || []).map((sg) => (
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
                <PlusIcon className="mr-1 h-5 w-5" /> New category
              </Button>
            </div>

            {(serviceCategories || []).map((sg) => (
              <TabsContent key={sg.id} value={sg.id}>
                {_.isEmpty(sg.services) ? (
                  <EmptyState
                    Icon={Square3Stack3DIcon}
                    title="No service found"
                    description="Create services for your customers to start booking."
                    actionButtonText="New service"
                    onAction={() =>
                      setSvcDialogState({
                        isOpen: !svcDialogState.isOpen,
                        initFormValues: undefined,
                        serviceCategoryId: sg.id,
                      })
                    }
                  />
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
                          serviceCategoryId: sg.id,
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
