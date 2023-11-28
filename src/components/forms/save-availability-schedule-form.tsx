import z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import InputText from "../ui/input/text";
import { useCurrentBusinessContext } from "@/src/contexts/current-business";
import { Button } from "@/src/components/ui/button";
import { Loader2 } from "lucide-react";
import { useSupaMutation } from "@/src/hooks/use-supabase";
import { saveAvailabilitySchedule } from "@/src/data/availability";

const formSchema = z.object({
  name: z
    .string()
    .min(1, { message: "Name is required." })
    .max(25, { message: "Name must be at most 25 characters." }),
});

export type SaveAvailabilityScheduleFormSchemaType = z.infer<
  typeof formSchema
> & {
  id?: string;
};

type SaveAvailabilityScheduleFormProps = {
  defaultValues?: SaveAvailabilityScheduleFormSchemaType;
  onSubmitted: () => void;
};

export default function SaveAvailabilityScheduleForm({
  defaultValues,
  onSubmitted,
}: SaveAvailabilityScheduleFormProps) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<SaveAvailabilityScheduleFormSchemaType>({
    defaultValues,
    resolver: zodResolver(formSchema),
  });
  const { currentBusiness } = useCurrentBusinessContext();
  const { mutate: _saveAvailabilitySchedule, isPending } = useSupaMutation(
    saveAvailabilitySchedule,
    {
      onSettled: () => {
        onSubmitted();
      },
      invalidate: [["getAvailabilitySchedules", currentBusiness.id]],
    },
  );
  const handleOnFormSuccess = (
    formValues: SaveAvailabilityScheduleFormSchemaType,
  ) => {
    _saveAvailabilitySchedule({
      ...(defaultValues?.id ? { id: defaultValues.id } : {}), // if id exists, then we are editing an existing service category (not creating a new one)
      ...formValues,
      business_id: currentBusiness.id,
    });
  };

  return (
    <form onSubmit={handleSubmit(handleOnFormSuccess)}>
      <InputText
        rhfKey="name"
        register={register}
        error={errors.name?.message}
        inputProps={{ placeholder: "Name" }}
        description="e.g. Classes, Studio Rentals, Private Lessons, etc..."
        label="Name"
      />
      <Button className="float-right mt-6" type="submit" disabled={isPending}>
        {isPending ? <Loader2 className="animate-spin" /> : "Save"}
      </Button>
    </form>
  );
}
