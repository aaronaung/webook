import { Button } from "@/src/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog";
import { useRef } from "react";
import { useCurrentBusinessContext } from "@/src/contexts/current-business";
import SaveServiceForm, {
  SaveServiceFormSchemaType,
} from "../forms/save-service-form";
import { useSaveService } from "@/src/hooks/use-save-service";

export function SaveServiceDialog({
  data,
  toggleOpen,
  isOpen,
  serviceGroupId,
}: {
  data?: SaveServiceFormSchemaType & { id?: string };
  toggleOpen: () => void;
  isOpen: boolean;
  serviceGroupId?: string;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const { currentBusiness } = useCurrentBusinessContext();
  const { mutate: saveService, isPending } = useSaveService(
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

  const handleOnFormSuccess = (formValues: SaveServiceFormSchemaType) => {
    saveService({
      ...formValues,
      ...(data ? { id: data.id } : {}), // if data exists, then we are editing an existing service  (not creating a new one)
      service_group_id: serviceGroupId,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={toggleOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Service</DialogTitle>
        </DialogHeader>
        <SaveServiceForm
          ref={formRef}
          defaultValues={data}
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
