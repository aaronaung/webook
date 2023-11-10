import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog";
import SaveQuestionForm, {
  SaveQuestionFormSchemaType,
} from "../forms/save-question-form";

export function SaveQuestionDialog({
  initFormValues,
  onClose,
  isOpen,
}: {
  initFormValues?: SaveQuestionFormSchemaType;
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
          onSubmitted={onClose}
        />
      </DialogContent>
    </Dialog>
  );
}
