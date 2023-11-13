import z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import InputText from "../ui/input/text";
import { useSaveQuestion } from "@/src/hooks/use-save-question";
import { useCurrentBusinessContext } from "@/src/contexts/current-business";
import { Button } from "@/src/components/ui/button";
import { Loader2 } from "lucide-react";
import InputSelect from "../ui/input/select";
import { QUESTION_TYPE_LABELS } from "@/src/consts/questions";
import InputSwitch from "../ui/input/switch";

const formSchema = z.object({
  question: z.string().min(1, { message: "Question is required." }),
  type: z.string(),
  required: z.boolean(),
});

export type SaveQuestionFormSchemaType = z.infer<typeof formSchema> & {
  id?: string;
};

type SaveQuestionFormProps = {
  defaultValues?: SaveQuestionFormSchemaType;
  onSubmitted: () => void;
};

export default function SaveQuestionForm({
  defaultValues,
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
          ? String(0) // default to text
          : defaultValues.type,
      required:
        defaultValues?.required === undefined ? false : defaultValues.required,
      ...defaultValues,
    },
    resolver: zodResolver(formSchema),
  });
  const { currentBusiness } = useCurrentBusinessContext();
  const { mutate: saveQuestion, isPending } = useSaveQuestion(
    currentBusiness.id,
    {
      onSettled: () => {
        onSubmitted();
      },
    },
  );

  const handleOnFormSuccess = (formValues: SaveQuestionFormSchemaType) => {
    saveQuestion({
      ...(defaultValues?.id ? { id: defaultValues.id } : {}), // if id exists, then we are editing an existing service category (not creating a new one)
      ...formValues,
      type: Number(formValues.type),
      business_id: currentBusiness.id,
    });
  };

  return (
    <form onSubmit={handleSubmit(handleOnFormSuccess)}>
      <InputText
        label="Question"
        rhfKey="question"
        register={register}
        inputProps={{
          placeholder: "e.g. How many people will be attending the event?",
        }}
        error={errors.question?.message}
      />
      <InputSelect
        rhfKey="type"
        options={Object.keys(QUESTION_TYPE_LABELS).map((key) => ({
          label: QUESTION_TYPE_LABELS[Number(key)], // all object keys are string so we have to cast to number.
          value: key,
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
