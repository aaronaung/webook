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
import SaveAvailabilityBasedServiceForm from "../forms/save-availability-based-service-form";

export enum ServiceType {
  AvailabilityBased = "Availability based",
  ScheduledEvent = "Scheduled event",
}
export function SaveServiceDialog({
  initFormValues,
  onClose,
  isOpen,
  serviceType,
  availableQuestions,
  availableAvailabilitySchedules,
}: {
  initFormValues?: Partial<SaveServiceFormSchemaType>;
  onClose: () => void;
  isOpen: boolean;
  serviceType: ServiceType;
  availableQuestions?: Tables<"questions">[];
  availableAvailabilitySchedules?: Tables<"availability_schedules">[];
}) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {initFormValues?.id ? "Edit" : "Add"} service
          </DialogTitle>
        </DialogHeader>
        {serviceType === ServiceType.AvailabilityBased && (
          <SaveAvailabilityBasedServiceForm
            defaultValues={initFormValues}
            onSubmitted={onClose}
            availableQuestions={availableQuestions}
            availableAvailabilitySchedules={availableAvailabilitySchedules}
          />
        )}
        {serviceType === ServiceType.ScheduledEvent && (
          <SaveServiceForm
            defaultValues={initFormValues}
            onSubmitted={onClose}
            availableQuestions={availableQuestions}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
