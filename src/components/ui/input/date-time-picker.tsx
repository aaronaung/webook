import { Controller, ControllerRenderProps } from "react-hook-form";
import InputDecorator from "./decorator";
import { ControlledRhfInputProps } from ".";
import { DateTimePicker } from "../date-time-picker";
import { cn } from "@/src/utils";

type InputDateTimePickerProps = ControlledRhfInputProps;

export default function InputDateTimePicker(props: InputDateTimePickerProps) {
  const input = ({ field }: { field: ControllerRenderProps }) => (
    <InputDecorator {...props}>
      <DateTimePicker
        className={cn("mt-1.5 w-full", props.className)}
        value={{ date: field.value, hasTime: true }}
        onChange={({ date }) => {
          field.onChange(date);
        }}
        isDisabled={props.disabled}
      />
    </InputDecorator>
  );

  return (
    <Controller
      name={props.rhfKey || ""}
      control={props.control}
      rules={props.disableValidation ? { validate: () => true } : undefined}
      render={({ field }) => input({ field })}
    />
  );
}
