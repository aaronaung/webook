import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import z from "zod";
import { Tables } from "@/types/db.extension";
import InputDateTimePicker from "../ui/input/date-time-picker";
import { Switch } from "../ui/switch";
import { Label } from "../ui/label";
import InputText from "../ui/input/text";
import InputMultiSelect from "../ui/input/multi-select";
import {
  CheckCircleIcon,
  ClipboardDocumentIcon,
  Square3Stack3DIcon,
} from "@heroicons/react/24/outline";
import _ from "lodash";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { toast } from "../ui/use-toast";
import { Button } from "../ui/button";
import { useRouter } from "next/navigation";
import { useCurrentBusinessContext } from "@/src/contexts/current-business";
import { Loader2 } from "lucide-react";
import { DeleteConfirmationDialog } from "../dialogs/delete-confirmation-dialog";
import { useSupaMutation } from "@/src/hooks/use-supabase";
import { deleteServiceEvent, saveServiceEvent } from "@/src/data/service";
import { addMilliseconds } from "date-fns";
import InputSelect from "../ui/input/select";
import EmptyState from "../shared/empty-state";
import { strListDiff } from "@/src/utils";

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

export type SaveServiceEventFormSchemaType = z.infer<typeof formSchema> & {
  id?: string;
  live_stream?: Tables<"service_event_live_streams">;
};

