import { Controller, ControllerRenderProps } from "react-hook-form";
import InputDecorator from "./decorator";

import { ControlledRhfInputProps } from ".";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../select";

type InputSelectOption = {
  label: string;
  value: string;
};

type InputSelectProps = ControlledRhfInputProps & {
  options: InputSelectOption[];
  defaultValue?: any;
};
export default function InputSelect(props: InputSelectProps) {
  const input = ({ field }: { field: ControllerRenderProps }) => (
    <InputDecorator {...props}>
      <Select
        onValueChange={(value) => {
          console.log(value);
          field.onChange(value);
        }}
        {...field}
      >
        <SelectTrigger className="mt-1.5 w-full">
          <SelectValue placeholder={props.inputProps?.placeholder} />
        </SelectTrigger>
        <SelectContent className="max-h-[250px] overflow-scroll">
          <SelectGroup>
            {props.options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </InputDecorator>
  );

  return (
    <Controller
      name={props.rhfKey}
      control={props.control}
      rules={props.disableValidation ? { validate: () => true } : undefined}
      render={(args) => input(args)}
    />
  );
}
