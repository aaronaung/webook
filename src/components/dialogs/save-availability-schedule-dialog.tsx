import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog";
import SaveAvailabilityScheduleForm, {
  SaveAvailabilityScheduleFormSchemaType,
} from "../forms/save-availability-schedule-form";

export function SaveAvailabilityScheduleDialog({
  initFormValues,
  onClose,
  isOpen,
}: {
  initFormValues?: SaveAvailabilityScheduleFormSchemaType;
  onClose: () => void;
  isOpen: boolean;
}) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {initFormValues ? "Edit" : "Add"} availability schedule
          </DialogTitle>
        </DialogHeader>
        {/**
         * It's important to put the form in its own component.
         * Upon dialog open, this forces a re-render of the component which sets the default values.
         * RHF only sets the default values on the first render of the component.
         */}
        <SaveAvailabilityScheduleForm
          defaultValues={initFormValues}
          onSubmitted={onClose}
        />
      </DialogContent>
    </Dialog>
  );
}
