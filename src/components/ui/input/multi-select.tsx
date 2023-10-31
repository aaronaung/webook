import { Controller, ControllerRenderProps } from "react-hook-form";
import InputDecorator from "./decorator";

import { ControlledRhfInputProps } from ".";
import React from "react";
import { FancyMultiSelect } from "../multi-select";

type InputMultiSelectOption = {
  label: string;
  value: string;
};

type InputMultiSelectProps = ControlledRhfInputProps & {
  options: InputMultiSelectOption[];
  defaultValue?: any;
};
const InputMultiSelect = React.forwardRef<
  HTMLButtonElement,
  InputMultiSelectProps
>((props, ref) => {
  const input = ({ field }: { field: ControllerRenderProps }) => (
    <InputDecorator {...props}>
      <FancyMultiSelect
        className="mt-1.5"
        options={props.options}
        selected={field.value}
        onSelectChange={(value) => {
          field.onChange(value);
        }}
        placeholder={props.inputProps?.placeholder}
      />
    </InputDecorator>
  );

  return (
    <Controller
      name={props.rhfKey || ""}
      control={props.control}
      rules={props.disableValidation ? { validate: () => true } : undefined}
      render={(args) => input(args)}
    />
  );
});

export default InputMultiSelect;
