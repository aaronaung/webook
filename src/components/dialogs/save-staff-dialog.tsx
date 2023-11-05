import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog";
import SaveStaffForm, {
  SaveStaffFormSchemaType,
} from "../forms/save-staff-form";

export function SaveStaffDialog({
  initFormValues,
  onClose,
  isOpen,
}: {
  initFormValues?: SaveStaffFormSchemaType;
  onClose: () => void;
  isOpen: boolean;
}) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{initFormValues ? "Edit" : "Add"} staff</DialogTitle>
        </DialogHeader>
        <SaveStaffForm defaultValues={initFormValues} onSubmitted={onClose} />
      </DialogContent>
    </Dialog>
  );
}
