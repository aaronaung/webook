import { zodResolver } from "@hookform/resolvers/zod";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import z from "zod";
import { Tables } from "@/types/db.extension";
import InputDateTimePicker from "../ui/input/date-time-picker";
import { Switch } from "../ui/switch";
import { Label } from "../ui/label";
import InputText from "../ui/input/text";
import InputSelect from "../ui/input/select";
import InputMultiSelect from "../ui/input/multi-select";

const formSchema = z.object({
  service_id: z.string(),
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
  staff_ids: z.array(z.string()).optional(),
});

type SaveServiceEventFromProps = {
  availableServices?: Tables<"service">[];
  availableStaffs?: Tables<"staff">[];
  defaultValues?: Partial<SaveServiceEventFormSchemaType>;
  isRecurrentEvent?: boolean;
  onFormSuccess: (
    formValues: SaveServiceEventFormSchemaType,
    recurrenceEnabled: boolean,
  ) => void;
};

export type SaveServiceEventFormSchemaType = z.infer<typeof formSchema> & {
  id?: string;
};

const SaveServiceEventForm = React.forwardRef<
  HTMLFormElement,
  SaveServiceEventFromProps
>((props, ref) => {
  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<SaveServiceEventFormSchemaType>({
    defaultValues: {
      ...props.defaultValues,
      service_id:
        props.defaultValues?.service_id || props.availableServices?.[0]?.id,
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
      setRecurrenceErr(
        determineRecurrenceErr(
          value as Partial<SaveServiceEventFormSchemaType>,
        ),
      );
    });
    return () => subscription.unsubscribe();
  }, [watch, recurrenceEnabled]);

  const determineRecurrenceErr = (
    formValues: Partial<SaveServiceEventFormSchemaType>,
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

  async function onFormSuccess(formValues: SaveServiceEventFormSchemaType) {
    const err = determineRecurrenceErr(formValues);
    setRecurrenceErr(err);
    if (err) {
      return;
    }

    props.onFormSuccess(formValues, recurrenceEnabled);
  }

  function onFormError(errors: any) {
    console.log(errors);
  }

  return (
    <form ref={ref} onSubmit={handleSubmit(onFormSuccess, onFormError)}>
      {props.isRecurrentEvent && (
        <p className="mb-1 text-sm text-destructive">
          This is a recurring event. Updates are not allowed.
        </p>
      )}
      <InputSelect
        rhfKey="service_id"
        options={(props?.availableServices || []).map((s) => ({
          label: s.title,
          value: s.id,
        }))}
        control={control}
        error={errors.service_id?.message}
        label="Service"
        disabled={props.isRecurrentEvent}
      />
      <InputMultiSelect
        rhfKey="staff_ids"
        options={(props?.availableStaffs || []).map((s) => ({
          label: `${s.first_name} ${s.last_name}`,
          value: s.id,
        }))}
        control={control}
        error={errors.staff_ids?.message}
        label="Staffs"
        inputProps={{ placeholder: "Who will lead the service event?" }}
        disabled={props.isRecurrentEvent}
      />
      <InputDateTimePicker
        rhfKey="start"
        control={control}
        error={errors.start?.message}
        label="Start"
        disabled={props.isRecurrentEvent}
      />
      <div className="my-3 flex items-center space-x-2">
        <Label htmlFor="enable-recurrence">Recurrence</Label>
        <Switch
          id="enable-recurrence"
          checked={recurrenceEnabled}
          onCheckedChange={(checked) => setRecurrenceEnabled(checked)}
          disabled={props.isRecurrentEvent}
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
            disabled={props.isRecurrentEvent}
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
            disabled={props.isRecurrentEvent}
          />
          <InputText
            rhfKey="recurrence_count"
            register={register}
            registerOptions={{ valueAsNumber: true }}
            error={errors.recurrence_count?.message}
            inputProps={{ placeholder: "100", type: "number", step: "any" }}
            description="How many times should this event repeat? Leave it empty for infinite recurrence."
            label="Recurrence count"
            disabled={props.isRecurrentEvent}
          />
          {recurrenceErr && (
            <p className="my-2 text-sm text-destructive">{recurrenceErr}</p>
          )}
        </>
      )}
    </form>
  );
});

export default SaveServiceEventForm;
