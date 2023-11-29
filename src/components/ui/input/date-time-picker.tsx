import { Controller, ControllerRenderProps } from "react-hook-form";
import InputDecorator from "./decorator";
import { ControlledRhfInputProps } from ".";
import { DateTimePicker } from "../date-time-picker";
import { cn } from "@/src/utils";
import { Button } from "../button";

type InputDateTimePickerProps = ControlledRhfInputProps & {
  disableTimePicker?: boolean;
  variant?: React.ComponentProps<typeof Button>["variant"];
};

export default function InputDateTimePicker(props: InputDateTimePickerProps) {
  const input = ({ field }: { field?: ControllerRenderProps }) => {
    const handleDateChange = ({ date }: { date: Date }) => {
      field?.onChange(date);
    };
    return (
      <InputDecorator {...props} className="mt-1.5">
        <DateTimePicker
          className={cn("w-full", props.className)}
          isDisabled={props.disabled}
          value={{
            date: props.value || field?.value,
            hasTime: props.disableTimePicker ? false : true,
          }}
          onChange={props.onChange || handleDateChange}
          disableTimePicker={props.disableTimePicker}
          placeholder={props.inputProps?.placeholder}
          variant={props.variant}
        />
      </InputDecorator>
    );
  };

  if (!props.control) return input({});

  return (
    <Controller
      name={props.rhfKey || ""}
      control={props.control}
      rules={props.disableValidation ? { validate: () => true } : undefined}
      render={({ field }) => input({ field })}
    />
  );
}
