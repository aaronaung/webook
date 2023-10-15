import InputDecorator from "./decorator";
import ReactInputMask, { Props as ReactInputMaskProps } from "react-input-mask";
import { RhfInputProps } from ".";
import { cn } from "@/lib/utils";
import React from "react";

type InputMaskProps = RhfInputProps & { maskProps: ReactInputMaskProps };

const InputMask = React.forwardRef<ReactInputMask, InputMaskProps>(
  (props, ref) => {
    return (
      <InputDecorator {...props}>
        <ReactInputMask
          {...props.inputProps}
          {...props.maskProps}
          {...props.register(
            props.rhfKey,
            props.disableValidation ? { validate: () => true } : {},
          )}
          name={props.rhfKey}
          id={props.rhfKey}
          className={cn(
            "mt-1.5 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
            props.className,
          )}
        />
      </InputDecorator>
    );
  },
);

export default InputMask;
