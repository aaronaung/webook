import { Button } from "@/src/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog";
import { useRef } from "react";
import { useCurrentBusinessContext } from "@/src/contexts/current-business";
import SaveServiceEventForm, {
  SaveServiceEventFormSchemaType,
} from "../forms/save-service-event-form";
import { Tables } from "@/types/db.extension";
import { useSaveServiceEvent } from "@/src/hooks/use-save-service-event";

export function SaveServiceEventDialog({
  data,
  toggleOpen,
  isOpen,
  availableServices,
  availableStaffs,
}: {
  data?: Partial<SaveServiceEventFormSchemaType>;
  toggleOpen: () => void;
  isOpen: boolean;
  availableServices?: Tables<"service">[];
  availableStaffs?: Tables<"staff">[];
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const { currentBusiness } = useCurrentBusinessContext();
  const { mutate: saveServiceEvent, isPending } = useSaveServiceEvent(
    currentBusiness.handle,
    {
      onSettled: () => {
        toggleOpen();
      },
    },
  );
  const handleSubmitForm = () => {
    formRef?.current?.requestSubmit();
  };

  const handleOnFormSuccess = (
    formValues: SaveServiceEventFormSchemaType,
    recurrenceEnabled: boolean,
  ) => {
    saveServiceEvent({
      ...(data ? { id: data.id } : {}), // if data exists, then we are editing an existing service  (not creating a new one)
      service_id: formValues.service_id,
      start: formValues.start.toISOString(),
      recurrence_start: recurrenceEnabled
        ? formValues.recurrence_start?.toISOString()
        : null,
      recurrence_interval: recurrenceEnabled
        ? formValues.recurrence_interval
        : null,
      recurrence_count: recurrenceEnabled ? formValues.recurrence_count : null,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={toggleOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{data?.id ? "Edit" : "Add"} service event</DialogTitle>
        </DialogHeader>
        <SaveServiceEventForm
          ref={formRef}
          defaultValues={data}
          onFormSuccess={handleOnFormSuccess}
          availableServices={availableServices}
          availableStaffs={availableStaffs}
        />
        <DialogFooter>
          <Button onClick={handleSubmitForm} disabled={isPending}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