type SaveServiceEventFormProps = {
  availableServices?: Tables<"services">[];
  availableStaffs?: Tables<"staffs">[];
  defaultValues?: Partial<SaveServiceEventFormSchemaType>;
  isRecurrentEvent?: boolean;
  onSubmitted?: () => void;
};
export default function SaveServiceEventForm({
  availableServices,
  availableStaffs,
  defaultValues,
  isRecurrentEvent,
  onSubmitted,
}: SaveServiceEventFormProps) {
  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<SaveServiceEventFormSchemaType>({
    defaultValues: {
      ...defaultValues,
      service_id: defaultValues?.service_id || availableServices?.[0]?.id,
      recurrence_start: defaultValues?.recurrence_start || defaultValues?.start,
      recurrence_interval: defaultValues?.recurrence_interval
        ? defaultValues.recurrence_interval / 86400000
        : undefined,
    },
    resolver: zodResolver(formSchema),
  });
  const router = useRouter();

  const { currentBusiness } = useCurrentBusinessContext();

  const [recurrenceEnabled, setRecurrenceEnabled] = useState(
    Boolean(defaultValues?.recurrence_start),
  );
  const [
    serviceId,
    start,
    recurrenceCount,
    recurrenceInterval,
    recurrenceStart,
  ] = watch([
    "service_id",
    "start",
    "recurrence_count",
    "recurrence_interval",
    "recurrence_start",
  ]);
  const selectedService = availableServices?.find((s) => s.id === serviceId);
  const hasRecurrenceError =
    recurrenceEnabled &&
    (!recurrenceCount || !recurrenceInterval || !recurrenceStart);

  const [liveStreamEnabled, setLiveStreamEnabled] = useState(
    Boolean(defaultValues?.live_stream),
  );
  const [isDeleteConfirmationDialogOpen, setIsDeleteConfirmationDialogOpen] =
    useState(false);

  const { mutate: _saveServiceEvent, isPending: isSaving } = useSupaMutation(
    saveServiceEvent,
    {
      // todo: potential optimization here: this is inefficient, we refetch the entire schedule.
      invalidate: [["getBusinessScheduleByTimeRange", currentBusiness.handle]],
      onSettled: () => {
        onSubmitted?.();
      },
    },
  );
  const { mutateAsync: _deleteServiceEvent, isPending: isDeleting } =
    useSupaMutation(deleteServiceEvent, {
      invalidate: [["getBusinessScheduleByTimeRange", currentBusiness.handle]],
    });

  async function onFormSuccess(formValues: SaveServiceEventFormSchemaType) {
    if (hasRecurrenceError) return;
    const initialLiveStreamEnabled = Boolean(defaultValues?.live_stream);
    const liveStreamStatusChanged =
      initialLiveStreamEnabled !== liveStreamEnabled;

    const staffIdChanges = strListDiff(
      defaultValues?.staff_ids || [],
      formValues.staff_ids || [],
    );

    _saveServiceEvent({
      serviceEvent: {
        ...(defaultValues?.id ? { id: defaultValues.id } : {}), // if original  exists, then we are editing an existing service  (not creating a new one)
        service_id: formValues.service_id,
        start: formValues.start.toISOString(),
        recurrence_start: recurrenceEnabled
          ? formValues.recurrence_start?.toISOString()
          : null,
        recurrence_interval: recurrenceEnabled
          ? formValues.recurrence_interval
          : null,
        recurrence_count: recurrenceEnabled
          ? formValues.recurrence_count
          : null,
      },
      staffIds: staffIdChanges,
      createLiveStreamRequest:
        liveStreamStatusChanged && liveStreamEnabled && selectedService
          ? {
              title: selectedService.title,
              contact_email: currentBusiness.email,
              contact_name: currentBusiness.title,
              duration_in_milli: selectedService.duration,
              start_time: formValues.start.toISOString(),
            }
          : undefined,
      deleteLiveStream: liveStreamStatusChanged && !liveStreamEnabled,
    });
  }

  function onFormError(errors: any) {
    console.log(errors);
  }

  if (_.isEmpty(availableServices)) {
    return (
      <EmptyState
        Icon={Square3Stack3DIcon}
        title="No service found"
        description="To create a service event, you must first create a service you provide."
        actionButtonText="Start by creating one"
        onAction={() => router.push("/app/business/services")}
      />
    );
  }

  return (
    <form
      className="flex flex-col gap-y-3"
      onSubmit={handleSubmit(onFormSuccess, onFormError)}
    >
      {isRecurrentEvent && (
        <p className="mb-2 text-sm text-destructive">
          This is a recurring event. Updates are not allowed.
        </p>
      )}

      <InputSelect
        rhfKey="service_id"
        options={(availableServices || []).map((s) => ({
          label: s.title,
          value: s.id,
        }))}
        control={control}
        error={errors.service_id?.message}
        label="Service"
        disabled={isRecurrentEvent}
      />

      {_.isEmpty(availableStaffs) ? (
        <div className="flex flex-col gap-y-2">
          <Label>Staff</Label>
          <Button
            onClick={(e) => {
              e.preventDefault();
              router.push("/app/business/staffs");
            }}
          >
            No staff found. Start by creating one.
          </Button>
        </div>
      ) : (
        <InputMultiSelect
          rhfKey="staff_ids"
          options={(availableStaffs || []).map((s) => ({
            label: `${s.first_name} ${s.last_name}`,
            value: s.id,
          }))}
          control={control}
          error={errors.staff_ids?.message}
          label="Staffs"
          inputProps={{
            placeholder: _.isEmpty(availableStaffs)
              ? "No staff"
              : "Who will lead the event?",
          }}
          disabled={isRecurrentEvent}
        />
      )}
      <InputDateTimePicker
        rhfKey="start"
        control={control}
        error={errors.start?.message}
        label="Start"
        disabled={isRecurrentEvent}
      />
      <InputDateTimePicker
        control={control}
        value={addMilliseconds(start, selectedService?.duration || 0)}
        error={errors.start?.message}
        label="End (calculated using service duration)"
        disabled
      />
      <div>
        <div className="flex items-center space-x-2">
          <Label htmlFor="enable-recurrence">Live stream</Label>
          <Switch
            id="enable-recurrence"
            checked={liveStreamEnabled}
            onCheckedChange={(checked) => setLiveStreamEnabled(checked)}
            disabled={isRecurrentEvent}
          />
        </div>
        {liveStreamEnabled && (
          <p className="my-1 text-sm text-muted-foreground">
            Details about live streaming will be available after you save the
            event.
          </p>
        )}
        {defaultValues?.live_stream && liveStreamEnabled && (
          <>
            <LiveStreamReadOnlyField
              prefix={"Start url"}
              data={defaultValues.live_stream.start_url}
            />
            <LiveStreamReadOnlyField
              prefix={"Join url"}
              data={defaultValues.live_stream.join_url}
            />
            <LiveStreamReadOnlyField
              prefix={"Password"}
              data={defaultValues.live_stream.password}
            />
          </>
        )}
      </div>
      <div className="flex items-center space-x-2">
        <Label htmlFor="enable-recurrence">Recurrence</Label>
        <Switch
          id="enable-recurrence"
          checked={recurrenceEnabled}
          onCheckedChange={(checked) => setRecurrenceEnabled(checked)}
          disabled={isRecurrentEvent}
        />
      </div>
      {recurrenceEnabled && (
        <>
          <InputDateTimePicker
            rhfKey="recurrence_start"
            control={control}
            error={errors.recurrence_start?.message}
            label="Recurrence start"
            disabled={isRecurrentEvent}
          />
          <InputText
            rhfKey="recurrence_interval"
            register={register}
            registerOptions={{ valueAsNumber: true }}
            defaultValue={defaultValues?.start}
            error={errors.recurrence_interval?.message}
            prefix={
              <span className="mr-3 text-sm text-muted-foreground">Every</span>
            }
            suffix={
              <span className="ml-1 text-sm text-muted-foreground">day(s)</span>
            }
            inputProps={{
              placeholder: "How often should it repeat?",
              type: "number",
              step: "any",
            }}
            label="Recurrence interval"
            disabled={isRecurrentEvent}
          />
          <InputText
            rhfKey="recurrence_count"
            register={register}
            registerOptions={{ valueAsNumber: true }}
            error={errors.recurrence_count?.message}
            inputProps={{
              placeholder: "How many times should this event repeat?",
              type: "number",
              step: "any",
            }}
            label="Recurrence count"
            disabled={isRecurrentEvent}
          />
          {hasRecurrenceError && (
            <p className="my-2 text-sm text-destructive">
              Recurrence count, interval, and start are required when recurrence
              is enabled.
            </p>
          )}
        </>
      )}
      {!isRecurrentEvent && (
        <div className="ml-auto flex gap-x-2">
          <Button
            className="float-right mt-6"
            type="submit"
            disabled={isSaving || hasRecurrenceError}
          >
            {isSaving ? <Loader2 className="animate-spin" /> : "Save"}
          </Button>
          {defaultValues?.id && (
            <Button
              className="float-right mr-2 mt-6"
              type="button"
              variant={"destructive"}
              onClick={async (e) => {
                e.preventDefault();
                if (recurrenceEnabled) {
                  setIsDeleteConfirmationDialogOpen(true);
                } else {
                  await _deleteServiceEvent(defaultValues.id!);
                  onSubmitted?.();
                }
              }}
              disabled={isSaving || isDeleting}
            >
              {isDeleting ? <Loader2 className="animate-spin" /> : "Delete"}
            </Button>
          )}
        </div>
      )}
      {recurrenceEnabled && defaultValues?.id && (
        <DeleteConfirmationDialog
          isOpen={isDeleteConfirmationDialogOpen}
          onClose={() => {
            setIsDeleteConfirmationDialogOpen(false);
          }}
          onDelete={async () => {
            await _deleteServiceEvent(defaultValues.id!);
            onSubmitted?.();
            setIsDeleteConfirmationDialogOpen(false);
          }}
          label={"This event is recurring. Deleting it will delete all events."}
        />
      )}
    </form>
  );
}

const LiveStreamReadOnlyField = ({
  prefix,
  data,
}: {
  prefix: string;
  data: string | null;
}) => {
  return (
    <InputText
      inputProps={{
        className: "truncate",
        placeholder: data || "Not available",
        readOnly: true,
      }}
      prefix={
        <span className="mr-2 whitespace-nowrap text-sm text-muted-foreground">
          {prefix}:
        </span>
      }
      suffix={
        <Tooltip>
          <TooltipTrigger>
            <div
              className="mr-2 p-2 hover:rounded-full hover:bg-secondary"
              onClick={(e) => {
                e.preventDefault();
                if (data) {
                  navigator.clipboard.writeText(data);
                }
                toast({
                  title: "Copied to clipboard",
                  variant: "success",
                  duration: 2000,
                  prefixIcon: <CheckCircleIcon className="h-5 w-5" />,
                });
              }}
            >
              <ClipboardDocumentIcon className="h-5 w-5 cursor-pointer" />
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>Copy</p>
          </TooltipContent>
        </Tooltip>
      }
    />
  );
};
