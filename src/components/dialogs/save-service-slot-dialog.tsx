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
import SaveServiceSlotForm, {
  SaveServiceSlotFormSchemaType,
} from "../forms/save-service-slot-form";
import { Tables } from "@/types/db.extension";
import { useSaveServiceSlot } from "@/src/hooks/use-save-service-slot";

export function SaveServiceSlotDialog({
  data,
  toggleOpen,
  isOpen,
  service,
}: {
  data?: SaveServiceSlotFormSchemaType;
  toggleOpen: () => void;
  isOpen: boolean;
  service?: Tables<"service">;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const { currentBusiness } = useCurrentBusinessContext();
  const { mutate: saveServiceSlot, isPending } = useSaveServiceSlot(
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

  const handleOnFormSuccess = (formValues: SaveServiceSlotFormSchemaType) => {
    saveServiceSlot({
      ...(data ? { id: data.id } : {}), // if data exists, then we are editing an existing service  (not creating a new one)
      service_id: service?.id,
      start: formValues.start.toISOString(),
      recurrence_start: formValues.recurrenceEnabled
        ? formValues.recurrence_start?.toISOString()
        : null,
      recurrence_interval: formValues.recurrenceEnabled
        ? formValues.recurrence_interval
        : null,
      recurrence_count: formValues.recurrenceEnabled
        ? formValues.recurrence_count
        : null,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={toggleOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{data?.id ? "Edit" : "Add"} service slot</DialogTitle>
        </DialogHeader>
        <SaveServiceSlotForm
          ref={formRef}
          service={service}
          defaultValues={data}
          onFormSuccess={handleOnFormSuccess}
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
