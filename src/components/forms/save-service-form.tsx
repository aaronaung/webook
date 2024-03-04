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
import { strListDiff } from "@/src/utils";

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
  defaultValues?: Partial<SaveServiceFormSchemaType>;
  availableQuestions?: Tables<"questions">[];
  availableAvailabilitySchedules?: Tables<"availability_schedules">[];
  onSubmitted: () => void;
};

export type SaveServiceFormSchemaType = z.infer<typeof formSchema> & {
  id?: string;
  question_ids?: string[];
};

export default function SaveServiceForm({
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
    invalidate: [["getServices", currentBusiness.id]],
    onSettled: () => {
      onSubmitted();
    },
  });
  const [selectedQuestions, setSelectedQuestions] = useState(
    defaultValues?.question_ids ?? [],
  );

  const onFormSuccess = (formValues: SaveServiceFormSchemaType) => {
    const questionChanges = strListDiff(
      defaultValues?.question_ids ?? [],
      selectedQuestions,
    );
    _saveService({
      service: {
        ...(defaultValues?.id ? { id: defaultValues.id } : {}), // if id exists, then we are editing an existing service  (not creating a new one)
        ...formValues,
        business_id: currentBusiness.id,
        availability_schedule_id: null,
      },
      questionIds: questionChanges,
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
        description="e.g. Beginner pilates, 1hr studio rental, 1hr private session, etc..."
        label="Title"
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
      <InputText
        rhfKey="duration"
        register={register}
        registerOptions={{ valueAsNumber: true }}
        error={errors.duration?.message}
        inputProps={{
          placeholder: "Duration",
          type: "number",
          step: "any",
        }}
        suffix={
          <span className="mr-1 text-sm text-muted-foreground">mins</span>
        }
        label="Duration"
      />
      <>
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
      </>

      {(availableQuestions || []).length === 0 ? (
        <div className="flex flex-col gap-y-2">
          <Label>Questions</Label>
          <Button
            type="button"
            variant="outline"
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
            placeholder: "For customers to answer before booking",
          }}
        />
      )}

      <Button className="float-right mt-6" disabled={isPending}>
        {isPending ? <Loader2 className="animate-spin" /> : "Save"}
      </Button>
    </form>
  );
}
