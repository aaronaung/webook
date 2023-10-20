import { Button } from "@/src/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog";
import SaveServiceGroupForm, {
  SaveServiceGroupFormSchemaType,
} from "../forms/save-service-group-form";
import { useRef } from "react";
import { useSaveServiceGroup } from "@/src/hooks/use-save-service-group";
import { useCurrentBusinessContext } from "@/src/contexts/current-business";

export function SaveServiceGroupDialog({
  toggleOpen,
  isOpen,
}: {
  toggleOpen: () => void;
  isOpen: boolean;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const { currentBusiness } = useCurrentBusinessContext();
  const { mutate: saveServiceGroup, isPending } = useSaveServiceGroup(
    currentBusiness.id,
    {
      onSettled: () => {
        toggleOpen();
      },
    },
  );
  const handleSubmitForm = () => {
    formRef?.current?.requestSubmit();
  };

  const handleOnFormSuccess = (formValues: SaveServiceGroupFormSchemaType) => {
    saveServiceGroup({
      ...formValues,
      business_id: currentBusiness.id,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={toggleOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Service group</DialogTitle>
        </DialogHeader>
        <SaveServiceGroupForm
          ref={formRef}
          onFormSuccess={handleOnFormSuccess}
        />
        <DialogFooter>
          <Button onClick={handleSubmitForm} disabled={isPending}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
