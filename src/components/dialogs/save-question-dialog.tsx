import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog";
import SaveQuestionForm, {
  SaveQuestionFormSchemaType,
} from "../forms/save-question-form";
import { Service } from "@/types";

export function SaveQuestionDialog({
  initFormValues,
  availableServices,
  onClose,
  isOpen,
}: {
  initFormValues?: SaveQuestionFormSchemaType;
  availableServices: Service[];
  onClose: () => void;
  isOpen: boolean;
}) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{initFormValues ? "Edit" : "Add"} question</DialogTitle>
        </DialogHeader>
        <SaveQuestionForm
          defaultValues={initFormValues}
          availableServices={availableServices}
          onSubmitted={onClose}
        />
      </DialogContent>
    </Dialog>
  );
}
