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
import React from "react";
import { cn } from "@/src/utils";

type InputSelectOption = {
  label: string;
  value: string;
};

type InputSelectProps = ControlledRhfInputProps & {
  options: InputSelectOption[];
  defaultValue?: any;
};
const InputSelect = React.forwardRef<HTMLButtonElement, InputSelectProps>(
  (props, ref) => {
    const input = ({ field }: { field: ControllerRenderProps }) => (
      <InputDecorator {...props}>
        <Select
          onValueChange={(value) => {
            field.onChange(value);
          }}
          {...field}
        >
          <SelectTrigger
            ref={ref}
            className={cn(
              "mt-1.5 w-full",
              !field.value && "text-muted-foreground",
            )}
          >
            <SelectValue placeholder={props.inputProps?.placeholder} />
          </SelectTrigger>
          <SelectContent className="max-h-[250px] overflow-scroll">
            <SelectGroup>
              {props.options.map((option) => (
                <SelectItem
                  className="cursor-pointer"
                  key={option.value}
                  value={option.value}
                >
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
  },
);

export default InputSelect;
