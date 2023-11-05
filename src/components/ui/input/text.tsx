import InputDecorator from "./decorator";
import { RhfInputProps } from ".";
import { cn } from "@/src/utils";
import React from "react";

type InputTextProps = RhfInputProps & {
  suffix?: React.ReactNode;
  prefix?: React.ReactNode;
};

export default function InputText(props: InputTextProps) {
  return (
    <InputDecorator {...props}>
      <div
        className={cn(
          "mt-1.5 flex h-10 w-full items-center rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 focus:ring-1",
          props.disabled && "cursor-not-allowed opacity-50",
          props.className,
        )}
      >
        {props.prefix}
        <input
          {...props.inputProps}
          {...(props.register && props.rhfKey
            ? props.register(props.rhfKey, {
                ...props.registerOptions,
                ...(props.disableValidation ? { validate: () => true } : {}),
              })
            : {})}
          {...(props.value ? { value: props.value } : {})}
          {...(props.onChange ? { onChange: props.onChange } : {})}
          {...(props.defaultValue ? { defaultValue: props.defaultValue } : {})}
          disabled={props.disabled}
          name={props.rhfKey}
          id={props.rhfKey}
          className={cn(
            "w-full border-0 bg-transparent p-0 pr-3 text-sm focus:ring-0",
            props.inputProps?.className,
          )}
        />
        {props.suffix}
      </div>
    </InputDecorator>
  );
}
