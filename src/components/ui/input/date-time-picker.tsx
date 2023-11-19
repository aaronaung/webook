import { Controller, ControllerRenderProps } from "react-hook-form";
import InputDecorator from "./decorator";
import { ControlledRhfInputProps } from ".";
import { DateTimePicker } from "../date-time-picker";
import { cn } from "@/src/utils";

type InputDateTimePickerProps = ControlledRhfInputProps;

export default function InputDateTimePicker(props: InputDateTimePickerProps) {
  const input = ({ field }: { field: ControllerRenderProps }) => {
    const handleDateChange = ({ date }: { date: Date }) => {
      field.onChange(date);
    };
    return (
      <InputDecorator {...props} className="mt-1.5">
        <DateTimePicker
          className={cn("w-full", props.className)}
          isDisabled={props.disabled}
          value={{ date: props.value || field.value, hasTime: true }}
          onChange={props.onChange || handleDateChange}
        />
      </InputDecorator>
    );
  };

  return (
    <Controller
      name={props.rhfKey || ""}
      control={props.control}
      rules={props.disableValidation ? { validate: () => true } : undefined}
      render={({ field }) => input({ field })}
    />
  );
}
