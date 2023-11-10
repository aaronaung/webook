import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog";
import SaveServiceForm, {
  SaveServiceFormSchemaType,
} from "../forms/save-service-form";
import { Tables } from "@/types/db.extension";

export function SaveServiceDialog({
  initFormValues,
  onClose,
  isOpen,
  serviceGroupId,
  availableQuestions,
}: {
  initFormValues?: SaveServiceFormSchemaType;
  onClose: () => void;
  isOpen: boolean;
  serviceGroupId?: string;
  availableQuestions?: Tables<"question">[];
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
          availableQuestions={availableQuestions}
        />
      </DialogContent>
    </Dialog>
  );
}
