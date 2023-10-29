import { zodResolver } from "@hookform/resolvers/zod";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import z from "zod";
import { Tables } from "@/types/db.extension";
import InputDateTimePicker from "../ui/input/date-time-picker";
import { Switch } from "../ui/switch";
import { Label } from "../ui/label";
import InputText from "../ui/input/text";

const formSchema = z.object({
  start: z.date(),
  recurrence_start: z.date().optional(),
  recurrence_interval: z
    .union([
      z
        .number({ invalid_type_error: "Invalid recurrence interval." })
        .positive({
          message: "Recurrence interval must be a positive number.",
        }),
      z.nan(),
    ])
    .transform((val) => val * 86400000)
    .optional(),
  recurrence_count: z
    .union([
      z.number().step(1, "Recurrence count must be a whole number.").positive({
        message: "Recurrence count must be a positive number.",
      }),
      z.nan(),
    ])
    .optional(),
});

type SaveServiceSlotFromProps = {
  service?: Tables<"service">;
  defaultValues?: SaveServiceSlotFormSchemaType;
  onFormSuccess: (formValues: SaveServiceSlotFormSchemaType) => void;
};

export type SaveServiceSlotFormSchemaType = z.infer<typeof formSchema> & {
  id?: string;
  recurrenceEnabled?: boolean;
};

const SaveServiceSlotForm = React.forwardRef<
  HTMLFormElement,
  SaveServiceSlotFromProps
>((props, ref) => {
  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<SaveServiceSlotFormSchemaType>({
    defaultValues: {
      ...props.defaultValues,
      recurrence_start:
        props.defaultValues?.recurrence_start || props.defaultValues?.start,
      recurrence_interval: props.defaultValues?.recurrence_interval
        ? props.defaultValues.recurrence_interval / 86400000
        : undefined,
    },
    resolver: zodResolver(formSchema),
  });

  const [recurrenceEnabled, setRecurrenceEnabled] = useState(
    Boolean(props.defaultValues?.recurrence_start),
  );
  const [recurrenceErr, setRecurrenceErr] = useState("");

  useEffect(() => {
    const subscription = watch((value) => {
      setRecurrenceErr(determineRecurrenceErr(value));
    });
    return () => subscription.unsubscribe();
  }, [watch, recurrenceEnabled]);

  const determineRecurrenceErr = (
    formValues: Partial<SaveServiceSlotFormSchemaType>,
  ) => {
    // We have to check for these values when recurrence is enabled because they are not required in the form schema.
    if (
      recurrenceEnabled &&
      (!formValues.recurrence_count ||
        !formValues.recurrence_interval ||
        !formValues.recurrence_start)
    ) {
      return "Recurrence count, interval, and start are required when recurrence is enabled.";
    }
    return "";
  };

  async function onFormSuccess(formValues: SaveServiceSlotFormSchemaType) {
    const err = determineRecurrenceErr(formValues);
    setRecurrenceErr(err);
    if (err) {
      return;
    }

    props.onFormSuccess({
      ...formValues,
      recurrenceEnabled: recurrenceEnabled,
    });
  }

  return (
    <form ref={ref} onSubmit={handleSubmit(onFormSuccess)}>
      <Label>{props.service?.title}</Label>
      <InputDateTimePicker
        rhfKey="start"
        control={control}
        error={errors.start?.message}
        label="Start"
      />
      <div className="mb-2 flex items-center space-x-2">
        <Label htmlFor="enable-recurrence">Recurrence</Label>
        <Switch
          id="enable-recurrence"
          checked={recurrenceEnabled}
          onCheckedChange={(checked) => setRecurrenceEnabled(checked)}
        />
      </div>
      {recurrenceEnabled && (
        <>
          <InputDateTimePicker
            rhfKey="recurrence_start"
            control={control}
            error={errors.recurrence_start?.message}
            label="Recurrence start"
            description="Defaulted to the event start date time."
            className="mb-2"
          />
          <InputText
            rhfKey="recurrence_interval"
            register={register}
            registerOptions={{ valueAsNumber: true }}
            defaultValue={props.defaultValues?.start}
            error={errors.recurrence_interval?.message}
            prefix={<span className="mr-3 text-muted-foreground">Every</span>}
            suffix={<span className="ml-1 text-muted-foreground">day(s)</span>}
            inputProps={{
              placeholder: "1",
              type: "number",
              step: "any",
            }}
            label="Recurrence interval"
          />
          <InputText
            rhfKey="recurrence_count"
            register={register}
            registerOptions={{ valueAsNumber: true }}
            error={errors.recurrence_count?.message}
            inputProps={{ placeholder: "100", type: "number", step: "any" }}
            description="How many times should this event repeat? Leave it empty for infinite recurrence."
            label="Recurrence count"
          />
          {recurrenceErr && (
            <p className="my-2 text-sm text-destructive">{recurrenceErr}</p>
          )}
        </>
      )}
    </form>
  );
});

export default SaveServiceSlotForm;
