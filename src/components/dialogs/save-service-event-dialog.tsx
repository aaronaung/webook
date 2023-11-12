import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog";
import SaveServiceEventForm, {
  SaveServiceEventFormSchemaType,
} from "../forms/save-service-event-form";
import { Tables } from "@/types/db.extension";

export function SaveServiceEventDialog({
  initFormValues,
  onClose,
  isOpen,
  isRecurrentEvent,
  availableServices,
  availableStaffs,
}: {
  initFormValues?: Partial<SaveServiceEventFormSchemaType>;
  onClose: () => void;
  isOpen: boolean;
  isRecurrentEvent?: boolean;
  availableServices?: Tables<"services">[];
  availableStaffs?: Tables<"staffs">[];
}) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        {!isRecurrentEvent && (
          <DialogHeader>
            <DialogTitle>
              {initFormValues?.id ? "Edit" : "Add"} service event
            </DialogTitle>
          </DialogHeader>
        )}
        <SaveServiceEventForm
          defaultValues={initFormValues}
          isRecurrentEvent={isRecurrentEvent}
          availableServices={availableServices}
          availableStaffs={availableStaffs}
          onSubmitted={onClose}
        />
      </DialogContent>
    </Dialog>
  );
}
