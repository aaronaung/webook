import React from "react";
import z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import InputText from "../ui/input/text";

const formSchema = z.object({
  title: z
    .string()
    .min(1, { message: "Title is required." })
    .max(25, { message: "Title must be at most 25 characters." }),
});

export type SaveServiceGroupFormSchemaType = z.infer<typeof formSchema> & {
  id?: string;
};

type SaveServiceGroupFromProps = {
  defaultValues?: SaveServiceGroupFormSchemaType;
  onFormSuccess: (formValues: SaveServiceGroupFormSchemaType) => void;
};

const SaveServiceGroupForm = React.forwardRef<
  HTMLFormElement,
  SaveServiceGroupFromProps
>((props, ref) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SaveServiceGroupFormSchemaType>({
    defaultValues: props.defaultValues,
    resolver: zodResolver(formSchema),
  });

  async function onFormSuccess(formValues: SaveServiceGroupFormSchemaType) {
    props.onFormSuccess(formValues);
  }
  return (
    <form ref={ref} onSubmit={handleSubmit(onFormSuccess)}>
      <InputText
        rhfKey="title"
        register={register}
        error={errors.title?.message}
        inputProps={{ placeholder: "Title" }}
        description="e.g. Classes, Studio Rentals, Private Lessons, etc..."
        label="Title"
      />
    </form>
  );
});

export default SaveServiceGroupForm;
