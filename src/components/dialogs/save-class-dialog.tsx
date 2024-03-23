import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog";
import SaveClassForm, {
  SaveClassFormSchemaType,
} from "../forms/save-class-form";

export function SaveClassDialog({
  initFormValues,
  onClose,
  isOpen,
}: {
  initFormValues?: Partial<SaveClassFormSchemaType>;
  onClose: () => void;
  isOpen: boolean;
}) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="min-w-screen h-screen">
        <DialogHeader>
          <DialogTitle>{initFormValues?.id ? "Edit" : "Add"} class</DialogTitle>
        </DialogHeader>
        <SaveClassForm defaultValues={initFormValues} onSubmitted={onClose} />
      </DialogContent>
    </Dialog>
  );
}
