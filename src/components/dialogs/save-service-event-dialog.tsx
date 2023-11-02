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
import { Loader2 } from "lucide-react";

export function SaveServiceEventDialog({
  data,
  toggleOpen,
  isOpen,
  isRecurrentEvent,
  service,
  availableServices,
  availableStaffs,
}: {
  data?: Partial<SaveServiceEventFormSchemaType>;
  toggleOpen: () => void;
  isOpen: boolean;
  isRecurrentEvent?: boolean;
  service?: Tables<"service">;
  availableServices?: Tables<"service">[];
  availableStaffs?: Tables<"staff">[];
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const { currentBusiness } = useCurrentBusinessContext();
  const { mutate: saveServiceEvent, isPending } = useSaveServiceEvent(
    currentBusiness,
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
    liveStreamEnabled: boolean,
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
      staff_ids: formValues.staff_ids,
      service: availableServices?.find((s) => s.id === formValues.service_id),
      live_stream_enabled: liveStreamEnabled,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={toggleOpen}>
      <DialogContent className="sm:max-w-[425px]">
        {!isRecurrentEvent && (
          <DialogHeader>
            <DialogTitle>{data?.id ? "Edit" : "Add"} service event</DialogTitle>
          </DialogHeader>
        )}
        <SaveServiceEventForm
          ref={formRef}
          defaultValues={data}
          isRecurrentEvent={isRecurrentEvent}
          onFormSuccess={handleOnFormSuccess}
          availableServices={availableServices}
          availableStaffs={availableStaffs}
        />
        {!isRecurrentEvent && (
          <DialogFooter>
            <Button onClick={handleSubmitForm} disabled={isPending}>
              {isPending ? <Loader2 className="animate-spin" /> : "Save"}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
