import z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import InputText from "../ui/input/text";
import { useCurrentBusinessContext } from "@/src/contexts/current-business";
import { Button } from "@/src/components/ui/button";
import { Loader2 } from "lucide-react";
import InputSelect from "../ui/input/select";
import { QuestionTypes } from "@/src/consts/questions";
import InputSwitch from "../ui/input/switch";
import { useSupaMutation } from "@/src/hooks/use-supabase";
import { saveQuestion } from "@/src/data/question";
import InputMultiSelect from "../ui/input/multi-select";
import _ from "lodash";
import { strListDiff } from "@/src/utils";
import { GetServicesResponseSingle } from "@/src/data/service";

const formSchema = z.object({
  question: z.string().min(1, { message: "Question is required." }),
  type: z.string(),
  required: z.boolean(),
  service_ids: z.array(z.string()).optional(),
});

export type SaveQuestionFormSchemaType = z.infer<typeof formSchema> & {
  id?: string;
};

type SaveQuestionFormProps = {
  defaultValues?: SaveQuestionFormSchemaType;
  availableServices: GetServicesResponseSingle[];
  onSubmitted: () => void;
};

export default function SaveQuestionForm({
  defaultValues,
  availableServices,
  onSubmitted,
}: SaveQuestionFormProps) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<SaveQuestionFormSchemaType>({
    defaultValues: {
      type:
        defaultValues?.type === undefined
          ? QuestionTypes.Text
          : defaultValues.type,
      required:
        defaultValues?.required === undefined ? false : defaultValues.required,
      ...defaultValues,
    },
    resolver: zodResolver(formSchema),
  });
  const { currentBusiness } = useCurrentBusinessContext();
  const { mutate: _saveQuestion, isPending } = useSupaMutation(saveQuestion, {
    invalidate: [
      ["getQuestions", currentBusiness.id],
      ["getServices", currentBusiness.id],
    ],
    onSettled: () => {
      onSubmitted();
    },
  });

  const handleOnFormSuccess = (formValues: SaveQuestionFormSchemaType) => {
    const serviceChanges = strListDiff(
      defaultValues?.service_ids || [],
      formValues.service_ids || [],
    );

    _saveQuestion({
      serviceIds: serviceChanges,
      question: {
        ...(defaultValues?.id ? { id: defaultValues.id } : {}), // if id exists, then we are editing an existing service category (not creating a new one)
        ..._.omit(formValues, "service_ids"),
        type: formValues.type,
        business_id: currentBusiness.id,
      },
    });
  };

  return (
    <form
      className="flex flex-col gap-y-3"
      onSubmit={handleSubmit(handleOnFormSuccess)}
    >
      <InputText
        label="Question"
        rhfKey="question"
        register={register}
        inputProps={{
          placeholder: "e.g. How many people will be there?",
        }}
        error={errors.question?.message}
      />
      {availableServices.length > 0 && (
        <InputMultiSelect
          rhfKey="service_ids"
          options={(availableServices || []).map((s) => ({
            label: s.title,
            value: s.id,
          }))}
          control={control}
          error={errors.service_ids?.message}
          label="Services"
          inputProps={{
            placeholder: "Select services to attach question to",
          }}
        />
      )}
      <InputSelect
        rhfKey="type"
        options={Object.keys(QuestionTypes).map((key) => ({
          // @ts-ignore
          label: QuestionTypes[key],
          // @ts-ignore
          value: QuestionTypes[key],
        }))}
        control={control}
        error={errors.type?.message}
        label="Type"
      />
      <InputSwitch
        rhfKey="required"
        control={control}
        label="Required"
        description="Turning this on will require customers to answer this question before booking."
      />

      <Button className="float-right mt-6" type="submit" disabled={isPending}>
        {isPending ? <Loader2 className="animate-spin" /> : "Save"}
      </Button>
    </form>
  );
}
