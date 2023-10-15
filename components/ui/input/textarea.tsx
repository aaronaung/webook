import InputDecorator from "./decorator";
import { RhfInputProps } from ".";
import { cn } from "@/lib/utils";
import React from "react";

type InputTextAreaProps = RhfInputProps & {
  textareaProps: React.TextareaHTMLAttributes<HTMLTextAreaElement>;
  suffix?: React.ReactNode;
  prefix?: React.ReactNode;
};

const InputTextArea = React.forwardRef<HTMLTextAreaElement, InputTextAreaProps>(
  (props, ref) => {
    return (
      <InputDecorator {...props}>
        <div
          className={cn(
            "mt-1.5 flex h-auto w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 focus:ring-1 disabled:cursor-not-allowed disabled:opacity-50",
            props.className,
          )}
        >
          {props.prefix}
          <textarea
            {...props.textareaProps}
            {...props.register(
              props.rhfKey,
              props.disableValidation ? { validate: () => true } : {},
            )}
            name={props.rhfKey}
            id={props.rhfKey}
            className="w-full border-0 bg-transparent p-0 pr-3 text-sm focus:ring-0"
          />
          {props.suffix}
        </div>
      </InputDecorator>
    );
  },
);

export default InputTextArea;
