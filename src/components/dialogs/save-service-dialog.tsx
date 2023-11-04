import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog";
import SaveServiceForm, {
  SaveServiceFormSchemaType,
} from "../forms/save-service-form";

export function SaveServiceDialog({
  initFormValues,
  onClose,
  isOpen,
  serviceGroupId,
}: {
  initFormValues?: SaveServiceFormSchemaType;
  onClose: () => void;
  isOpen: boolean;
  serviceGroupId?: string;
}) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{initFormValues ? "Edit" : "Add"} service</DialogTitle>
        </DialogHeader>
        <SaveServiceForm
          defaultValues={initFormValues}
          onSubmitted={onClose}
          serviceGroupId={serviceGroupId}
        />
      </DialogContent>
    </Dialog>
  );
}
