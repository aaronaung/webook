import { Controller, ControllerRenderProps } from "react-hook-form";
import InputDecorator from "./decorator";
import { ControlledRhfInputProps } from ".";
import { DateTimePicker } from "../date-time-picker";

type InputDateTimePickerProps = ControlledRhfInputProps;

export default function InputDateTimePicker(props: InputDateTimePickerProps) {
  const input = ({ field }: { field: ControllerRenderProps }) => (
    <InputDecorator {...props}>
      <DateTimePicker
        className="mt-1.5"
        value={{ date: field.value, hasTime: true }}
        onChange={({ date }) => {
          field.onChange(date);
        }}
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
