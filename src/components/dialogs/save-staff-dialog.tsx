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
import SaveStaffForm, {
  SaveStaffFormSchemaType,
} from "../forms/save-staff-form";
import { useSaveStaff } from "@/src/hooks/use-save-staff";
import { Loader2Icon } from "lucide-react";

export function SaveStaffDialog({
  data,
  toggleOpen,
  isOpen,
}: {
  data?: SaveStaffFormSchemaType;
  toggleOpen: () => void;
  isOpen: boolean;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const { currentBusiness } = useCurrentBusinessContext();
  const { mutateAsync: saveStaff, isPending } = useSaveStaff(
    currentBusiness.id,
  );
  const handleSubmitForm = () => {
    formRef?.current?.requestSubmit();
  };

  const handleOnFormSuccess = async (
    formValues: SaveStaffFormSchemaType,
    headshotFile?: File,
  ) => {
    await saveStaff({
      newStaff: {
        ...formValues,
        id: data?.id,
        business_id: currentBusiness.id,
        updated_at: new Date().toISOString(),
      },
      headshotFile: headshotFile,
    });

    toggleOpen();
  };

  return (
    <Dialog open={isOpen} onOpenChange={toggleOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{data ? "Edit" : "Add"} staff</DialogTitle>
        </DialogHeader>
        <SaveStaffForm
          ref={formRef}
          defaultValues={data}
          onFormSuccess={handleOnFormSuccess}
        />
        <DialogFooter>
          <Button onClick={handleSubmitForm} disabled={isPending}>
            {isPending && (
              <Loader2Icon className="mr-1 animate-spin text-muted-foreground" />
            )}
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
