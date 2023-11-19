import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import z from "zod";
import InputText from "../ui/input/text";
import { useCurrentBusinessContext } from "@/src/contexts/current-business";
import { Button } from "../ui/button";
import { Loader2 } from "lucide-react";
import InputMultiSelect from "../ui/input/multi-select";
import { Tables } from "@/types/db.extension";
import { Label } from "../ui/label";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useSupaMutation } from "@/src/hooks/use-supabase";
import { saveService } from "@/src/data/service";

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
    .transform((val) => val * 60000),
  booking_limit: z
    .number({ invalid_type_error: "Booking limit cannot be empty." })
    .step(1, "Booking limit must be a whole number.")
    .positive({
      message: "Booking limit must be a positive number.",
    }),
});

type SaveServiceFormProps = {
  serviceCategoryId?: string;
  defaultValues?: SaveServiceFormSchemaType;
  availableQuestions?: Tables<"questions">[];
  onSubmitted: () => void;
};

export type SaveServiceFormSchemaType = z.infer<typeof formSchema> & {
  id?: string;
  question_ids?: string[];
};

export default function SaveServiceForm({
  serviceCategoryId,
  defaultValues,
  availableQuestions,
  onSubmitted,
}: SaveServiceFormProps) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<SaveServiceFormSchemaType>({
    defaultValues: {
      ...defaultValues,
      price: defaultValues?.price ? defaultValues.price / 100 : undefined,
      duration: defaultValues?.duration
        ? defaultValues.duration / 60000
        : undefined,
    },
    resolver: zodResolver(formSchema),
  });

  const router = useRouter();
  const { currentBusiness } = useCurrentBusinessContext();
  const { mutate: _saveService, isPending } = useSupaMutation(saveService, {
    invalidate: [["getServiceCategoriesWithServices", currentBusiness.id]],
    onSettled: () => {
      onSubmitted();
    },
  });
  const [selectedQuestions, setSelectedQuestions] = useState(
    defaultValues?.question_ids ?? [],
  );

  const onFormSuccess = (formValues: SaveServiceFormSchemaType) => {
    let questionsChanged = false;
    if (defaultValues?.question_ids?.length !== selectedQuestions.length) {
      questionsChanged = true;
    } else {
      for (const q in selectedQuestions) {
        if (!defaultValues?.question_ids.some((id) => id === q)) {
          questionsChanged = true;
          break;
        }
      }
    }

    _saveService({
      service: {
        ...(defaultValues?.id ? { id: defaultValues.id } : {}), // if id exists, then we are editing an existing service  (not creating a new one)
        ...formValues,
        service_category_id: serviceCategoryId,
      },
      questionIds: questionsChanged ? selectedQuestions : undefined, // if no questions were changed, then we don't need to send the questionIds (link table won't be updated)
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
        inputProps={{ placeholder: "Price", type: "number", step: "any" }}
        prefix={<span className="mr-1 text-sm text-muted-foreground">$</span>}
        label="Price"
      />
      <InputText
        rhfKey="duration"
        register={register}
        registerOptions={{ valueAsNumber: true }}
        error={errors.duration?.message}
        inputProps={{ placeholder: "Duration", type: "number", step: "any" }}
        suffix={
          <span className="mr-1 text-sm text-muted-foreground">mins</span>
        }
        label="Duration"
      />
      <InputText
        rhfKey="booking_limit"
        register={register}
        registerOptions={{ valueAsNumber: true }}
        error={errors.booking_limit?.message}
        inputProps={{
          placeholder: "Maximum number of bookings allowed",
          type: "number",
          step: "any",
        }}
        label="Booking Limit"
      />
      {(availableQuestions || []).length === 0 ? (
        <div className="mt-3 flex flex-col gap-y-2">
          <Label>Questions</Label>
          <Button
            onClick={(e) => {
              e.preventDefault();
              router.push("/app/business/questions");
            }}
          >
            No question found. Start by creating one.
          </Button>
        </div>
      ) : (
        <InputMultiSelect
          control={control}
          options={(availableQuestions || []).map((q) => ({
            label: q.question,
            value: q.id,
          }))}
          value={selectedQuestions}
          onChange={(values) => {
            setSelectedQuestions(values);
          }}
          label="Questions"
          inputProps={{
            placeholder: "For customers to answer before booking (Optional) ",
          }}
        />
      )}
      <Button className="float-right mt-6" type="submit" disabled={isPending}>
        {isPending ? <Loader2 className="animate-spin" /> : "Save"}
      </Button>
    </form>
  );
}
