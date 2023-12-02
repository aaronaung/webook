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
import InputSelect from "../ui/input/select";
import _ from "lodash";

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
  pricing_interval: z.string(), // This is used only if service type is availability based.
  availability_schedule_id: z.string(),
});
``;
// We use string keys here, since we use this const in InputSelect.
export const PRICING_INTERVALS: { [key: string]: string } = {
  "60000": "/ min",
  "3600000": "/ hour",
};

type SaveAvailabilityBasedServiceFormProps = {
  defaultValues?: Partial<SaveAvailabilityBasedServiceFormSchemaType>;
  availableQuestions?: Tables<"questions">[];
  availableAvailabilitySchedules?: Tables<"availability_schedules">[];
  onSubmitted: () => void;
};

export type SaveAvailabilityBasedServiceFormSchemaType = z.infer<
  typeof formSchema
> & {
  id?: string;
  question_ids?: string[];
};

export default function SaveAvailabilityBasedServiceForm({
  defaultValues,
  availableQuestions,
  availableAvailabilitySchedules,
  onSubmitted,
}: SaveAvailabilityBasedServiceFormProps) {
  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<SaveAvailabilityBasedServiceFormSchemaType>({
    defaultValues: {
      ...defaultValues,
      price: defaultValues?.price ? defaultValues.price / 100 : undefined,
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

  const availabilityScheduleId = watch("availability_schedule_id");

  const onFormSuccess = (
    formValues: SaveAvailabilityBasedServiceFormSchemaType,
  ) => {
    const questionChanges = strListDiff(
      defaultValues?.question_ids ?? [],
      selectedQuestions,
    );

    _saveService({
      service: {
        ...(defaultValues?.id ? { id: defaultValues.id } : {}), // if id exists, then we are editing an existing service  (not creating a new one)
        ..._.omit(formValues, "pricing_interval"),
        business_id: currentBusiness.id,
        duration: Number(formValues.pricing_interval),
      },
      questionIds: questionChanges,
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
        suffix={
          <InputSelect
            className="w-[100px] rounded-bl-none rounded-tl-none"
            control={control}
            error={errors.pricing_interval?.message}
            rhfKey="pricing_interval"
            options={Object.keys(PRICING_INTERVALS).map((k: string) => ({
              label: PRICING_INTERVALS[k],
              value: k,
            }))}
          />
        }
        label="Price"
      />

      <div>
        {(availableAvailabilitySchedules || []).length === 0 ? (
          <div className="flex flex-col gap-y-2">
            <Label>Availability Schedule</Label>
            <Button
              type="button"
              variant="outline"
              onClick={(e) => {
                e.preventDefault();
                router.push("/app/business/availability");
              }}
            >
              No schedule found. Start by creating one.
            </Button>
          </div>
        ) : (
          <InputSelect
            control={control}
            description="The service will be available for booking during the times specified in the schedule."
            options={[
              ...(availableAvailabilitySchedules || []).map((q) => ({
                label: q.name,
                value: q.id,
              })),
            ]}
            inputProps={{
              placeholder: "Select an availability schedule",
            }}
            rhfKey="availability_schedule_id"
            label="Availability Schedule"
          />
        )}
        {!availabilityScheduleId && (
          <p className="mt-1.5 text-sm text-destructive">
            Please select an availability schedule.
          </p>
        )}
      </div>

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

      <Button
        className="float-right mt-6"
        disabled={isPending || !availabilityScheduleId}
      >
        {isPending ? <Loader2 className="animate-spin" /> : "Save"}
      </Button>
    </form>
  );
}
