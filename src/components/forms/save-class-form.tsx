import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import z from "zod";
import InputText from "../ui/input/text";
import { useCurrentBusinessContext } from "@/src/contexts/current-business";
import { Button } from "../ui/button";
import { Loader2 } from "lucide-react";
import { useSupaMutation } from "@/src/hooks/use-supabase";

import { saveClass } from "@/src/data/class";

const formSchema = z.object({
  title: z
    .string()
    .min(1, {
      message: "Title is required.",
    })
    .max(50, {
      message: "Title must be at most 50 characters.",
    }),
  description: z
    .string()
    .max(250, {
      message: "Description must be at most 250 characters.",
    })
    .nullable(),
  price: z
    .number({ invalid_type_error: "Price cannot be empty." })
    .positive({
      message: "Price must be a positive number.",
    })
    .transform((val) => val * 100),
});

type SaveClassFormProps = {
  defaultValues?: Partial<SaveClassFormSchemaType>;
  onSubmitted: () => void;
};

export type SaveClassFormSchemaType = z.infer<typeof formSchema> & {
  id?: string;
};

export default function SaveClassForm({
  defaultValues,
  onSubmitted,
}: SaveClassFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SaveClassFormSchemaType>({
    defaultValues: {
      ...defaultValues,
      price: defaultValues?.price ? defaultValues.price / 100 : undefined,
    },
    resolver: zodResolver(formSchema),
  });

  const { currentBusiness } = useCurrentBusinessContext();
  const { mutate: _saveClass, isPending } = useSupaMutation(saveClass, {
    invalidate: [["listClasses"], ["getClasss", currentBusiness.id]],
    onSettled: () => {
      onSubmitted();
    },
  });

  const onFormSuccess = (formValues: SaveClassFormSchemaType) => {
    _saveClass({
      danceClass: {
        ...(defaultValues?.id ? { id: defaultValues.id } : {}), // if id exists, then we are editing an existing service  (not creating a new one)
        ...formValues,
        business_id: currentBusiness.id,
      },
      priceChanged: defaultValues?.price !== formValues.price,
      titleChanged: defaultValues?.title !== formValues.title,
    });
  };

  const onFormErrors = (errors: any) => {
    console.log("ERRORS", errors);
  };

  return (
    <form
      className="flex flex-col gap-y-3"
      onSubmit={handleSubmit(onFormSuccess, onFormErrors)}
    >
      <InputText
        rhfKey="title"
        register={register}
        error={errors.title?.message}
        inputProps={{ placeholder: "Title" }}
        description="e.g. Groove Training"
        label="Title"
      />
      <InputText
        rhfKey="description"
        register={register}
        error={errors.description?.message}
        inputProps={{ placeholder: "Description" }}
        description="This class goes over the foundation of Hip Hop Grooves."
        label="Description"
      />
      <InputText
        rhfKey="price"
        register={register}
        registerOptions={{ valueAsNumber: true }}
        error={errors.price?.message}
        inputProps={{ placeholder: "Price", type: "number", step: "any" }}
        className="pr-0"
        prefix={<span className="mr-1 text-sm text-muted-foreground">$</span>}
        label="Price"
      />
      <Button className="float-right mt-6" disabled={isPending}>
        {isPending ? <Loader2 className="animate-spin" /> : "Save"}
      </Button>
    </form>
  );
}
