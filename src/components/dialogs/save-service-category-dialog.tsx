import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog";
import SaveServiceCategoryForm, {
  SaveServiceCategoryFormSchemaType,
} from "../forms/save-service-category-form";

export function SaveServiceCategoryDialog({
  initFormValues,
  onClose,
  isOpen,
}: {
  initFormValues?: SaveServiceCategoryFormSchemaType;
  onClose: () => void;
  isOpen: boolean;
}) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {initFormValues ? "Edit" : "Add"} service category
          </DialogTitle>
        </DialogHeader>
        {/**
         * It's important to put the form in its own component.
         * Upon dialog open, this forces a re-render of the component which sets the default values.
         * RHF only sets the default values on the first render of the component.
         */}
        <SaveServiceCategoryForm
          defaultValues={initFormValues}
          onSubmitted={onClose}
        />
      </DialogContent>
    </Dialog>
  );
}
