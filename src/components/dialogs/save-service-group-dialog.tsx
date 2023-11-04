import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog";
import SaveServiceGroupForm, {
  SaveServiceGroupFormSchemaType,
} from "../forms/save-service-group-form";

export function SaveServiceGroupDialog({
  initFormValues,
  onClose,
  isOpen,
}: {
  initFormValues?: SaveServiceGroupFormSchemaType;
  onClose: () => void;
  isOpen: boolean;
}) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {initFormValues ? "Edit" : "Add"} service group
          </DialogTitle>
        </DialogHeader>
        {/**
         * It's important to put the form in its own component.
         * Upon dialog open, this forces a re-render of the component which sets the default values.
         * RHF only sets the default values on the first render of the component.
         */}
        <SaveServiceGroupForm
          defaultValues={initFormValues}
          onSubmitted={onClose}
        />
      </DialogContent>
    </Dialog>
  );
}
