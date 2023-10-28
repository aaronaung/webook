import { zodResolver } from "@hookform/resolvers/zod";
import React from "react";
import { useForm } from "react-hook-form";
import z from "zod";
import InputText from "../ui/input/text";

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

type SaveServiceFromProps = {
  defaultValues?: SaveServiceFormSchemaType;
  onFormSuccess: (formValues: SaveServiceFormSchemaType) => void;
};

export type SaveServiceFormSchemaType = z.infer<typeof formSchema> & {
  id?: string;
};

const SaveServiceForm = React.forwardRef<HTMLFormElement, SaveServiceFromProps>(
  (props, ref) => {
    const {
      register,
      handleSubmit,
      formState: { errors },
    } = useForm<SaveServiceFormSchemaType>({
      defaultValues: {
        ...props.defaultValues,
        price: props.defaultValues?.price
          ? props.defaultValues.price / 100
          : undefined,
        duration: props.defaultValues?.duration
          ? props.defaultValues.duration / 6000
          : undefined,
      },
      resolver: zodResolver(formSchema),
    });

    async function onFormSuccess(formValues: SaveServiceFormSchemaType) {
      props.onFormSuccess(formValues);
    }

    return (
      <form ref={ref} onSubmit={handleSubmit(onFormSuccess)}>
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
      </form>
    );
  },
);

export default SaveServiceForm;
