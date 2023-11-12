import z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import InputText from "../ui/input/text";
import InputGradientPicker from "../ui/input/gradient-picker";
import { useSaveServiceCategory } from "@/src/hooks/use-save-service-category";
import { useCurrentBusinessContext } from "@/src/contexts/current-business";
import { Button } from "@/src/components/ui/button";
import { Loader2 } from "lucide-react";

const formSchema = z.object({
  title: z
    .string()
    .min(1, { message: "Title is required." })
    .max(25, { message: "Title must be at most 25 characters." }),
  color: z.string().min(1, { message: "Color is required." }),
});

export type SaveServiceCategoryFormSchemaType = z.infer<typeof formSchema> & {
  id?: string;
};

type SaveServiceCategoryFormProps = {
  defaultValues?: SaveServiceCategoryFormSchemaType;
  onSubmitted: () => void;
};

export default function SaveServiceCategoryForm({
  defaultValues,
  onSubmitted,
}: SaveServiceCategoryFormProps) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<SaveServiceCategoryFormSchemaType>({
    defaultValues,
    resolver: zodResolver(formSchema),
  });
  const { currentBusiness } = useCurrentBusinessContext();
  const { mutate: saveServiceCategory, isPending } = useSaveServiceCategory(
    currentBusiness.id,
    {
      onSettled: () => {
        onSubmitted();
      },
    },
  );
  const handleOnFormSuccess = (
    formValues: SaveServiceCategoryFormSchemaType,
  ) => {
    saveServiceCategory({
      ...(defaultValues?.id ? { id: defaultValues.id } : {}), // if id exists, then we are editing an existing service category (not creating a new one)
      ...formValues,
      business_id: currentBusiness.id,
    });
  };

  return (
    <form onSubmit={handleSubmit(handleOnFormSuccess)}>
      <InputText
        rhfKey="title"
        register={register}
        error={errors.title?.message}
        inputProps={{ placeholder: "Title" }}
        description="e.g. Classes, Studio Rentals, Private Lessons, etc..."
        label="Title"
      />
      <InputGradientPicker
        rhfKey="color"
        control={control}
        error={errors.color?.message}
        label="Color"
        description="This helps you visually identify your services."
      />
      <Button className="float-right mt-6" type="submit" disabled={isPending}>
        {isPending ? <Loader2 className="animate-spin" /> : "Save"}
      </Button>
    </form>
  );
}
