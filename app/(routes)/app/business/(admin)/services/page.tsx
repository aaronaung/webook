"use client";
import { useCurrentBusinessContext } from "@/src/contexts/current-business";
import { Button } from "@/src/components/ui/button";
import { Square3Stack3DIcon } from "@heroicons/react/24/outline";
import _ from "lodash";
import { useCallback, useState } from "react";
import ServicesTable from "@/src/components/tables/services-table";

import { PlusIcon } from "lucide-react";
import {
  SaveServiceDialog,
  ServiceType,
} from "@/src/components/dialogs/save-service-dialog";
import { SaveServiceFormSchemaType } from "@/src/components/forms/save-service-form";
import { Row } from "@tanstack/react-table";
import { RowAction } from "@/src/components/tables/types";
import EmptyState from "@/src/components/common/empty-state";
import { useSupaMutation, useSupaQuery } from "@/src/hooks/use-supabase";
import {
  GetServicesResponseSingle,
  deleteService,
  getServices,
} from "@/src/data/service";
import { getQuestions } from "@/src/data/question";
import { getAvailabilitySchedules } from "@/src/data/availability";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/src/components/ui/tabs";
import {
  PRICING_INTERVALS,
  SaveAvailabilityBasedServiceFormSchemaType,
} from "@/src/components/forms/save-availability-based-service-form";

type ServiceDialogState = {
  isOpen: boolean;
  initFormValues?: Partial<
    SaveServiceFormSchemaType | SaveAvailabilityBasedServiceFormSchemaType
  >;
  serviceType: ServiceType;
};

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

  const { data: services, isLoading: isServicesLoading } = useSupaQuery(
    getServices,
    currentBusiness.id,
    {
      queryKey: ["getServices", currentBusiness.id],
    },
  );

  const {
    data: availabilitySchedules,
    isLoading: isAvailabilitySchedulesLoading,
  } = useSupaQuery(getAvailabilitySchedules, currentBusiness?.id, {
    queryKey: ["getAvailabilitySchedules", currentBusiness.id],
  });

  const { mutate: _deleteService, isPending: isDeleteSvcPending } =
    useSupaMutation(deleteService, {
      invalidate: [["getServices", currentBusiness.id]],
    });

  const [svcDialogState, setSvcDialogState] = useState<ServiceDialogState>({
    isOpen: false,
    serviceType: ServiceType.AvailabilityBased,
  });

  const onSvcRowAction = useCallback(
    (row: Row<GetServicesResponseSingle>, action: RowAction) => {
      switch (action) {
        case RowAction.EDIT:
          const serviceType = row.original.availability_schedule_id
            ? ServiceType.AvailabilityBased
            : ServiceType.ScheduledEvent;

          const initFormValues =
            serviceType === ServiceType.AvailabilityBased
              ? {
                  id: row.original.id,
                  title: row.original.title,
                  price: row.original.price ?? 0,
                  pricing_interval:
                    Object.keys(PRICING_INTERVALS).find(
                      (k) => k === String(row.original.duration),
                    ) || Object.keys(PRICING_INTERVALS)[1],
                  question_ids: (row.original.questions ?? []).map((q) => q.id),
                  availability_schedule_id:
                    row.original.availability_schedule_id,
                }
              : {
                  id: row.original.id,
                  title: row.original.title,
                  price: row.original.price ?? 0,
                  duration: row.original.duration ?? 0,
                  booking_limit: row.original.booking_limit ?? 0,
                  question_ids: (row.original.questions ?? []).map((q) => q.id),
                };
          setSvcDialogState({
            isOpen: !svcDialogState.isOpen,
            initFormValues,
            serviceType,
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
    },
    [_deleteService, isDeleteSvcPending, svcDialogState.isOpen],
  );

  if (
    isServicesLoading ||
    isQuestionsLoading ||
    isAvailabilitySchedulesLoading
  ) {
    return <>Loading...</>;
  }
  return (
    <div className="flex w-full justify-center">
      <SaveServiceDialog
        isOpen={svcDialogState.isOpen}
        serviceType={svcDialogState.serviceType}
        initFormValues={svcDialogState.initFormValues}
        availableQuestions={questions}
        availableAvailabilitySchedules={availabilitySchedules}
        onClose={() =>
          setSvcDialogState({
            ...svcDialogState,
            isOpen: !svcDialogState.isOpen,
          })
        }
      />
      <div className="w-full">
        <Tabs defaultValue={ServiceType.AvailabilityBased}>
          <TabsList>
            <TabsTrigger
              key={ServiceType.AvailabilityBased}
              value={ServiceType.AvailabilityBased}
            >
              Availability based (Time flexible)
            </TabsTrigger>
            <TabsTrigger
              key={ServiceType.ScheduledEvent}
              value={ServiceType.ScheduledEvent}
            >
              Event based (Time specific)
            </TabsTrigger>
          </TabsList>

          <TabsContent value={ServiceType.AvailabilityBased}>
            <ServicesTabContent
              serviceType={ServiceType.AvailabilityBased}
              services={(services || []).filter((s) =>
                Boolean(s.availability_schedule_id),
              )}
              onSvcRowAction={onSvcRowAction}
              svcDialogState={svcDialogState}
              setSvcDialogState={setSvcDialogState}
            />
          </TabsContent>
          <TabsContent value={ServiceType.ScheduledEvent}>
            <ServicesTabContent
              serviceType={ServiceType.ScheduledEvent}
              services={(services || []).filter(
                (s) => !Boolean(s.availability_schedule_id),
              )}
              onSvcRowAction={onSvcRowAction}
              svcDialogState={svcDialogState}
              setSvcDialogState={setSvcDialogState}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function ServicesTabContent({
  serviceType,
  services,
  onSvcRowAction,
  svcDialogState,
  setSvcDialogState,
}: {
  serviceType: ServiceType;
  services: GetServicesResponseSingle[];
  onSvcRowAction: (
    row: Row<GetServicesResponseSingle>,
    action: RowAction,
  ) => void;
  svcDialogState: ServiceDialogState;
  setSvcDialogState: React.Dispatch<React.SetStateAction<ServiceDialogState>>;
}) {
  return _.isEmpty(services) ? (
    <EmptyState
      Icon={Square3Stack3DIcon}
      title="No service found"
      description="Create services for your customers to start booking."
      actionButtonText="New service"
      onAction={() =>
        setSvcDialogState({
          isOpen: !svcDialogState.isOpen,
          initFormValues: {
            pricing_interval: Object.keys(PRICING_INTERVALS)[1], // hourly,
          },
          serviceType,
        })
      }
    />
  ) : (
    <>
      <div className="mt-4 max-h-[600px] overflow-scroll ">
        <ServicesTable
          data={services || []}
          hiddenColumns={
            serviceType === ServiceType.AvailabilityBased
              ? {
                  id: true,
                  booking_limit: true,
                  duration: true,
                  questions: true,
                }
              : {
                  id: true,
                  questions: true,
                  availability_schedule: true,
                }
          }
          onRowAction={onSvcRowAction}
        />
      </div>
      <Button
        className="float-right mt-2"
        onClick={() =>
          setSvcDialogState({
            isOpen: !svcDialogState.isOpen,
            initFormValues: {
              pricing_interval: Object.keys(PRICING_INTERVALS)[1], // hourly,
            },
            serviceType,
          })
        }
      >
        <PlusIcon className="mr-1 h-5 w-5" /> New service
      </Button>
    </>
  );
}
