import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import z from "zod";
import InputText from "../ui/input/text";
import { useCurrentBusinessContext } from "@/src/contexts/current-business";
import { useSaveService } from "@/src/hooks/use-save-service";
import { Button } from "../ui/button";
import { Loader2 } from "lucide-react";

const formSchema = z.object({
  title: z
    .string()
    .min(1, {
      message: "Title is required.",
    })
    .max(50, {
      message: "Title must be at most 50 characters.",
    }),
  price: z
    .number({ invalid_type_error: "Price cannot be empty." })
    .positive({
      message: "Price must be a positive number.",
    })
    .transform((val) => val * 100),
  duration: z
    .number({ invalid_type_error: "Duration cannot be empty." })
    .positive({
      message: "Duration must be a positive number.",
    })
    .transform((val) => val * 6000),
  booking_limit: z
    .number({ invalid_type_error: "Booking limit cannot be empty." })
    .step(1, "Booking limit must be a whole number.")
    .positive({
      message: "Booking limit must be a positive number.",
    }),
});

type SaveServiceFormProps = {
  serviceGroupId?: string;
  defaultValues?: SaveServiceFormSchemaType;
  onSubmitted: () => void;
};

export type SaveServiceFormSchemaType = z.infer<typeof formSchema> & {
  id?: string;
};

export default function SaveServiceForm({
  serviceGroupId,
  defaultValues,
  onSubmitted,
}: SaveServiceFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SaveServiceFormSchemaType>({
    defaultValues: {
      ...defaultValues,
      price: defaultValues?.price ? defaultValues.price / 100 : undefined,
      duration: defaultValues?.duration
        ? defaultValues.duration / 6000
        : undefined,
    },
    resolver: zodResolver(formSchema),
  });
  const { currentBusiness } = useCurrentBusinessContext();
  const { mutate: saveService, isPending } = useSaveService(
    currentBusiness.id,
    {
      onSettled: () => {
        onSubmitted();
      },
    },
  );

  const onFormSuccess = (formValues: SaveServiceFormSchemaType) => {
    saveService({
      ...(defaultValues?.id ? { id: defaultValues.id } : {}), // if id exists, then we are editing an existing service  (not creating a new one)
      ...formValues,
      service_group_id: serviceGroupId,
    });
  };

  return (
    <form onSubmit={handleSubmit(onFormSuccess)}>
      <InputText
        rhfKey="title"
        register={register}
        error={errors.title?.message}
        inputProps={{ placeholder: "Title" }}
        description="e.g. Beginner pilates, 1hr studio rental, 1hr private session, etc..."
        label="Title"
      />
      <InputText
        rhfKey="price"
        register={register}
        registerOptions={{ valueAsNumber: true }}
        error={errors.price?.message}
        inputProps={{ placeholder: "12.5", type: "number", step: "any" }}
        prefix={<span className="mr-1 text-muted-foreground">$</span>}
        label="Price"
      />
      <InputText
        rhfKey="duration"
        register={register}
        registerOptions={{ valueAsNumber: true }}
        error={errors.duration?.message}
        inputProps={{ placeholder: "60", type: "number", step: "any" }}
        suffix={<span className="mr-1 text-muted-foreground">mins</span>}
        label="Duration"
      />
      <InputText
        rhfKey="booking_limit"
        register={register}
        registerOptions={{ valueAsNumber: true }}
        error={errors.booking_limit?.message}
        inputProps={{ placeholder: "100", type: "number", step: "any" }}
        label="Booking Limit"
      />
      <Button className="float-right mt-6" type="submit" disabled={isPending}>
        {isPending ? <Loader2 className="animate-spin" /> : "Save"}
      </Button>
    </form>
  );
}
